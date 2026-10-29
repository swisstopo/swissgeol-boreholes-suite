using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class WorkgroupController : ControllerBase
{
    private readonly BdmsContext context;
    private ILogger<WorkgroupController> logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="WorkgroupController"/> class.
    /// </summary>
    /// <param name="context">The EF database context containing data for the BDMS application.</param>
    /// <param name="logger">The logger used by the controller.</param>
    public WorkgroupController(BdmsContext context, ILogger<WorkgroupController> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    /// <summary>
    /// Gets a list of workgroups.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns a list of workgroups.")]
    public async Task<IEnumerable<Workgroup>> GetAllAsync()
    {
        var workgroups = await context
            .WorkgroupsWithIncludes
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);

        // Apply permission filtering by workgroup
        var subjectId = HttpContext.GetUserSubjectId();
        var user = await context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == subjectId)
            .ConfigureAwait(false);

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            workgroups = workgroups.Where(w => allowedWorkgroupIds.Contains(w.Id)).ToList();
        }

        return workgroups;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Workgroup"/> with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns a workgroup.")]
    public async Task<ActionResult<Workgroup>> GetByIdAsync(int id)
    {
        var workgroup = await context
            .WorkgroupsWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(w => w.Id == id)
            .ConfigureAwait(false);

        if (workgroup == null)
        {
            return NotFound();
        }

        return Ok(workgroup);
    }

    /// <summary>
    /// Create a new workgroup./>.
    /// </summary>
    [HttpPost]
    [SwaggerResponse(StatusCodes.Status200OK, "The workgroup was created successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "The workgroup could not be created due to invalid input.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user is not authorized to create workgroups.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request. ")]
    public async Task<IActionResult> CreateAsync(Workgroup workgroup)
    {
        try
        {
            if (workgroup == null)
            {
                return BadRequest();
            }

            var isDuplicate = await context.Workgroups.AnyAsync(w => w.Name == workgroup.Name).ConfigureAwait(false);
            if (isDuplicate)
            {
                return Problem("A workgroup with the same name already exists.");
            }

            workgroup.Settings = "{}";
            workgroup.CreatedAt = DateTime.UtcNow;

            var enityEntry = await context.Workgroups.AddAsync(workgroup).ConfigureAwait(false);
            await context.SaveChangesAsync().ConfigureAwait(false);

            return Ok(enityEntry.Entity);
        }
        catch (Exception e)
        {
            var message = "Error while creating workgroup.";
            logger.LogError(e, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Updates the <paramref name="workgroup"/>.
    /// </summary>
    [HttpPut]
    [SwaggerResponse(StatusCodes.Status200OK, "The workgroup was updated successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "The workgroup could not be updated due to invalid input.")]
    [SwaggerResponse(StatusCodes.Status404NotFound, "The workgroup could not be found.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user is not authorized to update workgroups.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request. ")]
    public async Task<IActionResult> EditAsync(Workgroup workgroup)
    {
        try
        {
            if (workgroup == null)
            {
                return BadRequest();
            }

            var workgroupToEdit = await context.WorkgroupsWithIncludes.SingleOrDefaultAsync(w => w.Id == workgroup.Id).ConfigureAwait(false);
            if (workgroupToEdit == null)
            {
                return NotFound();
            }

            workgroupToEdit.Name = workgroup.Name;
            workgroupToEdit.DisabledAt = workgroup.DisabledAt;

            await context.SaveChangesAsync().ConfigureAwait(false);
            var updatedWorkgroup = await context.Workgroups.SingleOrDefaultAsync(w => w.Id == workgroup.Id).ConfigureAwait(false);
            return Ok(updatedWorkgroup);
        }
        catch (Exception e)
        {
            var message = "Error while updating workgroup.";
            logger.LogError(e, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Deletes the workgroup with the specified <paramref name="id"/>.
    /// </summary>
    [HttpDelete("{id}")]
    [SwaggerResponse(StatusCodes.Status200OK, "The workgroup was deleted successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "The workgroup could not be updated due to invalid input.")]
    [SwaggerResponse(StatusCodes.Status404NotFound, "The workgroup could not be found.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user is not authorized to delete workgroups.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request. ")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try
        {
            var workgroup = await context.WorkgroupsWithIncludes.SingleOrDefaultAsync(w => w.Id == id).ConfigureAwait(false);
            if (workgroup == null)
            {
                return NotFound();
            }

            if (workgroup.Boreholes?.Count > 0)
            {
                return Problem("The workgroup is associated with boreholes and cannot be deleted.");
            }

            context.Workgroups.Remove(workgroup);
            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception e)
        {
            var message = "Error while deleting workgroup.";
            logger.LogError(e, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Sets or removes workgroup roles. A user holds one role per workgroup: an active role replaces the
    /// user's current role in that workgroup, an inactive role removes it only if it is the current role.
    /// </summary>
    [HttpPost("setRoles")]
    [SwaggerResponse(StatusCodes.Status200OK, "The roles were set successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "The roles could not be set due to invalid input.")]
    [SwaggerResponse(StatusCodes.Status404NotFound, "The user or workgroup could not be found.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user is not authorized to set roles.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request. ")]
    public async Task<IActionResult> SetRolesAsync(UserWorkgroupRole[] userWorkgroupRoles)
    {
        try
        {
            if (userWorkgroupRoles == null || userWorkgroupRoles.Length < 1 || userWorkgroupRoles.Any(r => r is null))
            {
                return BadRequest();
            }

            var invalidRequestResult = await ValidateRoleChangesAsync(userWorkgroupRoles).ConfigureAwait(false);
            if (invalidRequestResult is not null)
            {
                return invalidRequestResult;
            }

            foreach (var userWorkgroupRole in userWorkgroupRoles)
            {
                var existingRole = await context.UserWorkgroupRoles
                    .FindAsync(userWorkgroupRole.UserId, userWorkgroupRole.WorkgroupId)
                    .ConfigureAwait(false);

                if (userWorkgroupRole.IsActive == true && existingRole == default)
                {
                    // Only the keys and the role are taken from the request, so users or workgroups sent along are not written.
                    await context.AddAsync(new UserWorkgroupRole
                    {
                        UserId = userWorkgroupRole.UserId,
                        WorkgroupId = userWorkgroupRole.WorkgroupId,
                        Role = userWorkgroupRole.Role,
                    }).ConfigureAwait(false);
                }
                else if (userWorkgroupRole.IsActive == true && existingRole != default && existingRole.Role != userWorkgroupRole.Role)
                {
                    existingRole.Role = userWorkgroupRole.Role;
                }
                else if (userWorkgroupRole.IsActive == false && existingRole != default && existingRole.Role == userWorkgroupRole.Role)
                {
                    context.UserWorkgroupRoles.Remove(existingRole);
                }
                else if (userWorkgroupRole.IsActive == null)
                {
                    logger.LogWarning("No active state for the user's workgroup role was provided in the request body: <{UserWorkgroupRole}> ", userWorkgroupRole);
                }
                else
                {
                    logger.LogInformation("The user's workgroup role provided in the request body: <{UserWorkgroupRole}> already corresponds to the role saved in the database, no changes were made.", userWorkgroupRole);
                }
            }

            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception e)
        {
            var message = "Error while setting roles.";
            logger.LogError(e, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Rejects role changes with an unknown role, or for a user or workgroup that does not exist,
    /// so they fail with a client error instead of a foreign key violation. The role is parsed from
    /// JSON that also accepts plain numbers, so an out-of-range value can reach this point.
    /// </summary>
    /// <returns>The error result, or <c>null</c> if all role changes are valid.</returns>
    private async Task<IActionResult?> ValidateRoleChangesAsync(UserWorkgroupRole[] userWorkgroupRoles)
    {
        var unknownRoles = userWorkgroupRoles.Select(r => r.Role).Where(role => !Enum.IsDefined(role)).Distinct().ToList();
        if (unknownRoles.Count > 0)
        {
            return BadRequest($"Unknown role(s): {string.Join(", ", unknownRoles)}.");
        }

        var userIds = userWorkgroupRoles.Select(r => r.UserId).Distinct().ToList();
        var existingUserCount = await context.Users.CountAsync(u => userIds.Contains(u.Id)).ConfigureAwait(false);
        if (existingUserCount != userIds.Count)
        {
            return NotFound();
        }

        var workgroupIds = userWorkgroupRoles.Select(r => r.WorkgroupId).Distinct().ToList();
        var existingWorkgroupCount = await context.Workgroups.CountAsync(w => workgroupIds.Contains(w.Id)).ConfigureAwait(false);
        if (existingWorkgroupCount != workgroupIds.Count)
        {
            return NotFound();
        }

        return null;
    }
}
