using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LayerController : BdmsControllerBase<Layer>
{
    public LayerController(BdmsContext context, ILogger<Layer> logger)
        : base(context, logger)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Layer"/>s, optionally filtered by <paramref name="profileId"/>.
    /// </summary>
    /// <param name="profileId">The id of the profile containing the layers to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Layer>>> GetAsync([FromQuery] int? profileId = null)
    {
        var layers = GetLayersWithIncludes().AsNoTracking();
        if (profileId != null)
        {
            layers = layers.Where(l => l.StratigraphyId == profileId);
        }

        return await layers.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Layer"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of layer to get.</param>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Layer>> GetByIdAsync(int id)
    {
        var layer = await GetLayersWithIncludes()
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (layer == null)
        {
            return NotFound();
        }

        return Ok(layer);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public async override Task<ActionResult<Layer>> EditAsync(Layer entity)
    {
        if (entity == null)
        {
            return BadRequest(ModelState);
        }

        var existingLayer = Context.Layers.Include(l => l.LayerCodelists).Include(c => c.Codelists).SingleOrDefault(l => l.Id == entity.Id);
        var codelistIds = entity.CodelistIds?.ToList();
        if (existingLayer != default)
        {
            Context.Entry(existingLayer).CurrentValues.SetValues(entity);
        }
        else
        {
            return NotFound();
        }

        if (codelistIds?.Count > 0)
        {
            foreach (var layerCodelist in existingLayer.LayerCodelists)
            {
                if (!entity.CodelistIds.Contains(layerCodelist.CodelistId))
                {
                    Context.Remove(layerCodelist);
                }
            }

            foreach (var id in entity.CodelistIds)
            {
                if (!existingLayer.LayerCodelists.Any(lc => lc.CodelistId == id))
                {
                    var codelist = await Context.Codelists.FindAsync(id).ConfigureAwait(false);
                    if (codelist != null)
                    {
                        existingLayer.LayerCodelists ??= new List<LayerCodelist>();

                        existingLayer.LayerCodelists.Add(new LayerCodelist { Codelist = codelist, CodelistId = codelist.Id, SchemaName = codelist.Schema! });
                    }
                }
            }
        }

        try
        {
            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return await GetByIdAsync(entity.Id).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the entity changes.";
            Logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Layer>> CreateAsync(Layer entity)
    {
        // Create a layer code list entry for each provided code list id.
        var codeLists = await Context.Codelists.Where(c => entity.CodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
        entity.LayerCodelists = codeLists.Where(c => c.Schema != null).Select(c => new LayerCodelist { Codelist = c, CodelistId = c.Id, SchemaName = c.Schema! }).ToList();

        return await base.CreateAsync(entity).ConfigureAwait(false);
    }

    private IQueryable<Layer> GetLayersWithIncludes()
    {
        return Context.Layers
            .Include(l => l.QtDescription)
            .Include(l => l.Lithology)
            .Include(l => l.Plasticity)
            .Include(l => l.Consistance)
            .Include(l => l.Alteration)
            .Include(l => l.Compactness)
            .Include(l => l.GrainSize1)
            .Include(l => l.GrainSize2)
            .Include(l => l.Cohesion)
            .Include(l => l.Uscs1)
            .Include(l => l.Uscs2)
            .Include(l => l.UscsDetermination)
            .Include(l => l.Lithostratigraphy)
            .Include(l => l.Humidity)
            .Include(l => l.InstrumentKind)
            .Include(l => l.InstrumentStatus)
            .Include(l => l.CasingKind)
            .Include(l => l.CasingMaterial)
            .Include(l => l.FillMaterial)
            .Include(l => l.Gradation)
            .Include(l => l.FillKind)
            .Include(l => l.LithologyTopBedrock)
            .Include(l => l.LayerCodelists)
            .Include(l => l.Codelists);
    }
}
