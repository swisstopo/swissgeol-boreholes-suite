using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

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
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> CopyAsync([Required] int id, [Required] int workgroupId)
    {
        logger.LogInformation("Copy borehole with id <{BoreholeId}> to workgroup with id <{WorkgroupId}>", id, workgroupId);

        var user = await context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        if (user == null || !user.WorkgroupRoles.Any(w => w.WorkgroupId == workgroupId && w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        var borehole = await context.Boreholes
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerCodelists)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.LithologicalDescriptions)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.FaciesDescriptions)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.ChronostratigraphyLayers)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.LithostratigraphyLayers)
            .Include(b => b.BoreholeCodelists)
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

            foreach (var lithostratigraphy in stratigraphy.LithostratigraphyLayers)
            {
                lithostratigraphy.Id = 0;
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
