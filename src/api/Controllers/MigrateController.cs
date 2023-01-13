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
    private const string Lv95ToLv03 = "lv95tolv03";
    private const string Lv03ToLv95 = "lv03tolv95";

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
    ///
    /// Important:
    /// In order to use this endpoint, you have to authenticate with an admin user.
    /// ]]>
    [HttpGet("recalculatecoordinates")]
    public async Task<IActionResult> RecalculateCoordinates(bool onlyMissing = true, bool dryRun = true)
    {
        var httpClient = httpClientFactory.CreateClient(nameof(MigrateController));
        httpClient.BaseAddress = new Uri("https://geodesy.geo.admin.ch/reframe/");

        logger.LogInformation(
            "Starting recalculating coordinates with the following options: onlyMissing=<{OnlyMissing}>; dryRun=<{DryRun}>", dryRun, onlyMissing);

        var transformedCoordinates = 0;

        try
        {
            foreach (var borehole in context.Boreholes)
            {
                var transformDirection = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? Lv95ToLv03 : Lv03ToLv95;
                var sourceLocationX = transformDirection == Lv95ToLv03 ? borehole.LocationX : borehole.LocationXLV03;
                var sourceLocationY = transformDirection == Lv95ToLv03 ? borehole.LocationY : borehole.LocationYLV03;
                var destinationLocationX = transformDirection == Lv95ToLv03 ? borehole.LocationXLV03 : borehole.LocationX;
                var destinationLocationY = transformDirection == Lv95ToLv03 ? borehole.LocationYLV03 : borehole.LocationY;
                var setDestinationLocationX = (double x) => transformDirection == Lv95ToLv03 ? borehole.LocationXLV03 = x : borehole.LocationX = x;
                var setDestinationLocationY = (double y) => transformDirection == Lv95ToLv03 ? borehole.LocationYLV03 = y : borehole.LocationY = y;

                if (onlyMissing && destinationLocationX != null && destinationLocationY != null) continue;
                if (sourceLocationX == null || sourceLocationY == null) continue;

                var reframeOptions = FormattableString.Invariant(
                    $"{transformDirection}?easting={sourceLocationX}&northing={sourceLocationY}&format=json");

                using var response = await httpClient.GetAsync(new Uri(reframeOptions, UriKind.Relative)).ConfigureAwait(false);
                response.EnsureSuccessStatusCode();

                var jsonResult = await response.Content.ReadFromJsonAsync<JsonElement>().ConfigureAwait(false);

                var originalDecimalPlaces = new List<int> { GetDecimalPlaces(sourceLocationX.Value), GetDecimalPlaces(sourceLocationY.Value) }.OrderByDescending(x => x).First();
                setDestinationLocationX(Math.Round(double.Parse(jsonResult.GetProperty("easting").GetString()!, CultureInfo.InvariantCulture), originalDecimalPlaces, MidpointRounding.AwayFromZero));
                setDestinationLocationY(Math.Round(double.Parse(jsonResult.GetProperty("northing").GetString()!, CultureInfo.InvariantCulture), originalDecimalPlaces, MidpointRounding.AwayFromZero));

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

    /// <summary>
    /// Gets the number of decimal places for the given <paramref name="value"/>.
    /// </summary>
    internal static int GetDecimalPlaces(double value) =>
        value.ToString(CultureInfo.InvariantCulture).Split('.').Skip(1).FirstOrDefault()?.Length ?? default;
}
