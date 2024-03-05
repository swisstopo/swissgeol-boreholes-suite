using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Amazon.S3.Util.S3EventNotification;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class WaterIngressController : BdmsControllerBase<WaterIngress>
{
    public WaterIngressController(BdmsContext context, ILogger<WaterIngress> logger, IBoreholeLockService boreholeLockService)
        : base(context, logger, boreholeLockService)
    {
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
        var waterIngresses = Context.WaterIngresses
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
    public override Task<ActionResult<WaterIngress>> EditAsync(WaterIngress entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<WaterIngress>> CreateAsync(WaterIngress entity)
        => base.CreateAsync(entity);

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
    protected override async Task<int?> GetBoreholeId(WaterIngress entity)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
    {
        if (entity == null) return default;
        return entity.BoreholeId;
    }
}
