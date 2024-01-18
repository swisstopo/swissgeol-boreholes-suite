using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

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
    public async Task<IEnumerable<Completion>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var completions = Context.Completions.Include(c => c.Kind).AsNoTracking();

        if (boreholeId != null)
        {
            completions = completions.Where(c => c.BoreholeId == boreholeId);
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
    public override async Task<ActionResult<Completion>> CreateAsync([Required] Completion entity)
    {
        if (entity == null) return BadRequest();

        try
        {
            // Check if associated borehole is locked
            var subjectId = HttpContext.GetUserSubjectId();
            if (await boreholeLockService.IsBoreholeLockedAsync(entity.BoreholeId, subjectId).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user.");
            }

            // If the completion to create is the first completion of a borehole,
            // then we need to set it as the primary completion.
            var hasBoreholeExistingCompletion = await Context.Completions
                .AnyAsync(s => s.BoreholeId == entity.BoreholeId)
                .ConfigureAwait(false);

            var otherPrimaryCompletions = await Context.Completions
                    .Where(c => c.BoreholeId == entity.BoreholeId && c.IsPrimary == true && c.Id != entity.Id)
                    .ToListAsync()
                    .ConfigureAwait(false);

            if (entity.IsPrimary == false && otherPrimaryCompletions.Count == 0)
            {
                entity.IsPrimary = true;
            }
            else if (entity.IsPrimary == true && otherPrimaryCompletions.Count > 0)
            {
                foreach (var other in otherPrimaryCompletions)
                {
                    other.IsPrimary = false;
                    Context.Update(other);
                }

                await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            }

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
    public override async Task<ActionResult<Completion>> EditAsync([Required] Completion entity)
    {
        try
        {
            // Check if associated borehole is locked
            var subjectId = HttpContext.GetUserSubjectId();
            if (await boreholeLockService.IsBoreholeLockedAsync(entity.BoreholeId, subjectId).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user.");
            }

            var editResult = await base.EditAsync(entity).ConfigureAwait(false);
            if (editResult.Result is not OkObjectResult) return editResult;

            // If the completion to edit is the primary completion,
            // then reset any other primary completions of the borehole.
            if (entity.IsPrimary)
            {
                var otherPrimaryCompletions = await Context.Completions
                    .Where(c => c.BoreholeId == entity.BoreholeId && c.IsPrimary == true && c.Id != entity.Id)
                    .ToListAsync()
                    .ConfigureAwait(false);

                foreach (var other in otherPrimaryCompletions)
                {
                    other.IsPrimary = false;
                    Context.Update(other);
                }

                await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            }

            return editResult;
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("You are not authorized to edit to this completion.");
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while editing the completion.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Asynchronously copies a <see cref="Completion"/>.
    /// </summary>
    /// <param name="id">The <see cref="Completion.Id"/> of the completion to copy.</param>
    /// <returns>The id of the newly created <see cref="Completion"/>.</returns>
    [HttpPost("copy")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> CopyAsync([Required] int id)
    {
        try
        {
            var completion = await Context.Completions
                .Include(c => c.Instrumentations)
                .Include(c => c.Backfills)
                .Include(c => c.Casings)
                .AsNoTracking()
                .SingleOrDefaultAsync(b => b.Id == id)
                .ConfigureAwait(false);

            if (completion == null)
            {
                return NotFound();
            }

            // Check if associated borehole is locked
            var subjectId = HttpContext.GetUserSubjectId();
            if (await boreholeLockService.IsBoreholeLockedAsync(completion.BoreholeId, subjectId).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user.");
            }

            // Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
            completion.Id = 0;

            foreach (var instrumentation in completion.Instrumentations)
            {
                instrumentation.Id = 0;
            }

            foreach (var backfill in completion.Backfills)
            {
                backfill.Id = 0;
            }

            foreach (var casing in completion.Casings)
            {
                casing.Id = 0;
            }

            completion.Name += " (Clone)";
            completion.IsPrimary = false;

            var entityEntry = await Context.AddAsync(completion).ConfigureAwait(false);
            await Context.SaveChangesAsync().ConfigureAwait(false);

            return Ok(entityEntry.Entity.Id);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("You are not authorized to copy this completion.");
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while copying the completion.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    /// <remarks>Automatically sets the remaining and latest completion as the primary completion, if possible.</remarks>
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync([Required] int id)
    {
        try
        {
            var completionToDelete = await Context.Completions.FindAsync(id).ConfigureAwait(false);
            if (completionToDelete == null)
            {
                return NotFound();
            }

            // Check if associated borehole is locked
            var subjectId = HttpContext.GetUserSubjectId();
            if (await boreholeLockService.IsBoreholeLockedAsync(completionToDelete.BoreholeId, subjectId).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user.");
            }

            Context.Remove(completionToDelete);
            await Context.SaveChangesAsync().ConfigureAwait(false);

            // If the completion to delete is the primary completion of a borehole,
            // then we need to set the latest completion as the primary completion, if possible.
            if (completionToDelete.IsPrimary)
            {
                var latestCompletion = await Context.Completions
                    .Where(c => c.BoreholeId == completionToDelete.BoreholeId)
                    .OrderByDescending(c => c.Created)
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
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("You are not authorized to delete this completion.");
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while deleting the completion.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }
}
