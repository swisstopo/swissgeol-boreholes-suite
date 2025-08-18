using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LithostratigraphyController : BoreholeControllerBase<LithostratigraphyLayer>
{
    public LithostratigraphyController(BdmsContext context, ILogger<LithostratigraphyController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="LithostratigraphyLayer"/>s of the specified <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy referenced in the lithostratigraphy to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<LithostratigraphyLayer>> GetAsync([FromQuery] int stratigraphyId)
    {
        var user = await Context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        var lithostratigraphyLayers = Context.LithostratigraphyLayers
            .Include(c => c.Lithostratigraphy)
            .AsNoTracking()
            .Where(l => l.StratigraphyId == stratigraphyId);

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            lithostratigraphyLayers = lithostratigraphyLayers
                .Where(l => Context.Boreholes
                .Where(b => b.WorkgroupId.HasValue)
                .Any(b => b.Id == l.Stratigraphy.BoreholeId && allowedWorkgroupIds
                .Contains(b.WorkgroupId!.Value)));
        }

        return await lithostratigraphyLayers.OrderBy(l => l.FromDepth).ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="LithostratigraphyLayer"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the lithostratigraphy to get.</param>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<LithostratigraphyLayer>> GetByIdAsync(int id)
    {
        var lithostratigraphyLayer = await Context.LithostratigraphyLayers
            .Include(c => c.Lithostratigraphy)
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (lithostratigraphyLayer == null)
        {
            return NotFound();
        }

        var boreholeId = await GetBoreholeId(lithostratigraphyLayer).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        return Ok(lithostratigraphyLayer);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<LithostratigraphyLayer>> EditAsync(LithostratigraphyLayer entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<LithostratigraphyLayer>> CreateAsync(LithostratigraphyLayer entity)
        => base.CreateAsync(entity);

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(LithostratigraphyLayer entity)
    {
        if (entity == null) return default;

        var stratigraphy = await Context.Stratigraphies
            .AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == entity.StratigraphyId)
            .ConfigureAwait(false);
        return stratigraphy?.BoreholeId;
    }
}
