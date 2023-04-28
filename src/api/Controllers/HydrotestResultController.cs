using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class HydrotestResultController : BdmsControllerBase<HydrotestResult>
{
    private readonly BdmsContext context;

    public HydrotestResultController(BdmsContext context, ILogger<HydrotestResult> logger)
        : base(context, logger)
    {
        this.context = context;
    }

    /// <summary>
    /// Asynchronously gets all hydrotest results optionally filtered by <paramref name="hydrotestId"/>.
    /// </summary>
    /// <param name="hydrotestId">The id of the hydrotest referenced in the hydrotest results to get.</param>
    /// <returns>An IEnumerable of type <see cref="HydrotestResult"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<HydrotestResult>> GetAsync([FromQuery] int? hydrotestId = null)
    {
        var hydrotestes = context.HydrotestResults.AsNoTracking();

        if (hydrotestId != null)
        {
            hydrotestes = hydrotestes.Where(w => w.HydrotestId == hydrotestId);
        }

        return await hydrotestes.ToListAsync().ConfigureAwait(false);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> EditAsync(HydrotestResult entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> CreateAsync(HydrotestResult entity)
        => base.CreateAsync(entity);
}
