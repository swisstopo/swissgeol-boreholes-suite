using NetTopologySuite.Features;
namespace BDMS.Models;

/// <summary>
/// Represents a paginated response containing filtered boreholes.
/// </summary>
/// <param name="TotalCount">The total count of filtered boreholes.</param>
/// <param name="PageNumber">The current page number.</param>
/// <param name="PageSize">The size of the page.</param>
/// <param name="TotalPages">The total number of pages.</param>
/// <param name="Boreholes">The borehole list items for the current page.</param>
/// <param name="GeoJson">The GeoJSON feature collection for map display.</param>
/// <param name="FilteredBoreholeIds">The IDs of all filtered boreholes (unlocked only).</param>
public record FilterResponse(
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages,
    IEnumerable<BoreholeListItem> Boreholes,
    FeatureCollection? GeoJson,
    IEnumerable<int> FilteredBoreholeIds);

/// <summary>
/// Represents a lightweight borehole for displaying on map and in boreholes table.
/// </summary>
public class BoreholeListItem
{
    public int Id { get; set; }
    public string? OriginalName { get; set; }
    public string? Name { get; set; }
    public int? WorkgroupId { get; set; }
    public string? WorkgroupName { get; set; }
    public int? StatusId { get; set; }
    public int? TypeId { get; set; }
    public int? PurposeId { get; set; }
    public int? RestrictionId { get; set; }
    public DateTime? RestrictionUntil { get; set; }
    public bool? NationalInterest { get; set; }
    public double? LocationX { get; set; }
    public double? LocationY { get; set; }
    public double? ElevationZ { get; set; }
    public double? TotalDepth { get; set; }
    public DateTime? Created { get; set; }
    public DateTime? Updated { get; set; }
    public string? CreatedByUsername { get; set; }
    public string? UpdatedByUsername { get; set; }
    public bool? IsPublic { get; set; }
    public DateTime? Locked { get; set; }
}
