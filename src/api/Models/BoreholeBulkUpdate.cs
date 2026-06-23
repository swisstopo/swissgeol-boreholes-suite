using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// The typed set of borehole fields that can be changed through bulk edit.
/// Every property is nullable; which of them are actually written is controlled
/// by <see cref="BoreholeBulkUpdateRequest.FieldsToUpdate"/>. A field named in the
/// mask whose value is <see langword="null"/> clears the corresponding column.
/// </summary>
public class BoreholeBulkUpdate
{
    public int? WorkgroupId { get; set; }
    public int? RestrictionId { get; set; }
    public DateOnly? RestrictionUntil { get; set; }
    public bool? NationalInterest { get; set; }
    public string? ProjectName { get; set; }
    public int? TypeId { get; set; }
    public int? PurposeId { get; set; }
    public int? StatusId { get; set; }
    public int? LocationPrecisionId { get; set; }
    public int? ElevationPrecisionId { get; set; }
    public int? ReferenceElevationPrecisionId { get; set; }
    public int? ReferenceElevationTypeId { get; set; }
    public int? DepthPrecisionId { get; set; }
    public double? TotalDepth { get; set; }
    public double? TopBedrockFreshMd { get; set; }
    public double? TopBedrockWeatheredMd { get; set; }
    public bool? HasGroundwater { get; set; }
    public int? LithologyTopBedrockId { get; set; }
    public int? LithostratigraphyTopBedrockId { get; set; }
    public int? ChronostratigraphyTopBedrockId { get; set; }
}

/// <summary>
/// Request payload for bulk editing boreholes. Applies <see cref="Update"/> to every
/// borehole in <see cref="BoreholeIds"/>, writing only the properties named in
/// <see cref="FieldsToUpdate"/> (matched case-insensitively against
/// <see cref="BoreholeBulkUpdate"/> property names).
/// </summary>
public class BoreholeBulkUpdateRequest
{
    [Required]
    [MinLength(1)]
    public Collection<int> BoreholeIds { get; set; } = new();

    [Required]
    public BoreholeBulkUpdate Update { get; set; } = new();

    [Required]
    [MinLength(1)]
    public Collection<string> FieldsToUpdate { get; set; } = new();
}
