using BDMS.Models;
using System.Globalization;
using System.Text;
using System.Text.Json;

namespace BDMS;

/// <summary>
/// Retrieves location information (country, canton, municipality) from the swisstopo identify API.
/// </summary>
public sealed class LocationService(ILogger<LocationService> logger, IHttpClientFactory httpClientFactory)
{
    private const string CountryLayer = "ch.swisstopo.swissboundaries3d-land-flaeche.fill";
    private const string CantonLayer = "ch.swisstopo.swissboundaries3d-kanton-flaeche.fill";
    private const string MunicipalityLayer = "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill";

    private static readonly CompositeFormat ApiUri = CompositeFormat.Parse("https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry={0}&tolerance=0&layers=all:{1}&returnGeometry=false&sr={2}");

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
        var layers = string.Join(',', CountryLayer, CantonLayer, MunicipalityLayer);
        var requestUri = new Uri(string.Format(CultureInfo.InvariantCulture, ApiUri, point, layers, srid));

        try
        {
            using var httpResponse = await httpClient.GetAsync(requestUri).ConfigureAwait(false);
            httpResponse.EnsureSuccessStatusCode();

            using var contentStream = await httpResponse.Content.ReadAsStreamAsync().ConfigureAwait(false);
            using var document = await JsonDocument.ParseAsync(contentStream).ConfigureAwait(false);

            return new(
                Country: GetAttributeValueForLayer(document, CountryLayer, "bez"),
                Canton: GetAttributeValueForLayer(document, CantonLayer, "name"),
                Municipality: GetAttributeValueForLayer(document, MunicipalityLayer, "gemname"));
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Failed to query swisstopo identify API ({RequestUri}).", requestUri);
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
            logger.LogError(ex, "Key <{AttributeName}> in layer <{LayerName}> not found in swisstopo JSON response.", attributeName, layerName);
            return null;
        }
    }
}
