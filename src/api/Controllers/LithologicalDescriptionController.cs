﻿using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LithologicalDescriptionController : BdmsControllerBase<LithologicalDescription>
{
    private readonly BdmsContext context;

    public LithologicalDescriptionController(BdmsContext context, ILogger<LithologicalDescription> logger)
        : base(context, logger)
    {
        this.context = context;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="LithologicalDescription"/>s, optionally filtered by <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy referenced in the lithological descriptions to get.</param>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LithologicalDescription>>> GetAsync([FromQuery] int? stratigraphyId = null)
    {
        var lithologicalDescriptions = context.LithologicalDescriptions
            .Include(l => l.QtDescription)
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
    public async Task<ActionResult<LithologicalDescription>> GetByIdAsync(int id)
    {
        var lithologicalDescription = await context.LithologicalDescriptions
            .Include(l => l.QtDescription)
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (lithologicalDescription == null)
        {
            return NotFound();
        }

        return Ok(lithologicalDescription);
    }
}
