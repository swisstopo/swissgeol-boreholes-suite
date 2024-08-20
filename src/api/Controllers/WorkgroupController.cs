using BDMS.Models;
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
    [SwaggerResponse(StatusCodes.Status200OK, "Returns a list of workgroups.")]
    public async Task<IEnumerable<Workgroup>> GetAll()
    {
        var workgroups = await context
            .WorkgroupsWithIncludes
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);

        return workgroups;
    }

    /// <summary>
    /// Create a new workgroup./>.
    /// </summary>
    [HttpPost]
    [SwaggerResponse(StatusCodes.Status200OK, "The workgroup was created successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "The workgroup could not be created due to invalid input.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user is not authorized to create workgroups.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request. ")]
    public async Task<IActionResult> Create(Workgroup workgroup)
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
    public async Task<IActionResult> Edit(Workgroup workgroup)
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
    public async Task<IActionResult> Delete(int id)
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

    [HttpPost("setRole")]
    [SwaggerResponse(StatusCodes.Status200OK, "The role was set successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "The role could not be set due to invalid input.")]
    [SwaggerResponse(StatusCodes.Status404NotFound, "The user or workgroup could not be found.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user is not authorized to set roles.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request. ")]
    public async Task<IActionResult> SetRole(UserWorkgroupRole userWorkgroupRole)
    {
        try
        {
            if (userWorkgroupRole == null)
            {
                return BadRequest();
            }

            var existingRole = await context.UserWorkgroupRoles
                .SingleOrDefaultAsync(r => r.UserId == userWorkgroupRole.UserId && r.WorkgroupId == userWorkgroupRole.WorkgroupId && r.Role == userWorkgroupRole.Role)
                .ConfigureAwait(false);

            if (userWorkgroupRole.IsActive == true && existingRole == default)
            {
                await context.AddAsync(userWorkgroupRole).ConfigureAwait(false);
            }
            else if (userWorkgroupRole.IsActive == false && existingRole != default)
            {
                context.UserWorkgroupRoles.Remove(existingRole);
            }

            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception e)
        {
            var message = "Error while setting role.";
            logger.LogError(e, message);
            return Problem(message);
        }
    }
}
