using Amazon.S3;
using BDMS.Authentication;
using BDMS.Models;
using BDMS.Services;
using CsvHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LogController : BoreholeControllerBase<LogRun>
{
    private const string LogRunExportFileName = "log_runs";
    private const string LogFileExportFileName = "log_files";
    private const string LogExportFileName = "log_export";
    private readonly LogFileCloudService logFileCloudService;

    public LogController(BdmsContext context, ILogger<LogController> logger, IBoreholePermissionService boreholePermissionService, LogFileCloudService logFileCloudService)
        : base(context, logger, boreholePermissionService)
    {
        this.logFileCloudService = logFileCloudService;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="LogRun"/>s, filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole containing the logRuns to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<LogRun>>> GetAsync([FromQuery] int boreholeId)
    {
        var borehole = await Context.Boreholes
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == boreholeId)
            .ConfigureAwait(false);

        if (borehole == null) return NotFound();

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        return await Context.LogRunsWithIncludes
            .AsNoTracking()
            .Where(x => x.BoreholeId == boreholeId)
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Downloads a log file from the cloud storage.
    /// </summary>
    /// <param name="id">The <see cref="LogFile.Id"/> of the file to download.</param>
    /// <param name="cancellationToken">Aborts the download once the client is gone.</param>
    /// <returns>The stream of the downloaded file.</returns>
    [HttpGet("download")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> DownloadAsync([Range(1, int.MaxValue)] int id, CancellationToken cancellationToken)
    {
        try
        {
            var logFile = await Context.LogFiles
                .FirstOrDefaultAsync(f => f.Id == id, cancellationToken)
                .ConfigureAwait(false);

            if (logFile == null || logFile.NameUuid == null)
            {
                return NotFound($"File with id {id} not found.");
            }

            if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), logFile.LogRun.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            var fileStream = await logFileCloudService.GetObjectStream(logFile.NameUuid, cancellationToken).ConfigureAwait(false);

            return File(fileStream, "application/octet-stream", logFile.Name);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "An error occurred while downloading the file.");
            return Problem("An error occurred while downloading the file.");
        }
    }

    /// <summary>
    /// Deletes one or multiple log runs.
    /// </summary>
    /// <param name="logRunIds">The IDs of the log runs to delete.</param>
    /// <returns>An OK result if successful.</returns>
    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> DeleteMultipleAsync([FromQuery][MaxLength(100)] IReadOnlyList<int> logRunIds)
    {
        if (logRunIds == null || logRunIds.Count == 0) return BadRequest("The list of logRunIds must not be empty.");

        var logRuns = await Context.LogRuns
            .Where(l => logRunIds.Contains(l.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (logRuns.Count == 0) return NotFound();

        var boreholeIds = logRuns.Select(l => l.BoreholeId).Distinct().ToList();
        if (boreholeIds.Count != 1) return BadRequest("Not all log runs are attached to the same borehole.");

        var boreholeId = boreholeIds.Single();
        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        foreach (var logRun in logRuns)
        {
            var logFileIds = logRun.LogFiles?.Select(f => f.Id).ToList();
            var existingLogRun = logRuns.SingleOrDefault(run => run.Id == logRun.Id);
            var filesToRemove = existingLogRun?.LogFiles?.Where(f => logFileIds.Contains(f.Id)).ToList();
            if (filesToRemove != null && filesToRemove.Count > 0)
            {
                await logFileCloudService.DeleteObjects(filesToRemove.Select(lf => lf.NameUuid!)).ConfigureAwait(false);
                Context.RemoveRange(filesToRemove);
            }
        }

        Context.RemoveRange(logRuns);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        return Ok();
    }

    /// <inheritdoc />
    [HttpDelete("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        return await DeleteMultipleAsync(new List<int> { id }).ConfigureAwait(false);
    }

    /// <summary>
    /// Deletes a log file record that never received its attachment.
    ///
    /// The import writes the record before the attachment is uploaded, so an upload that fails or
    /// is given up on would leave a record behind that every later import skips as already
    /// existing. Removing it here lets the next import add it properly.
    ///
    /// A record that has its attachment is refused: this endpoint exists to undo an unfinished
    /// import, not to delete stored files.
    /// </summary>
    /// <param name="id">The <see cref="LogFile.Id"/> to delete.</param>
    /// <returns>An OK result if the record was removed.</returns>
    [HttpDelete("file/{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> DeleteLogFileAsync([Range(1, int.MaxValue)] int id)
    {
        var logFile = await Context.LogFiles
            .Include(lf => lf.LogRun)
            .FirstOrDefaultAsync(lf => lf.Id == id)
            .ConfigureAwait(false);

        if (logFile == null) return NotFound($"LogFile with id {id} not found.");

        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), logFile.LogRun.BoreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        if (logFile.NameUuid != null)
        {
            return Problem(detail: $"LogFile with id {id} has an attachment and is not deleted here.", type: ProblemType.UserError);
        }

        Context.LogFiles.Remove(logFile);
        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

        return Ok();
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<LogRun>> CreateAsync(LogRun entity)
    {
        if (entity == null)
        {
            return BadRequest(ModelState);
        }

        if (!await IsRunNumberUnique(entity).ConfigureAwait(false))
        {
            return Problem(detail: $"{entity.RunNumber}: Run number must be unique", type: ProblemType.UserError);
        }

        entity.LogFiles = null; // Cannot create LogFiles here because the files first have to be uploaded to S3

        return await base.CreateAsync(entity).ConfigureAwait(false);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<LogRun>> EditAsync(LogRun entity)
    {
        if (entity == null)
        {
            return BadRequest(ModelState);
        }

        var boreholeId = await GetBoreholeId(entity).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var existingLogRun = await Context.LogRuns
            .Include(lr => lr.BoreholeStatus)
            .Include(lr => lr.ConveyanceMethod)
            .Include(lr => lr.LogFiles).ThenInclude(lf => lf.PassType)
            .Include(lr => lr.LogFiles).ThenInclude(lf => lf.DataPackage)
            .Include(lr => lr.LogFiles).ThenInclude(lf => lf.DepthType)
            .Include(lr => lr.LogFiles).ThenInclude(lf => lf.LogFileToolTypeCodes)
            .SingleOrDefaultAsync(l => l.Id == entity.Id).ConfigureAwait(false);

        if (existingLogRun == null)
        {
            return NotFound();
        }

        if (!await IsRunNumberUnique(entity).ConfigureAwait(false))
        {
            return Problem(detail: "Run number must be unique");
        }

        if (entity.LogFiles != null)
        {
            if (entity.LogFiles.Any(f => f.Id == 0))
            {
                return Problem(detail: "LogFiles must first be uploaded to S3");
            }

            var logFileIds = entity.LogFiles?.Select(f => f.Id).ToList();
            var filesToRemove = existingLogRun.LogFiles?.Where(f => !logFileIds.Contains(f.Id)).ToList();
            if (filesToRemove != null && filesToRemove.Count > 0)
            {
                await logFileCloudService.DeleteObjects(filesToRemove!.Select(lf => lf.NameUuid!)).ConfigureAwait(false);
                Context.RemoveRange(filesToRemove!);
            }

            foreach (var logFile in entity.LogFiles)
            {
                var existingLogFile = existingLogRun.LogFiles?.SingleOrDefault(f => f.Id == logFile.Id);
                if (existingLogFile != null)
                {
                    await UpdateLogFileToolTypeCodes(existingLogFile.Id, existingLogFile.LogFileToolTypeCodes, logFile.ToolTypeCodelistIds).ConfigureAwait(false);
                    Context.Entry(existingLogFile).CurrentValues.SetValues(logFile);

                    // The following fields should never be updated by the user, but only when the file changes
                    Context.Entry(existingLogFile).Property(x => x.Name).IsModified = false;
                    Context.Entry(existingLogFile).Property(x => x.NameUuid).IsModified = false;
                }
            }
        }

        Context.Entry(existingLogRun).CurrentValues.SetValues(entity);
        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

        var updatedLogRun = await Context.LogRunsWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == entity.Id).ConfigureAwait(false);
        return Ok(updatedLogRun);
    }

    /// <summary>
    /// Imports log runs and log files from CSV files.
    ///
    /// Every row is classified and reported, and the rows that are complete and valid are written.
    /// A row that is skipped is not a failure: repeating the import adds what has since become
    /// complete without writing anything twice. Only a request that cannot be read at all is
    /// answered with a failure status.
    /// </summary>
    /// <param name="boreholeId">The borehole the import belongs to.</param>
    /// <param name="logRunsCsvFile">The log runs CSV, if the import carries one.</param>
    /// <param name="logFilesCsvFile">The log files CSV, if the import carries one.</param>
    /// <param name="providedAttachmentNames">The attachments the client holds, each as "runNumber/fileName".</param>
    /// <returns>One <see cref="LogImportResultItem"/> per row.</returns>
    [HttpPost("import")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(FileSizeLimits.Large)]

    // One form value is sent per provided attachment, so the default FormOptions.ValueCountLimit
    // of 1024 would fail model binding on a large import; 10000 is well beyond any real import.
    [RequestFormLimits(MultipartBodyLengthLimit = FileSizeLimits.Large, ValueCountLimit = 10000)]
    public async Task<IActionResult> ImportAsync(
        [FromQuery] int boreholeId,
        IFormFile? logRunsCsvFile,
        IFormFile? logFilesCsvFile,
        [FromForm] IReadOnlyList<string> providedAttachmentNames)
    {
        var borehole = await Context.Boreholes
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == boreholeId)
            .ConfigureAwait(false);

        if (borehole == null) return NotFound();

        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        if (logRunsCsvFile == null && logFilesCsvFile == null)
        {
            return BadRequest(new { detail = "At least one CSV file is required.", messageKey = "importErrorCsvRequired" });
        }

        var structuralError = ValidateCsvStructure(logRunsCsvFile, logFilesCsvFile);
        if (structuralError != null) return structuralError;

        var codelists = await LoadLogCodelistsAsync().ConfigureAwait(false);

        var runRows = logRunsCsvFile == null
            ? []
            : LogCsvParser.ParseRuns(logRunsCsvFile.OpenReadStream(), codelists, boreholeId);

        var fileRows = logFilesCsvFile == null
            ? []
            : LogCsvParser.ParseFiles(logFilesCsvFile.OpenReadStream(), codelists);

        var existingRuns = await Context.LogRuns
            .AsNoTracking()
            .Where(lr => lr.BoreholeId == boreholeId)
            .Select(lr => new ExistingLogRun(lr.Id, lr.RunNumber))
            .ToListAsync()
            .ConfigureAwait(false);

        var existingFiles = await Context.LogFiles
            .AsNoTracking()
            .Where(lf => lf.LogRun.BoreholeId == boreholeId)
            .Select(lf => new ExistingLogFile(lf.Id, lf.LogRunId, lf.Name!, lf.NameUuid != null))
            .ToListAsync()
            .ConfigureAwait(false);

        var classification = LogImportClassifier.Classify(runRows, fileRows, existingRuns, existingFiles, providedAttachmentNames ?? []);

        return Ok(await CommitImportAsync(classification).ConfigureAwait(false));
    }

    private BadRequestObjectResult? ValidateCsvStructure(IFormFile? logRunsCsvFile, IFormFile? logFilesCsvFile)
    {
        try
        {
            if (logRunsCsvFile != null)
            {
                var missing = LogCsvParser.MissingRunColumns(logRunsCsvFile.OpenReadStream());
                if (missing.Count > 0)
                {
                    return BadRequest(new { detail = $"Missing columns in the log runs CSV: {string.Join(", ", missing)}.", messageKey = "importErrorMissingColumns", values = new { columns = string.Join(", ", missing) } });
                }
            }

            if (logFilesCsvFile != null)
            {
                var missing = LogCsvParser.MissingFileColumns(logFilesCsvFile.OpenReadStream());
                if (missing.Count > 0)
                {
                    return BadRequest(new { detail = $"Missing columns in the log files CSV: {string.Join(", ", missing)}.", messageKey = "importErrorMissingColumns", values = new { columns = string.Join(", ", missing) } });
                }
            }

            return null;
        }
        catch (CsvHelperException ex)
        {
            Logger.LogError(ex, "A log import CSV could not be read.");
            return BadRequest(new { detail = "The CSV file could not be read.", messageKey = "importErrorUnreadableCsv" });
        }
    }

    private async Task<List<Codelist>> LoadLogCodelistsAsync()
    {
        var logSchemas = new[]
        {
            LogSchemas.LogBoreholeStatusSchema,
            LogSchemas.LogConveyanceMethodSchema,
            LogSchemas.LogPassTypeSchema,
            LogSchemas.LogDataPackageSchema,
            LogSchemas.LogDepthTypeSchema,
            LogSchemas.LogToolTypeSchema,
        };

        return await Context.Codelists
            .Where(c => logSchemas.Contains(c.Schema))
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Writes everything the classification marked as added, and fills the stored ids into the
    /// report so the client knows what to upload the attachments against.
    ///
    /// Runs are saved before the files, because a file may belong to a run this same import
    /// creates and can only carry its id once that run has one.
    /// </summary>
    private async Task<IReadOnlyList<LogImportResultItem>> CommitImportAsync(LogImportClassification classification)
    {
        if (classification.RunsToAdd.Count == 0 && classification.FilesToAdd.Count == 0)
        {
            return classification.Items;
        }

        // Only start a transaction when the caller has not already opened one: nesting a new
        // transaction on a connection that is already inside one fails.
        using var transaction = Context.Database.CurrentTransaction == null
            ? await Context.Database.BeginTransactionAsync().ConfigureAwait(false)
            : null;

        Context.LogRuns.AddRange(classification.RunsToAdd);
        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

        var runIdByNumber = classification.RunsToAdd.ToDictionary(r => r.RunNumber, r => r.Id, StringComparer.OrdinalIgnoreCase);

        // LogImportClassifier only ever puts a file here when its run is already stored (and the
        // file's LogRunId is set already) or is created in this same import (and found below), so
        // runIdByNumber always has an entry when it is needed.
        foreach (var pending in classification.FilesToAdd)
        {
            if (pending.LogFile.LogRunId == 0 && runIdByNumber.TryGetValue(pending.RunNumber, out var runId))
            {
                pending.LogFile.LogRunId = runId;
            }

            Context.LogFiles.Add(pending.LogFile);
        }

        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
        if (transaction != null) await transaction.CommitAsync().ConfigureAwait(false);

        return FillStoredIds(classification, runIdByNumber);
    }

    private static List<LogImportResultItem> FillStoredIds(LogImportClassification classification, Dictionary<string, int> runIdByNumber)
    {
        var addedFiles = new Queue<PendingLogFile>(classification.FilesToAdd);

        return classification.Items
            .Select(item =>
            {
                if (item.Outcome != LogImportOutcome.Added) return item;

                if (item.Type == LogImportItemType.Run)
                {
                    return runIdByNumber.TryGetValue(item.Identifier, out var runId)
                        ? item with { LogRunId = runId }
                        : item;
                }

                // A file item that already names its stored file is one an earlier import left
                // waiting for its attachment, so nothing was written for it here.
                if (item.LogFileId != null) return item;

                var pending = addedFiles.Dequeue();
                return item with { LogRunId = pending.LogFile.LogRunId, LogFileId = pending.LogFile.Id };
            })
            .ToList();
    }

    private IQueryable<LogRun> LogRunsForExport => Context.LogRuns
        .AsNoTracking()
        .Include(lr => lr.ConveyanceMethod)
        .Include(lr => lr.BoreholeStatus)
        .Include(lr => lr.LogFiles).ThenInclude(lf => lf.LogFileToolTypeCodes).ThenInclude(tc => tc.Codelist);

    private IQueryable<LogFile> LogFilesForExport => Context.LogFiles
        .AsNoTracking()
        .Include(lf => lf.LogRun)
        .Include(lf => lf.PassType)
        .Include(lf => lf.DataPackage)
        .Include(lf => lf.DepthType)
        .Include(lf => lf.LogFileToolTypeCodes).ThenInclude(tc => tc.Codelist);

    /// <summary>
    /// Exports log runs or log files as a ZIP archive containing CSV files and optionally the file attachments.
    /// </summary>
    /// <param name="request">The log runs or log files to export.</param>
    /// <param name="cancellationToken">Aborts the export once the client is gone. An export can transfer several gigabytes, so the work it triggers must not outlive the request.</param>
    [HttpPost("export")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> ExportAsync([FromBody] LogExportRequest request, CancellationToken cancellationToken)
    {
        var (logRuns, logFiles, error) = await LoadLogExportDataAsync(request, cancellationToken).ConfigureAwait(false);
        if (error != null) return error;

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), logRuns[0].BoreholeId).ConfigureAwait(false)) return Unauthorized();

        try
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);
            var entries = new List<ZipEntrySource>();

            // The CSVs are generated in memory anyway and are small, so they stay buffered.
            // Only the attachments, which can be several gigabytes each, are streamed.
            var logRunCsvBytes = await WriteLogRunCsvBytesAsync(logRuns, request.Locale).ConfigureAwait(false);
            entries.Add(new ZipEntrySource(
                $"{LogRunExportFileName}_{timestamp}.csv",
                _ => Task.FromResult<Stream>(new MemoryStream(logRunCsvBytes))));

            if (logFiles.Count > 0)
            {
                var logFileCsvBytes = await WriteLogFileCsvBytesAsync(logFiles, request.Locale).ConfigureAwait(false);
                entries.Add(new ZipEntrySource(
                    $"{LogFileExportFileName}_{timestamp}.csv",
                    _ => Task.FromResult<Stream>(new MemoryStream(logFileCsvBytes))));
            }

            if (request.WithAttachments == true)
            {
                var attachments = logFiles.Where(lf => lf.NameUuid != null && lf.Name != null).ToList();

                // The archive is streamed, so the status code is committed as soon as the first
                // byte reaches the response body. Probe every object up front, while returning a
                // problem response is still possible.
                var probes = await Task.WhenAll(attachments.Select(async logFile => new
                {
                    LogFile = logFile,
                    Exists = await logFileCloudService.ObjectExists(logFile.NameUuid!, cancellationToken).ConfigureAwait(false),
                })).ConfigureAwait(false);

                var missingFileNames = probes.Where(probe => !probe.Exists).Select(probe => probe.LogFile.Name).ToList();
                if (missingFileNames.Count > 0)
                {
                    Logger.LogError("Log file attachments are missing in cloud storage: {MissingFiles}", string.Join(", ", missingFileNames));
                    return Problem("An error occurred while fetching a file from the cloud storage.");
                }

                foreach (var logFile in attachments)
                {
                    var folderName = FileHelper.SanitizeZipEntryFileName(logFile.LogRun!.RunNumber, "run");
                    var fileName = FileHelper.SanitizeZipEntryFileName(logFile.Name!, "export");
                    var nameUuid = logFile.NameUuid!;
                    entries.Add(new ZipEntrySource(
                        $"{folderName}/{fileName}",
                        entryCancellationToken => logFileCloudService.GetObjectStream(nameUuid, entryCancellationToken)));
                }
            }

            return new StreamedZipResult($"{LogExportFileName}_{timestamp}.zip", entries, Logger);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // The client gave up while the export was still being prepared. There is nobody left
            // to answer, so this is not reported as a failed export.
            throw;
        }
        catch (AmazonS3Exception ex)
        {
            Logger.LogError(ex, "Amazon S3 Store threw an exception.");
            return Problem("An error occurred while fetching a file from the cloud storage.");
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Failed to prepare ZIP file.");
            return Problem("An error occurred while preparing the ZIP file.");
        }
    }

    private async Task<(List<LogRun> LogRuns, List<LogFile> LogFiles, IActionResult? Error)> LoadLogExportDataAsync(LogExportRequest request, CancellationToken cancellationToken)
    {
        if (request.LogRunIds.Count == 0 && request.LogFileIds.Count == 0)
            return ([], [], BadRequest("No ids were provided."));

        if (request.LogRunIds.Count > 0 && request.LogFileIds.Count > 0)
            return ([], [], BadRequest("LogRunIds and LogFileIds should not be provided together."));

        if (request.LogRunIds.Count > 0)
        {
            var logRuns = await LogRunsForExport
                .Where(lr => request.LogRunIds.Contains(lr.Id))
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);

            if (logRuns.Count == 0) return ([], [], NotFound());

            var boreholeIds = logRuns.Select(lr => lr.BoreholeId).Distinct().ToList();
            if (boreholeIds.Count != 1) return ([], [], BadRequest("All log runs must belong to the same borehole."));

            var logFiles = await LogFilesForExport
                .Where(lf => request.LogRunIds.Contains(lf.LogRunId))
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);

            return (logRuns, logFiles, null);
        }

        var logFilesResult = await LogFilesForExport
            .Where(lf => request.LogFileIds.Contains(lf.Id))
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        if (logFilesResult.Count == 0) return ([], [], NotFound());

        var logRunIds = logFilesResult.Select(lf => lf.LogRunId).Distinct().ToList();
        if (logRunIds.Count != 1) return ([], [], BadRequest("All log files must belong to the same log run."));

        var logRunsResult = await LogRunsForExport
            .Where(lr => lr.Id == logRunIds[0])
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        if (logRunsResult.Count == 0) return ([], [], NotFound());

        return (logRunsResult, logFilesResult, null);
    }

    private static async Task<byte[]> WriteLogRunCsvBytesAsync(List<LogRun> logRuns, string locale)
    {
        using var stringWriter = new StringWriter();
        using var csvWriter = new CsvWriter(stringWriter, CsvConfigHelper.CsvWriteConfig);

        csvWriter.WriteField(nameof(LogRun.RunNumber));
        csvWriter.WriteField(nameof(LogRun.FromDepth));
        csvWriter.WriteField(nameof(LogRun.ToDepth));
        csvWriter.WriteField("ToolType");
        csvWriter.WriteField(nameof(LogRun.BoreholeStatus));
        csvWriter.WriteField(nameof(LogRun.RunDate));
        csvWriter.WriteField(nameof(LogRun.BitSize));
        csvWriter.WriteField(nameof(LogRun.ConveyanceMethod));
        csvWriter.WriteField(nameof(LogRun.ServiceCo));
        csvWriter.WriteField(nameof(LogRun.Comment));
        await csvWriter.NextRecordAsync().ConfigureAwait(false);

        foreach (var lr in logRuns)
        {
            var toolTypes = lr.LogFiles?.SelectMany(lf => lf.LogFileToolTypeCodes?.Select(tc => tc.Codelist.Code) ?? []).Distinct().Order().ToArray() ?? [];
            csvWriter.WriteField(lr.RunNumber);
            csvWriter.WriteField(lr.FromDepth);
            csvWriter.WriteField(lr.ToDepth);
            csvWriter.WriteField(string.Join(",", toolTypes));
            csvWriter.WriteField(GetCodelistText(lr.BoreholeStatus, locale));
            csvWriter.WriteField(lr.RunDate);
            csvWriter.WriteField(lr.BitSize);
            csvWriter.WriteField(GetCodelistText(lr.ConveyanceMethod, locale));
            csvWriter.WriteField(lr.ServiceCo);
            csvWriter.WriteField(lr.Comment);
            await csvWriter.NextRecordAsync().ConfigureAwait(false);
        }

        await csvWriter.FlushAsync().ConfigureAwait(false);
        return Encoding.UTF8.GetBytes(stringWriter.ToString());
    }

    private static async Task<byte[]> WriteLogFileCsvBytesAsync(List<LogFile> logFiles, string locale)
    {
        using var stringWriter = new StringWriter();
        using var csvWriter = new CsvWriter(stringWriter, CsvConfigHelper.CsvWriteConfig);

        csvWriter.WriteField(nameof(LogRun.RunNumber));
        csvWriter.WriteField(nameof(LogFile.Name));
        csvWriter.WriteField(nameof(LogFile.LogFileToolTypeCodes));
        csvWriter.WriteField("Extension");
        csvWriter.WriteField(nameof(LogFile.Pass));
        csvWriter.WriteField(nameof(LogFile.PassType));
        csvWriter.WriteField(nameof(LogFile.DataPackage));
        csvWriter.WriteField(nameof(LogFile.DepthType));
        csvWriter.WriteField(nameof(LogFile.DeliveryDate));
        csvWriter.WriteField(nameof(LogFile.Public));
        await csvWriter.NextRecordAsync().ConfigureAwait(false);

        foreach (var lf in logFiles)
        {
            var fileNameWithoutExtension = string.IsNullOrEmpty(lf.Name) ? string.Empty : Path.GetFileNameWithoutExtension(lf.Name);
            var extension = string.IsNullOrEmpty(lf.Name) ? string.Empty : Path.GetExtension(lf.Name).TrimStart('.');
            csvWriter.WriteField(lf.LogRun!.RunNumber);
            csvWriter.WriteField(fileNameWithoutExtension);
            csvWriter.WriteField(string.Join(",", lf.LogFileToolTypeCodes?.Select(tc => tc.Codelist.Code).Order().ToArray() ?? []));
            csvWriter.WriteField(extension);
            csvWriter.WriteField(lf.Pass);
            csvWriter.WriteField(GetCodelistText(lf.PassType, locale));
            csvWriter.WriteField(GetCodelistText(lf.DataPackage, locale));
            csvWriter.WriteField(GetCodelistText(lf.DepthType, locale));
            csvWriter.WriteField(lf.DeliveryDate);
            csvWriter.WriteField(GetLocalizedYesNoBoolean(lf.Public, locale));
            await csvWriter.NextRecordAsync().ConfigureAwait(false);
        }

        await csvWriter.FlushAsync().ConfigureAwait(false);
        return Encoding.UTF8.GetBytes(stringWriter.ToString());
    }

    private static string? GetCodelistText(Codelist? codelist, string locale) => locale switch
    {
        "de" => codelist?.De,
        "fr" => codelist?.Fr,
        "it" => codelist?.It,
        _ => codelist?.En,
    };

    private static string GetLocalizedYesNoBoolean(bool value, string locale) => (value, locale) switch
    {
        (true, "de") => "Ja",
        (false, "de") => "Nein",
        (true, "fr") => "Oui",
        (false, "fr") => "Non",
        (true, "it") => "Sì",
        (false, "it") => "No",
        (true, _) => "Yes",
        (false, _) => "No",
    };

    private async Task UpdateLogFileToolTypeCodes(int logFileId, IList<LogFileToolTypeCodes>? existingCodes, ICollection<int>? newCodelistIds)
    {
        newCodelistIds = newCodelistIds?.ToList() ?? [];
        existingCodes ??= [];

        // Remove codes not in newCodelistIds
        var codesToRemove = existingCodes.Where(toolTypeCode => !newCodelistIds.Contains(toolTypeCode.CodelistId)).ToList();
        foreach (var toolTypeCode in codesToRemove)
        {
            Context.Remove(toolTypeCode);
        }

        // Add codes that are in newCodelistIds but not in existingCodes
        var idsToAdd = newCodelistIds.Where(id => !existingCodes.Any(lc => lc.CodelistId == id)).ToList();
        foreach (var id in idsToAdd)
        {
            var codelist = await Context.Codelists.FindAsync(id).ConfigureAwait(false);
            if (codelist != null)
            {
                existingCodes.Add(new LogFileToolTypeCodes
                {
                    CodelistId = codelist.Id,
                    LogFileId = logFileId,
                });
            }
        }
    }

    /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(LogRun entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }

    private async Task<bool> IsRunNumberUnique(LogRun logRun)
    {
        var hasBoreholeLogRunsWithSameRunNumber = await Context.LogRuns
                .AnyAsync(lr => lr.BoreholeId == logRun.BoreholeId && lr.Id != logRun.Id && lr.RunNumber == logRun.RunNumber)
                .ConfigureAwait(false);

        return !hasBoreholeLogRunsWithSameRunNumber;
    }
}
