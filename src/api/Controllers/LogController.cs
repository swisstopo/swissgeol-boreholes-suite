using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LogController : BoreholeControllerBase<LogRun>
{
    private const long MaxFileSize = 5_000_000_000; // ~5 GB max file size
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
