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

    private readonly BdmsContext context;
    private readonly ILogger logger;

    public StratigraphyController(BdmsContext context, ILogger<Stratigraphy> logger)
        : base(context, logger)
    {
        this.context = context;
        this.logger = logger;
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
        var stratigraphies = context.Stratigraphies.AsNoTracking();
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
        logger.LogInformation("Copy stratigraphy with id <{StratigraphyId}>", id);

        var user = await context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Name == HttpContext.User.FindFirst(ClaimTypes.Name).Value)
            .ConfigureAwait(false);

        if (user == null || !user.WorkgroupRoles.Any(w => w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        var stratigraphy = await context.Stratigraphies
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

        var entityEntry = await context.AddAsync(stratigraphy).ConfigureAwait(false);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok(entityEntry.Entity.Id);
    }

    /// <inheritdoc />
    /// <remarks>Automatically sets the remaining and latest stratigraphy as the primary stratigraphy, if possible.</remarks>
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        var stratigraphyToDelete = await context.Stratigraphies.FindAsync(id).ConfigureAwait(false);
        if (stratigraphyToDelete == null)
        {
            return NotFound();
        }

        context.Remove(stratigraphyToDelete);
        await context.SaveChangesAsync().ConfigureAwait(false);

        // If the stratigraphy to delete is the primary stratigraphy of a borehole,
        // then we need to set the latest stratigraphy as the primary stratigraphy, if possible.
        if (stratigraphyToDelete.IsPrimary.GetValueOrDefault() && stratigraphyToDelete.KindId == StratigraphyKindId)
        {
            var latestStratigraphy = await context.Stratigraphies
                .Where(s => s.BoreholeId == stratigraphyToDelete.BoreholeId && s.KindId == StratigraphyKindId)
                .OrderByDescending(s => s.Created)
                .FirstOrDefaultAsync()
                .ConfigureAwait(false);

            if (latestStratigraphy != null)
            {
                latestStratigraphy.IsPrimary = true;
                context.Update(latestStratigraphy);
                await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            }
        }

        return Ok();
    }
}
