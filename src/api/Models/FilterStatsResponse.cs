namespace BDMS.Models;

/// <summary>
/// Represents per-option counts for each multi-option filter
/// dimension. Counts are computed with the filter-exclusion semantic.
/// </summary>
public class FilterStatsResponse
{
    /// <summary>Gets or sets counts grouped by <see cref="Borehole.StatusId"/>.</summary>
    public Dictionary<int, int> StatusId { get; set; } = new();

    /// <summary>Gets or sets counts grouped by <see cref="Borehole.TypeId"/>.</summary>
    public Dictionary<int, int> TypeId { get; set; } = new();

    /// <summary>Gets or sets counts grouped by <see cref="Borehole.PurposeId"/>.</summary>
    public Dictionary<int, int> PurposeId { get; set; } = new();

    /// <summary>Gets or sets counts grouped by <see cref="Borehole.WorkgroupId"/>.</summary>
    public Dictionary<int, int> WorkgroupId { get; set; } = new();

    /// <summary>Gets or sets counts grouped by <see cref="Borehole.RestrictionId"/>.</summary>
    public Dictionary<int, int> RestrictionId { get; set; } = new();

    /// <summary>Gets or sets counts for the nullable-boolean "national interest" dimension.</summary>
    public NullableBooleanCounts NationalInterest { get; set; } = new();

    /// <summary>Gets or sets counts for the nullable-boolean "top bedrock intersected" dimension.</summary>
    public NullableBooleanCounts TopBedrockIntersected { get; set; } = new();

    /// <summary>Gets or sets counts for the nullable-boolean "has groundwater" dimension.</summary>
    public NullableBooleanCounts HasGroundwater { get; set; } = new();

    /// <summary>Gets or sets counts for the derived "has geometry" dimension.</summary>
    public BooleanCounts HasGeometry { get; set; } = new();

    /// <summary>Gets or sets counts for the derived "has logs" dimension.</summary>
    public BooleanCounts HasLogs { get; set; } = new();

    /// <summary>Gets or sets counts for the derived "has profiles" dimension.</summary>
    public BooleanCounts HasProfiles { get; set; } = new();

    /// <summary>Gets or sets counts for the derived "has photos" dimension.</summary>
    public BooleanCounts HasPhotos { get; set; } = new();

    /// <summary>Gets or sets counts for the derived "has documents" dimension.</summary>
    public BooleanCounts HasDocuments { get; set; } = new();
}

/// <summary>
/// Per-value counts for a nullable-boolean filter field (true / false / null).
/// </summary>
public class NullableBooleanCounts
{
    /// <summary>Gets or sets the number of rows with value true.</summary>
    public int True { get; set; }

    /// <summary>Gets or sets the number of rows with value false.</summary>
    public int False { get; set; }

    /// <summary>Gets or sets the number of rows with null value.</summary>
    public int Null { get; set; }
}

/// <summary>
/// Per-value counts for a derived boolean filter field (true / false).
/// </summary>
public class BooleanCounts
{
    /// <summary>Gets or sets the number of rows for which the derived predicate is true.</summary>
    public int True { get; set; }

    /// <summary>Gets or sets the number of rows for which the derived predicate is false.</summary>
    public int False { get; set; }
}
