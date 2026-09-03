using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using System.IO.Compression;
using System.Text;

namespace BDMS.Services;

[TestClass]
public class StreamedZipResultTest
{
    private const string ZipFileName = "test.zip";
    private const string FirstEntryName = "first.txt";
    private const string FirstEntryContent = "content one";
    private const string SecondEntryName = "folder/second.txt";
    private const string SecondEntryContent = "content two";

    [TestMethod]
    public async Task ExecuteResultAsyncWritesEveryEntryWithItsContent()
    {
        var entries = new[]
        {
            CreateEntrySource(FirstEntryName, FirstEntryContent),
            CreateEntrySource(SecondEntryName, SecondEntryContent),
        };

        var httpContext = new DefaultHttpContext();
        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        await new StreamedZipResult(ZipFileName, entries, NullLogger.Instance).ExecuteResultAsync(CreateActionContext(httpContext));

        body.Position = 0;
        using var archive = new ZipArchive(body, ZipArchiveMode.Read);

        Assert.AreEqual(2, archive.Entries.Count);
        Assert.AreEqual(FirstEntryContent, ReadEntry(archive, FirstEntryName));
        Assert.AreEqual(SecondEntryContent, ReadEntry(archive, SecondEntryName));
    }

    [TestMethod]
    public async Task ExecuteResultAsyncSetsZipContentTypeAndAttachmentHeader()
    {
        var httpContext = new DefaultHttpContext();
        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        var result = new StreamedZipResult("log_export_20260902.zip", new[] { CreateEntrySource("a.txt", "a") }, NullLogger.Instance);
        await result.ExecuteResultAsync(CreateActionContext(httpContext));

        var contentDisposition = httpContext.Response.Headers.ContentDisposition.ToString();

        Assert.AreEqual("application/zip", httpContext.Response.ContentType);
        Assert.IsTrue(contentDisposition.Contains("attachment", StringComparison.Ordinal), $"Expected an attachment disposition but got '{contentDisposition}'.");
        Assert.IsTrue(contentDisposition.Contains("log_export_20260902.zip", StringComparison.Ordinal), $"Expected the file name in the disposition but got '{contentDisposition}'.");
    }

    [TestMethod]
    public async Task ExecuteResultAsyncKeepsOnlyOneContentStreamOpenAtATime()
    {
        var currentlyOpen = 0;
        var maxConcurrentlyOpen = 0;

        Func<CancellationToken, Task<Stream>> openContent = () =>
        {
            currentlyOpen++;
            maxConcurrentlyOpen = Math.Max(maxConcurrentlyOpen, currentlyOpen);
            Stream stream = new TrackingStream(Encoding.UTF8.GetBytes("payload"), () => currentlyOpen--);
            return Task.FromResult(stream);
        };

        var entries = new[]
        {
            new ZipEntrySource("a.txt", openContent),
            new ZipEntrySource("b.txt", openContent),
            new ZipEntrySource("c.txt", openContent),
        };

        var httpContext = new DefaultHttpContext();
        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        await new StreamedZipResult(ZipFileName, entries, NullLogger.Instance).ExecuteResultAsync(CreateActionContext(httpContext));

        body.Position = 0;
        using var archive = new ZipArchive(body, ZipArchiveMode.Read);

        Assert.AreEqual(3, archive.Entries.Count);
        Assert.AreEqual(1, maxConcurrentlyOpen, "More than one entry's content was materialized at the same time.");
        Assert.AreEqual(0, currentlyOpen, "A content stream was not disposed after its entry was written.");
    }

    [TestMethod]
    public async Task ExecuteResultAsyncWritesTheEntryPayloadAsynchronously()
    {
        // Guards the reason the archive is built through ZipArchive.CreateAsync and OpenAsync:
        // an entry's payload, which is the bulk of a large export, must reach the response body
        // through WriteAsync rather than blocking a thread pool thread per buffer. Closing an
        // entry remains synchronous because the stream OpenAsync returns does not override
        // DisposeAsync, so this asserts a ratio rather than the absence of synchronous writes.
        var httpContext = new DefaultHttpContext();
        httpContext.Features.Set<IHttpBodyControlFeature>(new TestBodyControlFeature());

        using var body = new WriteCountingStream();
        httpContext.Response.Body = body;

        // Incompressible content, so the archive cannot shrink the payload away.
        var payload = new byte[512 * 1024];
        Random.Shared.NextBytes(payload);

        var entries = new[] { new ZipEntrySource("large.bin", () => Task.FromResult<Stream>(new MemoryStream(payload))) };

        await new StreamedZipResult(ZipFileName, entries, NullLogger.Instance)
            .ExecuteResultAsync(CreateActionContext(httpContext));

        Assert.IsTrue(
            body.AsynchronousByteCount > body.SynchronousByteCount * 2,
            $"Expected the payload to be written asynchronously but only {body.AsynchronousByteCount} of {body.AsynchronousByteCount + body.SynchronousByteCount} bytes were.");
    }

    [TestMethod]
    public async Task ExecuteResultAsyncEnablesSynchronousIoForTheResponseBody()
    {
        // Closing a ZIP entry writes synchronously, and Kestrel rejects synchronous writes on the
        // response body unless AllowSynchronousIO is enabled, so without opting in every real
        // export fails with an InvalidOperationException. A plain MemoryStream cannot observe
        // that, which is why the guard stream exists.
        var bodyControl = new TestBodyControlFeature { AllowSynchronousIO = false };
        var httpContext = new DefaultHttpContext();
        httpContext.Features.Set<IHttpBodyControlFeature>(bodyControl);

        using var body = new SynchronousIoGuardStream(bodyControl);
        httpContext.Response.Body = body;

        await new StreamedZipResult(ZipFileName, new[] { CreateEntrySource(FirstEntryName, FirstEntryContent) }, NullLogger.Instance)
            .ExecuteResultAsync(CreateActionContext(httpContext));

        Assert.IsTrue(bodyControl.AllowSynchronousIO, "StreamedZipResult must enable synchronous IO before writing the archive.");

        using var writtenBytes = new MemoryStream(body.ToArray());
        using var archive = new ZipArchive(writtenBytes, ZipArchiveMode.Read);
        Assert.AreEqual(FirstEntryContent, ReadEntry(archive, FirstEntryName));
    }

    [TestMethod]
    public async Task ExecuteResultAsyncStopsWritingWhenTheClientDisconnects()
    {
        using var clientGone = new CancellationTokenSource();
        var httpContext = new DefaultHttpContext { RequestAborted = clientGone.Token };
        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        var entries = new[]
        {
            new ZipEntrySource(FirstEntryName, () =>
            {
                clientGone.Cancel();
                return Task.FromResult<Stream>(new MemoryStream(Encoding.UTF8.GetBytes(FirstEntryContent)));
            }),
        };

        // The concrete type depends on which layer observes the cancellation first, so the
        // assertion deliberately accepts any cancellation exception.
        await Assert.ThrowsAsync<OperationCanceledException>(
            () => new StreamedZipResult(ZipFileName, entries, NullLogger.Instance).ExecuteResultAsync(CreateActionContext(httpContext)));
    }

    [TestMethod]
    public async Task ExecuteResultAsyncSurfacesTheEntryFailureRatherThanTheDisposalFailure()
    {
        // When an entry fails after the response has started, disposing the entry stream and the
        // archive flushes headers to a stream that is usually broken as well. Those secondary
        // failures must not replace the one that explains what actually went wrong, because the
        // exception the pipeline logs is the only record the operator gets.
        var httpContext = new DefaultHttpContext();
        using var body = new BreakableStream();
        httpContext.Response.Body = body;

        var entries = new[]
        {
            CreateEntrySource(FirstEntryName, FirstEntryContent),
            new ZipEntrySource("broken.txt", () =>
            {
                body.Break();
                throw new InvalidOperationException("attachment gone from cloud storage");
            }),
        };

        var exception = await Assert.ThrowsExactlyAsync<InvalidOperationException>(
            () => new StreamedZipResult(ZipFileName, entries, NullLogger.Instance).ExecuteResultAsync(CreateActionContext(httpContext)));

        // The entry name only exists at the point of failure, so it travels on the exception
        // rather than in a log statement here.
        StringAssert.Contains(exception.Message, "broken.txt");
        Assert.AreEqual("attachment gone from cloud storage", exception.InnerException?.Message);
    }

    [TestMethod]
    public async Task ExecuteResultAsyncPassesTheClientDisconnectTokenToTheContentSource()
    {
        // An attachment is fetched from cloud storage while the archive is being written, so the
        // token has to reach the content source. Without it a client that gives up mid-download
        // leaves the fetch for a multi-gigabyte object running to completion.
        using var clientGone = new CancellationTokenSource();
        var httpContext = new DefaultHttpContext { RequestAborted = clientGone.Token };
        httpContext.Features.Set<IHttpBodyControlFeature>(new TestBodyControlFeature());

        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        CancellationToken observedToken = default;
        var entries = new[]
        {
            new ZipEntrySource(FirstEntryName, token =>
            {
                observedToken = token;
                return Task.FromResult<Stream>(new MemoryStream(Encoding.UTF8.GetBytes(FirstEntryContent)));
            }),
        };

        await new StreamedZipResult(ZipFileName, entries, NullLogger.Instance)
            .ExecuteResultAsync(CreateActionContext(httpContext));

        Assert.AreEqual(clientGone.Token, observedToken, "The content source must receive the token that is aborted when the client disconnects.");
    }

    [TestMethod]
    [TestCategory("LongRunning")]
    public async Task ExecuteResultAsyncWritesAnEntryLargerThanFourGigabytes()
    {
        // Guards the point of streaming the archive: an entry may be far larger than the 2 GB a
        // managed array can hold and than the 4 GB an uncompressed size field can express, so the
        // writer must neither buffer the entry nor truncate its size to 32 bits. The content is
        // highly compressible on purpose, which keeps the archive itself small enough to read
        // back while the entry's uncompressed size still crosses both boundaries.
        const long entryLength = (4L * 1024 * 1024 * 1024) + (64 * 1024);

        var httpContext = new DefaultHttpContext();
        httpContext.Features.Set<IHttpBodyControlFeature>(new TestBodyControlFeature());

        using var body = new WriteCountingStream();
        httpContext.Response.Body = body;

        var entries = new[] { new ZipEntrySource("huge.bin", () => Task.FromResult<Stream>(new PatternStream(entryLength))) };

        await new StreamedZipResult(ZipFileName, entries, NullLogger.Instance)
            .ExecuteResultAsync(CreateActionContext(httpContext));

        using var writtenBytes = new MemoryStream(body.ToArray());
        using var archive = new ZipArchive(writtenBytes, ZipArchiveMode.Read);
        var entry = archive.Entries.Single();

        // A size this large can only be expressed through a ZIP64 extra field, so reading it back
        // correctly also proves the archive was written as ZIP64.
        Assert.AreEqual(entryLength, entry.Length);

        // Reading a ZIP entry does not verify its checksum, so the content is compared against a
        // second generator rather than trusted because the sizes agree.
        using var actualContent = await entry.OpenAsync();
        using var expectedContent = new PatternStream(entryLength);
        var actualBuffer = new byte[1024 * 1024];
        var expectedBuffer = new byte[actualBuffer.Length];
        long verifiedLength = 0;

        while (true)
        {
            var readLength = await actualContent.ReadAsync(actualBuffer);
            if (readLength == 0) break;

            await expectedContent.ReadExactlyAsync(expectedBuffer.AsMemory(0, readLength));
            Assert.IsTrue(
                actualBuffer.AsSpan(0, readLength).SequenceEqual(expectedBuffer.AsSpan(0, readLength)),
                $"The archived content differs from the source content at offset {verifiedLength}.");

            verifiedLength += readLength;
        }

        Assert.AreEqual(entryLength, verifiedLength);
    }

    private static ZipEntrySource CreateEntrySource(string entryName, string content) =>
        new(entryName, () => Task.FromResult<Stream>(new MemoryStream(Encoding.UTF8.GetBytes(content))));

    // ExecuteResultAsync only reads HttpContext.Response, so RouteData and ActionDescriptor
    // are deliberately left unset.
    private static ActionContext CreateActionContext(HttpContext httpContext) =>
        new() { HttpContext = httpContext };

    private static string ReadEntry(ZipArchive archive, string entryName)
    {
        using var stream = archive.Entries.Single(e => e.FullName == entryName).Open();
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }

    /// <summary>
    /// A <see cref="MemoryStream"/> that reports its disposal, so a test can assert that the
    /// writer released each entry's content stream.
    /// </summary>
    private sealed class TrackingStream : MemoryStream
    {
        private readonly Action onDispose;

        internal TrackingStream(byte[] buffer, Action onDispose)
            : base(buffer)
        {
            this.onDispose = onDispose;
        }

        protected override void Dispose(bool disposing)
        {
            onDispose();
            base.Dispose(disposing);
        }
    }

    /// <summary>
    /// Buffers writes until <see cref="Break"/> is called, after which every write fails the way
    /// a dead client connection would.
    /// </summary>
    private sealed class BreakableStream : Stream
    {
        private readonly MemoryStream inner = new();
        private bool broken;

        public override bool CanRead => false;

        public override bool CanSeek => false;

        public override bool CanWrite => true;

        public override long Length => throw new NotSupportedException();

        public override long Position
        {
            get => throw new NotSupportedException();
            set => throw new NotSupportedException();
        }

        internal void Break() => broken = true;

        public override void Flush()
        {
            ThrowIfBroken();
            inner.Flush();
        }

        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count)
        {
            ThrowIfBroken();
            inner.Write(buffer, offset, count);
        }

        public override void WriteByte(byte value)
        {
            ThrowIfBroken();
            inner.WriteByte(value);
        }

        public override Task WriteAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
        {
            ThrowIfBroken();
            return inner.WriteAsync(buffer, offset, count, cancellationToken);
        }

        public override ValueTask WriteAsync(ReadOnlyMemory<byte> buffer, CancellationToken cancellationToken = default)
        {
            ThrowIfBroken();
            return inner.WriteAsync(buffer, cancellationToken);
        }

        public override Task FlushAsync(CancellationToken cancellationToken)
        {
            ThrowIfBroken();
            return inner.FlushAsync(cancellationToken);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                inner.Dispose();
            }

            base.Dispose(disposing);
        }

        private void ThrowIfBroken()
        {
            if (broken)
            {
                throw new IOException("The response stream is no longer writable.");
            }
        }
    }

    /// <summary>
    /// Produces a deterministic byte pattern of an arbitrary length without materializing it, so
    /// a test can stream more content than fits in memory. The pattern repeats over a short cycle
    /// and therefore compresses to a fraction of its length.
    /// </summary>
    private sealed class PatternStream : Stream
    {
        // A prime cycle length keeps the pattern from aligning with the buffer sizes used around
        // it, so an off-by-one in the writer cannot go unnoticed.
        private static readonly byte[] Pattern = CreatePattern(251);

        private readonly long length;
        private long position;

        internal PatternStream(long length) => this.length = length;

        public override bool CanRead => true;

        public override bool CanSeek => false;

        public override bool CanWrite => false;

        public override long Length => length;

        public override long Position
        {
            get => position;
            set => throw new NotSupportedException();
        }

        public override void Flush()
        {
        }

        public override int Read(byte[] buffer, int offset, int count) => Read(buffer.AsSpan(offset, count));

        public override int Read(Span<byte> buffer)
        {
            var remainingLength = length - position;
            if (remainingLength <= 0) return 0;

            var readLength = (int)Math.Min(buffer.Length, remainingLength);
            var writtenLength = 0;
            while (writtenLength < readLength)
            {
                var patternOffset = (int)((position + writtenLength) % Pattern.Length);
                var chunkLength = Math.Min(Pattern.Length - patternOffset, readLength - writtenLength);
                Pattern.AsSpan(patternOffset, chunkLength).CopyTo(buffer.Slice(writtenLength, chunkLength));
                writtenLength += chunkLength;
            }

            position += writtenLength;
            return writtenLength;
        }

        public override Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken) =>
            Task.FromResult(Read(buffer.AsSpan(offset, count)));

        public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default) =>
            ValueTask.FromResult(Read(buffer.Span));

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        private static byte[] CreatePattern(int cycleLength)
        {
            var pattern = new byte[cycleLength];
            for (var i = 0; i < pattern.Length; i++)
            {
                pattern[i] = (byte)i;
            }

            return pattern;
        }
    }

    /// <summary>
    /// Stands in for Kestrel's <see cref="IHttpBodyControlFeature"/>, which
    /// <see cref="DefaultHttpContext"/> does not provide on its own.
    /// </summary>
    private sealed class TestBodyControlFeature : IHttpBodyControlFeature
    {
        public bool AllowSynchronousIO { get; set; }
    }

    /// <summary>
    /// Mimics Kestrel's response body: synchronous writes throw unless synchronous IO has been
    /// enabled through <see cref="IHttpBodyControlFeature"/>. Buffers everything written so a
    /// test can read the result back.
    /// </summary>
    private sealed class SynchronousIoGuardStream : WriteOnlyStream
    {
        private readonly IHttpBodyControlFeature bodyControl;

        internal SynchronousIoGuardStream(IHttpBodyControlFeature bodyControl) => this.bodyControl = bodyControl;

        protected override void OnSynchronousWrite(int byteCount)
        {
            if (!bodyControl.AllowSynchronousIO)
            {
                throw new InvalidOperationException("Synchronous operations are disallowed. Call WriteAsync or set AllowSynchronousIO to true instead.");
            }
        }
    }

    /// <summary>
    /// Records how many bytes reached the response body synchronously and how many reached it
    /// through the asynchronous write path.
    /// </summary>
    private sealed class WriteCountingStream : WriteOnlyStream
    {
        internal long SynchronousByteCount { get; private set; }

        internal long AsynchronousByteCount { get; private set; }

        protected override void OnSynchronousWrite(int byteCount) => SynchronousByteCount += byteCount;

        protected override void OnAsynchronousWrite(int byteCount) => AsynchronousByteCount += byteCount;
    }

    /// <summary>
    /// A write-only, non-seekable stream that stands in for Kestrel's response body. Buffers
    /// everything written so a test can read the result back, and reports every write so a
    /// derived class can observe whether it arrived synchronously.
    /// </summary>
    private abstract class WriteOnlyStream : Stream
    {
        private readonly MemoryStream inner = new();

        public override bool CanRead => false;

        public override bool CanSeek => false;

        public override bool CanWrite => true;

        public override long Length => throw new NotSupportedException();

        public override long Position
        {
            get => throw new NotSupportedException();
            set => throw new NotSupportedException();
        }

        internal byte[] ToArray() => inner.ToArray();

        public override void Flush()
        {
            OnSynchronousWrite(0);
            inner.Flush();
        }

        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count)
        {
            OnSynchronousWrite(count);
            inner.Write(buffer, offset, count);
        }

        public override void Write(ReadOnlySpan<byte> buffer)
        {
            OnSynchronousWrite(buffer.Length);
            inner.Write(buffer);
        }

        public override void WriteByte(byte value)
        {
            OnSynchronousWrite(1);
            inner.WriteByte(value);
        }

        public override Task FlushAsync(CancellationToken cancellationToken)
        {
            OnAsynchronousWrite(0);
            return inner.FlushAsync(cancellationToken);
        }

        public override Task WriteAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
        {
            OnAsynchronousWrite(count);
            return inner.WriteAsync(buffer, offset, count, cancellationToken);
        }

        public override ValueTask WriteAsync(ReadOnlyMemory<byte> buffer, CancellationToken cancellationToken = default)
        {
            OnAsynchronousWrite(buffer.Length);
            return inner.WriteAsync(buffer, cancellationToken);
        }

        /// <summary>
        /// Called before every synchronous write reaches the buffer.
        /// </summary>
        /// <param name="byteCount">The number of bytes being written, zero for a flush.</param>
        protected virtual void OnSynchronousWrite(int byteCount)
        {
        }

        /// <summary>
        /// Called before every asynchronous write reaches the buffer.
        /// </summary>
        /// <param name="byteCount">The number of bytes being written, zero for a flush.</param>
        protected virtual void OnAsynchronousWrite(int byteCount)
        {
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                inner.Dispose();
            }

            base.Dispose(disposing);
        }
    }
}
