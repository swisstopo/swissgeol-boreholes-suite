using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;
using System.Reflection;
using System.Threading.Tasks;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class WorkflowController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly IBoreholePermissionService boreholePermissionService;
    private readonly ILogger<WorkflowController> logger;

    public WorkflowController(BdmsContext context, IBoreholePermissionService boreholePermissionService, ILogger<WorkflowController> logger)
    {
        this.context = context;
        this.logger = logger;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="WorkflowV2"/> associated with <paramref name="boreholeId"/>.
    /// </summary>
    [HttpGet("{boreholeId}")]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns a workflow.")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<WorkflowV2>> GetByIdAsync(int boreholeId)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var workflow = await context.WorkflowsV2WithIncludes.SingleOrDefaultAsync(i => i.BoreholeId == boreholeId).ConfigureAwait(false);
        if (workflow == null) return NotFound();

        return Ok(workflow);
    }

    /// <summary>
    /// Updates the <see cref="WorkflowV2"/> defined in the <paramref name="workflowChangeRequest"/> and creates a corresponding <see cref="WorkflowChange"/>.
    /// </summary>
    [HttpPost("change")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [SwaggerResponse(StatusCodes.Status200OK, "Applies a workflow change and updates the workflow.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "The workflow could not be created due to invalid input.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "The current user is not authorized to create workflow changes.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "The server encountered an unexpected condition that prevented it from fulfilling the request.")]
    public async Task<IActionResult> ApplyWorkflowChangeAsync([FromBody] WorkflowChangeRequest workflowChangeRequest)
    {
        var subjectId = HttpContext.GetUserSubjectId();

        // Check permission for editing the borehole
        if (!await boreholePermissionService.CanEditBoreholeAsync(subjectId, workflowChangeRequest.BoreholeId, true).ConfigureAwait(false)) return Unauthorized();

        // Check permissions specifically for publishing the borehole
        BoreholePermissionService.EditPermissionsStatusRoleMap.TryGetValue(WorkflowStatus.Published, out var requiredRole);
        if (!requiredRole.HasValue)
        {
            var errorMessage = $"No required role found workflow status {WorkflowStatus.Published}.";
            logger?.LogError(errorMessage);
            return Problem(errorMessage);
        }

        if (workflowChangeRequest.NewStatus == WorkflowStatus.Published && !await boreholePermissionService.HasUserRoleOnWorkgroupAsync(subjectId, workflowChangeRequest.BoreholeId, requiredRole.Value).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        var workflow = await context.WorkflowsV2WithIncludes.SingleOrDefaultAsync(w => w.BoreholeId == workflowChangeRequest.BoreholeId).ConfigureAwait(false);
        if (workflow == null)
        {
            var workflowNotFoundMessage = $"Workflow for borehole with {workflowChangeRequest.BoreholeId} not found.";
            logger?.LogWarning(workflowNotFoundMessage);
            return NotFound(workflowNotFoundMessage);
        }

        var newAssignee = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Id == workflowChangeRequest.NewAssigneeId).ConfigureAwait(false);
        if (newAssignee == null)
        {
            var userNotFoundMessage = $"New assignee with id {workflowChangeRequest.NewAssigneeId} not found.";
            logger?.LogWarning(userNotFoundMessage);
            return NotFound(userNotFoundMessage);
        }

        var user = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.SubjectId == subjectId).ConfigureAwait(false);

        // Create the change history entry
        var change = new WorkflowChange
        {
            WorkflowId = workflow.Id,
            FromStatus = workflow.Status,
            ToStatus = workflowChangeRequest.NewStatus ?? workflow.Status,
            Comment = workflowChangeRequest.Comment ?? "",
            Created = DateTime.UtcNow,
            CreatedById = user.Id,
            AssigneeId = newAssignee.Id,
        };

        // Update the workflow state
        workflow.Status = change.ToStatus;
        workflow.AssigneeId = change.AssigneeId;

        context.WorkflowChanges.Add(change);

        try
        {
            await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return Ok(workflow);
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the workflow changes.";
            logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
    }

    /// <summary>
    /// Applies a tab status change to the workflow of a borehole.
    /// </summary>
    [HttpPost("tabstatuschange")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [SwaggerResponse(StatusCodes.Status200OK, "Tab status change applied successfully.")]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid input for tab status change.")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized, "Unauthorized to change tab status.")]
    [SwaggerResponse(StatusCodes.Status404NotFound, "Workflow not found for the specified borehole.")]
    [SwaggerResponse(StatusCodes.Status500InternalServerError, "Server error while applying tab status change.")]
    public async Task<IActionResult> ApplyTabStatusChangeAsync([FromBody] WorkflowTabStatusChangeRequest request)
    {
        var subjectId = HttpContext.GetUserSubjectId();

        if (!await boreholePermissionService.CanEditBoreholeAsync(subjectId, request.BoreholeId, true).ConfigureAwait(false)) return Unauthorized();

        var workflow = await context.WorkflowsV2WithIncludes.SingleOrDefaultAsync(w => w.BoreholeId == request.BoreholeId).ConfigureAwait(false);
        if (workflow == null)
        {
            var workflowNotFoundMessage = $"Workflow for borehole with {request.BoreholeId} not found.";
            logger?.LogWarning(workflowNotFoundMessage);
            return NotFound(workflowNotFoundMessage);
        }

        try
        {
            if (!Enum.TryParse<WorkflowStatusField>(request.Field, true, out var fieldEnum) ||
                !Enum.IsDefined(typeof(WorkflowStatusField), fieldEnum))
            {
                return BadRequest($"Invalid field name {request.Field} for tab status change.");
            }

            TabStatus tabStatus;
            if (request.Tab == WorkflowTabType.Reviewed)
            {
                tabStatus = workflow.ReviewedTabs;
            }
            else if (request.Tab == WorkflowTabType.Published)
            {
                tabStatus = workflow.PublishedTabs;
            }
            else
            {
                return BadRequest($"Invalid tab type {request.Tab} for tab status change.");
            }

            SetTabStatusField(tabStatus, fieldEnum, request.NewStatus);
            await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return Ok(workflow);
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Error applying tab status change.");
            return Problem("An error occurred while applying the tab status change.");
        }
    }

    private static void SetTabStatusField(TabStatus tabStatus, WorkflowStatusField field, bool value)
    {
        var prop = typeof(TabStatus).GetProperty(field.ToString(), BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
        if (prop == null || prop.PropertyType != typeof(bool))
            throw new ArgumentException($"Invalid field: {field}");

        prop.SetValue(tabStatus, value);
    }
}
