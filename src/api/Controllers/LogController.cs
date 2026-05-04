using Amazon.S3;
using BDMS.Authentication;
using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.IO.Compression;
using System.Text;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LogController : BoreholeControllerBase<LogRun>
{
    private const long MaxFileSize = 5_000_000_000; // ~5 GB max file size
    private const string LogRunExportFileName = "log_runs";
    private const string LogFileExportFileName = "log_files";
    private const string LogExportFileName = "log_export";
    private const string LogRunErrorPrefix = "LogRun";
    private const string LogFileErrorPrefix = "LogFile";
    private const string ImportDateFormat = "dd/MM/yyyy";
    private const string RunNumberValueKey = "runNumber";
    private const string FileNameValueKey = "fileName";
    private readonly LogFileCloudService logFileCloudService;
    private readonly List<ImportError> importErrors = [];

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
    /// Uploads a log file to the cloud storage and links it to the log run.
    /// If <paramref name="logFileId"/> is provided, the file is linked to the existing <see cref="LogFile"/> instead of creating a new one.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="logRunId">The log run ID to associate with the file.</param>
    /// <param name="logFileId">Optional existing log file ID to link the uploaded file to.</param>
    [HttpPost("upload")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(MaxFileSize)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> UploadAsync(IFormFile file, [Range(1, int.MaxValue)] int logRunId, int? logFileId = null)
    {
        var logRun = await Context.LogRuns
            .Include(lr => lr.Borehole)
            .FirstOrDefaultAsync(lr => lr.Id == logRunId)
            .ConfigureAwait(false);

        if (logRun == null) return NotFound($"LogRun with ID {logRunId} not found.");

        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), logRun.BoreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided.");
        }

        if (file.Length > MaxFileSize)
        {
            return Problem(detail: $"{logRun.RunNumber} - {file.FileName}: File size exceeds maximum file size of {MaxFileSize} bytes.", type: ProblemType.UserError);
        }

        try
        {
            if (logFileId.HasValue)
            {
                var existingLogFile = await Context.LogFiles
                    .FirstOrDefaultAsync(lf => lf.Id == logFileId.Value && lf.LogRunId == logRunId)
                    .ConfigureAwait(false);

                if (existingLogFile == null)
                {
                    return NotFound($"LogFile with ID {logFileId.Value} not found for LogRun {logRunId}.");
                }

                await logFileCloudService.UploadFileForExistingLogFileAsync(
                    file.OpenReadStream(),
                    file.ContentType,
                    existingLogFile.NameUuid!)
                    .ConfigureAwait(false);

                return Ok(existingLogFile);
            }

            var logFile = await logFileCloudService.UploadLogFileAndLinkToLogRunAsync(
                file.OpenReadStream(),
                file.FileName,
                file.ContentType,
                logRunId)
                .ConfigureAwait(false);

            return Ok(logFile);
        }
        catch (InvalidOperationException ex)
        {
            Logger.LogError(ex, "An error occurred while uploading the file.");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "An error occurred while uploading the file.");
            return Problem(detail: $"{logRun.RunNumber} - {file.FileName}: {ex.Message}", type: ProblemType.UserError);
        }
    }

    /// <summary>
    /// Downloads a log file from the cloud storage.
    /// </summary>
    /// <param name="id">The <see cref="LogFile.Id"/> of the file to download.</param>
    /// <returns>The stream of the downloaded file.</returns>
    [HttpGet("download")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> DownloadAsync([Range(1, int.MaxValue)] int id)
    {
        try
        {
            var logFile = await Context.LogFiles
                .FirstOrDefaultAsync(f => f.Id == id)
                .ConfigureAwait(false);

            if (logFile == null || logFile.NameUuid == null)
            {
                return NotFound($"File with id {id} not found.");
            }

            if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), logFile.LogRun.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            var fileBytes = await logFileCloudService.GetObject(logFile.NameUuid).ConfigureAwait(false);

            return File(fileBytes, "application/octet-stream", logFile.Name);
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
    /// Imports log runs and optionally log files from CSV files.
    /// </summary>
    [HttpPost("import")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(MaxFileSize)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> ImportAsync([FromQuery] int boreholeId, IFormFile logRunsCsvFile, IFormFile? logFilesCsvFile, IFormFile? fileListFile)
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

        if (logRunsCsvFile == null)
        {
            return BadRequest(new { detail = "Log runs CSV file is required.", messageKey = "importErrorLogRunsCsvRequired" });
        }

        if (logFilesCsvFile != null && fileListFile == null)
        {
            return BadRequest(new { detail = "File list is required when a log files CSV is provided.", messageKey = "importErrorFileListRequired" });
        }

        if (logFilesCsvFile == null && fileListFile != null)
        {
            return BadRequest(new { detail = "Log files CSV is required when a file list is provided.", messageKey = "importErrorLogFilesCsvRequired" });
        }

        var logSchemas = new[]
        {
            LogSchemas.LogBoreholeStatusSchema,
            LogSchemas.LogConveyanceMethodSchema,
            LogSchemas.LogPassTypeSchema,
            LogSchemas.LogDataPackageSchema,
            LogSchemas.LogDepthTypeSchema,
            LogSchemas.LogToolTypeSchema,
        };

        var codelists = await Context.Codelists
            .Where(c => logSchemas.Contains(c.Schema))
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);

        var parsedLogRuns = ParseLogRunsCsv(logRunsCsvFile, CsvConfigHelper.CsvReadConfig, codelists);
        await ValidateLogRuns(parsedLogRuns, boreholeId).ConfigureAwait(false);

        List<(string RunNumber, LogFile LogFile)> parsedLogFiles = [];
        if (logFilesCsvFile != null)
        {
            var fileNames = await ReadFileListAsync(fileListFile!).ConfigureAwait(false);
            parsedLogFiles = ParseLogFilesCsv(logFilesCsvFile, CsvConfigHelper.CsvReadConfig, codelists, parsedLogRuns, fileNames);
        }

        if (importErrors.Count > 0) return BadRequest(importErrors);

        var runNumbers = new List<string>();
        foreach (var parsed in parsedLogRuns)
        {
            var logRun = new LogRun
            {
                BoreholeId = boreholeId,
                RunNumber = parsed.RunNumber,
                FromDepth = parsed.FromDepth,
                ToDepth = parsed.ToDepth,
                BoreholeStatusId = parsed.BoreholeStatusId,
                RunDate = parsed.RunDate,
                BitSize = parsed.BitSize,
                ConveyanceMethodId = parsed.ConveyanceMethodId,
                ServiceCo = parsed.ServiceCo,
                Comment = parsed.Comment,
                LogFiles = parsedLogFiles
                    .Where(pf => pf.RunNumber == parsed.RunNumber)
                    .Select(pf => pf.LogFile)
                    .ToList(),
            };
            Context.LogRuns.Add(logRun);
            runNumbers.Add(parsed.RunNumber);
        }

        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

        var result = await Context.LogRunsWithIncludes
            .AsNoTracking()
            .Where(lr => lr.BoreholeId == boreholeId && runNumbers.Contains(lr.RunNumber))
            .ToListAsync()
            .ConfigureAwait(false);

        return Ok(result);
    }

    private List<ParsedLogRun> ParseLogRunsCsv(IFormFile csvFile, CsvConfiguration config, List<Codelist> codelists)
    {
        var result = new List<ParsedLogRun>();
        using var reader = new StreamReader(csvFile.OpenReadStream(), Encoding.UTF8);
        using var csv = new CsvReader(reader, config);

        csv.Read();
        csv.ReadHeader();

        var rowIndex = 0;
        while (csv.Read())
        {
            rowIndex++;
            var rowErrorStartIndex = importErrors.Count;
            var runNumber = csv.GetField<string>("RunNumber") ?? string.Empty;
            if (string.IsNullOrWhiteSpace(runNumber))
            {
                AddImportError(rowIndex, "RunNumber is required.", "importErrorRunNumberRequired", LogRunErrorPrefix);
            }

            var fromDepth = TryParseImportDouble(csv.GetField<string>("FromDepth"), rowIndex, "FromDepth", LogRunErrorPrefix, "importErrorFromDepthRequired", required: true);
            var toDepth = TryParseImportDouble(csv.GetField<string>("ToDepth"), rowIndex, "ToDepth", LogRunErrorPrefix, "importErrorToDepthRequired", required: true);

            var boreholeStatusId = ResolveCodelistId(LogSchemas.LogBoreholeStatusSchema, csv.GetField<string>("BoreholeStatus"), codelists, rowIndex, "BoreholeStatus", LogRunErrorPrefix);
            var conveyanceMethodId = ResolveCodelistId(LogSchemas.LogConveyanceMethodSchema, csv.GetField<string>("ConveyanceMethod"), codelists, rowIndex, "ConveyanceMethod", LogRunErrorPrefix);

            var runDate = TryParseImportDate(csv.GetField<string>("RunDate"), rowIndex, "RunDate", LogRunErrorPrefix);
            var bitSize = TryParseImportDouble(csv.GetField<string>("BitSize"), rowIndex, "BitSize", LogRunErrorPrefix, "importErrorInvalidNumberFormat");

            result.Add(new ParsedLogRun
            {
                RunNumber = runNumber,
                FromDepth = fromDepth ?? 0,
                ToDepth = toDepth ?? 0,
                BoreholeStatusId = boreholeStatusId,
                RunDate = runDate,
                BitSize = bitSize,
                ConveyanceMethodId = conveyanceMethodId,
                ServiceCo = csv.GetField<string>("ServiceCo"),
                Comment = csv.GetField<string>("Comment"),
            });

            // Tag every error from this row with the run number so it can be shown as the group header.
            TagRowErrors(rowErrorStartIndex, RunNumberValueKey, runNumber);
        }

        return result;
    }

    private List<(string RunNumber, LogFile LogFile)> ParseLogFilesCsv(IFormFile csvFile, CsvConfiguration config, List<Codelist> codelists, List<ParsedLogRun> logRuns, IReadOnlyList<string> fileNames)
    {
        var result = new List<(string RunNumber, LogFile LogFile)>();
        var validRunNumbers = logRuns.Select(lr => lr.RunNumber).ToHashSet();
        var referencedFileNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        using var reader = new StreamReader(csvFile.OpenReadStream(), Encoding.UTF8);
        using var csv = new CsvReader(reader, config);

        csv.Read();
        csv.ReadHeader();

        var rowIndex = 0;
        while (csv.Read())
        {
            rowIndex++;
            var rowErrorStartIndex = importErrors.Count;

            var runNumber = csv.GetField<string>("RunNumber") ?? string.Empty;
            if (!validRunNumbers.Contains(runNumber))
            {
                AddImportError(rowIndex, $"RunNumber '{runNumber}' does not match any imported log run.", "importErrorRunNumberNotFound", LogFileErrorPrefix, new() { [RunNumberValueKey] = runNumber });
            }

            var name = csv.GetField<string>("Name") ?? string.Empty;
            var extension = csv.GetField<string>("Extension") ?? string.Empty;
            var expectedFileName = string.IsNullOrWhiteSpace(extension) ? name : $"{name}.{extension}";

            var matchedFileName = fileNames.FirstOrDefault(f => string.Equals(f, expectedFileName, StringComparison.OrdinalIgnoreCase));
            if (matchedFileName == null)
            {
                AddImportError(rowIndex, $"No file in file list matches '{expectedFileName}'.", "importErrorFileNotFound", LogFileErrorPrefix);
            }
            else
            {
                referencedFileNames.Add(matchedFileName);
            }

            var sanitizedName = (matchedFileName ?? expectedFileName).Replace(" ", "_", StringComparison.OrdinalIgnoreCase);
            var fileExtension = Path.GetExtension(sanitizedName);

            var toolTypeCodes = ResolveToolTypeCodelistIds(csv.GetField<string>("LogFileToolTypeCodes"), codelists, rowIndex);

            var passStr = csv.GetField<string>("Pass");
            int? pass = null;
            if (!string.IsNullOrWhiteSpace(passStr) && int.TryParse(passStr, out var parsedPass))
            {
                pass = parsedPass;
            }

            var passTypeId = ResolveCodelistId(LogSchemas.LogPassTypeSchema, csv.GetField<string>("PassType"), codelists, rowIndex, "PassType", LogFileErrorPrefix);
            var dataPackageId = ResolveCodelistId(LogSchemas.LogDataPackageSchema, csv.GetField<string>("DataPackage"), codelists, rowIndex, "DataPackage", LogFileErrorPrefix);
            var depthTypeId = ResolveCodelistId(LogSchemas.LogDepthTypeSchema, csv.GetField<string>("DepthType"), codelists, rowIndex, "DepthType", LogFileErrorPrefix);

            var deliveryDate = TryParseImportDate(csv.GetField<string>("DeliveryDate"), rowIndex, "DeliveryDate", LogFileErrorPrefix);

            var publicValue = ParseLocalizedYesNo(csv.GetField<string>("Public"), rowIndex);

            var logFile = new LogFile
            {
                Name = sanitizedName,
                NameUuid = $"{Guid.NewGuid()}{fileExtension}",
                PassTypeId = passTypeId,
                Pass = pass,
                DataPackageId = dataPackageId,
                DepthTypeId = depthTypeId,
                DeliveryDate = deliveryDate,
                Public = publicValue,
                LogFileToolTypeCodes = toolTypeCodes
                    .Select(id => new LogFileToolTypeCodes { CodelistId = id })
                    .ToList(),
            };

            result.Add((runNumber, logFile));

            // Tag every error from this row with the expected file name so it can be shown as the group header.
            TagRowErrors(rowErrorStartIndex, FileNameValueKey, expectedFileName);
        }

        AddErrorsForUnreferencedAttachments(fileNames, referencedFileNames, rowIndex);

        return result;
    }

    private void AddErrorsForUnreferencedAttachments(IReadOnlyList<string> fileNames, HashSet<string> referencedFileNames, int rowIndexOffset)
    {
        var orphans = fileNames.Where(name => !referencedFileNames.Contains(name)).ToList();
        for (var i = 0; i < orphans.Count; i++)
        {
            var orphanRowIndex = rowIndexOffset + i + 1;
            AddImportError(orphanRowIndex, $"Attachment '{orphans[i]}' is not referenced by any row in the log files CSV.", "importErrorAttachmentNotInCsv", LogFileErrorPrefix, new() { [FileNameValueKey] = orphans[i] });
        }
    }

    private void TagRowErrors(int rowErrorStartIndex, string valueKey, string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        for (var i = rowErrorStartIndex; i < importErrors.Count; i++)
        {
            importErrors[i].Values![valueKey] = value;
        }
    }

    private async Task ValidateLogRuns(List<ParsedLogRun> parsedLogRuns, int boreholeId)
    {
        var existingRunNumbers = await Context.LogRuns
            .Where(lr => lr.BoreholeId == boreholeId)
            .Select(lr => lr.RunNumber)
            .ToListAsync()
            .ConfigureAwait(false);

        var seenRunNumbers = new HashSet<string>();
        for (var i = 0; i < parsedLogRuns.Count; i++)
        {
            var runNumber = parsedLogRuns[i].RunNumber;
            if (string.IsNullOrWhiteSpace(runNumber)) continue;

            if (!seenRunNumbers.Add(runNumber))
            {
                AddImportError(i + 1, $"Duplicate RunNumber '{runNumber}' in import file.", "importErrorDuplicateRunNumber", LogRunErrorPrefix, new() { [RunNumberValueKey] = runNumber });
            }

            if (existingRunNumbers.Contains(runNumber))
            {
                AddImportError(i + 1, $"RunNumber '{runNumber}' already exists for this borehole.", "importErrorRunNumberExists", LogRunErrorPrefix, new() { [RunNumberValueKey] = runNumber });
            }
        }
    }

    private static async Task<IReadOnlyList<string>> ReadFileListAsync(IFormFile fileListFile)
    {
        var fileNames = new List<string>();
        using var reader = new StreamReader(fileListFile.OpenReadStream(), Encoding.UTF8);
        while (await reader.ReadLineAsync().ConfigureAwait(false) is { } line)
        {
            var trimmed = line.Trim();
            if (!string.IsNullOrEmpty(trimmed))
            {
                fileNames.Add(trimmed);
            }
        }

        return fileNames;
    }

    private int? ResolveCodelistId(string schema, string? textValue, List<Codelist> codelists, int rowIndex, string fieldName, string errorPrefix)
    {
        if (string.IsNullOrWhiteSpace(textValue)) return null;

        var match = codelists.FirstOrDefault(c =>
            c.Schema == schema &&
            (string.Equals(c.En, textValue, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(c.De, textValue, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(c.Fr, textValue, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(c.It, textValue, StringComparison.OrdinalIgnoreCase)));

        if (match == null)
        {
            AddImportError(rowIndex, $"Unknown {fieldName} value: '{textValue}'.", "importErrorUnknownCodelistValue", errorPrefix, new() { ["fieldName"] = fieldName, ["value"] = textValue! });
            return null;
        }

        return match.Id;
    }

    private List<int> ResolveToolTypeCodelistIds(string? codesString, List<Codelist> codelists, int rowIndex)
    {
        if (string.IsNullOrWhiteSpace(codesString)) return [];

        var codes = codesString.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        var result = new List<int>();
        foreach (var code in codes)
        {
            var match = codelists.FirstOrDefault(c =>
                c.Schema == LogSchemas.LogToolTypeSchema &&
                string.Equals(c.Code, code, StringComparison.OrdinalIgnoreCase));

            if (match == null)
            {
                AddImportError(rowIndex, $"Unknown tool type code: '{code}'.", "importErrorUnknownToolTypeCode", LogFileErrorPrefix, new() { ["code"] = code });
            }
            else
            {
                result.Add(match.Id);
            }
        }

        return result;
    }

    private bool ParseLocalizedYesNo(string? value, int rowIndex)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;

        switch (value.Trim().ToUpperInvariant())
        {
            case "YES" or "JA" or "OUI" or "SÌ" or "SI":
                return true;
            case "NO" or "NEIN" or "NON":
                return false;
            default:
                AddImportError(rowIndex, $"Unknown Public value: '{value}'. Expected Yes/No/Ja/Nein/Oui/Non/Sì/Si/No.", "importErrorUnknownPublicValue", LogFileErrorPrefix, new() { ["value"] = value });
                return false;
    }
    }

    private void AddImportError(int rowIndex, string errorMessage, string messageKey, string prefix, Dictionary<string, string>? values = null)
    {
        values ??= new Dictionary<string, string>();
        values["rowNumber"] = rowIndex.ToString(CultureInfo.InvariantCulture);
        importErrors.Add(new ImportError($"{prefix}{rowIndex}", messageKey, errorMessage, values));
    }

    private sealed record ImportError(string ErrorKey, string MessageKey, string Detail, Dictionary<string, string>? Values = null);

    private DateOnly? TryParseImportDate(string? value, int rowIndex, string fieldName, string errorPrefix)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (DateOnly.TryParseExact(value, ImportDateFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
        {
            return parsed;
        }

        AddImportError(rowIndex, $"Invalid {fieldName} format: '{value}'. Expected {ImportDateFormat}.", "importErrorInvalidDateFormat", errorPrefix, new() { ["value"] = value });
        return null;
    }

    private double? TryParseImportDouble(string? value, int rowIndex, string fieldName, string errorPrefix, string messageKey, bool required = false)
    {
        if (string.IsNullOrWhiteSpace(value))
    {
            if (required) AddImportError(rowIndex, $"{fieldName} is required and must be a number.", messageKey, errorPrefix);
            return null;
        }

        if (double.TryParse(value, new CultureInfo("de-CH"), out var parsed)) return parsed;

        AddImportError(rowIndex, $"Invalid {fieldName} value: '{value}'. Expected a number.", messageKey, errorPrefix, new() { ["value"] = value });
        return null;
    }

    private sealed class ParsedLogRun
    {
        public string RunNumber { get; set; } = string.Empty;

        public double FromDepth { get; set; }

        public double ToDepth { get; set; }

        public int? BoreholeStatusId { get; set; }

        public DateOnly? RunDate { get; set; }

        public double? BitSize { get; set; }

        public int? ConveyanceMethodId { get; set; }

        public string? ServiceCo { get; set; }

        public string? Comment { get; set; }
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
    [HttpPost("export")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> ExportAsync([FromBody] LogExportRequest request)
    {
        var (logRuns, logFiles, error) = await LoadLogExportDataAsync(request).ConfigureAwait(false);
        if (error != null) return error;

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), logRuns[0].BoreholeId).ConfigureAwait(false)) return Unauthorized();

        try
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);
            using var memoryStream = new MemoryStream();
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                var logRunCsvBytes = await WriteLogRunCsvBytesAsync(logRuns, request.Locale).ConfigureAwait(false);
                var logRunCsvEntry = archive.CreateEntry($"{LogRunExportFileName}_{timestamp}.csv", CompressionLevel.Fastest);
                using (var logRunCsvStream = logRunCsvEntry.Open())
                {
                    await logRunCsvStream.WriteAsync(logRunCsvBytes.AsMemory(0, logRunCsvBytes.Length)).ConfigureAwait(false);
                }

                if (logFiles.Count > 0)
                {
                    var logFileCsvBytes = await WriteLogFileCsvBytesAsync(logFiles, request.Locale).ConfigureAwait(false);
                    var logFileCsvEntry = archive.CreateEntry($"{LogFileExportFileName}_{timestamp}.csv", CompressionLevel.Fastest);
                    using (var logFileCsvStream = logFileCsvEntry.Open())
                    {
                        await logFileCsvStream.WriteAsync(logFileCsvBytes.AsMemory(0, logFileCsvBytes.Length)).ConfigureAwait(false);
                    }
                }

                if (request.WithAttachments == true)
                {
                    foreach (var logFile in logFiles.Where(lf => lf.NameUuid != null && lf.Name != null))
                    {
                        var fileBytes = await logFileCloudService.GetObject(logFile.NameUuid!).ConfigureAwait(false);

                        // Export the file with the original name and the UUID as a prefix to make it unique while preserving the original name.
                        // Sanitize the name to prevent Zip Slip path traversal via directory separators embedded in the original file name.
                        var entryName = $"{logFile.NameUuid}_{FileHelper.SanitizeZipEntryFileName(logFile.Name!, "export")}";
                        var zipEntry = archive.CreateEntry(entryName, CompressionLevel.Fastest);
                        using var zipEntryStream = zipEntry.Open();
                        await zipEntryStream.WriteAsync(fileBytes.AsMemory(0, fileBytes.Length)).ConfigureAwait(false);
                    }
                }
            }

            return File(memoryStream.ToArray(), "application/zip", $"{LogExportFileName}_{timestamp}.zip");
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

    private async Task<(List<LogRun> LogRuns, List<LogFile> LogFiles, IActionResult? Error)> LoadLogExportDataAsync(LogExportRequest request)
    {
        if (request.LogRunIds.Count == 0 && request.LogFileIds.Count == 0)
            return ([], [], BadRequest("No ids were provided."));

        if (request.LogRunIds.Count > 0 && request.LogFileIds.Count > 0)
            return ([], [], BadRequest("LogRunIds and LogFileIds should not be provided together."));

        if (request.LogRunIds.Count > 0)
        {
            var logRuns = await LogRunsForExport
                .Where(lr => request.LogRunIds.Contains(lr.Id))
                .ToListAsync()
                .ConfigureAwait(false);

            if (logRuns.Count == 0) return ([], [], NotFound());

            var boreholeIds = logRuns.Select(lr => lr.BoreholeId).Distinct().ToList();
            if (boreholeIds.Count != 1) return ([], [], BadRequest("All log runs must belong to the same borehole."));

            var logFiles = await LogFilesForExport
                .Where(lf => request.LogRunIds.Contains(lf.LogRunId))
                .ToListAsync()
                .ConfigureAwait(false);

            return (logRuns, logFiles, null);
        }

        var logFilesResult = await LogFilesForExport
            .Where(lf => request.LogFileIds.Contains(lf.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (logFilesResult.Count == 0) return ([], [], NotFound());

        var logRunIds = logFilesResult.Select(lf => lf.LogRunId).Distinct().ToList();
        if (logRunIds.Count != 1) return ([], [], BadRequest("All log files must belong to the same log run."));

        var logRunsResult = await LogRunsForExport
            .Where(lr => lr.Id == logRunIds[0])
            .ToListAsync()
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
            csvWriter.WriteField(lr.RunDate?.ToString(ImportDateFormat, CultureInfo.InvariantCulture));
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
            csvWriter.WriteField(lf.DeliveryDate?.ToString(ImportDateFormat, CultureInfo.InvariantCulture));
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
