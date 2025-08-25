using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Amazon.S3.Util.S3EventNotification;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class WaterIngressController : BoreholeControllerBase<WaterIngress>
{
    public WaterIngressController(BdmsContext context, ILogger<WaterIngressController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets all water ingress records, filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole referenced in the observations to get.</param>
    /// <returns>An IEnumerable of type <see cref="WaterIngress"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<WaterIngress>>> GetAsync([FromQuery] int boreholeId)
    {
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        return await Context.WaterIngresses
            .Include(w => w.Quantity)
            .Include(w => w.Reliability)
            .Include(w => w.Conditions)
            .Include(w => w.Casing)
            .ThenInclude(c => c.Completion)
            .Where(x => x.BoreholeId == boreholeId)
            .AsNoTracking()
            .ToListAsync().ConfigureAwait(false);
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

    /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(WaterIngress entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }
}
