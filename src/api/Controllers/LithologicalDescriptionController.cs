using Amazon;
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
    /// Asynchronously gets the <see cref="LithologicalDescription"/>s, filtered by <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy referenced in the lithological descriptions to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<LithologicalDescription>>> GetAsync([FromQuery] int stratigraphyId)
    {
        var stratigraphy = await Context.StratigraphiesV2
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == stratigraphyId)
            .ConfigureAwait(false);

        if (stratigraphy == null)
        {
            return NotFound();
        }

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false)) return Unauthorized();

        return await Context.LithologicalDescriptions
            .AsNoTracking()
            .Where(x => x.StratigraphyId == stratigraphyId)
            .ToListAsync()
            .ConfigureAwait(false);
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

        var boreholeId = await GetBoreholeId(lithologicalDescription).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

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

    /// <summary>
    /// Asynchronously creates multiple <see cref="LithologicalDescription"/> entities in a single operation.
    /// </summary>
    /// <param name="entities">The collection of lithological descriptions to create.</param>
    /// <returns>The created lithological descriptions.</returns>
    [HttpPost("bulk")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<LithologicalDescription>>> BulkCreateAsync(IEnumerable<LithologicalDescription> entities)
    {
        var entityList = entities?.ToList();
        if (entities == null || entityList.Count == 0)
        {
            return BadRequest("No lithological descriptions provided");
        }

        // Verify all entities share the same stratigraphyId
        var stratigraphyIds = entityList.Select(e => e.StratigraphyId).Distinct().ToList();
        if (stratigraphyIds.Count != 1)
        {
            return BadRequest("All lithological descriptions must belong to the same stratigraphy");
        }

        var stratigraphyId = stratigraphyIds.Single();
        var stratigraphy = await Context.StratigraphiesV2
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == stratigraphyId)
            .ConfigureAwait(false);

        if (stratigraphy == null)
        {
            return NotFound("Stratigraphy not found");
        }

        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false)) return Unauthorized();

        await Context.LithologicalDescriptions.AddRangeAsync(entityList).ConfigureAwait(false);

        try
        {
            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return Ok(entityList);
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the lithological descriptions.";
            Logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
    }

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(LithologicalDescription entity)
    {
        if (entity == null) return default;

        var stratigraphy = await Context.StratigraphiesV2
            .AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == entity.StratigraphyId)
            .ConfigureAwait(false);
        return stratigraphy?.BoreholeId;
    }
}
