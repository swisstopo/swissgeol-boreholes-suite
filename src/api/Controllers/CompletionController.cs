using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class CompletionController : BdmsControllerBase<Completion>
{
    private readonly IBoreholeLockService boreholeLockService;

    public CompletionController(BdmsContext context, ILogger<Completion> logger, IBoreholeLockService boreholeLockService)
        : base(context, logger)
    {
        this.boreholeLockService = boreholeLockService;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Completion"/>s, optionally filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole containing the <see cref="Completion"/> to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Completion>>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var completions = Context.Completions.AsNoTracking();

        if (boreholeId != null)
        {
            completions = completions
                .Where(c => c.BoreholeId == boreholeId)
                .Include(c => c.Kind)
                .AsNoTracking();
            completions = completions
            .OrderByDescending(c => c.IsPrimary)
            .ThenBy(c => c.Created);
        }

        return await completions.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Completion"/> with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Completion>> GetByIdAsync(int id)
    {
        var completion = await Context.Completions
            .Include(c => c.Kind)
            .AsNoTracking()
            .SingleOrDefaultAsync(i => i.Id == id)
            .ConfigureAwait(false);

        if (completion == null)
        {
            return NotFound();
        }

        return Ok(completion);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Completion>> CreateAsync(Completion entity)
    {
        if (entity == null) return BadRequest();

        try
        {
            // Check if associated borehole is locked
            var userName = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;
            if (await boreholeLockService.IsBoreholeLockedAsync(entity.BoreholeId, userName).ConfigureAwait(false))
            {
              return Problem("The borehole is locked by another user.");
            }

            // If the completion to create is the first completion of a borehole,
            // then we need to set it as the primary completion.
            var hasBoreholeExistingCompletion = await Context.Completions
                .AnyAsync(s => s.BoreholeId == entity.BoreholeId)
                .ConfigureAwait(false);

            entity.IsPrimary = !hasBoreholeExistingCompletion;

            return await base.CreateAsync(entity).ConfigureAwait(false);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("You are not authorized to create a completion for this borehole.");
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while creating the completion.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<ActionResult<Completion>> EditAsync(Completion entity)
        => base.EditAsync(entity);

    /// <summary>
    /// Asynchronously copies a <see cref="Completion"/>.
    /// </summary>
    /// <param name="id">The <see cref="Completion.Id"/> of the completion to copy.</param>
    /// <returns>The id of the newly created <see cref="Completion"/>.</returns>
    [HttpPost("copy")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> CopyAsync([Required] int id)
    {
        Logger.LogInformation("Copy completion with id <{CompletionId}>", id);

        var user = await Context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Name == HttpContext.User.FindFirst(ClaimTypes.Name).Value)
            .ConfigureAwait(false);

        if (user == null || !user.WorkgroupRoles.Any(w => w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        // TODO: Add relevant includes
        var completion = await Context.Completions
            .Include(c => c.Kind)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id)
            .ConfigureAwait(false);

        if (completion == null)
        {
            return NotFound();
        }

        // TODO: Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
        completion.Id = 0;

        completion.Name += " (Clone)";
        completion.IsPrimary = false;

        var entityEntry = await Context.AddAsync(completion).ConfigureAwait(false);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        return Ok(entityEntry.Entity.Id);
    }

    /// <inheritdoc />
    /// <remarks>Automatically sets the remaining and latest completion as the primary completion, if possible.</remarks>
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        var completionToDelete = await Context.Completions.FindAsync(id).ConfigureAwait(false);
        if (completionToDelete == null)
        {
            return NotFound();
        }

        Context.Remove(completionToDelete);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        // If the completion to delete is the primary completion of a borehole,
        // then we need to set the latest completion as the primary completion, if possible.
        if (completionToDelete.IsPrimary.GetValueOrDefault())
        {
            var latestCompletion = await Context.Stratigraphies
                .Where(s => s.BoreholeId == completionToDelete.BoreholeId)
                .OrderByDescending(s => s.Created)
                .FirstOrDefaultAsync()
                .ConfigureAwait(false);

            if (latestCompletion != null)
            {
                latestCompletion.IsPrimary = true;
                Context.Update(latestCompletion);
                await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            }
        }

        return Ok();
    }
}
