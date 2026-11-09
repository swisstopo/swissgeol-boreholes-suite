using CsvHelper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.Text;

namespace BDMS.Services;

/// <summary>
/// Writes a CSV file directly to the response body, record by record, instead of building the whole
/// file in memory first. The file starts with a UTF-8 byte order mark, see <see cref="CsvEncoding"/>.
/// </summary>
/// <remarks>
/// Once the first byte reaches the response body the status code is committed, so a failure while
/// streaming cannot be turned into an error response. Callers must therefore load and validate
/// everything they can, such as permissions and the records themselves, before returning this result.
/// </remarks>
internal sealed class StreamedCsvResult : IActionResult
{
    // The byte order mark is written as a character of its own. An encoding that emitted it as well
    // would put a second mark in front, because StreamWriter writes the preamble to every stream it
    // cannot seek, such as the response body.
    private static readonly Encoding utf8WithoutMark = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false);

    private readonly Func<CsvWriter, CancellationToken, Task> writeRecords;

    /// <summary>
    /// Initializes a new instance of the <see cref="StreamedCsvResult"/> class.
    /// </summary>
    /// <param name="fileName">The file name offered to the client, including the .csv extension.</param>
    /// <param name="writeRecords">Writes the header and the records. It must end every record with
    /// <see cref="CsvWriter.NextRecordAsync"/>, which hands the record to the response body asynchronously.</param>
    internal StreamedCsvResult(string fileName, Func<CsvWriter, CancellationToken, Task> writeRecords)
    {
        FileName = fileName;
        this.writeRecords = writeRecords;
    }

    /// <summary>
    /// Gets the file name offered to the client, including the .csv extension.
    /// </summary>
    internal string FileName { get; }

    /// <inheritdoc/>
    public async Task ExecuteResultAsync(ActionContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var response = context.HttpContext.Response;
        var cancellationToken = context.HttpContext.RequestAborted;

        response.ContentType = "text/csv";

        var contentDisposition = new ContentDispositionHeaderValue("attachment");
        contentDisposition.SetHttpFileName(FileName);
        response.Headers.ContentDisposition = contentDisposition.ToString();

        // Kestrel rejects synchronous writes and flushes on the response body, and StreamWriter.Dispose
        // flushes its stream synchronously. Each writer is therefore disposed on its own through its
        // asynchronous path, and neither closes what it writes to. leaveOpen on the StreamWriter keeps
        // the response body usable by the server after the file has been written.
        var streamWriter = new StreamWriter(response.Body, utf8WithoutMark, bufferSize: -1, leaveOpen: true);
        await using (streamWriter.ConfigureAwait(false))
        {
            await streamWriter.WriteAsync(CsvEncoding.ByteOrderMark).ConfigureAwait(false);

            var csvWriter = new CsvWriter(streamWriter, CsvConfigHelper.CsvWriteConfig, leaveOpen: true);
            await using (csvWriter.ConfigureAwait(false))
            {
                await writeRecords(csvWriter, cancellationToken).ConfigureAwait(false);
            }
        }
    }
}
