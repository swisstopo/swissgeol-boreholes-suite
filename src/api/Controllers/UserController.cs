using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class UserController : ControllerBase
{
    private readonly BdmsContext context;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserController"/> class.
    /// </summary>
    /// <param name="context">The EF database context containing data for the BDMS application.</param>
    public UserController(BdmsContext context)
    {
        this.context = context;
    }

    /// <summary>
    /// Gets the current authenticated and authorized bdms user.
    /// </summary>
    [HttpGet("self")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<User?>> GetUserInformationAsync() =>
        await context.Users.SingleOrDefaultAsync(u => u.Name == HttpContext.User.FindFirst(ClaimTypes.Name).Value).ConfigureAwait(false);

    /// <summary>
    /// Gets the user list.
    /// </summary>
    [HttpGet]
    public async Task<IEnumerable<User>> GetAll()
    {
        var users = await context
            .Users
            .Include(x => x.WorkgroupRoles)
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var user in users)
        {
            user.Deletable = !(context.Workflows.Any(x => x.UserId == user.Id)
                || context.Layers.Any(x => x.CreatedById == user.Id)
                || context.Layers.Any(x => x.UpdatedById == user.Id)
                || context.Boreholes.Any(x => x.UpdatedById == user.Id)
                || context.Boreholes.Any(x => x.CreatedById == user.Id)
                || context.Boreholes.Any(x => x.LockedById == user.Id)
                || context.Stratigraphies.Any(x => x.CreatedById == user.Id)
                || context.Stratigraphies.Any(x => x.UpdatedById == user.Id)
                || context.Files.Any(x => x.CreatedById == user.Id)
                || context.BoreholeFiles.Any(x => x.UserId == user.Id));
        }

        return users;
    }

    [HttpPost("resetAllSettings")]
    public ActionResult ResetAllSettings()
    {
        // Reset admin settings to initial state
        context.Database.ExecuteSqlRaw("UPDATE bdms.users SET settings_usr = null;");
        context.Database.ExecuteSqlRaw("UPDATE bdms.users SET settings_usr = '{{\"filter\": {{\"custom\": {{\"borehole_identifier\": true, \"project_name\": true, \"landuse\": true, \"alternate_name\": true, \"canton\": true, \"city\": true}}, \"restriction\": true, \"mapfilter\": true, \"restriction_until\": true, \"extended\": {{ \"original_name\": true, \"method\": true, \"status\": true}}, \"kind\": true, \"elevation_z\": true, \"length\": true, \"drilling_date\": true, \"zoom2selected\": true}}, \"boreholetable\": {{ \"orderby\": \"original_name\", \"direction\": \"ASC\"}}, \"eboreholetable\": {{ \"orderby\": \"creation\", \"direction\": \"DESC\"}}, \"map\": {{ \"explorer\": {{ }}, \"editor\": {{ }} }}, \"appearance\": {{ \"explorer\": 1}}}}' WHERE username = 'admin';");

        // Reset codelist settings to initial state
        context.Database.ExecuteSqlRaw("UPDATE bdms.codelist SET conf_cli = '{{\"text\": \"lithology_id_cli\", \"color\": \"lithostratigraphy\", \"title\": \"lithostratigraphy_id_cli\", \"fields\": {{\"color\": true, \"notes\": true, \"debris\": true, \"striae\": true, \"uscs_1\": true, \"uscs_2\": true, \"uscs_3\": true, \"geology\": true, \"cohesion\": true, \"humidity\": true, \"jointing\": true, \"lithology\": true, \"alteration\": true, \"plasticity\": true, \"soil_state\": true, \"compactness\": true, \"consistance\": true, \"description\": true, \"grain_shape\": true, \"lit_pet_deb\": true, \"grain_size_1\": true, \"grain_size_2\": true, \"tectonic_unit\": true, \"uscs_original\": true, \"qt_description\": true, \"grain_granularity\": true, \"lithostratigraphy\": true, \"organic_component\": true, \"chronostratigraphy\": true, \"further_properties\": true, \"uscs_determination\": true}}, \"textNS\": \"custom.lithology_top_bedrock\", \"colorNS\": \"custom.lithostratigraphy_top_bedrock\", \"pattern\": \"lithology\", \"titleNS\": \"custom.chro_str_top_bedrock\", \"patternNS\": \"custom.lithology_top_bedrock\"}}' WHERE conf_cli IS NOT NULL and schema_cli = 'layer_kind';");

        return Ok();
    }
}
