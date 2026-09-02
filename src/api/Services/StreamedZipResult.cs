using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.IO.Compression;

namespace BDMS.Services;

/// <summary>
/// Writes a ZIP archive directly to the response body, streaming each entry's content instead of
/// buffering the archive or any single entry in memory. This removes the ~2 GB managed array
/// ceiling and the peak memory multiplication of building an archive in a <see cref="MemoryStream"/>.
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
    /// Gets the file name offered to the client, including the .zip extension. Exposed so a
    /// caller's tests can assert on the name without executing the result.
    /// </summary>
    internal string FileName { get; }

    /// <inheritdoc/>
    public async Task ExecuteResultAsync(ActionContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var response = context.HttpContext.Response;

        // ZipArchive has no internal async write path. Kestrel rejects synchronous writes on the response body by default,
        // so it has to be enabled for this response or every export fails.
        var bodyControl = context.HttpContext.Features.Get<IHttpBodyControlFeature>();
        if (bodyControl != null)
        {
            bodyControl.AllowSynchronousIO = true;
        }

        response.ContentType = "application/zip";

        var contentDisposition = new ContentDispositionHeaderValue("attachment");
        contentDisposition.SetHttpFileName(FileName);
        response.Headers.ContentDisposition = contentDisposition.ToString();

        // leaveOpen keeps the response body usable by the server after the archive's central
        // directory has been written.
        var archive = new ZipArchive(response.Body, ZipArchiveMode.Create, leaveOpen: true);
        try
        {
            foreach (var entry in entries)
            {
                await WriteEntryAsync(archive, entry).ConfigureAwait(false);
            }
        }
        catch
        {
            DisposeWithoutMaskingFailure(archive);
            throw;
        }

        archive.Dispose();
    }

    /// <summary>
    /// Writes one entry, ensuring the failure that explains the problem is the one that escapes.
    /// The response has already started by this point, so a failure cannot become an error status
    /// and the log is the only record of what went wrong.
    /// </summary>
    /// <param name="archive">The archive being written.</param>
    /// <param name="entry">The entry to write.</param>
    private async Task WriteEntryAsync(ZipArchive archive, ZipEntrySource entry)
    {
        var zipEntryStream = archive.CreateEntry(entry.EntryName, CompressionLevel.Fastest).Open();
        try
        {
            using var content = await entry.OpenContent().ConfigureAwait(false);
            await content.CopyToAsync(zipEntryStream).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to write entry {EntryName} into the streamed ZIP archive. The client receives a truncated archive.", entry.EntryName);
            DisposeWithoutMaskingFailure(zipEntryStream);
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
    private void DisposeWithoutMaskingFailure(IDisposable disposable)
    {
        try
        {
            disposable.Dispose();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Suppressed a failure while disposing part of a truncated ZIP archive.");
        }
    }
}
