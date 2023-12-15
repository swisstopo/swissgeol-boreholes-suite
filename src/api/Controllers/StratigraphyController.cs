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
public class StratigraphyController : BdmsControllerBase<Stratigraphy>
{
    internal const int StratigraphyKindId = 3000;
    internal const int LockTimeoutInMinutes = 10;

    private readonly TimeProvider timeProvider;

    public StratigraphyController(BdmsContext context, ILogger<Stratigraphy> logger, TimeProvider timeProvider)
        : base(context, logger)
    {
        this.timeProvider = timeProvider;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Stratigraphy"/>s, optionally filtered by <paramref name="boreholeId"/> and <paramref name="kindId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole containing the stratigraphies to get.</param>
    /// <param name="kindId">The kind of the stratigraphies to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Stratigraphy>> GetAsync([FromQuery] int? boreholeId = null, int? kindId = null)
    {
        var stratigraphies = Context.Stratigraphies.AsNoTracking();
        if (boreholeId != null)
        {
            stratigraphies = stratigraphies.Where(l => l.BoreholeId == boreholeId);
        }

        if (kindId != null)
        {
            stratigraphies = stratigraphies.Where(l => l.KindId == kindId);
        }

        return await stratigraphies.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously copies a <see cref="Stratigraphy"/>.
    /// </summary>
    /// <param name="id">The <see cref="Stratigraphy.Id"/> of the stratigraphy to copy.</param>
    /// <returns>The id of the newly created <see cref="Stratigraphy"/>.</returns>
    [HttpPost("copy")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> CopyAsync([Required] int id)
    {
        Logger.LogInformation("Copy stratigraphy with id <{StratigraphyId}>", id);

        var user = await Context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Name == HttpContext.User.FindFirst(ClaimTypes.Name).Value)
            .ConfigureAwait(false);

        if (user == null || !user.WorkgroupRoles.Any(w => w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        var stratigraphy = await Context.Stratigraphies
            .Include(s => s.Layers).ThenInclude(l => l.LayerCodelists)
            .Include(s => s.LithologicalDescriptions)
            .Include(s => s.FaciesDescriptions)
            .Include(s => s.ChronostratigraphyLayers)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id)
            .ConfigureAwait(false);

        if (stratigraphy == null)
        {
            return NotFound();
        }

        // Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
        stratigraphy.Id = 0;

        foreach (var layer in stratigraphy.Layers)
        {
            layer.Id = 0;
            foreach (var layerCode in layer.LayerCodelists)
            {
                layerCode.LayerId = 0;
            }
        }

        foreach (var lithologicalDescription in stratigraphy.LithologicalDescriptions)
        {
            lithologicalDescription.Id = 0;
        }

        foreach (var faciesDescription in stratigraphy.FaciesDescriptions)
        {
            faciesDescription.Id = 0;
        }

        foreach (var chronostratigraphy in stratigraphy.ChronostratigraphyLayers)
        {
            chronostratigraphy.Id = 0;
        }

        stratigraphy.Name += " (Clone)";
        stratigraphy.IsPrimary = false;

        var entityEntry = await Context.AddAsync(stratigraphy).ConfigureAwait(false);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        return Ok(entityEntry.Entity.Id);
    }

    /// <inheritdoc />
    /// <remarks>Automatically sets the remaining and latest stratigraphy as the primary stratigraphy, if possible.</remarks>
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        var stratigraphyToDelete = await Context.Stratigraphies.FindAsync(id).ConfigureAwait(false);
        if (stratigraphyToDelete == null)
        {
            return NotFound();
        }

        Context.Remove(stratigraphyToDelete);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        // If the stratigraphy to delete is the primary stratigraphy of a borehole,
        // then we need to set the latest stratigraphy as the primary stratigraphy, if possible.
        if (stratigraphyToDelete.IsPrimary.GetValueOrDefault() && stratigraphyToDelete.KindId == StratigraphyKindId)
        {
            var latestStratigraphy = await Context.Stratigraphies
                .Where(s => s.BoreholeId == stratigraphyToDelete.BoreholeId && s.KindId == StratigraphyKindId)
                .OrderByDescending(s => s.Created)
                .FirstOrDefaultAsync()
                .ConfigureAwait(false);

            if (latestStratigraphy != null)
            {
                latestStratigraphy.IsPrimary = true;
                Context.Update(latestStratigraphy);
                await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            }
        }

        return Ok();
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Stratigraphy>> CreateAsync(Stratigraphy entity)
    {
        if (entity == null) return BadRequest(ModelState);

        try
        {
            // Check if associated borehole is locked
            var userName = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;
            if (userName == null) throw new InvalidOperationException("Could not retrieve current user name from HttpContext.");

            var user = await Context.Users
                .Include(u => u.WorkgroupRoles)
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.Name == userName)
                .ConfigureAwait(false);
            if (user == null) throw new InvalidOperationException($"Current user with name <{userName}> does not exist.");

            var borehole = await Context.Boreholes
                .Include(b => b.Workflows)
                .AsNoTracking()
                .SingleOrDefaultAsync(b => b.Id == entity.BoreholeId)
                .ConfigureAwait(false);
            if (borehole == null) throw new InvalidOperationException($"Associated borehole with id <{entity.BoreholeId}> does not exist.");

            var userWorkflowRoles = borehole.Workflows
                .Where(w => w.UserId == user.Id)
                .Select(w => w.Role)
                .ToHashSet();
            if (!user.WorkgroupRoles.Any(x => x.WorkgroupId == borehole.WorkgroupId && userWorkflowRoles.Contains(x.Role)))
            {
                Logger.LogWarning("Current user with name <{UserName}> does not have the required role to create a stratigraphy for borehole with id <{BoreholeId}>.", userName, entity.BoreholeId);
                return Unauthorized();
            }

            if (borehole.Locked.HasValue && borehole.Locked.Value.AddMinutes(LockTimeoutInMinutes) > timeProvider.GetUtcNow() && borehole.LockedById != user.Id)
            {
                var lockedUserFullName = $"{borehole.LockedBy?.FirstName} {borehole.LockedBy?.LastName}";
                Logger.LogWarning("Current user with name <{UserName}> tried to create a stratigraphy for borehole with id <{BoreholeId}>, but the borehole is locked by user <{LockedByUserName}>.", userName, entity.BoreholeId, lockedUserFullName);
                return Problem($"The borehole is locked by user {lockedUserFullName}.");
            }
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while checking if the associated borehole is locked.";
            Logger.LogError(ex, message);
            return Problem(message);
        }

        // If the stratigraphy to create is the first stratigraphy of a borehole,
        // then we need to set it as the primary stratigraphy.
        var hasBoreholeExistingStratigraphy = await Context.Stratigraphies
            .AnyAsync(s => s.BoreholeId == entity.BoreholeId)
            .ConfigureAwait(false);

        entity.IsPrimary = !hasBoreholeExistingStratigraphy;

        return await base.CreateAsync(entity).ConfigureAwait(false);
    }
}
