using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BackfillController : BdmsControllerBase<Backfill>
{
    public BackfillController(BdmsContext context, ILogger<Backfill> logger)
        : base(context, logger)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Backfill"/>s, optionally filtered by <paramref name="completionId"/>.
    /// </summary>
    /// <param name="completionId">The id of the completion containing the <see cref="Backfill"/> to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Backfill>> GetAsync([FromQuery] int? completionId = null)
    {
        var backfills = Context.Backfills
            .Include(b => b.Material)
            .Include(b => b.Kind)
            .Include(b => b.Casing)
            .AsNoTracking();

        if (completionId != null)
        {
            backfills = backfills.Where(b => b.CompletionId == completionId);
        }

        return await backfills.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Backfill"/> with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Backfill>> GetByIdAsync(int id)
    {
        var backfill = await Context.Backfills
            .Include(b => b.Material)
            .Include(b => b.Kind)
            .Include(b => b.Casing)
            .AsNoTracking()
            .SingleOrDefaultAsync(i => i.Id == id)
            .ConfigureAwait(false);

        if (backfill == null)
        {
            return NotFound();
        }

        return Ok(backfill);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<Backfill>> CreateAsync(Backfill entity)
        => base.CreateAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<Backfill>> EditAsync(Backfill entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);
}
