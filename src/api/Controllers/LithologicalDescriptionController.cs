using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LithologicalDescriptionController : BoreholeControllerBase<LithologicalDescription>
{
    public LithologicalDescriptionController(BdmsContext context, ILogger<LithologicalDescriptionController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="LithologicalDescription"/>s, optionally filtered by <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy referenced in the lithological descriptions to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<LithologicalDescription>> GetAsync([FromQuery] int? stratigraphyId = null)
    {
        var lithologicalDescriptions = Context.LithologicalDescriptions
            .AsNoTracking();

        if (stratigraphyId != null)
        {
            lithologicalDescriptions = lithologicalDescriptions.Where(l => l.StratigraphyId == stratigraphyId);
        }

        return await lithologicalDescriptions.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="LithologicalDescription"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the lithological description to get.</param>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<LithologicalDescription>> GetByIdAsync(int id)
    {
        var lithologicalDescription = await Context.LithologicalDescriptions
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (lithologicalDescription == null)
        {
            return NotFound();
        }

        return Ok(lithologicalDescription);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<LithologicalDescription>> EditAsync(LithologicalDescription entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<LithologicalDescription>> CreateAsync(LithologicalDescription entity)
        => base.CreateAsync(entity);

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(LithologicalDescription entity)
    {
        if (entity == null) return default;

        var stratigraphy = await Context.Stratigraphies
            .AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == entity.StratigraphyId)
            .ConfigureAwait(false);
        return stratigraphy?.BoreholeId;
    }
}
