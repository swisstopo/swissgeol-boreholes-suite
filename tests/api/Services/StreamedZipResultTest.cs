using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System.IO.Compression;
using System.Text;

namespace BDMS.Services;

[TestClass]
public class StreamedZipResultTest
{
    [TestMethod]
    public async Task ExecuteResultAsyncWritesEveryEntryWithItsContent()
    {
        var entries = new[]
        {
            CreateEntrySource("first.txt", "content one"),
            CreateEntrySource("folder/second.txt", "content two"),
        };

        var httpContext = new DefaultHttpContext();
        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        await new StreamedZipResult("test.zip", entries).ExecuteResultAsync(CreateActionContext(httpContext));

        body.Position = 0;
        using var archive = new ZipArchive(body, ZipArchiveMode.Read);

        Assert.AreEqual(2, archive.Entries.Count);
        Assert.AreEqual("content one", ReadEntry(archive, "first.txt"));
        Assert.AreEqual("content two", ReadEntry(archive, "folder/second.txt"));
    }

    [TestMethod]
    public async Task ExecuteResultAsyncWritesValidArchiveToNonSeekableResponseBody()
    {
        // Kestrel's response body cannot seek, which makes ZipArchive emit data descriptors
        // instead of back-patching the local file headers. A seekable MemoryStream does not
        // exercise that path, so this test writes through a forward-only stream like the real
        // server does.
        var entries = new[]
        {
            CreateEntrySource("first.txt", "content one"),
            CreateEntrySource("folder/second.txt", "content two"),
        };

        var httpContext = new DefaultHttpContext();
        using var body = new NonSeekableWriteStream();
        httpContext.Response.Body = body;

        await new StreamedZipResult("test.zip", entries).ExecuteResultAsync(CreateActionContext(httpContext));

        using var writtenBytes = new MemoryStream(body.ToArray());
        using var archive = new ZipArchive(writtenBytes, ZipArchiveMode.Read);

        Assert.AreEqual(2, archive.Entries.Count);
        Assert.AreEqual("content one", ReadEntry(archive, "first.txt"));
        Assert.AreEqual("content two", ReadEntry(archive, "folder/second.txt"));
    }

    [TestMethod]
    public async Task ExecuteResultAsyncSetsZipContentTypeAndAttachmentHeader()
    {
        var httpContext = new DefaultHttpContext();
        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        var result = new StreamedZipResult("log_export_20260902.zip", new[] { CreateEntrySource("a.txt", "a") });
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

        Func<Task<Stream>> openContent = () =>
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

        await new StreamedZipResult("test.zip", entries).ExecuteResultAsync(CreateActionContext(httpContext));

        body.Position = 0;
        using var archive = new ZipArchive(body, ZipArchiveMode.Read);

        Assert.AreEqual(3, archive.Entries.Count);
        Assert.AreEqual(1, maxConcurrentlyOpen, "More than one entry's content was materialized at the same time.");
        Assert.AreEqual(0, currentlyOpen, "A content stream was not disposed after its entry was written.");
    }

    [TestMethod]
    public async Task ExecuteResultAsyncEnablesSynchronousIoForTheResponseBody()
    {
        // ZipArchive has no internal async write path: it writes to its destination stream
        // synchronously even when the caller only ever uses CopyToAsync on the entry streams.
        // Kestrel rejects synchronous writes on the response body unless AllowSynchronousIO is
        // enabled, so without opting in every real export fails with InvalidOperationException.
        // A plain MemoryStream cannot observe that, which is why this guard stream exists.
        var bodyControl = new TestBodyControlFeature { AllowSynchronousIO = false };
        var httpContext = new DefaultHttpContext();
        httpContext.Features.Set<IHttpBodyControlFeature>(bodyControl);

        using var body = new SynchronousIoGuardStream(bodyControl);
        httpContext.Response.Body = body;

        await new StreamedZipResult("test.zip", new[] { CreateEntrySource("first.txt", "content one") })
            .ExecuteResultAsync(CreateActionContext(httpContext));

        Assert.IsTrue(bodyControl.AllowSynchronousIO, "StreamedZipResult must enable synchronous IO before writing the archive.");

        using var writtenBytes = new MemoryStream(body.ToArray());
        using var archive = new ZipArchive(writtenBytes, ZipArchiveMode.Read);
        Assert.AreEqual("content one", ReadEntry(archive, "first.txt"));
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
    private sealed class SynchronousIoGuardStream : Stream
    {
        private readonly MemoryStream inner = new();
        private readonly IHttpBodyControlFeature bodyControl;

        internal SynchronousIoGuardStream(IHttpBodyControlFeature bodyControl) => this.bodyControl = bodyControl;

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
            ThrowIfSynchronousIoDisallowed();
            inner.Flush();
        }

        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count)
        {
            ThrowIfSynchronousIoDisallowed();
            inner.Write(buffer, offset, count);
        }

        public override void WriteByte(byte value)
        {
            ThrowIfSynchronousIoDisallowed();
            inner.WriteByte(value);
        }

        public override Task WriteAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken) =>
            inner.WriteAsync(buffer, offset, count, cancellationToken);

        public override ValueTask WriteAsync(ReadOnlyMemory<byte> buffer, CancellationToken cancellationToken = default) =>
            inner.WriteAsync(buffer, cancellationToken);

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                inner.Dispose();
            }

            base.Dispose(disposing);
        }

        private void ThrowIfSynchronousIoDisallowed()
        {
            if (!bodyControl.AllowSynchronousIO)
            {
                throw new InvalidOperationException("Synchronous operations are disallowed. Call WriteAsync or set AllowSynchronousIO to true instead.");
            }
        }
    }

    /// <summary>
    /// A write-only, forward-only stream that stands in for Kestrel's response body, which
    /// cannot seek. Buffers everything written so a test can read the result back.
    /// </summary>
    private sealed class NonSeekableWriteStream : Stream
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

        public override void Flush() => inner.Flush();

        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => inner.Write(buffer, offset, count);

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
