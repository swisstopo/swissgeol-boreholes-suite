using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using NetTopologySuite.Geometries;
using System.Globalization;
using System.Text.Json;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class MigrateController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<MigrateController> logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MigrateController"/> class.
    /// </summary>
    /// <param name="context">The EF database context containing data for the BDMS application.</param>
    /// <param name="httpClientFactory">A factory abstraction that can create <see cref="HttpClient"/> instance.</param>
    /// <param name="logger">The <see cref="ILoggerFactory"/>.</param>
    public MigrateController(BdmsContext context, IHttpClientFactory httpClientFactory, ILogger<MigrateController> logger)
    {
        this.context = context;
        this.httpClientFactory = httpClientFactory;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously recalculates the LV03/LV95 coordinates depending on whether the original
    /// reference system is LV03 or LV95 based.
    /// </summary>
    /// <param name="onlyMissing">Default: true; Indicates whether or not only missing coordinates should be (re-)calculated.</param>
    /// <param name="dryRun">Default: true; Indicates wheter or not changes get written to the database.</param>
    /// <![CDATA[
    /// The transformation from LV03 to LV95 coordinates and reverse is based on the FINELTRA algorithm
    /// https://geodesy.geo.admin.ch/reframe/lv95tolv03?easting=2646000&northing=1149500&format=json
    /// => {"easting": "646000.0750693441", "northing": "149500.33675441807"}
    /// https://geodesy.geo.admin.ch/reframe/lv03tolv95?easting=646000&northing=149500&format=json
    /// => {"easting": "2645999.9249287224", "northing": "1149499.663239225"}
    ///
    /// Example:
    /// https://example.com/api/v2/migrate/recalculatecoordinates?onlymissing=true&dryrun=true
    /// ]]>
    [HttpGet("recalculatecoordinates")]
    public async Task<IActionResult> RecalculateCoordinates(bool onlyMissing = true, bool dryRun = true)
    {
        var httpClient = httpClientFactory.CreateClient(nameof(MigrateController));
        httpClient.BaseAddress = new Uri("https://geodesy.geo.admin.ch/reframe/");

        async Task<(double Easting, double Northing)> TransformCoordinatesAsync(string convertionMethod, double? x, double? y)
        {
            var reframeOptions = FormattableString.Invariant($"{convertionMethod}?easting={x}&northing={y}&format=json");

            using var response = await httpClient.GetAsync(new Uri(reframeOptions, UriKind.Relative)).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();

            var jsonResult = await response.Content.ReadFromJsonAsync<JsonElement>().ConfigureAwait(false);
            return (
                double.Parse(jsonResult.GetProperty("easting").GetString()!, CultureInfo.InvariantCulture),
                double.Parse(jsonResult.GetProperty("northing").GetString()!, CultureInfo.InvariantCulture));
        }

        logger.LogInformation("Started recalculation coordinates with the following options: onlyMissing=<{OnlyMissing}>; dryRun=<{DryRun}>", dryRun, onlyMissing);
        var transformedCoordinates = 0;

        try
        {
            foreach (var borehole in context.Boreholes)
            {
                if (borehole.OriginalReferenceSystem == ReferenceSystem.LV95)
                {
                    if (onlyMissing && borehole.LocationXLV03 != null && borehole.LocationYLV03 != null) continue;

                    var (easting, northing) = await TransformCoordinatesAsync(
                        "lv95tolv03", borehole.LocationX, borehole.LocationY).ConfigureAwait(false);
                    borehole.LocationXLV03 = easting;
                    borehole.LocationYLV03 = northing;
                }
                else
                {
                    if (onlyMissing && borehole.LocationX != null && borehole.LocationY != null) continue;

                    var (easting, northing) = await TransformCoordinatesAsync(
                        "lv03tolv95", borehole.LocationXLV03, borehole.LocationYLV03).ConfigureAwait(false);
                    borehole.LocationX = easting;
                    borehole.LocationY = northing;
                }

                // Update geometry (using LV95 coordinates)
                borehole.Geometry = new Point(borehole.LocationX!.Value, borehole.LocationY!.Value) { SRID = 2056 };

                transformedCoordinates++;
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
