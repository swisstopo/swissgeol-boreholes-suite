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
        var subjectId = HttpContext.GetUserSubjectId();
        if (!await boreholePermissionService.CanEditBoreholeAsync(subjectId, workflowChangeRequest.BoreholeId, true).ConfigureAwait(false)) return Unauthorized();

        var workflow = await context.WorkflowsV2WithIncludes.SingleOrDefaultAsync(w => w.BoreholeId == workflowChangeRequest.BoreholeId).ConfigureAwait(false);
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), workflowChangeRequest.BoreholeId).ConfigureAwait(false)) return Unauthorized();
        if (workflowChangeRequest.NewStatus == WorkflowStatus.Published)
        {
         if (!await boreholePermissionService.HasUserRoleOnWorkgroupAsync(HttpContext.GetUserSubjectId(), workflowChangeRequest.BoreholeId, Role.Publisher).ConfigureAwait(false)) return Unauthorized();
        }
        if (workflow == null) return NotFound($"Workflow for borehole with {workflowChangeRequest.BoreholeId} not found.");

        var newAssignee = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Id == workflowChangeRequest.NewAssigneeId).ConfigureAwait(false);
        if (newAssignee == null) return NotFound($"New assingee with id {workflowChangeRequest.NewAssigneeId} not found.");

        var user = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.SubjectId == subjectId).ConfigureAwait(false);

        // Create the change history entry
        var change = new WorkflowChange
        {
            WorkflowId = workflow.Id,
            FromStatus = workflow.Status,
            ToStatus = workflowChangeRequest.NewStatus,
            Comment = workflowChangeRequest.Comment,
            Created = DateTime.UtcNow,
            CreatedById = user.Id,
            AssigneeId = workflowChangeRequest?.NewAssigneeId ?? null,
        };

        // Update the workflow state
        workflow.Status = workflowChangeRequest.NewStatus;
        workflow.AssigneeId = workflowChangeRequest.NewAssigneeId;

        context.WorkflowChanges.Add(change);
        await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
        return Ok(workflow);
    }
}
