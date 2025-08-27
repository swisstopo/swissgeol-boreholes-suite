using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class GroundwaterLevelMeasurementController : BoreholeControllerBase<GroundwaterLevelMeasurement>
{
    public GroundwaterLevelMeasurementController(BdmsContext context, ILogger<GroundwaterLevelMeasurementController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets all groundwater level measurement records, filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole referenced in the observations to get.</param>
    /// <returns>An IEnumerable of type <see cref="GroundwaterLevelMeasurement"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<GroundwaterLevelMeasurement>>> GetAsync([FromQuery] int boreholeId)
    {
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        return await Context.GroundwaterLevelMeasurements
            .Include(w => w.Kind)
            .Include(w => w.Reliability)
            .Include(w => w.Casing)
            .ThenInclude(c => c.Completion)
            .Where(x => x.BoreholeId == boreholeId)
            .AsNoTracking()
            .ToListAsync().ConfigureAwait(false);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<GroundwaterLevelMeasurement>> EditAsync(GroundwaterLevelMeasurement entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<GroundwaterLevelMeasurement>> CreateAsync(GroundwaterLevelMeasurement entity)
        => base.CreateAsync(entity);

    /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(GroundwaterLevelMeasurement entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }
}
