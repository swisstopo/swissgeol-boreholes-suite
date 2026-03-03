using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LocationController(LocationService locationService) : ControllerBase
{
    /// <summary>
    /// Asynchronously retrieves location information (country_bho, canton_bho and municipality_bho) for a single location
    /// using the coordinates and the original reference system.
    /// </summary>
    /// <param name="east">The east coordinate of the location.</param>
    /// <param name="north">The north coordinate of the location.</param>
    /// <param name="srid">The id of the reference system. </param>
    /// <returns>The <see cref="LocationInfo"/> corresponding to the supplied coordinates.</returns>
    [HttpGet("identify")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public Task<LocationInfo> IdentifyAsync([Required] double east, [Required] double north, int srid = SpatialReferenceConstants.SridLv95)
        => locationService.IdentifyAsync(east, north, srid);
}
