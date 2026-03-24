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
/// Represents a lightweight borehole for displaying in boreholes table.
/// </summary>
public class BoreholeListItem
{
    /// <inheritdoc cref="Borehole.Id"/>
    public int Id { get; set; }

    /// <inheritdoc cref="Borehole.OriginalName"/>
    public string? OriginalName { get; set; }

    /// <inheritdoc cref="Borehole.Name"/>
    public string? Name { get; set; }

    /// <inheritdoc cref="Borehole.WorkgroupId"/>
    public int? WorkgroupId { get; set; }

    public string? WorkgroupName { get; set; }

    /// <inheritdoc cref="Borehole.StatusId"/>
    public int? StatusId { get; set; }

    /// <inheritdoc cref="Borehole.TypeId"/>
    public int? TypeId { get; set; }

    /// <inheritdoc cref="Borehole.PurposeId"/>
    public int? PurposeId { get; set; }

    /// <inheritdoc cref="Borehole.RestrictionId"/>
    public int? RestrictionId { get; set; }

    /// <inheritdoc cref="Borehole.RestrictionUntil"/>
    public DateTime? RestrictionUntil { get; set; }

    /// <inheritdoc cref="Borehole.NationalInterest"/>
    public bool? NationalInterest { get; set; }

    /// <inheritdoc cref="Borehole.LocationX"/>
    public double? LocationX { get; set; }

    /// <inheritdoc cref="Borehole.LocationY"/>
    public double? LocationY { get; set; }

    /// <inheritdoc cref="Borehole.ElevationZ"/>
    public double? ElevationZ { get; set; }

    /// <inheritdoc cref="Borehole.TotalDepth"/>
    public double? TotalDepth { get; set; }

    /// <inheritdoc cref="Borehole.Created"/>
    public DateTime? Created { get; set; }

    /// <inheritdoc cref="Borehole.Updated"/>
    public DateTime? Updated { get; set; }

    /// <inheritdoc cref="Borehole.IsPublic"/>
    public bool? IsPublic { get; set; }

    /// <inheritdoc cref="Borehole.Locked"/>
    public DateTime? Locked { get; set; }
}
