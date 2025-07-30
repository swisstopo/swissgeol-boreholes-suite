using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class PermissionsController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly IBoreholePermissionService permissionService;

    /// <summary>
    /// Initializes a new instance of the <see cref="PermissionsController"/> class.
    /// </summary>
    /// <param name="context">The EF database context containing data for the BDMS application.</param>
    /// <param name="permissionService"><see cref="BoreholePermissionService"/>.</param>
    public PermissionsController(BdmsContext context, IBoreholePermissionService permissionService)
    {
        this.context = context;
        this.permissionService = permissionService;
    }

    /// <summary>
    /// Gets whether the currently authenticated user has permission to edit the <see cref="Borehole"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole to get the edit permissions for.</param>
    [HttpGet("canEdit")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<bool> CanEditAsync([FromQuery] int? boreholeId)
    {
        if (!boreholeId.HasValue || boreholeId <= 0)
        {
            return false;
        }

        return await permissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false);
    }
}
