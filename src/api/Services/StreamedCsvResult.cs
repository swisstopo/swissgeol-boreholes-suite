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
    private readonly ILogger logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="StreamedCsvResult"/> class.
    /// </summary>
    /// <param name="fileName">The file name offered to the client, including the .csv extension.</param>
    /// <param name="writeRecords">Writes the header and the records. It must end every record with
    /// <see cref="CsvWriter.NextRecordAsync"/>, which hands the record to the response body asynchronously.</param>
    /// <param name="logger">Records an aborted download and the secondary failures suppressed while abandoning a truncated file.</param>
    internal StreamedCsvResult(string fileName, Func<CsvWriter, CancellationToken, Task> writeRecords, ILogger logger)
    {
        FileName = fileName;
        this.writeRecords = writeRecords;
        this.logger = logger;
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
        var csvWriter = new CsvWriter(streamWriter, CsvConfigHelper.CsvWriteConfig, leaveOpen: true);
        try
        {
            await streamWriter.WriteAsync(CsvEncoding.ByteOrderMark).ConfigureAwait(false);
            await writeRecords(csvWriter, cancellationToken).ConfigureAwait(false);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // The client gave up, for example by cancelling the export. There is nobody left to receive
            // the file, so the abort is noted as such instead of as a failed export. The cancellation
            // still travels on, so the request ends aborted rather than completing with a truncated file.
            logger.LogInformation("The client aborted the download of '{FileName}'. The streamed CSV was abandoned.", FileName);
            await AbandonAsync(csvWriter, streamWriter).ConfigureAwait(false);
            throw;
        }
        catch (Exception ex)
        {
            await AbandonAsync(csvWriter, streamWriter).ConfigureAwait(false);
            if (ex is OperationCanceledException) throw;

            // The response has already started, so the failure cannot become an error status. The file name
            // travels on the exception, because it is the only record of the failure the pipeline logs.
            throw new InvalidOperationException($"Failed to write the streamed CSV '{FileName}'. The client receives a truncated file.", ex);
        }

        await csvWriter.DisposeAsync().ConfigureAwait(false);
        await streamWriter.DisposeAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Disposes the writers of a failed file, swallowing any failure. Disposal flushes what is still
    /// buffered, and once the file has failed that write usually goes to a broken connection. Letting
    /// it escape would replace the exception that actually explains the failure.
    /// </summary>
    /// <param name="csvWriter">The writer of the records, disposed first so it hands over what it still buffers.</param>
    /// <param name="streamWriter">The writer of the response body.</param>
    private async Task AbandonAsync(CsvWriter csvWriter, StreamWriter streamWriter)
    {
        await DisposeWithoutMaskingFailureAsync(csvWriter).ConfigureAwait(false);
        await DisposeWithoutMaskingFailureAsync(streamWriter).ConfigureAwait(false);
    }

    /// <summary>
    /// Disposes one writer of a failed file and logs, rather than throws, a failure while doing so.
    /// </summary>
    /// <param name="disposable">The writer to dispose.</param>
    private async Task DisposeWithoutMaskingFailureAsync(IAsyncDisposable disposable)
    {
        try
        {
            await disposable.DisposeAsync().ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Suppressed a failure while disposing a writer of the truncated CSV '{FileName}'.", FileName);
        }
    }
}
