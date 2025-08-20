using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BackfillController : BoreholeControllerBase<Backfill>
{
    public BackfillController(BdmsContext context, ILogger<BackfillController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Backfill"/>s, filtered by <paramref name="completionId"/>.
    /// </summary>
    /// <param name="completionId">The id of the completion containing the <see cref="Backfill"/> to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Backfill>>> GetAsync([FromQuery] int completionId)
    {
        var completion = await Context.Completions
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == completionId)
            .ConfigureAwait(false);

        if (completion == null)
        {
            return NotFound();
        }

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), completion.BoreholeId).ConfigureAwait(false)) return Unauthorized();

        return await GetBackfillsWithIncludes().Where(b => b.CompletionId == completionId).ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Backfill"/> with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Backfill>> GetByIdAsync(int id)
    {
        var boreholeId = await GetBoreholeId(new Backfill { Id = id }).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var backfill = await GetBackfillsWithIncludes().SingleOrDefaultAsync(i => i.Id == id).ConfigureAwait(false);

        if (backfill == null)
        {
            return NotFound();
        }

        return Ok(backfill);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Backfill>> CreateAsync(Backfill entity)
    {
        var backfill = ProcessBackfill(entity);

        return await base.CreateAsync(backfill).ConfigureAwait(false);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Backfill>> EditAsync(Backfill entity)
    {
        var backfill = ProcessBackfill(entity);

        return await base.EditAsync(backfill).ConfigureAwait(false);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    private IQueryable<Backfill> GetBackfillsWithIncludes()
    {
        return Context.Backfills
            .Include(b => b.Material)
            .Include(b => b.Kind)
            .Include(b => b.Casing).ThenInclude(c => c.Completion)
            .AsNoTracking();
    }

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(Backfill entity)
    {
        if (entity == null) return default;

        var completion = await Context.Completions
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == entity.CompletionId)
            .ConfigureAwait(false);
        return completion?.BoreholeId;
    }

    private Backfill ProcessBackfill(Backfill backfill)
    {
        if (backfill.IsOpenBorehole)
        {
            backfill.CasingId = null;
        }

        return backfill;
    }
}
