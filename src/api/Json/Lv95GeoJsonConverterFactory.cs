using NetTopologySuite.Geometries;
using NetTopologySuite.IO.Converters;

namespace BDMS.Json;

/// <summary>
/// Reads GeoJSON geometries with the LV95 SRID (EPSG:2056). GeoJSON has no coordinate system member
/// (RFC 7946 fixes WGS84), so the default converter assigns SRID 4326 and ignores a <c>crs</c> member.
/// Use it on properties whose API contract defines LV95 coordinates.
/// </summary>
public sealed class Lv95GeoJsonConverterFactory : GeoJsonConverterFactory
{
    public Lv95GeoJsonConverterFactory()
        : base(new GeometryFactory(new PrecisionModel(), SpatialReferenceIdentifier.LV95))
    {
    }
}
