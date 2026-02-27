using BDMS.Maintenance;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace BDMS.Controllers;

/// <summary>
/// Controller for running and monitoring maintenance tasks.
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class MaintenanceController(BdmsContext context, MaintenanceTaskService maintenanceTaskService) : ControllerBase
{
    /// <summary>
    /// Starts the specified maintenance task in the background.
    /// The task type is resolved from the route parameter.
    /// </summary>
    /// <param name="taskType">The <see cref="MaintenanceTaskType"/> to start.</param>
    /// <param name="parameters">Migration parameters controlling whether to process only missing values and whether to perform a dry run.</param>
    [HttpPost("{taskType}")]
    [SwaggerResponse(StatusCodes.Status202Accepted, "The maintenance task was accepted and started in the background.")]
    [SwaggerResponse(StatusCodes.Status409Conflict, "The task is already running.")]
    public async Task<IActionResult> StartTaskAsync(MaintenanceTaskType taskType, [FromBody] MigrationParameters parameters)
    {
        var subjectId = User.Claims.Single(c => c.Type == ClaimTypes.NameIdentifier).Value;
        var user = await context.Users.SingleAsync(u => u.SubjectId == subjectId).ConfigureAwait(false);

        // The "already running" case returns a synchronously completed Task<bool> with value false.
        // Do not await the result — the background task is intentionally fire-and-forget.
        var startTask = maintenanceTaskService.TryStartTaskAsync(taskType, parameters, user.Id);
#pragma warning disable CA1849 // Safe: only accessed after IsCompletedSuccessfully check
        if (startTask.IsCompletedSuccessfully && !startTask.Result)
#pragma warning restore CA1849
        {
            return Conflict("The task is already running.");
        }

        return Accepted();
    }

    /// <summary>
    /// Gets the current in-memory state of all maintenance tasks.
    /// </summary>
    [HttpGet("status")]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns the current state of all maintenance tasks.", typeof(IReadOnlyList<MaintenanceTaskState>))]
    public async Task<ActionResult<IReadOnlyList<MaintenanceTaskState>>> GetStatusAsync() =>
        Ok(await maintenanceTaskService.GetTaskStatesAsync().ConfigureAwait(false));

    /// <summary>
    /// Gets a paginated list of execution log entries for all maintenance tasks.
    /// </summary>
    /// <param name="pageNumber">The page number to retrieve, starting at 1 for the first page.</param>
    /// <param name="pageSize">The number of entries per page (default 5, max 100).</param>
    /// <param name="includeDryRun">Whether to include dry-run entries (default false).</param>
    [HttpGet("logs")]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns a paginated list of log entries.", typeof(PaginatedLogResponse))]
    public async Task<ActionResult<PaginatedLogResponse>> GetLogsAsync(
        [FromQuery][Range(1, int.MaxValue)] int pageNumber = 1,
        [FromQuery][Range(1, 100)] int pageSize = 5,
        [FromQuery] bool includeDryRun = false)
    {
        pageSize = Math.Min(100, Math.Max(1, pageSize));
        return Ok(await maintenanceTaskService
            .GetPaginatedLogEntriesAsync(pageNumber, pageSize, includeDryRun)
            .ConfigureAwait(false));
    }
}
