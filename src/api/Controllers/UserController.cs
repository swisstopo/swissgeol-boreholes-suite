using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class UserController : ControllerBase
{
    private readonly IBoreholePermissionService boreholePermissionService;
    private readonly BdmsContext context;
    private ILogger<UserController> logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserController"/> class.
    /// </summary>
    /// <param name="context">The EF database context containing data for the BDMS application.</param>
    /// <param name="logger">The logger used by the controller.</param>
    /// <param name="boreholePermissionService">The service for checking borehole permissions.</param>
    public UserController(BdmsContext context, ILogger<UserController> logger, IBoreholePermissionService boreholePermissionService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Gets the currently authenticated and authorized bdms user.
    /// </summary>
    [HttpGet("self")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns the currently logged in user.")]
    public async Task<User?> GetSelf()
    {
        var user = await context.UsersWithIncludes.SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId()).ConfigureAwait(false);
        user.Deletable = IsDeletable(user);
        return user;
    }

    /// <summary>
    /// Gets the user with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns the user with the specified id.")]
    [SwaggerResponse(StatusCodes.Status404NotFound, "The user could not be found.")]
    public async Task<ActionResult> GetUserById(int id)
    {
        var user = await context.UsersWithIncludes.SingleOrDefaultAsync(u => u.Id == id).ConfigureAwait(false);

        if (user == null)
        {
            return NotFound();
        }

        user.Deletable = IsDeletable(user);
        return Ok(user);
    }

    /// <summary>
    /// Gets a list of users.
    /// </summary>
    [HttpGet]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns a list of users.")]
    public async Task<IEnumerable<User>> GetAll()
    {
        var users = await context
            .UsersWithIncludes
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var user in users)
        {
            user.Deletable = IsDeletable(user);
        }

        return users;
    }

    /// <summary>
    /// Gets editor users for the provided workgroupId.
    /// </summary>
    [HttpGet("editorsOnWorkgroup/{workgroupId}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns a list editor users for the provided workgroupId.")]
    public async Task<ActionResult<IEnumerable<WorkgroupEditor>>> GetWorkgroupEditors(int workgroupId)
    {
        var subjectId = HttpContext.GetUserSubjectId();

        if (!await boreholePermissionService.HasUserRoleOnWorkgroupAsync(subjectId, workgroupId, Role.Editor).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        var allUsersWithRoleOnWorkgroup = await context
            .UsersWithIncludes
            .AsNoTracking()
            .Where(u => u.DisabledAt == null && u.WorkgroupRoles.Any(r => r.WorkgroupId == workgroupId))
            .OrderBy(x => x.Name)
            .ToListAsync()
            .ConfigureAwait(false);

        var editorUsers = new List<WorkgroupEditor>();

        foreach (var user in allUsersWithRoleOnWorkgroup)
        {
            if (await boreholePermissionService.HasUserRoleOnWorkgroupAsync(user.SubjectId, workgroupId, Role.Editor).ConfigureAwait(false))
            {
                editorUsers.Add(new WorkgroupEditor(user));
            }
        }

        return editorUsers;
    }

    /// <summary>
    /// Resets all settings to initial state.
    /// </summary>
    [HttpPost("resetAllSettings")]
    [SwaggerResponse(StatusCodes.Status200OK, "All settings were reset successfully.")]
    public ActionResult ResetAllSettings()
    {
        // Reset admin settings to initial state
        context.Database.ExecuteSqlRaw("UPDATE bdms.users SET settings_usr = null;");
        context.Database.ExecuteSqlRaw("UPDATE bdms.users SET settings_usr = '{{\"filter\": {{\"custom\": {{\"borehole_identifier\": true, \"project_name\": true, \"landuse\": true, \"alternate_name\": true, \"canton\": true, \"city\": true}}, \"restriction\": true, \"restriction_until\": true, \"extended\": {{ \"original_name\": true, \"method\": true, \"status\": true}}, \"kind\": true, \"elevation_z\": true, \"length\": true, \"drilling_date\": true, \"zoom2selected\": true}}, \"boreholetable\": {{ \"orderby\": \"original_name\", \"direction\": \"ASC\"}}, \"eboreholetable\": {{ \"orderby\": \"original_name\", \"direction\": \"ASC\"}}, \"map\": {{ \"explorer\": {{ }}, \"editor\": {{ }} }}, \"appearance\": {{ \"explorer\": 1}}}}' WHERE username = 'admin';");

        // Reset codelist settings to initial state
        context.Database.ExecuteSqlRaw("UPDATE bdms.codelist SET conf_cli = '{{\"text\": \"lithology_id_cli\", \"color\": \"lithostratigraphy\", \"title\": \"lithostratigraphy_id_cli\", \"fields\": {{\"color\": true, \"notes\": true, \"debris\": true, \"striae\": true, \"uscs_1\": true, \"uscs_2\": true, \"uscs_3\": true, \"geology\": true, \"cohesion\": true, \"humidity\": true, \"jointing\": true, \"lithology\": true, \"alteration\": true, \"plasticity\": true, \"soil_state\": true, \"compactness\": true, \"consistance\": true, \"description\": true, \"grain_shape\": true, \"lit_pet_deb\": true, \"grain_size_1\": true, \"grain_size_2\": true, \"tectonic_unit\": true, \"uscs_original\": true, \"description_quality\": true, \"grain_granularity\": true, \"lithostratigraphy\": true, \"organic_component\": true, \"chronostratigraphy\": true, \"further_properties\": true, \"uscs_determination\": true}}, \"textNS\": \"custom.lithology_top_bedrock\", \"colorNS\": \"custom.lithostratigraphy_top_bedrock\", \"pattern\": \"lithology\", \"titleNS\": \"custom.chro_str_top_bedrock\", \"patternNS\": \"custom.lithology_top_bedrock\"}}' WHERE conf_cli IS NOT NULL and schema_cli = 'layer_kind';");

        return Ok();
    }

    /// <summary>
    /// Updates the <paramref name="user"/>.
    /// </summary>
    [HttpPut]
    [SwaggerResponse(StatusCodes.Status200OK, "The user was updated successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "The user could not be updated due to invalid input.")]
    [SwaggerResponse(StatusCodes.Status404NotFound, "The user could not be found.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user is not authorized to update users.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request. ")]
    public async Task<IActionResult> Edit(User user)
    {
        try
        {
            if (user == null)
            {
                return BadRequest();
            }

            var userToEdit = await context.Users.SingleOrDefaultAsync(u => u.Id == user.Id).ConfigureAwait(false);
            if (userToEdit == null)
            {
                return NotFound();
            }

            if (userToEdit.SubjectId != HttpContext.GetUserSubjectId())
            {
                userToEdit.IsAdmin = user.IsAdmin;
            }

            userToEdit.DisabledAt = user.DisabledAt;

            await context.SaveChangesAsync().ConfigureAwait(false);
            return await GetUserById(userToEdit.Id).ConfigureAwait(false);
        }
        catch (Exception e)
        {
            var message = "Error while updating user.";
            logger.LogError(e, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Deletes the user with the specified <paramref name="id"/>.
    /// </summary>
    [HttpDelete("{id}")]
    [SwaggerResponse(StatusCodes.Status200OK, "The user was deleted successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "The user could not be updated due to invalid input.")]
    [SwaggerResponse(StatusCodes.Status404NotFound, "The user could not be found.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user is not authorized to delete users.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request. ")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var user = await context.Users.SingleOrDefaultAsync(u => u.Id == id).ConfigureAwait(false);
            if (user == null)
            {
                return NotFound();
            }

            if (!IsDeletable(user))
            {
                return Problem("The user is associated with boreholes, layers, stratigraphies, files or borehole files and cannot be deleted.");
            }

            context.Users.Remove(user);
            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception e)
        {
            var message = "Error while deleting user.";
            logger.LogError(e, message);
            return Problem(message);
        }
    }

    private bool IsDeletable(User user)
    {
        return !(context.Layers.Any(x => x.CreatedById == user.Id)
                || context.Layers.Any(x => x.UpdatedById == user.Id)
                || context.Boreholes.Any(x => x.UpdatedById == user.Id)
                || context.Boreholes.Any(x => x.CreatedById == user.Id)
                || context.Boreholes.Any(x => x.LockedById == user.Id)
                || context.Stratigraphies.Any(x => x.CreatedById == user.Id)
                || context.Stratigraphies.Any(x => x.UpdatedById == user.Id)
                || context.Files.Any(x => x.CreatedById == user.Id)
                || context.Profiles.Any(x => x.UserId == user.Id));
    }
}
