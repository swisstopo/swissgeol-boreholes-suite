using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LayerController : BoreholeControllerBase<Layer>
{
    public LayerController(BdmsContext context, ILogger<LayerController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
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
        var layers = Context.LayersWithIncludes.AsNoTracking();
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
        var layer = await Context.LayersWithIncludes
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

        var existingLayer = Context.Layers
            .Include(l => l.LayerColorCodes)
            .Include(l => l.LayerDebrisCodes)
            .Include(l => l.LayerGrainShapeCodes)
            .Include(l => l.LayerGrainAngularityCodes)
            .Include(l => l.LayerOrganicComponentCodes)
            .Include(l => l.LayerUscs3Codes)
            .SingleOrDefault(l => l.Id == entity.Id);

        if (existingLayer == null)
        {
            return NotFound();
        }

        Context.Entry(existingLayer).CurrentValues.SetValues(entity);

        // Update each join table
        await UpdateLayerCodesAsync(existingLayer.LayerColorCodes!, entity.ColorCodelistIds!, existingLayer.Id).ConfigureAwait(false);
        await UpdateLayerCodesAsync(existingLayer.LayerDebrisCodes!, entity.DebrisCodelistIds!, existingLayer.Id).ConfigureAwait(false);
        await UpdateLayerCodesAsync(existingLayer.LayerGrainShapeCodes!, entity.GrainShapeCodelistIds!, existingLayer.Id).ConfigureAwait(false);
        await UpdateLayerCodesAsync(existingLayer.LayerGrainAngularityCodes!, entity.GrainAngularityCodelistIds!, existingLayer.Id).ConfigureAwait(false);
        await UpdateLayerCodesAsync(existingLayer.LayerOrganicComponentCodes!, entity.OrganicComponentCodelistIds!, existingLayer.Id).ConfigureAwait(false);
        await UpdateLayerCodesAsync(existingLayer.LayerUscs3Codes!, entity.Uscs3CodelistIds!, existingLayer.Id).ConfigureAwait(false);

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

    private async Task UpdateLayerCodesAsync<T>(IList<T> existingLayerCodes, ICollection<int> newCodelistIds, int layerId)
        where T : class, ILayerCode, new()
    {
        newCodelistIds = newCodelistIds?.ToList() ?? new List<int>();
        existingLayerCodes ??= new List<T>();

        foreach (var layerCode in existingLayerCodes)
        {
            if (!newCodelistIds.Contains(layerCode.CodelistId))
            {
                Context.Remove(layerCode);
            }
        }

        foreach (var id in newCodelistIds)
        {
            if (!existingLayerCodes.Any(lc => lc.CodelistId == id))
            {
                var codelist = await Context.Codelists.FindAsync(id).ConfigureAwait(false);
                if (codelist != null)
                {
                    var newLayerCode = CreateLayerCode<T>(codelist, layerId);
                    existingLayerCodes.Add(newLayerCode);
                }
            }
        }
    }

    private T CreateLayerCode<T>(Codelist codelist, int layerId)
        where T : class, ILayerCode, new()
    {
        return new T
        {
            CodelistId = codelist.Id,
            LayerId = layerId,
        };
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id) => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Layer>> CreateAsync(Layer entity)
    {
        // Create a layer code list entry for each provided code list id.
        var colorCodes = await Context.Codelists.Where(c => entity.ColorCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
        var debrisCodes = await Context.Codelists.Where(c => entity.DebrisCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
        var grainShapeCodes = await Context.Codelists.Where(c => entity.GrainShapeCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
        var grainAngularityCodes = await Context.Codelists.Where(c => entity.GrainAngularityCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
        var organicComponentCodes = await Context.Codelists.Where(c => entity.OrganicComponentCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
        var uscs3Codes = await Context.Codelists.Where(c => entity.Uscs3CodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);

        entity.LayerColorCodes = colorCodes.Select(c => new LayerColorCode { Codelist = c, CodelistId = c.Id }).ToList();
        entity.LayerDebrisCodes = debrisCodes.Select(c => new LayerDebrisCode { Codelist = c, CodelistId = c.Id }).ToList();
        entity.LayerGrainShapeCodes = grainShapeCodes.Select(c => new LayerGrainShapeCode { Codelist = c, CodelistId = c.Id }).ToList();
        entity.LayerGrainAngularityCodes = grainAngularityCodes.Select(c => new LayerGrainAngularityCode { Codelist = c, CodelistId = c.Id }).ToList();
        entity.LayerOrganicComponentCodes = organicComponentCodes.Select(c => new LayerOrganicComponentCode { Codelist = c, CodelistId = c.Id }).ToList();
        entity.LayerUscs3Codes = uscs3Codes.Select(c => new LayerUscs3Code { Codelist = c, CodelistId = c.Id }).ToList();

        return await base.CreateAsync(entity).ConfigureAwait(false);
    }

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(Layer entity)
    {
        if (entity == null) return default;

        var stratigraphy = await Context.Stratigraphies
            .AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == entity.StratigraphyId)
            .ConfigureAwait(false);
        return stratigraphy?.BoreholeId;
    }
}
