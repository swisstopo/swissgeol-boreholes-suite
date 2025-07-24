using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class StratigraphyV2Controller : BoreholeControllerBase<StratigraphyV2>
{
    public StratigraphyV2Controller(BdmsContext context, ILogger<StratigraphyV2Controller> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="StratigraphyV2"/>s, optionally filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole containing the stratigraphies to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<StratigraphyV2>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var stratigraphies = Context.StratigraphiesV2.AsNoTracking();
        if (boreholeId != null)
        {
            stratigraphies = stratigraphies.Where(l => l.BoreholeId == boreholeId);
        }

        return await stratigraphies.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously copies a <see cref="StratigraphyV2"/>.
    /// </summary>
    /// <param name="id">The <see cref="StratigraphyV2.Id"/> of the stratigraphy to copy.</param>
    /// <returns>The id of the newly created <see cref="StratigraphyV2"/>.</returns>
    [HttpPost("copy")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> CopyAsync([Required] int id)
    {
        try
        {
            var stratigraphy = await Context.StratigraphiesV2
                .AsNoTracking()
                .SingleOrDefaultAsync(b => b.Id == id)
                .ConfigureAwait(false);

            if (stratigraphy == null)
            {
                return NotFound();
            }

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            // Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
            stratigraphy.Id = 0;
            stratigraphy.Name += " (Clone)";
            stratigraphy.IsPrimary = false;

            var entityEntry = await Context.AddAsync(stratigraphy).ConfigureAwait(false);
            await Context.SaveChangesAsync().ConfigureAwait(false);

            return Ok(entityEntry.Entity.Id);
        }
        catch (Exception ex)
        {
            var message = "An error occurred while copying the stratigraphy.";
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
            var stratigraphyToDelete = await Context.StratigraphiesV2.FindAsync(id).ConfigureAwait(false);
            if (stratigraphyToDelete == null)
            {
                return NotFound();
            }

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphyToDelete.BoreholeId).ConfigureAwait(false)) return Unauthorized();


            var existingStratigraphyCount = await Context.StratigraphiesV2
                .CountAsync(s => s.BoreholeId == stratigraphyToDelete.BoreholeId)
                .ConfigureAwait(false);

            if (existingStratigraphyCount > 1 && stratigraphyToDelete.IsPrimary)
            {
                return Problem("Main stratigraphy cannot be deleted.");
            }

            Context.Remove(stratigraphyToDelete);
            await Context.SaveChangesAsync().ConfigureAwait(false);

            return Ok();
        }
        catch (Exception ex)
        {
            var message = "An error occurred while deleting the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<StratigraphyV2>> CreateAsync(StratigraphyV2 entity)
    {
        try
        {
            if (entity == null) return BadRequest(ModelState);

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), entity.BoreholeId).ConfigureAwait(false)) return Unauthorized();


            if (!await IsNameUnique(entity).ConfigureAwait(false))
            {
                return Problem("Name must be unique");
            }

            // If the stratigraphy to create is the first stratigraphy of a borehole,
            // then we need to set it as the primary stratigraphy.
            var hasBoreholeExistingStratigraphy = await Context.StratigraphiesV2
                .AnyAsync(s => s.BoreholeId == entity.BoreholeId)
                .ConfigureAwait(false);

            if (!hasBoreholeExistingStratigraphy)
            {
                entity.IsPrimary = true;
            }
            else if (entity.IsPrimary)
            {
                await ResetOtherPrimaryStratigraphiesAsync(entity).ConfigureAwait(false);
            }

            return await base.CreateAsync(entity).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while creating the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<StratigraphyV2>> EditAsync(StratigraphyV2 entity)
    {
        try
        {
            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), entity.BoreholeId).ConfigureAwait(false)) return Unauthorized();


            if (!await IsNameUnique(entity).ConfigureAwait(false))
            {
                return Problem("Name must be unique");
            }

            entity.Date = entity.Date != null ? DateTime.SpecifyKind(entity.Date.Value, DateTimeKind.Utc) : null;
            var editResult = await base.EditAsync(entity).ConfigureAwait(false);
            if (editResult.Result is not OkObjectResult) return editResult;

            if (entity.IsPrimary)
            {
                await ResetOtherPrimaryStratigraphiesAsync(entity).ConfigureAwait(false);
            }

            return editResult;
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while editing the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(StratigraphyV2 entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }

    private async Task ResetOtherPrimaryStratigraphiesAsync(StratigraphyV2 entity)
    {
        var otherPrimaryStratigraphies = await Context.StratigraphiesV2
            .Where(s => s.BoreholeId == entity.BoreholeId && s.IsPrimary == true && s.Id != entity.Id)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var other in otherPrimaryStratigraphies)
        {
            other.IsPrimary = false;
            Context.Update(other);
        }

        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
    }

    private async Task<bool> IsNameUnique(StratigraphyV2 entity)
    {
        var hasBoreholeStratigraphiesWithSameName = await Context.StratigraphiesV2
                .AnyAsync(s => s.BoreholeId == entity.BoreholeId && s.Id != entity.Id && s.Name == entity.Name)
                .ConfigureAwait(false);

        return !hasBoreholeStratigraphiesWithSameName;
    }
}
