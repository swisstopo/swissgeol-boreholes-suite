using BDMS.Models;
using System.Globalization;
using System.Text.Json;

namespace BDMS;

public class LocationService
{
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger logger;

    private readonly string apiUri = "https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry={0}&tolerance=0&layers=all:{1}&returnGeometry=false&sr={2}";
    private readonly string countryLayer = "ch.swisstopo.swissboundaries3d-land-flaeche.fill";
    private readonly string cantonLayer = "ch.swisstopo.swissboundaries3d-kanton-flaeche.fill";
    private readonly string municipalityLayer = "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill";

    /// <summary>
    /// Initializes a new instance of the <see cref="LocationService"/> class.
    /// </summary>
    /// <param name="logger">The <see cref="ILogger"/>.</param>
    /// <param name="httpClientFactory">A factory abstraction that can create <see cref="HttpClient"/> instance.</param>
    public LocationService(ILogger<LocationService> logger, IHttpClientFactory httpClientFactory)
    {
        this.httpClientFactory = httpClientFactory;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously retrieves location information (country_bho, canton_bho and municipality_bho) for a single location
    /// using the coordinates and the original reference system.
    /// </summary>
    /// <param name="east">The east coordinate of the location.</param>
    /// <param name="north">The north coordinate of the location.</param>
    /// <param name="srid">The id of the reference system. </param>
    /// <returns>The <see cref="LocationInfo"/> corresponding to the supplied coordinates.</returns>
    public async Task<LocationInfo> IdentifyAsync(double east, double north, int srid = SpatialReferenceConstants.SridLv95)
    {
        using var httpClient = httpClientFactory.CreateClient(nameof(LocationService));

        var point = string.Join(',', east, north);
        var layers = string.Join(',', countryLayer, cantonLayer, municipalityLayer);
        var requestUri = new Uri(string.Format(CultureInfo.InvariantCulture, apiUri, point, layers, srid));

        try
        {
            using var httpResponse = await httpClient.GetAsync(requestUri).ConfigureAwait(false);
            httpResponse.EnsureSuccessStatusCode();

            using var contentStream = await httpResponse.Content.ReadAsStreamAsync().ConfigureAwait(false);
            using var document = await JsonDocument.ParseAsync(contentStream).ConfigureAwait(false);

            return new(
                Country: GetAttributeValueForLayer(document, countryLayer, "bez"),
                Canton: GetAttributeValueForLayer(document, cantonLayer, "name"),
                Municipality: GetAttributeValueForLayer(document, municipalityLayer, "gemname"));
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
