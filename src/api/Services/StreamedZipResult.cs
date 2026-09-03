using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.IO.Compression;

namespace BDMS.Services;

/// <summary>
/// Writes a ZIP archive directly to the response body, streaming each entry's content instead of
/// buffering the archive or any single entry in memory.
/// </summary>
/// <remarks>
/// Once the first byte reaches the response body the status code is committed, so a failure while
/// streaming cannot be turned into an error response. Callers must therefore validate everything
/// they can, such as permissions and object existence, before returning this result.
/// </remarks>
internal sealed class StreamedZipResult : IActionResult
{
    private readonly IReadOnlyList<ZipEntrySource> entries;
    private readonly ILogger logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="StreamedZipResult"/> class.
    /// </summary>
    /// <param name="fileName">The file name offered to the client, including the .zip extension.</param>
    /// <param name="entries">The entries to write, in order.</param>
    /// <param name="logger">Used to record which entry failed, since a mid-stream failure cannot be reported to the client.</param>
    internal StreamedZipResult(string fileName, IReadOnlyList<ZipEntrySource> entries, ILogger logger)
    {
        FileName = fileName;
        this.entries = entries;
        this.logger = logger;
    }

    /// <summary>
    /// Gets the file name offered to the client, including the .zip extension.
    /// </summary>
    internal string FileName { get; }

    /// <inheritdoc/>
    public async Task ExecuteResultAsync(ActionContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var response = context.HttpContext.Response;
        var cancellationToken = context.HttpContext.RequestAborted;

        response.ContentType = "application/zip";

        var contentDisposition = new ContentDispositionHeaderValue("attachment");
        contentDisposition.SetHttpFileName(FileName);
        response.Headers.ContentDisposition = contentDisposition.ToString();

        // The archive is built through the asynchronous API, so an entry's payload reaches the
        // response body through WriteAsync. Closing an entry is still synchronous: the stream
        // ZipArchiveEntry.OpenAsync returns does not override DisposeAsync, so disposal falls back
        // to the synchronous chain and flushes the deflate buffer with blocking writes.
        // Kestrel rejects those unless they are allowed for this response.
        // TODO: https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2995
        // Drop this opt-in once the deployed runtime carries the fix for
        // https://github.com/dotnet/runtime/issues/121624 (still reproducible on 10.0.11).
        var bodyControl = context.HttpContext.Features.Get<IHttpBodyControlFeature>();
        if (bodyControl is not null)
        {
            bodyControl.AllowSynchronousIO = true;
        }

        // leaveOpen keeps the response body usable by the server after the archive's central
        // directory has been written.
        var archive = await ZipArchive.CreateAsync(response.Body, ZipArchiveMode.Create, leaveOpen: true, entryNameEncoding: null, cancellationToken).ConfigureAwait(false);
        try
        {
            foreach (var entry in entries)
            {
                await WriteEntryAsync(archive, entry, cancellationToken).ConfigureAwait(false);
            }
        }
        catch
        {
            await DisposeWithoutMaskingFailureAsync(archive).ConfigureAwait(false);
            throw;
        }

        await archive.DisposeAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Writes one entry, ensuring the failure that explains the problem is the one that escapes.
    /// The response has already started by this point, so a failure cannot become an error status
    /// and the log is the only record of what went wrong.
    /// </summary>
    /// <param name="archive">The archive being written.</param>
    /// <param name="entry">The entry to write.</param>
    /// <param name="cancellationToken">Aborts the write once the client is gone.</param>
    private async Task WriteEntryAsync(ZipArchive archive, ZipEntrySource entry, CancellationToken cancellationToken)
    {
        var zipEntry = archive.CreateEntry(entry.EntryName, CompressionLevel.Fastest);
        var zipEntryStream = await zipEntry.OpenAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            var content = await entry.OpenContent().ConfigureAwait(false);
            await using (content.ConfigureAwait(false))
            {
                await content.CopyToAsync(zipEntryStream, cancellationToken).ConfigureAwait(false);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to write entry {EntryName} into the streamed ZIP archive. The client receives a truncated archive.", entry.EntryName);
            await DisposeWithoutMaskingFailureAsync(zipEntryStream).ConfigureAwait(false);
            throw;
        }

        await zipEntryStream.DisposeAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Disposes part of a failed archive, swallowing any failure. Disposal flushes and writes
    /// headers, and once an entry has failed those writes usually go to a broken stream. Letting
    /// them escape would replace the exception that actually explains the failure.
    /// </summary>
    /// <param name="disposable">The archive or entry stream to dispose.</param>
    private async Task DisposeWithoutMaskingFailureAsync(IAsyncDisposable disposable)
    {
        try
        {
            await disposable.DisposeAsync().ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Suppressed a failure while disposing part of a truncated ZIP archive.");
        }
    }
}
