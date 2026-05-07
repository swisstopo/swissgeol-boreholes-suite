using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Represents a request to filter boreholes by various criteria.
/// </summary>
public class FilterRequest
{
    /// <summary>
    /// Gets or sets the polygon geometry filter for spatial filtering.
    /// Boreholes within this geometry will be included.
    /// </summary>
    public Geometry? Polygon { get; set; }

    /// <summary>
    /// Gets or sets the original name filter.
    /// </summary>
    public string? OriginalName { get; set; }

    /// <summary>
    /// Gets or sets the project name filter.
    /// </summary>
    public string? ProjectName { get; set; }

    /// <summary>
    /// Gets or sets the alternate name filter.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the status ID filter.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<int>? StatusId { get; set; }

    /// <summary>
    /// Gets or sets the borehole type ID filter.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<int>? TypeId { get; set; }

    /// <summary>
    /// Gets or sets the purpose ID filter.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<int>? PurposeId { get; set; }

    /// <summary>
    /// Gets or sets the workflow status filter. Matches boreholes whose workflow status is in this set.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<WorkflowStatus>? WorkflowStatus { get; set; }

    /// <summary>
    /// Gets or sets the workgroup ID filter.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<int>? WorkgroupId { get; set; }

    /// <summary>
    /// Gets or sets multiple borehole IDs filter.
    /// </summary>
    public IEnumerable<int>? Ids { get; set; }

    /// <summary>
    /// Gets or sets the restriction until date start filter.
    /// </summary>
    public DateOnly? RestrictionUntilFrom { get; set; }

    /// <summary>
    /// Gets or sets the restriction until date end filter.
    /// </summary>
    public DateOnly? RestrictionUntilTo { get; set; }

    /// <summary>
    /// Gets or sets the minimum total depth filter.
    /// </summary>
    public double? TotalDepthMin { get; set; }

    /// <summary>
    /// Gets or sets the maximum total depth filter.
    /// </summary>
    public double? TotalDepthMax { get; set; }

    /// <summary>
    /// Gets or sets the minimum top bedrock fresh depth filter.
    /// </summary>
    public double? TopBedrockFreshMdMin { get; set; }

    /// <summary>
    /// Gets or sets the maximum top bedrock fresh depth filter.
    /// </summary>
    public double? TopBedrockFreshMdMax { get; set; }

    /// <summary>
    /// Gets or sets the minimum top bedrock weathered depth filter.
    /// </summary>
    public double? TopBedrockWeatheredMdMin { get; set; }

    /// <summary>
    /// Gets or sets the maximum top bedrock weathered depth filter.
    /// </summary>
    public double? TopBedrockWeatheredMdMax { get; set; }

    /// <summary>
    /// Gets or sets the restriction ID filter.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<int>? RestrictionId { get; set; }

    /// <summary>
    /// Gets or sets the canton filter. Boreholes match if their canton is in this set.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<string>? Canton { get; set; }

    /// <summary>
    /// Gets or sets the municipality filter. Boreholes match if their municipality is in this set.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<string>? Municipality { get; set; }

    /// <summary>
    /// Gets or sets the log tool type codelist IDs filter. Boreholes match if any of their log files
    /// have at least one of these tool type codelist IDs in their <see cref="LogFile.LogFileToolTypeCodes"/>.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<int>? LogToolTypeId { get; set; }

    /// <summary>
    /// Gets or sets the identifier type (codelist) IDs filter.
    /// Boreholes match if at least one <see cref="BoreholeCodelist"/> row has a
    /// <c>CodelistId</c> in this set; combined with <see cref="IdentifierValue"/>
    /// the predicates apply on the same row (strict semantics).
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<int>? IdentifierTypeId { get; set; }

    /// <summary>
    /// Gets or sets the identifier value substring filter (case-insensitive).
    /// </summary>
    public string? IdentifierValue { get; set; }

    /// <summary>
    /// Gets or sets the national interest filter.
    /// </summary>
    public NullableBooleanFilterValue? NationalInterest { get; set; }

    /// <summary>
    /// Gets or sets the top bedrock intersected filter.
    /// </summary>
    public NullableBooleanFilterValue? TopBedrockIntersected { get; set; }

    /// <summary>
    /// Gets or sets the has groundwater filter.
    /// </summary>
    public NullableBooleanFilterValue? HasGroundwater { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with geometry available.
    /// </summary>
    public BooleanFilterValue? HasGeometry { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with log runs.
    /// </summary>
    public BooleanFilterValue? HasLogs { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with attached profiles.
    /// </summary>
    public BooleanFilterValue? HasProfiles { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with photos.
    /// </summary>
    public BooleanFilterValue? HasPhotos { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with documents.
    /// </summary>
    public BooleanFilterValue? HasDocuments { get; set; }

    /// <summary>
    /// Gets or sets the page number for pagination.
    /// </summary>
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Gets or sets the page size for pagination.
    /// </summary>
    [Range(1, 100)]
    public int PageSize { get; set; } = 100;

    /// <summary>
    /// Gets or sets the field to order by.
    /// </summary>
    public BoreholeOrderBy? OrderBy { get; set; }

    /// <summary>
    /// Gets or sets the order direction.
    /// </summary>
    public OrderDirection? Direction { get; set; }
}
