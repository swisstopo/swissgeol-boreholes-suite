using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text.Json;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LocationController : Controller
{
    private readonly HttpClient httpClient;
    private readonly ILogger<LocationController> logger;

    private readonly string apiUri = "https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry={0}&tolerance=0&layers=all:{1}&returnGeometry=false&sr={2}";
    private readonly string countryLayer = "ch.swisstopo.swissboundaries3d-land-flaeche.fill";
    private readonly string cantonLayer = "ch.swisstopo.swissboundaries3d-kanton-flaeche.fill";
    private readonly string municipalityLayer = "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill";

    public LocationController(HttpClient httpClient, ILogger<LocationController> logger)
    {
        this.httpClient = httpClient;
        this.logger = logger;
    }

    [HttpGet("identify")]
    public async Task<ActionResult<LocationInfo>> IdentifyAsync([Required] double east, [Required] double north, int srid = 2056)
    {
        var point = string.Join(',', east, north);
        var layers = string.Join(',', countryLayer, cantonLayer, municipalityLayer);
        var requestUri = new Uri(string.Format(CultureInfo.InvariantCulture, apiUri, point, layers, srid));

        try
        {
            var httpResponse = await httpClient.GetAsync(requestUri).ConfigureAwait(false);
            httpResponse.EnsureSuccessStatusCode();

            var contentStream = await httpResponse.Content.ReadAsStreamAsync().ConfigureAwait(false);
            var document = await JsonDocument.ParseAsync(contentStream).ConfigureAwait(false);

            var result = new LocationInfo(
                Country: GetAttributeValueForLayer(document, countryLayer, "bez"),
                Canton: GetAttributeValueForLayer(document, cantonLayer, "name"),
                Municipality: GetAttributeValueForLayer(document, municipalityLayer, "gemname"));

            return Ok(result);
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
