using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LocationController : Controller
{
    private readonly BdmsContext context;
    private readonly ILogger<LocationController> logger;
    private readonly LocationService locationService;

    /// <summary>
    /// Initializes a new instance of the <see cref="LocationController"/> class.
    /// </summary>
    /// <param name="context">The EF database context containing data for the BDMS application.</param>
    /// <param name="logger">The <see cref="ILogger"/>.</param>
    /// <param name="locationService">An incstance of <see cref="LocationService"/>.</param>
    public LocationController(BdmsContext context, ILogger<LocationController> logger, LocationService locationService)
    {
        this.context = context;
        this.logger = logger;
        this.locationService = locationService;
    }

    /// <summary>
    /// Asynchronously batch updates location information (country_bho, canton_bho and municipality_bho) for existing boreholes
    /// using the coordinates from the original reference system.
    /// </summary>
    /// <param name="onlyMissing">Default: true; Indicates whether or not only boreholes with missing location
    /// information should be updated.</param>
    /// <param name="dryRun">Default: true; Indicates wheter or not changes get written to the database.</param>
    /// <![CDATA[
    /// Example:
    /// https://example.com/api/v2/location/migrate?onlymissing=true&dryrun=true
    ///
    /// Important:
    /// In order to use this endpoint, you have to authenticate with an admin user.
    /// ]]>
    [HttpGet("migrate")]
    public async Task<IActionResult> MigrateAsync(bool onlyMissing = true, bool dryRun = true)
    {
        logger.LogInformation(
            "Starting updating borehole locations with the following options: onlyMissing=<{OnlyMissing}>; dryRun=<{DryRun}>", dryRun, onlyMissing);

        var updatedBoreholes = 0;

        try
        {
            foreach (var borehole in context.Boreholes)
            {
                // Use origin spatial reference system
                var locationX = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationX : borehole.LocationXLV03;
                var locationY = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationY : borehole.LocationYLV03;
                var srid = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? SpatialReferenceConstants.SridLv95 : SpatialReferenceConstants.SridLv03;

                // Skip empty ones
                if (locationX == null || locationY == null) continue;

                // Skip if location information is already set (if configured)
                if (onlyMissing &&
                    !string.IsNullOrWhiteSpace(borehole.Country) &&
                    !string.IsNullOrWhiteSpace(borehole.Canton) &&
                    !string.IsNullOrWhiteSpace(borehole.Municipality)) continue;

                var locationInfo = await IdentifyAsync(locationX.Value, locationY.Value, srid).ConfigureAwait(false);
                borehole.Country = locationInfo.Country;
                borehole.Canton = locationInfo.Canton;
                borehole.Municipality = locationInfo.Municipality;

                updatedBoreholes++;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex.Message, ex);
            return Problem(detail: ex.Message);
        }

        if (!dryRun)
        {
            await context.SaveChangesAsync().ConfigureAwait(false);
            logger.LogInformation("Successfully updated <{Count}> borehole locations.", updatedBoreholes);
        }

        return new JsonResult(new { updatedBoreholes, onlyMissing, dryRun, success = true });
    }

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
