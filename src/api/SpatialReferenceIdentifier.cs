using BDMS.Models;

namespace BDMS;

/// <summary>
/// Contains spatial reference identifiers (SRIDs) used in the application.
/// </summary>
public static class SpatialReferenceIdentifier
{
    /// <summary>
    /// Swiss coordinate system LV95 (EPSG:2056).
    /// </summary>
    public const int LV95 = 2056;

    /// <summary>
    /// Swiss coordinate system LV03 (EPSG:21781).
    /// </summary>
    public const int LV03 = 21781;

    /// <summary>
    /// Gets the SRID corresponding to the given spatial reference system codelist <paramref name="referenceSystemId"/>.
    /// Returns <see cref="LV95"/> for <see cref="SpatialReferenceCodelistId.LV95"/>, otherwise <see cref="LV03"/>.
    /// </summary>
    public static int GetByCodelistId(int? referenceSystemId) =>
        referenceSystemId == SpatialReferenceCodelistId.LV95 ? LV95 : LV03;
}
