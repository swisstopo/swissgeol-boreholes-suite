﻿using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class WaterIngressController : BdmsControllerBase<WaterIngress>
{
    private readonly BdmsContext context;

    public WaterIngressController(BdmsContext context, ILogger<WaterIngress> logger)
        : base(context, logger)
    {
        this.context = context;
    }

    /// <summary>
    /// Asynchronously gets all water ingress records optionally filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole referenced in the observations to get.</param>
    /// <returns>An IEnumerable of type <see cref="WaterIngress"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<WaterIngress>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var waterIngresses = context.WaterIngresses
            .Include(w => w.Quantity)
            .Include(w => w.Reliability)
            .Include(w => w.Conditions)
            .Include(w => w.Casing)
            .AsNoTracking();

        if (boreholeId != null)
        {
            waterIngresses = waterIngresses.Where(w => w.BoreholeId == boreholeId);
        }

        return await waterIngresses.ToListAsync().ConfigureAwait(false);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> EditAsync(WaterIngress entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> CreateAsync(WaterIngress entity)
        => base.CreateAsync(entity);
}
