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
    /// Asynchronously gets all groundwater level measurement records optionally filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole referenced in the observations to get.</param>
    /// <returns>An IEnumerable of type <see cref="GroundwaterLevelMeasurement"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<GroundwaterLevelMeasurement>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var su = HttpContext.GetUserSubjectId();
        var user = await Context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        var groundwaterLevelMeasurements = Context.GroundwaterLevelMeasurements
            .Include(w => w.Kind)
            .Include(w => w.Reliability)
            .Include(w => w.Casing)
            .ThenInclude(c => c.Completion)
            .AsNoTracking();

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            groundwaterLevelMeasurements = groundwaterLevelMeasurements
                .Where(g => Context.Boreholes
                .Where(b => b.WorkgroupId.HasValue)
                .Any(b => b.Id == g.BoreholeId && allowedWorkgroupIds
                .Contains(b.WorkgroupId!.Value)));
        }

        if (boreholeId != null)
        {
            groundwaterLevelMeasurements = groundwaterLevelMeasurements.Where(g => g.BoreholeId == boreholeId);
        }

        return await groundwaterLevelMeasurements.ToListAsync().ConfigureAwait(false);
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
