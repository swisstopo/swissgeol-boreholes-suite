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

    /// <summary>
    /// Initializes a new instance of the <see cref="StreamedZipResult"/> class.
    /// </summary>
    /// <param name="fileName">The file name offered to the client, including the .zip extension.</param>
    /// <param name="entries">The entries to write, in order.</param>
    internal StreamedZipResult(string fileName, IReadOnlyList<ZipEntrySource> entries)
    {
        FileName = fileName;
        this.entries = entries;
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
        using var archive = new ZipArchive(response.Body, ZipArchiveMode.Create, leaveOpen: true);

        foreach (var entry in entries)
        {
            var zipEntry = archive.CreateEntry(entry.EntryName, CompressionLevel.Fastest);
            using var zipEntryStream = zipEntry.Open();
            using var content = await entry.OpenContent().ConfigureAwait(false);
            await content.CopyToAsync(zipEntryStream).ConfigureAwait(false);
        }
    }
}
