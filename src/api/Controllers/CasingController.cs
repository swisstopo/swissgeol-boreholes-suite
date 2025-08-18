using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class CasingController : BoreholeControllerBase<Casing>
{
    public CasingController(BdmsContext context, ILogger<CasingController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Casing"/>s, optionally filtered either by <paramref name="completionId"/> or <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="completionId">The id of the completion containing the <see cref="Casing"/> to get.</param>
    /// <param name="boreholeId">The id of the borehole containing the <see cref="Casing"/>s to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Casing>> GetAsync([FromQuery] int? completionId = null, [FromQuery] int? boreholeId = null)
    {
        var user = await Context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        var casings = Context.Casings
            .Include(c => c.CasingElements)
            .Include(c => c.Completion)
            .AsNoTracking();

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            casings = casings
                .Where(c => Context.Boreholes
                .Where(b => b.WorkgroupId.HasValue)
                .Any(b => b.Id == c.Completion.BoreholeId && allowedWorkgroupIds
                .Contains(b.WorkgroupId!.Value)));
        }

        if (completionId != null)
        {
            casings = casings.Where(c => c.CompletionId == completionId);
        }
        else if (boreholeId != null)
        {
            casings = casings.Where(c => c.Completion.BoreholeId == boreholeId);
        }

        return await casings.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Casing"/> with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Casing>> GetByIdAsync(int id)
    {
        var casing = await Context.Casings
            .Include(c => c.CasingElements)
            .AsNoTracking()
            .SingleOrDefaultAsync(i => i.Id == id)
            .ConfigureAwait(false);

        if (casing == null)
        {
            return NotFound();
        }

        var boreholeId = await GetBoreholeId(casing).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        return Ok(casing);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Casing>> CreateAsync(Casing entity)
    {
        if (entity == null) return BadRequest();

        try
        {
            if (!(entity.CasingElements?.Count > 0))
            {
                var message = "At least one casing element must be defined.";
                Logger.LogWarning(message);
                return Problem(message);
            }

            return await base.CreateAsync(entity).ConfigureAwait(false);
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
    public override async Task<ActionResult<Casing>> EditAsync(Casing entity)
    {
        if (entity == null) return BadRequest();

        try
        {
            // Check if associated borehole is locked
            var boreholeId = await GetBoreholeId(entity).ConfigureAwait(false);
            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user or you are missing permissions.");
            }

            if (!(entity.CasingElements?.Count > 0))
            {
                var message = "At least one casing element must be defined.";
                Logger.LogWarning(message);
                return Problem(message);
            }

            var existingEntity = await Context.Casings.Include(c => c.CasingElements).SingleOrDefaultAsync(c => c.Id == entity.Id).ConfigureAwait(false);
            if (existingEntity == null)
            {
                return NotFound();
            }

            Context.Entry(existingEntity).CurrentValues.SetValues(entity);
            existingEntity.CasingElements = entity.CasingElements;

            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return Ok(entity);
        }
        catch (Exception ex)
        {
            var message = "An error occurred while updating the casing.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        try
        {
            var casing = await Context.Casings
                .Include(c => c.CasingElements)
                .Include(c => c.Instrumentations)
                .Include(c => c.Backfills)
                .Include(c => c.Observations)
                .AsNoTracking()
                .SingleOrDefaultAsync(i => i.Id == id)
                .ConfigureAwait(false);

            if (casing == null)
            {
                return NotFound();
            }

            // Check if associated borehole is locked
            var boreholeId = await GetBoreholeId(casing).ConfigureAwait(false);
            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
            {
                return Problem("The borehole is locked by another user or you are missing permissions.");
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

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(Casing entity)
    {
        if (entity == null) return default;

        var completion = await Context.Completions
            .AsNoTracking()
            .SingleOrDefaultAsync(c => c.Id == entity.CompletionId)
            .ConfigureAwait(false);
        return completion?.BoreholeId;
    }
}
