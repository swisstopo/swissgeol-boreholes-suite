using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

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
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var subjectId = HttpContext.GetUserSubjectId();

        // Check permission for editing the borehole
        if (!await boreholePermissionService.CanEditBoreholeAsync(subjectId, workflowChangeRequest.BoreholeId, true).ConfigureAwait(false)) return Unauthorized();

        // Check permissions specifically for publishing the borehole
        if (workflowChangeRequest.NewStatus == WorkflowStatus.Published &&
            !await boreholePermissionService.HasUserRoleOnWorkgroupAsync(subjectId, workflowChangeRequest.BoreholeId, Role.Publisher).ConfigureAwait(false))
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
            AssigneeId = workflowChangeRequest.NewAssigneeId,
        };

        // Update the workflow state
        workflow.Status = workflowChangeRequest.NewStatus ?? workflow.Status;
        workflow.AssigneeId = workflowChangeRequest.NewAssigneeId;

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
}
