using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LogRunController : BoreholeControllerBase<LogRun>
{
    public LogRunController(BdmsContext context, ILogger<LogRunController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
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
    public override Task<ActionResult<LogRun>> CreateAsync(LogRun entity)
        => base.CreateAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<LogRun>> EditAsync(LogRun entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(LogRun entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }
}
