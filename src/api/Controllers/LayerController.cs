using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LayerController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;

    public LayerController(BdmsContext context, ILogger<LayerController> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Layer"/>s, optionally filtered by <paramref name="profileId"/>.
    /// </summary>
    /// <param name="profileId">The id of the profile containing the layers to get.</param>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Layer>>> GetAsync([FromQuery] int? profileId = null)
    {
        var layers = GetLayersWithIncludes().AsNoTracking();
        if (profileId != null)
        {
            layers = layers.Where(l => l.StratigraphyId == profileId);
        }

        if (!layers.Any())
        {
            return NotFound();
        }

        return await layers.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Layer"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of layer to get.</param>
    [HttpGet("{id}")]
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

    /// <summary>
    /// Asynchronously updates the <see cref="Layer"/> corresponding to
    /// the <paramref name="layer"/> with the values to update.
    /// </summary>
    /// <param name="layer">The <see cref="Layer"/> to update.</param>
    [HttpPut]
    public async Task<IActionResult> EditAsync(Layer layer)
    {
        if (layer == null)
        {
            return BadRequest(ModelState);
        }

        var layerToUpdate = await GetLayersWithIncludes().SingleOrDefaultAsync(c => c.Id == layer.Id).ConfigureAwait(false);

        if (layerToUpdate == null)
        {
            return NotFound();
        }

        context.Entry(layerToUpdate).CurrentValues.SetValues(layer);

        try
        {
            await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return Ok(layerToUpdate);
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the entity changes.";
            logger.LogError(ex, errorMessage);
            return Problem(errorMessage, statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private IQueryable<Layer> GetLayersWithIncludes()
    {
        return context.Layers
            .Include(l => l.QtDescription)
            .Include(l => l.Lithology)
            .Include(l => l.Chronostratigraphy)
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
