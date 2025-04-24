using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class FaciesDescriptionController : BoreholeControllerBase<FaciesDescription>
{
    public FaciesDescriptionController(BdmsContext context, ILogger<FaciesDescriptionController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="FaciesDescription"/>s, optionally filtered by <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy referenced in the facies descriptions to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<FaciesDescription>> GetAsync([FromQuery] int? stratigraphyId = null)
    {
        var faciesDescriptions = Context.FaciesDescriptions
            .Include(l => l.DescriptionQuality)
            .AsNoTracking();

        if (stratigraphyId != null)
        {
            faciesDescriptions = faciesDescriptions.Where(l => l.StratigraphyId == stratigraphyId);
        }

        return await faciesDescriptions.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="FaciesDescription"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the facies description to get.</param>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<FaciesDescription>> GetByIdAsync(int id)
    {
        var faciesDescription = await Context.FaciesDescriptions
            .Include(l => l.DescriptionQuality)
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (faciesDescription == null)
        {
            return NotFound();
        }

        return Ok(faciesDescription);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<FaciesDescription>> EditAsync(FaciesDescription entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<FaciesDescription>> CreateAsync(FaciesDescription entity)
        => base.CreateAsync(entity);

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(FaciesDescription entity)
    {
        if (entity == null) return default;

        var stratigraphy = await Context.Stratigraphies
            .AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == entity.StratigraphyId)
            .ConfigureAwait(false);
        return stratigraphy?.BoreholeId;
    }
}
