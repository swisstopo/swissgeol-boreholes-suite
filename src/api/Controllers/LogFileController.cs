using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.IO.Compression;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LogFileController : ControllerBase
{
    private const int MaxFileSize = 210_000_000; // ~200MB max file size
    private readonly BdmsContext context;
    private readonly ILogger<LogFileController> logger;
    private readonly IBoreholePermissionService boreholePermissionService;
    private readonly LogFileCloudService logFileCloudService;

    public LogFileController(
        BdmsContext context,
        ILogger<LogFileController> logger,
        IBoreholePermissionService boreholePermissionService,
        LogFileCloudService logFileCloudService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholePermissionService = boreholePermissionService;
        this.logFileCloudService = logFileCloudService;
    }

    /// <summary>
    /// Uploads a log file to the cloud storage and links it to the log run.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="logRunId">The log run ID to associate with the file.</param>
    /// <returns>The newly created log file.</returns>
    [HttpPost("upload")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> UploadAsync(IFormFile file, [Range(1, int.MaxValue)] int logRunId)
    {
        var logRun = await context.LogRuns
            .Include(lr => lr.Borehole)
            .FirstOrDefaultAsync(lr => lr.Id == logRunId)
            .ConfigureAwait(false);

        if (logRun == null)
        {
            return NotFound($"LogRun with ID {logRunId} not found.");
        }

        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), logRun.BoreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided.");
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest($"File size exceeds maximum file size of {MaxFileSize} bytes.");
        }

        try
        {
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
            logger.LogError(ex, "An error occurred while uploading the file.");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while uploading the file.");
            return Problem("An error occurred while uploading the file.");
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
            var logFile = await context.LogFiles
                .FirstOrDefaultAsync(f => f.Id == id)
                .ConfigureAwait(false);

            if (logFile == null|| logFile.NameUuid == null)
            {
                return NotFound($"File with id {id} not found.");
            }

            if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), logFile.LogRun.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            var fileBytes = await logFileCloudService.GetObject(logFile.NameUuid).ConfigureAwait(false);

            return File(fileBytes, "application/octet-stream", logFile.Name);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while downloading the file.");
            return Problem("An error occurred while downloading the file.");
        }
    }

    /// <summary>
    /// Gets all log files associated with a specific log run.
    /// </summary>
    /// <param name="logRunId">The ID of the log run.</param>
    /// <returns>A list of log files.</returns>
    [HttpGet("getAllForLogRun")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<LogFile>>> GetAllForLogRunAsync([Required, Range(1, int.MaxValue)] int logRunId)
    {
        var logRun = await context.LogRuns
            .Include(lr => lr.Borehole)
            .FirstOrDefaultAsync(lr => lr.Id == logRunId)
            .ConfigureAwait(false);

        if (logRun == null)
        {
            return NotFound($"LogRun with ID {logRunId} not found.");
        }

        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), logRun.BoreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        return await context.LogFiles
            .Include(lf => lf.CreatedBy)
            .Where(lf => lf.LogRunId == logRunId)
            .OrderBy(lf => lf.Name)
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Gets the file data for a specific log file.
    /// </summary>
    /// <param name="logFileId">The ID of the log file.</param>
    /// <returns>The file content.</returns>
    [HttpGet("file")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> GetFileAsync([Range(1, int.MaxValue)] int logFileId)
    {
        var logFile = await context.LogFiles
            .Include(lf => lf.LogRun)
            .FirstOrDefaultAsync(lf => lf.Id == logFileId)
            .ConfigureAwait(false);

        if (logFile == null)
        {
            return NotFound();
        }

        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), logFile.LogRun!.BoreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        var fileData = await logFileCloudService.GetObject(logFile.NameUuid!).ConfigureAwait(false);

        return File(fileData, logFile.FileType, logFile.Name);
    }

    /// <summary>
    /// Deletes one or multiple log files.
    /// </summary>
    /// <param name="logFileIds">The IDs of the log files to delete.</param>
    /// <returns>An OK result if successful.</returns>
    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> DeleteAsync([FromQuery][MaxLength(100)] IReadOnlyList<int> logFileIds)
    {
        if (logFileIds == null || logFileIds.Count == 0)
        {
            return BadRequest("The list of logFileIds must not be empty.");
        }

        var logFiles = await context.LogFiles
            .Include(lf => lf.LogRun)
            .Where(lf => logFileIds.Contains(lf.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (logFiles.Count == 0)
        {
            return NotFound();
        }

        // Make sure all log files belong to the same borehole
        var boreholeIds = logFiles.Select(lf => lf.LogRun!.BoreholeId).Distinct().ToList();
        if (boreholeIds.Count != 1)
        {
            return BadRequest("Not all log files are associated with the same borehole.");
        }

        var boreholeId = boreholeIds.Single();
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        await logFileCloudService.DeleteObjects(logFiles.Select(lf => lf.NameUuid!)).ConfigureAwait(false);

        context.RemoveRange(logFiles);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok();
    }

    /// <summary>
    /// Updates the properties of one or multiple log files.
    /// </summary>
    /// <param name="logFileUpdates">The log file updates containing the ID and properties to update.</param>
    /// <returns>An OK result if successful.</returns>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> UpdateAsync([FromBody] Collection<LogFileUpdate> logFileUpdates)
    {
        if (logFileUpdates == null || logFileUpdates.Count == 0 || logFileUpdates.Any(d => d == null || d.Id <= 0))
        {
            return BadRequest("The data must not be empty and must contain valid entries.");
        }

        var logFileIds = logFileUpdates.Select(d => d.Id).ToList();

        var logFiles = await context.LogFiles
            .Include(lf => lf.LogRun)
            .Where(lf => logFileIds.Contains(lf.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (logFiles.Count == 0)
        {
            return NotFound();
        }

        // Make sure all log files belong to the same borehole
        var boreholeIds = logFiles.Select(lf => lf.LogRun!.BoreholeId).Distinct().ToList();
        if (boreholeIds.Count != 1)
        {
            return BadRequest("Not all log files are associated with the same borehole.");
        }

        var boreholeId = boreholeIds.Single();
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        foreach (var logFile in logFiles)
        {
            var updateData = logFileUpdates.FirstOrDefault(d => d.Id == logFile.Id);
            if (updateData != null)
            {
                logFile.Public = updateData.Public;
                logFile.Pass = updateData.Pass;
                logFile.DeliveryDate = updateData.DeliveryDate;
                logFile.PassTypeId = updateData.PassTypeId;
                logFile.DataPackageId = updateData.DataPackageId;
                logFile.DepthTypeId = updateData.DepthTypeId;
            }
        }

        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok();
    }
}
