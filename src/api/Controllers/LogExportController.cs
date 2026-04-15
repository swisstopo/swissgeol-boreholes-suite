using Amazon.S3;
using BDMS.Authentication;
using BDMS.Models;
using CsvHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.IO.Compression;
using System.Text;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LogExportController : ControllerBase
{
    private const int MaxExportItems = 100;
    private const string LogRunExportFileName = "log_runs";
    private const string LogFileExportFileName = "log_files";
    private const string LogExportFileName = "log_export";
    private readonly BdmsContext context;
    private readonly ILogger<LogExportController> logger;
    private readonly LogFileCloudService logFileCloudService;
    private readonly IBoreholePermissionService boreholePermissionService;

    public LogExportController(BdmsContext context, ILogger<LogExportController> logger, IBoreholePermissionService boreholePermissionService, LogFileCloudService logFileCloudService)
    {
        this.context = context;
        this.logger = logger;
        this.logFileCloudService = logFileCloudService;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Exports log runs and their associated log files as a ZIP archive containing CSV files and optionally the file attachments.
    /// </summary>
    /// <param name="ids">The IDs of the log runs to export. All must belong to the same borehole.</param>
    /// <param name="withAttachments">Whether to include file attachments in the ZIP.</param>
    /// <param name="locale">The locale for codelist translations (e.g., "de", "en", "fr", "it").</param>
    [HttpGet("logruns")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> ExportLogRunsAsync([FromQuery][MinLength(1)][MaxLength(MaxExportItems)] IReadOnlyList<int> ids, [FromQuery] bool withAttachments, [FromQuery] string locale)
    {
        var logRuns = await context.LogRuns
            .AsNoTracking()
            .Include(lr => lr.ConveyanceMethod)
            .Include(lr => lr.BoreholeStatus)
            .Include(lr => lr.LogFiles).ThenInclude(lf => lf.LogFileToolTypeCodes).ThenInclude(tc => tc.Codelist)
            .Where(lr => ids.Contains(lr.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (logRuns.Count == 0) return NotFound();

        var boreholeIds = logRuns.Select(lr => lr.BoreholeId).Distinct().ToList();
        if (boreholeIds.Count != 1) return BadRequest("All log runs must belong to the same borehole.");

        var boreholeId = boreholeIds.Single();
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var logFiles = await context.LogFiles
            .AsNoTracking()
            .Include(lf => lf.LogRun)
            .Include(lf => lf.PassType)
            .Include(lf => lf.DataPackage)
            .Include(lf => lf.DepthType)
            .Include(lf => lf.LogFileToolTypeCodes).ThenInclude(tc => tc.Codelist)
            .Where(lf => ids.Contains(lf.LogRunId))
            .ToListAsync()
            .ConfigureAwait(false);

        try
        {
            var zipBytes = await BuildExportZipAsync(logRuns, logFiles, withAttachments, locale).ConfigureAwait(false);
            return File(zipBytes, "application/zip", $"{LogExportFileName}_{DateTime.UtcNow:yyyyMMddHHmmss}.zip");
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, "Amazon S3 Store threw an exception.");
            return Problem("An error occurred while fetching a file from the cloud storage.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to prepare ZIP file.");
            return Problem("An error occurred while preparing the ZIP file.");
        }
    }

    /// <summary>
    /// Exports specific log files and their parent log run as a ZIP archive containing CSV files and optionally the file attachments.
    /// </summary>
    /// <param name="ids">The IDs of the log files to export. All must belong to the same log run.</param>
    /// <param name="withAttachments">Whether to include file attachments in the ZIP.</param>
    /// <param name="locale">The locale for codelist translations (e.g., "de", "en", "fr", "it").</param>
    [HttpGet("logfiles")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> ExportLogFilesAsync([FromQuery][MinLength(1)][MaxLength(MaxExportItems)] IReadOnlyList<int> ids, [FromQuery] bool withAttachments, [FromQuery] string locale)
    {
        var logFiles = await context.LogFiles
            .AsNoTracking()
            .Include(lf => lf.LogRun).ThenInclude(lr => lr.ConveyanceMethod)
            .Include(lf => lf.LogRun).ThenInclude(lr => lr.BoreholeStatus)
            .Include(lf => lf.PassType)
            .Include(lf => lf.DataPackage)
            .Include(lf => lf.DepthType)
            .Include(lf => lf.LogFileToolTypeCodes).ThenInclude(tc => tc.Codelist)
            .Where(lf => ids.Contains(lf.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (logFiles.Count == 0) return NotFound();

        var logRunIds = logFiles.Select(lf => lf.LogRunId).Distinct().ToList();
        if (logRunIds.Count != 1) return BadRequest("All log files must belong to the same log run.");

        var logRun = logFiles.First().LogRun!;
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), logRun.BoreholeId).ConfigureAwait(false)) return Unauthorized();

        // Also load ToolTypeCodes for the LogRun CSV (via its LogFiles)
        var logRunWithFiles = await context.LogRuns
            .AsNoTracking()
            .Include(lr => lr.ConveyanceMethod)
            .Include(lr => lr.BoreholeStatus)
            .Include(lr => lr.LogFiles).ThenInclude(lf => lf.LogFileToolTypeCodes).ThenInclude(tc => tc.Codelist)
            .SingleOrDefaultAsync(lr => lr.Id == logRun.Id)
            .ConfigureAwait(false);

        try
        {
            var zipBytes = await BuildExportZipAsync(new List<LogRun> { logRunWithFiles! }, logFiles, withAttachments, locale).ConfigureAwait(false);
            return File(zipBytes, "application/zip", $"{LogExportFileName}_{DateTime.UtcNow:yyyyMMddHHmmss}.zip");
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, "Amazon S3 Store threw an exception.");
            return Problem("An error occurred while fetching a file from the cloud storage.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to prepare ZIP file.");
            return Problem("An error occurred while preparing the ZIP file.");
        }
    }

    private async Task<byte[]> BuildExportZipAsync(List<LogRun> logRuns, List<LogFile> logFiles, bool withAttachments, string locale)
    {

        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            var logRunCsvBytes = await WriteLogRunCsvBytesAsync(logRuns, locale).ConfigureAwait(false);
            var logRunCsvEntry = archive.CreateEntry($"{LogRunExportFileName}_{DateTime.UtcNow:yyyyMMddHHmmss}.csv", CompressionLevel.Fastest);
            using (var logRunCsvStream = logRunCsvEntry.Open())
            {
                await logRunCsvStream.WriteAsync(logRunCsvBytes.AsMemory(0, logRunCsvBytes.Length)).ConfigureAwait(false);
            }

            if (logFiles.Count > 0)
            {
                var logFileCsvBytes = await WriteLogFileCsvBytesAsync(logFiles, locale).ConfigureAwait(false);
                var logFileCsvEntry = archive.CreateEntry($"{LogFileExportFileName}_{DateTime.UtcNow:yyyyMMddHHmmss}.csv", CompressionLevel.Fastest);
                using (var logFileCsvStream = logFileCsvEntry.Open())
                {
                    await logFileCsvStream.WriteAsync(logFileCsvBytes.AsMemory(0, logFileCsvBytes.Length)).ConfigureAwait(false);
                }
            }

            if (withAttachments)
            {
                foreach (var logFile in logFiles.Where(lf => lf.NameUuid != null && lf.Name != null))
                {
                    var fileBytes = await logFileCloudService.GetObject(logFile.NameUuid!).ConfigureAwait(false);
                    var zipEntry = archive.CreateEntry(logFile.Name!, CompressionLevel.Fastest);
                    using var zipEntryStream = zipEntry.Open();
                    await zipEntryStream.WriteAsync(fileBytes.AsMemory(0, fileBytes.Length)).ConfigureAwait(false);
                }
            }
        }

        return memoryStream.ToArray();
    }

    private static async Task<byte[]> WriteLogRunCsvBytesAsync(List<LogRun> logRuns, string locale)
    {
        using var stringWriter = new StringWriter();
        using var csvWriter = new CsvWriter(stringWriter, CsvConfigHelper.CsvWriteConfig);

        csvWriter.WriteField(nameof(LogRun.Id));
        csvWriter.WriteField(nameof(LogRun.BoreholeId));
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
            csvWriter.WriteField(lr.Id);
            csvWriter.WriteField(lr.BoreholeId);
            csvWriter.WriteField(lr.RunNumber);
            csvWriter.WriteField(lr.FromDepth);
            csvWriter.WriteField(lr.ToDepth);
            csvWriter.WriteField(string.Join(",", toolTypes));
            csvWriter.WriteField(GetCodelistText(lr.BoreholeStatus, locale));
            csvWriter.WriteField(lr.RunDate?.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture));
            csvWriter.WriteField(lr.BitSize?.ToString("F3", CultureInfo.InvariantCulture));
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

        csvWriter.WriteField(nameof(LogFile.Id));
        csvWriter.WriteField(nameof(LogRun.BoreholeId));
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
            csvWriter.WriteField(lf.Id);
            csvWriter.WriteField(lf.LogRun!.BoreholeId);
            csvWriter.WriteField(lf.LogRun!.RunNumber);
            csvWriter.WriteField(Path.GetFileNameWithoutExtension(lf.Name));
            csvWriter.WriteField(string.Join(",", lf.LogFileToolTypeCodes?.Select(tc => tc.Codelist.Code).Order().ToArray() ?? []));
            csvWriter.WriteField(Path.GetExtension(lf.Name)?.TrimStart('.'));
            csvWriter.WriteField(lf.Pass);
            csvWriter.WriteField(GetCodelistText(lf.PassType, locale));
            csvWriter.WriteField(GetCodelistText(lf.DataPackage, locale));
            csvWriter.WriteField(GetCodelistText(lf.DepthType, locale));
            csvWriter.WriteField(lf.DeliveryDate?.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture));
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
}
