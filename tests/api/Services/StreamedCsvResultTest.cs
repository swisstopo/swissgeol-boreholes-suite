using CsvHelper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using System.Text;

namespace BDMS.Services;

[TestClass]
public class StreamedCsvResultTest
{
    private const string CsvFileName = "boreholes_export.csv";

    [TestMethod]
    public async Task ExecuteResultAsyncWritesTheRecordsAfterOneByteOrderMark()
    {
        var httpContext = new DefaultHttpContext();
        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        await new StreamedCsvResult(CsvFileName, WriteTwoRecordsAsync, NullLogger.Instance).ExecuteResultAsync(CreateActionContext(httpContext));

        var content = body.ToArray();
        CollectionAssert.AreEqual(new byte[] { 0xEF, 0xBB, 0xBF }, content.Take(3).ToArray());
        Assert.AreEqual("Id;Name\r\n1;Forêt\r\n2;Bière\r\n", Encoding.UTF8.GetString(content.Skip(3).ToArray()));
    }

    [TestMethod]
    public async Task ExecuteResultAsyncSetsCsvContentTypeAndAttachmentHeader()
    {
        var httpContext = new DefaultHttpContext();
        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        await new StreamedCsvResult(CsvFileName, WriteTwoRecordsAsync, NullLogger.Instance).ExecuteResultAsync(CreateActionContext(httpContext));

        var contentDisposition = httpContext.Response.Headers.ContentDisposition.ToString();
        Assert.AreEqual("text/csv", httpContext.Response.ContentType);
        Assert.IsTrue(contentDisposition.Contains("attachment", StringComparison.Ordinal), $"Expected an attachment disposition but got '{contentDisposition}'.");
        Assert.IsTrue(contentDisposition.Contains(CsvFileName, StringComparison.Ordinal), $"Expected the file name in the disposition but got '{contentDisposition}'.");
    }

    [TestMethod]
    public async Task ExecuteResultAsyncWritesAndFlushesTheResponseBodyOnlyAsynchronously()
    {
        // Kestrel rejects synchronous writes and flushes on the response body. The records are larger
        // than the buffers of both writers, so a writer that flushed synchronously when its buffer
        // runs full, or when it is disposed, would fail here.
        var httpContext = new DefaultHttpContext();
        using var body = new AsynchronousOnlyStream();
        httpContext.Response.Body = body;
        var longRemark = new string('x', 64 * 1024);

        await new StreamedCsvResult(CsvFileName, async (csvWriter, _) =>
        {
            for (var record = 0; record < 3; record++)
            {
                csvWriter.WriteField(record);
                csvWriter.WriteField(longRemark);
                await csvWriter.NextRecordAsync();
            }
        }, NullLogger.Instance).ExecuteResultAsync(CreateActionContext(httpContext));

        Assert.AreEqual(3 + (3 * (1 + 1 + longRemark.Length + 2)), body.WrittenLength);
    }

    [TestMethod]
    public async Task ExecuteResultAsyncPassesTheClientDisconnectTokenToTheRecordWriter()
    {
        using var clientGone = new CancellationTokenSource();
        var httpContext = new DefaultHttpContext { RequestAborted = clientGone.Token };
        using var body = new MemoryStream();
        httpContext.Response.Body = body;

        CancellationToken observedToken = default;
        await new StreamedCsvResult(CsvFileName, (_, token) =>
        {
            observedToken = token;
            return Task.CompletedTask;
        }, NullLogger.Instance).ExecuteResultAsync(CreateActionContext(httpContext));

        Assert.AreEqual(clientGone.Token, observedToken);
    }

    [TestMethod]
    public async Task ExecuteResultAsyncKeepsTheCancellationWhenTheConnectionIsGone()
    {
        // A client that gives up leaves a dead connection behind, so flushing the buffered rest of the
        // file fails as well. That failure must not replace the cancellation, or a normal abort would
        // be logged as a failed export.
        using var clientGone = new CancellationTokenSource();
        var httpContext = new DefaultHttpContext { RequestAborted = clientGone.Token };
        using var body = new BreakableStream();
        httpContext.Response.Body = body;

        var result = new StreamedCsvResult(
            CsvFileName,
            async (csvWriter, token) =>
            {
                await WriteTwoRecordsAsync(csvWriter, token);
                body.Break();
                await clientGone.CancelAsync();
                token.ThrowIfCancellationRequested();
            },
            NullLogger.Instance);

        await Assert.ThrowsAsync<OperationCanceledException>(() => result.ExecuteResultAsync(CreateActionContext(httpContext)));
    }

    [TestMethod]
    public async Task ExecuteResultAsyncSurfacesTheWriteFailureWithTheFileName()
    {
        // Once the response has started, the exception is the only record of a failed export, so it
        // names the file and keeps the original failure rather than the one from flushing to a broken stream.
        var httpContext = new DefaultHttpContext();
        using var body = new BreakableStream();
        httpContext.Response.Body = body;

        var result = new StreamedCsvResult(
            CsvFileName,
            async (csvWriter, token) =>
            {
                await WriteTwoRecordsAsync(csvWriter, token);
                body.Break();
                throw new InvalidOperationException("borehole data gone");
            },
            NullLogger.Instance);

        var exception = await Assert.ThrowsExactlyAsync<InvalidOperationException>(() => result.ExecuteResultAsync(CreateActionContext(httpContext)));

        StringAssert.Contains(exception.Message, CsvFileName);
        Assert.AreEqual("borehole data gone", exception.InnerException?.Message);
    }

    private static async Task WriteTwoRecordsAsync(CsvWriter csvWriter, CancellationToken cancellationToken)
    {
        csvWriter.WriteField("Id");
        csvWriter.WriteField("Name");
        await csvWriter.NextRecordAsync();
        csvWriter.WriteField(1);
        csvWriter.WriteField("Forêt");
        await csvWriter.NextRecordAsync();
        csvWriter.WriteField(2);
        csvWriter.WriteField("Bière");
        await csvWriter.NextRecordAsync();
    }

    // ExecuteResultAsync only reads HttpContext.Response, so RouteData and ActionDescriptor
    // are deliberately left unset.
    private static ActionContext CreateActionContext(HttpContext httpContext) =>
        new() { HttpContext = httpContext };

    /// <summary>
    /// A write-only, non-seekable stream that, like Kestrel's response body without synchronous IO
    /// enabled, throws on every synchronous write or flush and counts the bytes written asynchronously.
    /// </summary>
    private sealed class AsynchronousOnlyStream : Stream
    {
        public override bool CanRead => false;

        public override bool CanSeek => false;

        public override bool CanWrite => true;

        public override long Length => throw new NotSupportedException();

        public override long Position
        {
            get => throw new NotSupportedException();
            set => throw new NotSupportedException();
        }

        internal long WrittenLength { get; private set; }

        public override void Flush() => throw SynchronousOperationException();

        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => throw SynchronousOperationException();

        public override void Write(ReadOnlySpan<byte> buffer) => throw SynchronousOperationException();

        public override void WriteByte(byte value) => throw SynchronousOperationException();

        public override Task FlushAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        public override Task WriteAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
        {
            WrittenLength += count;
            return Task.CompletedTask;
        }

        public override ValueTask WriteAsync(ReadOnlyMemory<byte> buffer, CancellationToken cancellationToken = default)
        {
            WrittenLength += buffer.Length;
            return ValueTask.CompletedTask;
        }

        private static InvalidOperationException SynchronousOperationException() =>
            new("Synchronous operations are disallowed. Call WriteAsync or FlushAsync instead.");
    }

    /// <summary>
    /// Accepts asynchronous writes until <see cref="Break"/> is called, after which every write and flush
    /// fails the way a dead client connection would.
    /// </summary>
    private sealed class BreakableStream : Stream
    {
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

        public override void Flush() => ThrowIfBroken();

        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => ThrowIfBroken();

        public override Task FlushAsync(CancellationToken cancellationToken)
        {
            ThrowIfBroken();
            return Task.CompletedTask;
        }

        public override Task WriteAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
        {
            ThrowIfBroken();
            return Task.CompletedTask;
        }

        public override ValueTask WriteAsync(ReadOnlyMemory<byte> buffer, CancellationToken cancellationToken = default)
        {
            ThrowIfBroken();
            return ValueTask.CompletedTask;
        }

        private void ThrowIfBroken()
        {
            if (broken)
            {
                throw new IOException("The response stream is no longer writable.");
            }
        }
    }
}
