using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class HydrotestController : BdmsControllerBase<Hydrotest>
{
    private readonly BdmsContext context;

    public HydrotestController(BdmsContext context, ILogger<Hydrotest> logger)
        : base(context, logger)
    {
        this.context = context;
    }

    /// <summary>
    /// Asynchronously gets all hydrotest records optionally filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole referenced in the observations to get.</param>
    /// <returns>An IEnumerable of type <see cref="Hydrotest"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Hydrotest>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var hydrotestes = context.Hydrotests
            .Include(w => w.TestKind)
            .Include(w => w.Codelists)
            .Include(w => w.Reliability)
            .Include(w => w.HydrotestResults)
            .AsNoTracking();

        if (boreholeId != null)
        {
            hydrotestes = hydrotestes.Where(w => w.BoreholeId == boreholeId);
        }

        return await hydrotestes.ToListAsync().ConfigureAwait(false);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> EditAsync(Hydrotest entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> CreateAsync(Hydrotest entity)
        => base.CreateAsync(entity);
}
