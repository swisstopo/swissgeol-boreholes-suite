using Amazon.Runtime.Internal.Util;
using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class ChronostratigraphyController : BoreholeControllerBase<ChronostratigraphyLayer>
{
    public ChronostratigraphyController(BdmsContext context, ILogger<ChronostratigraphyController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="ChronostratigraphyLayer"/>s, optionally filtered by <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy referenced in the chronostratigraphy to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<ChronostratigraphyLayer>> GetAsync([FromQuery] int? stratigraphyId = null)
    {
        var chronostratigraphyLayers = Context.ChronostratigraphyLayers
            .Include(c => c.Chronostratigraphy)
            .AsNoTracking();

        if (stratigraphyId != null)
        {
            chronostratigraphyLayers = chronostratigraphyLayers.Where(l => l.StratigraphyId == stratigraphyId);
        }

        return await chronostratigraphyLayers.OrderBy(l => l.FromDepth).ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="ChronostratigraphyLayer"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the facies description to get.</param>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<ChronostratigraphyLayer>> GetByIdAsync(int id)
    {
        var chronostratigraphyLayer = await Context.ChronostratigraphyLayers
            .Include(c => c.Chronostratigraphy)
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (chronostratigraphyLayer == null)
        {
            return NotFound();
        }

        var boreholeId = await GetBoreholeId(chronostratigraphyLayer).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        return Ok(chronostratigraphyLayer);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<ChronostratigraphyLayer>> EditAsync(ChronostratigraphyLayer entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<ChronostratigraphyLayer>> CreateAsync(ChronostratigraphyLayer entity)
        => base.CreateAsync(entity);

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(ChronostratigraphyLayer entity)
    {
        if (entity == null) return default;

        var stratigraphy = await Context.Stratigraphies
            .AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == entity.StratigraphyId)
            .ConfigureAwait(false);
        return stratigraphy?.BoreholeId;
    }
}
