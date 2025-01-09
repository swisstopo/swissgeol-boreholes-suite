using BDMS.Models;
using NetTopologySuite.Geometries;
using System.Globalization;
using System.Text.Json;

namespace BDMS;

public class CoordinateService
{
    private const string Lv95ToLv03 = "lv95tolv03";
    private const string Lv03ToLv95 = "lv03tolv95";

    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CoordinateService"/> class.
    /// </summary>
    /// <param name="logger">The <see cref="ILogger"/>.</param>
    /// <param name="httpClientFactory">A factory abstraction that can create <see cref="HttpClient"/> instance.</param>
    public CoordinateService(ILogger<CoordinateService> logger, IHttpClientFactory httpClientFactory)
    {
        this.httpClientFactory = httpClientFactory;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously recalculates the LV03/LV95 coordinates for the given <paramref name="borehole"/> depending on whether the original
    /// reference system is LV03 or LV95 based.
    /// </summary>
    /// <param name="borehole">The borehole object to apply the recalculations for.</param>
    /// <param name="onlyMissing">Default: true; Indicates whether or not only missing coordinates should be (re-)calculated.</param>
    /// <![CDATA[
    /// The transformation from LV03 to LV95 coordinates and reverse is based on the FINELTRA algorithm
    /// https://geodesy.geo.admin.ch/reframe/lv95tolv03?easting=2646000&northing=1149500&format=json
    /// => {"easting": "646000.0750693441", "northing": "149500.33675441807"}
    /// https://geodesy.geo.admin.ch/reframe/lv03tolv95?easting=646000&northing=149500&format=json
    /// => {"easting": "2645999.9249287224", "northing": "1149499.663239225"}
    ///
    /// Example:
    /// https://example.com/api/v2/coordinate/migrate?onlymissing=true&dryrun=true
    /// ]]>
    public async Task<bool> MigrateCoordinatesOfBorehole(Borehole borehole, bool onlyMissing = true)
    {
        var httpClient = httpClientFactory.CreateClient(nameof(CoordinateService));
        httpClient.BaseAddress = new Uri("https://geodesy.geo.admin.ch/reframe/");

        var transformDirection = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? Lv95ToLv03 : Lv03ToLv95;
        var sourceLocationX = transformDirection == Lv95ToLv03 ? borehole.LocationX : borehole.LocationXLV03;
        var sourceLocationY = transformDirection == Lv95ToLv03 ? borehole.LocationY : borehole.LocationYLV03;
        var destinationLocationX = transformDirection == Lv95ToLv03 ? borehole.LocationXLV03 : borehole.LocationX;
        var destinationLocationY = transformDirection == Lv95ToLv03 ? borehole.LocationYLV03 : borehole.LocationY;
        var setDestinationLocationX = (double x) => transformDirection == Lv95ToLv03 ? borehole.LocationXLV03 = x : borehole.LocationX = x;
        var setDestinationLocationY = (double y) => transformDirection == Lv95ToLv03 ? borehole.LocationYLV03 = y : borehole.LocationY = y;

        if (onlyMissing && destinationLocationX != null && destinationLocationY != null) return false;
        if (sourceLocationX == null || sourceLocationY == null) return false;

        var reframeOptions = FormattableString.Invariant(
            $"{transformDirection}?easting={sourceLocationX}&northing={sourceLocationY}&format=json");

        using var response = await httpClient.GetAsync(new Uri(reframeOptions, UriKind.Relative)).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();

        var jsonResult = await response.Content.ReadFromJsonAsync<JsonElement>().ConfigureAwait(false);

        var originalDecimalPlaces = new List<int> { GetDecimalPlaces(sourceLocationX.Value), GetDecimalPlaces(sourceLocationY.Value) }.OrderByDescending(x => x).First();
        setDestinationLocationX(Math.Round(double.Parse(jsonResult.GetProperty("easting").GetString()!, CultureInfo.InvariantCulture), originalDecimalPlaces, MidpointRounding.AwayFromZero));
        setDestinationLocationY(Math.Round(double.Parse(jsonResult.GetProperty("northing").GetString()!, CultureInfo.InvariantCulture), originalDecimalPlaces, MidpointRounding.AwayFromZero));

        // Update geometry (using LV95 coordinates)
        borehole.Geometry = new Point(borehole.LocationX!.Value, borehole.LocationY!.Value) { SRID = SpatialReferenceConstants.SridLv95 };

        return true;
    }

    /// <summary>
    /// Gets the number of decimal places for the given <paramref name="value"/>.
    /// </summary>
    internal static int GetDecimalPlaces(double value) =>
        value.ToString(CultureInfo.InvariantCulture).Split('.').Skip(1).FirstOrDefault()?.Length ?? default;
}
