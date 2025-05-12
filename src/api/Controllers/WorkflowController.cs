using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class WorkflowController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly IBoreholePermissionService boreholePermissionService;

    public WorkflowController(BdmsContext context, IBoreholePermissionService boreholePermissionService)
    {
        this.context = context;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="WorkflowV2"/> associated with <paramref name="boreholeId"/>.
    /// </summary>
    [HttpGet("{boreholeId}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<WorkflowV2>> GetByIdAsync(int boreholeId)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var workflow = await context.WorkflowsV2WithIncludes.SingleOrDefaultAsync(i => i.BoreholeId == boreholeId).ConfigureAwait(false);
        if (workflow == null)
        {
            return NotFound();
        }

        return Ok(workflow);
    }
}
