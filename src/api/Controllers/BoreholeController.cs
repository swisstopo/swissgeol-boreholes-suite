using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BoreholeController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;

    public BoreholeController(BdmsContext context, ILogger<BoreholeController> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously copies a <see cref="Borehole"/>.
    /// </summary>
    /// <param name="id">The <see cref="Borehole.Id"/> of the borehole to copy.</param>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>.</param>
    /// <returns>The id of the newly created <see cref="Borehole"/>.</returns>
    [HttpPost("copy")]
    public async Task<ActionResult<int>> CopyAsync([Required]int id, [Required]int workgroupId)
    {
        logger.LogInformation("Copy borehole with id <{BoreholeId}> to workgroup with id <{WorkgroupId}>", id, workgroupId);

        var user = await context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Name == HttpContext.User.FindFirst(ClaimTypes.Name).Value)
            .ConfigureAwait(false);

        if (user == null || !user.WorkgroupRoles.Any(w => w.WorkgroupId == workgroupId && w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        var borehole = await context.Boreholes
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerCodelists)
            .Include(b => b.Workflows)
            .Include(b => b.BoreholeFiles)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id)
            .ConfigureAwait(false);

        if (borehole == null)
        {
            return NotFound();
        }

        // Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
        borehole.Id = 0;
        foreach (var stratigraphy in borehole.Stratigraphies)
        {
            stratigraphy.Id = 0;
            foreach (var layer in stratigraphy.Layers)
            {
                layer.Id = 0;
                foreach (var layerCode in layer.LayerCodelists)
                {
                    layerCode.LayerId = 0;
                }
            }
        }

        foreach (var boreholeFile in borehole.BoreholeFiles)
        {
            boreholeFile.BoreholeId = 0;
        }

        borehole.WorkgroupId = workgroupId;

        borehole.Workflows.Clear();
        borehole.Workflows.Add(new Workflow { Borehole = borehole, Role = Role.Editor, UserId = user.Id });

        borehole.OriginalName += " (Copy)";

        var entityEntry = await context.AddAsync(borehole).ConfigureAwait(false);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok(entityEntry.Entity.Id);
    }
}
