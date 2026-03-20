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
    /// Returns 202 Accepted if the task was started, or 409 Conflict if it is already running.
    /// </summary>
    /// <param name="taskType">The <see cref="MaintenanceTaskType"/> to start.</param>
    /// <param name="parameters">Parameters controlling whether to process only missing values and whether to perform a dry run.</param>
    [HttpPost("{taskType}")]
    [SwaggerResponse(StatusCodes.Status202Accepted, "The maintenance task was accepted and started in the background.")]
    [SwaggerResponse(StatusCodes.Status409Conflict, "The task is already running.")]
    public async Task<IActionResult> StartTaskAsync(MaintenanceTaskType taskType, [FromBody] MaintenanceTaskParameters parameters)
    {
        var subjectId = User.Claims.Single(c => c.Type == ClaimTypes.NameIdentifier).Value;
        var user = await context.Users.SingleAsync(u => u.SubjectId == subjectId).ConfigureAwait(false);

        if (!maintenanceTaskService.TryStartTask(taskType, parameters, user.Id))
        {
            return Problem(detail: "The task is already running.", statusCode: StatusCodes.Status409Conflict, type: ProblemType.UserError);
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
        [FromQuery][Range(1, 100)] int pageSize = 10,
        [FromQuery] bool includeDryRun = false)
    {
        pageSize = Math.Min(100, Math.Max(1, pageSize));
        return Ok(await maintenanceTaskService
            .GetPaginatedLogEntriesAsync(pageNumber, pageSize, includeDryRun)
            .ConfigureAwait(false));
    }
}
