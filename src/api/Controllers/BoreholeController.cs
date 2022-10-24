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

        var borehole = await context.Boreholes
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers)
            .Include(b => b.Workflows)
            .Include(b => b.BoreholeFiles)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id)
            .ConfigureAwait(false);

        var workgroup = await context.Workgroups
            .SingleOrDefaultAsync(w => w.Id == workgroupId)
            .ConfigureAwait(false);

        var user = await context.Users
            .Include(u => u.WorkgroupRoles)
            .SingleOrDefaultAsync(u => u.Name == HttpContext.User.FindFirst(ClaimTypes.Name).Value)
            .ConfigureAwait(false);

        if (borehole == null || workgroup == null || user == null)
        {
            return NotFound();
        }

        if (!user.WorkgroupRoles.Any(w => w.WorkgroupId == workgroup.Id && w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        // Set ids of copied entities to zero
        borehole.Id = 0;
        foreach (var stratigraphy in borehole.Stratigraphies)
        {
            stratigraphy.Id = 0;
            foreach (var layer in stratigraphy.Layers)
            {
                layer.Id = 0;
            }
        }

        foreach (var boreholeFile in borehole.BoreholeFiles)
        {
            boreholeFile.BoreholeId = 0;
        }

        borehole.Workgroup = workgroup;

        borehole.Workflows.Clear();
        borehole.Workflows.Add(new Workflow { Borehole = borehole, Role = Role.Editor, User = user });

        borehole.OriginalName += " (Copy)";
        borehole.CreatedBy = user;

        var entityEntry = await context.AddAsync(borehole).ConfigureAwait(false);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok(entityEntry.Entity.Id);
    }
}
