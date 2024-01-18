using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class CasingController : BdmsControllerBase<Casing>
{
    public CasingController(BdmsContext context, ILogger<Casing> logger)
        : base(context, logger)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Casing"/>s, optionally filtered by <paramref name="completionId"/>.
    /// </summary>
    /// <param name="completionId">The id of the completion containing the <see cref="Casing"/> to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Casing>> GetAsync([FromQuery] int? completionId = null)
    {
        var casings = Context.Casings
            .Include(i => i.Material)
            .Include(i => i.Kind)
            .AsNoTracking();

        if (completionId != null)
        {
            casings = casings.Where(i => i.CompletionId == completionId);
        }

        return await casings.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Backfill"/> with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Casing>> GetByIdAsync(int id)
    {
        var casing = await Context.Casings
            .Include(i => i.Material)
            .Include(i => i.Kind)
            .AsNoTracking()
            .SingleOrDefaultAsync(i => i.Id == id)
            .ConfigureAwait(false);

        if (casing == null)
        {
            return NotFound();
        }

        return Ok(casing);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<Casing>> CreateAsync(Casing entity)
        => base.CreateAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<Casing>> EditAsync(Casing entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        try
        {
            var casing = await Context.Casings
                .Include(i => i.Instrumentations)
                .AsNoTracking()
                .SingleOrDefaultAsync(i => i.Id == id)
                .ConfigureAwait(false);
            if (casing == null)
            {
                return NotFound();
            }

            if (casing.Instrumentations.Count > 0)
            {
                return Conflict("Cannot delete casing because it is referenced by an instrumentation.");
            }

            Context.Remove(casing);
            await Context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while deleting the casing.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }
}
