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
    /// Asynchronously gets all <see cref="Layer"/>s.
    /// </summary>
    [HttpGet("")]
    public async Task<ActionResult<IEnumerable<Layer>>> GetAllAsync() => await context.Layers.AsNoTracking().ToListAsync().ConfigureAwait(false);

    /// <summary>
    /// Asynchronously gets the <see cref="Layer"/>s, filtered by <paramref name="profileId"/>.
    /// </summary>
    /// <param name="profileId">The id of the stratigraphy containing the layers to get.</param>
    /// GET /api/v2/layer/profileId/{profileId}
    [HttpGet("profileId")]
    public async Task<ActionResult<IEnumerable<Layer>>> GetByProfileIdAsync(int profileId)
    {
        var layers = context.Layers.Where(l => l.StratigraphyId == profileId);

        if (!layers.Any())
        {
            return NotFound();
        }

        return await layers.AsNoTracking().ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Layer"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of layer to get.</param>
    /// GET /api/v2/layer/id/{id}
    [HttpGet("id")]
    public async Task<ActionResult<Layer>> GetByIdAsync(int id)
    {
        var layer = await context.Layers.SingleOrDefaultAsync(l => l.Id == id).ConfigureAwait(false);

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

        var layerToUpdate = await context.Layers.SingleOrDefaultAsync(c => c.Id == layer.Id).ConfigureAwait(false);

        if (layerToUpdate == null)
        {
            return NotFound();
        }

        context.Entry(layerToUpdate).CurrentValues.SetValues(layer);

        try
        {
            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok(layerToUpdate);
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the entity changes.";
            logger.LogError(ex, errorMessage);
            return Problem(errorMessage, statusCode: StatusCodes.Status400BadRequest);
        }
    }
}
