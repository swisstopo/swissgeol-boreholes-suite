using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text.Json;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LocationController : Controller
{
    private readonly BdmsContext context;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<LocationController> logger;

    private readonly string apiUri = "https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry={0}&tolerance=0&layers=all:{1}&returnGeometry=false&sr={2}";
    private readonly string countryLayer = "ch.swisstopo.swissboundaries3d-land-flaeche.fill";
    private readonly string cantonLayer = "ch.swisstopo.swissboundaries3d-kanton-flaeche.fill";
    private readonly string municipalityLayer = "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill";

    // Spatial reference identifier (SRID)
    private readonly int sridLv95 = 2056;
    private readonly int sridLv03 = 21781;

    /// <summary>
    /// Initializes a new instance of the <see cref="LocationController"/> class.
    /// </summary>
    /// <param name="context">The EF database context containing data for the BDMS application.</param>
    /// <param name="httpClientFactory">A factory abstraction that can create <see cref="HttpClient"/> instance.</param>
    /// <param name="logger">The <see cref="ILoggerFactory"/>.</param>
    public LocationController(BdmsContext context, IHttpClientFactory httpClientFactory, ILogger<LocationController> logger)
    {
        this.context = context;
        this.httpClientFactory = httpClientFactory;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously updates location information (country_bho, canton_bho and municipality_bho)
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
                var srid = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? sridLv95 : sridLv03;

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

    [HttpGet("identify")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<LocationInfo> IdentifyAsync([Required] double east, [Required] double north, int srid = 2056)
    {
        var httpClient = httpClientFactory.CreateClient(nameof(LocationController));

        var point = string.Join(',', east, north);
        var layers = string.Join(',', countryLayer, cantonLayer, municipalityLayer);
        var requestUri = new Uri(string.Format(CultureInfo.InvariantCulture, apiUri, point, layers, srid));

        try
        {
            using var httpResponse = await httpClient.GetAsync(requestUri).ConfigureAwait(false);
            httpResponse.EnsureSuccessStatusCode();

            using var contentStream = await httpResponse.Content.ReadAsStreamAsync().ConfigureAwait(false);
            using var document = await JsonDocument.ParseAsync(contentStream).ConfigureAwait(false);

            var result = new LocationInfo(
                Country: GetAttributeValueForLayer(document, countryLayer, "bez"),
                Canton: GetAttributeValueForLayer(document, cantonLayer, "name"),
                Municipality: GetAttributeValueForLayer(document, municipalityLayer, "gemname"));

            return result;
        }
        catch (HttpRequestException ex)
        {
            logger.LogError($"Failed to query swisstopo identify API ({requestUri})", ex);
            throw;
        }
    }

    private string? GetAttributeValueForLayer(JsonDocument document, string layerName, string attributeName)
    {
        try
        {
            var layer = document.RootElement
                .GetProperty("results")
                .EnumerateArray()
                .FirstOrDefault(layer => layerName.Equals(layer.GetProperty("layerBodId").GetString(), StringComparison.Ordinal));

            if (layer.Equals(default(JsonElement)))
                return null;

            return layer.GetProperty("attributes").GetProperty(attributeName).GetString();
        }
        catch (KeyNotFoundException ex)
        {
            logger.LogError($"Key <{attributeName}> in layer <{layerName}> not found in swisstopo JSON response.", ex);
            return null;
        }
    }
}
