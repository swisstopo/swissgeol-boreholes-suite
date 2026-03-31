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
    /// Gets or sets the workflow status filter.
    /// </summary>
    public WorkflowStatus? WorkflowStatus { get; set; }

    /// <summary>
    /// Gets or sets the workgroup ID filter.
    /// </summary>
    [MaxLength(100)]
    public IEnumerable<int>? WorkgroupId { get; set; }

    /// <summary>
    /// Gets or sets multiple borehole IDs filter.
    /// </summary>
    [MaxLength(100)]
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
    /// Gets or sets the national interest filter.
    /// </summary>
    public TriStateBooleanFilter? NationalInterest { get; set; }

    /// <summary>
    /// Gets or sets the top bedrock intersected filter.
    /// </summary>
    public TriStateBooleanFilter? TopBedrockIntersected { get; set; }

    /// <summary>
    /// Gets or sets the has groundwater filter.
    /// </summary>
    public TriStateBooleanFilter? HasGroundwater { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with geometry available.
    /// </summary>
    public BooleanFilter? HasGeometry { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with log runs.
    /// </summary>
    public BooleanFilter? HasLogs { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with attached profiles.
    /// </summary>
    public BooleanFilter? HasProfiles { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with photos.
    /// </summary>
    public BooleanFilter? HasPhotos { get; set; }

    /// <summary>
    /// Gets or sets whether to filter for boreholes with documents.
    /// </summary>
    public BooleanFilter? HasDocuments { get; set; }

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
    /// Gets or sets the sort direction.
    /// </summary>
    public OrderDirection? Direction { get; set; }
}
