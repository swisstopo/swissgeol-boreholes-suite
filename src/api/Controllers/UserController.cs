using BDMS.Authentication;
using BDMS.Models;
using BDMS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;
using System.Text.Json;
using System.Text.Json.Nodes;

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
    /// Gets the custom map overlays of the currently authenticated user.
    /// </summary>
    [HttpGet("self/maplayers")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns the current user's custom map overlays, keyed by layer identifier.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user could not be identified.")]
    public async Task<ActionResult<Dictionary<string, MapLayer>>> GetMapLayers()
    {
        var user = await context.Users.SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId()).ConfigureAwait(false);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(ReadMapLayers(user.Settings));
    }

    /// <summary>
    /// Replaces the custom map overlays of the currently authenticated user with <paramref name="mapLayers"/>.
    /// </summary>
    [HttpPut("self/maplayers")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [SwaggerResponse(StatusCodes.Status200OK, "The map overlays were saved successfully and are returned.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user could not be identified.")]
    public async Task<ActionResult<Dictionary<string, MapLayer>>> SetMapLayers([FromBody] Dictionary<string, MapLayer> mapLayers)
    {
        var user = await context.Users.SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId()).ConfigureAwait(false);
        if (user is null)
        {
            return Unauthorized();
        }

        user.Settings = WriteMapLayers(user.Settings, mapLayers);
        await context.SaveChangesAsync().ConfigureAwait(false);
        return Ok(mapLayers);
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
        return !(context.Lithologies.Any(x => x.CreatedById == user.Id)
                || context.Lithologies.Any(x => x.UpdatedById == user.Id)
                || context.Boreholes.Any(x => x.UpdatedById == user.Id)
                || context.Boreholes.Any(x => x.CreatedById == user.Id)
                || context.Boreholes.Any(x => x.LockedById == user.Id)
                || context.Stratigraphies.Any(x => x.CreatedById == user.Id)
                || context.Stratigraphies.Any(x => x.UpdatedById == user.Id)
                || context.Profiles.Any(x => x.CreatedById == user.Id)
                || context.Profiles.Any(x => x.UpdatedById == user.Id));
    }

    private static Dictionary<string, MapLayer> ReadMapLayers(string? settings)
    {
        if (string.IsNullOrEmpty(settings))
        {
            return new Dictionary<string, MapLayer>();
        }

        var explorer = JsonNode.Parse(settings)?["map"]?["explorer"];
        return explorer?.Deserialize<Dictionary<string, MapLayer>>() ?? new Dictionary<string, MapLayer>();
    }

    private static string WriteMapLayers(string? settings, Dictionary<string, MapLayer> mapLayers)
    {
        var root = (string.IsNullOrEmpty(settings) ? null : JsonNode.Parse(settings)) as JsonObject ?? new JsonObject();
        if (root["map"] is not JsonObject map)
        {
            map = new JsonObject();
            root["map"] = map;
        }

        map["explorer"] = JsonSerializer.SerializeToNode(mapLayers);
        return root.ToJsonString();
    }
}
