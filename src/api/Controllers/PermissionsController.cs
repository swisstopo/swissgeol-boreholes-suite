using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class PermissionsController : ControllerBase
{
    private readonly IBoreholePermissionService permissionService;

    /// <summary>
    /// Initializes a new instance of the <see cref="PermissionsController"/> class.
    /// </summary>
    /// <param name="permissionService"><see cref="BoreholePermissionService"/>.</param>
    public PermissionsController(IBoreholePermissionService permissionService)
    {
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

    /// <summary>
    /// Gets whether the currently authenticated user has permission to change the status of the <see cref="Borehole"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole to get the edit permissions for.</param>
    [HttpGet("canChangeStatus")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<bool> CanChangeStatus([FromQuery] int? boreholeId)
    {
        if (!boreholeId.HasValue || boreholeId <= 0)
        {
            return false;
        }

        return await permissionService.CanChangeBoreholeStatusAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false);
    }
}
