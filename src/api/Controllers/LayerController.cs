﻿using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LayerController : BdmsControllerBase<Layer>
{
    private readonly BdmsContext context;

    public LayerController(BdmsContext context, ILogger<Layer> logger)
        : base(context, logger)
    {
        this.context = context;
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
    public override Task<IActionResult> EditAsync(Layer entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> CreateAsync(Layer entity)
        => base.CreateAsync(entity);

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
