using Microsoft.AspNetCore.Mvc;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class CoordinateController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger<CoordinateController> logger;
    private readonly CoordinateService coordinateService;

    /// <summary>
    /// Initializes a new instance of the <see cref="CoordinateController"/> class.
    /// </summary>
    /// <param name="context">The EF database context containing data for the BDMS application.</param>
    /// <param name="logger">The <see cref="ILoggerFactory"/>.</param>
    /// <param name="coordinateService"><see cref="CoordinateService"/>.</param>
    public CoordinateController(BdmsContext context, ILogger<CoordinateController> logger, CoordinateService coordinateService)
    {
        this.context = context;
        this.logger = logger;
        this.coordinateService = coordinateService;
    }

    /// <summary>
    /// Asynchronously recalculates the LV03/LV95 coordinates of all boreholes depending on whether the original
    /// reference system is LV03 or LV95 based.
    /// </summary>
    /// <param name="onlyMissing">Default: true; Indicates whether or not only missing coordinates should be (re-)calculated.</param>
    /// <param name="dryRun">Default: true; Indicates wheter or not changes get written to the database.</param>
    /// <![CDATA[
    /// Important:
    /// In order to use this endpoint, you have to authenticate with an admin user.
    /// ]]>
    [HttpGet("migrate")]
    public async Task<IActionResult> MigrateAsync(bool onlyMissing = true, bool dryRun = true)
    {
        logger.LogInformation(
            "Starting recalculating coordinates with the following options: onlyMissing=<{OnlyMissing}>; dryRun=<{DryRun}>", dryRun, onlyMissing);

        var transformedCoordinates = 0;

        try
        {
            foreach (var borehole in context.Boreholes)
            {
                // Migrate coordinates.
                var coordinatesDidMigrate = await coordinateService.MigrateCoordinatesOfBorehole(borehole, onlyMissing).ConfigureAwait(false);

                // Count borehole if coordinates did migrate.
                if (coordinatesDidMigrate)
                {
                    transformedCoordinates++;
                }
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
            logger.LogInformation("Successfully transformed coordinates for <{Count}> boreholes.", transformedCoordinates);
        }

        return new JsonResult(new { transformedCoordinates, onlyMissing, dryRun, success = true });
    }
}
