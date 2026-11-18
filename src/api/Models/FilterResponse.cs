using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Represents a paginated response containing filtered boreholes.
/// </summary>
/// <param name="TotalCount">The total count of filtered boreholes.</param>
/// <param name="PageNumber">The current page number.</param>
/// <param name="PageSize">The size of the page.</param>
/// <param name="TotalPages">The total number of pages.</param>
/// <param name="Boreholes">The borehole list items for the current page.</param>
/// <param name="SelectableBoreholeIds">The IDs of all unlocked filtered boreholes.</param>
/// <remarks>Every field is always sent, so each is marked required for the generated client types.</remarks>
public record FilterResponse(
    [property: Required] int TotalCount,
    [property: Required] int PageNumber,
    [property: Required] int PageSize,
    [property: Required] int TotalPages,
    [property: Required] IEnumerable<BoreholeListItem> Boreholes,
    [property: Required] IEnumerable<int> SelectableBoreholeIds);

/// <summary>
/// Represents a lightweight borehole for displaying in boreholes table.
/// </summary>
/// <remarks>
/// Every property is always sent, null values included. The <c>required</c> modifier marks each one as required in
/// the OpenAPI schema for the generated client types and keeps the nullable ones nullable there, which
/// <see cref="RequiredAttribute"/> would not: Swashbuckle also marks a property with that attribute as non-nullable.
/// </remarks>
public class BoreholeListItem
{
    /// <inheritdoc cref="Borehole.Id"/>
    public required int Id { get; set; }

    /// <inheritdoc cref="Borehole.OriginalName"/>
    public required string? OriginalName { get; set; }

    /// <inheritdoc cref="Borehole.Name"/>
    public required string? Name { get; set; }

    /// <inheritdoc cref="Borehole.WorkgroupId"/>
    public required int? WorkgroupId { get; set; }

    public required string? WorkgroupName { get; set; }

    /// <inheritdoc cref="Borehole.StatusId"/>
    public required int? StatusId { get; set; }

    /// <inheritdoc cref="Borehole.TypeId"/>
    public required int? TypeId { get; set; }

    /// <inheritdoc cref="Borehole.PurposeId"/>
    public required int? PurposeId { get; set; }

    /// <inheritdoc cref="Borehole.RestrictionId"/>
    public required int? RestrictionId { get; set; }

    /// <inheritdoc cref="Borehole.RestrictionUntil"/>
    public required DateOnly? RestrictionUntil { get; set; }

    /// <inheritdoc cref="Borehole.NationalInterest"/>
    public required bool? NationalInterest { get; set; }

    /// <inheritdoc cref="Borehole.LocationX"/>
    public required double? LocationX { get; set; }

    /// <inheritdoc cref="Borehole.LocationY"/>
    public required double? LocationY { get; set; }

    /// <inheritdoc cref="Borehole.ElevationZ"/>
    public required double? ElevationZ { get; set; }

    /// <inheritdoc cref="Borehole.TotalDepth"/>
    public required double? TotalDepth { get; set; }

    /// <inheritdoc cref="Borehole.Created"/>
    public required DateTime? Created { get; set; }

    /// <inheritdoc cref="Borehole.Updated"/>
    public required DateTime? Updated { get; set; }

    /// <inheritdoc cref="Borehole.Locked"/>
    public required DateTime? Locked { get; set; }
}
