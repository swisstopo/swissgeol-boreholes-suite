namespace BDMS.Models;

/// <summary>
/// Represents a borehole from the csv export.
/// </summary>
public class BoreholeExport
{
    /// <summary>
    /// Gets or sets the ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the original name of the <see cref="BoreholeExport"/>.
    /// </summary>
    public string? OriginalName { get; set; }

    /// <summary>
    /// Gets or sets the project name associated with the <see cref="BoreholeExport"/>.
    /// </summary>
    public string? ProjectName { get; set; }

    /// <summary>
    /// Gets or sets the name of the <see cref="BoreholeExport"/>.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the restriction ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? RestrictionId { get; set; }

    /// <summary>
    /// Gets or sets the date until which the <see cref="BoreholeExport"/> is restricted.
    /// </summary>
    public DateTime? RestrictionUntil { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="BoreholeExport"/> has national interest.
    /// </summary>
    public bool? NationalInterest { get; set; }

    /// <summary>
    /// Gets or sets the X-coordinate of the <see cref="BoreholeExport"/>'s location.
    /// </summary>
    public double? LocationX { get; set; }

    /// <summary>
    /// Gets or sets the Y-coordinate of the <see cref="BoreholeExport"/>'s location.
    /// </summary>
    public double? LocationY { get; set; }

    /// <summary>
    /// Gets or sets the location precision ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? LocationPrecisionId { get; set; }

    /// <summary>
    /// Gets or sets the elevation (Z) of the <see cref="BoreholeExport"/>.
    /// </summary>
    public double? ElevationZ { get; set; }

    /// <summary>
    /// Gets or sets the elevation precision ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? ElevationPrecisionId { get; set; }

    /// <summary>
    /// Gets or sets the reference elevation of the <see cref="BoreholeExport"/>.
    /// </summary>
    public double? ReferenceElevation { get; set; }

    /// <summary>
    /// Gets or sets the reference elevation type ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? ReferenceElevationTypeId { get; set; }

    /// <summary>
    /// Gets or sets the precision ID for the reference elevation of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? ReferenceElevationPrecisionId { get; set; }

    /// <summary>
    /// Gets or sets the HRS ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? HrsId { get; set; }

    /// <summary>
    /// Gets or sets the type ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? TypeId { get; set; }

    /// <summary>
    /// Gets or sets the purpose ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? PurposeId { get; set; }

    /// <summary>
    /// Gets or sets the status ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? StatusId { get; set; }

    /// <summary>
    /// Gets or sets any remarks associated with the <see cref="BoreholeExport"/>.
    /// </summary>
    public string? Remarks { get; set; }

    /// <summary>
    /// Gets or sets the total depth of the <see cref="BoreholeExport"/>.
    /// </summary>
    public double? TotalDepth { get; set; }

    /// <summary>
    /// Gets or sets the depth precision ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? DepthPresicionId { get; set; }

    /// <summary>
    /// Gets or sets the top fresh bedrock depth of the <see cref="BoreholeExport"/>.
    /// </summary>
    public double? TopBedrockFreshMd { get; set; }

    /// <summary>
    /// Gets or sets the top weathered bedrock depth of the <see cref="BoreholeExport"/>.
    /// </summary>
    public double? TopBedrockWeatheredMd { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="BoreholeExport"/> has groundwater.
    /// </summary>
    public bool? HasGroundwater { get; set; }

    /// <summary>
    /// Gets or sets the lithology top bedrock ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? LithologyTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the chronostratigraphy top bedrock ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? ChronostratigraphyTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the lithostratigraphy top bedrock ID of the <see cref="BoreholeExport"/>.
    /// </summary>
    public int? LithostratigraphyTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoreholeExport"/>'s true vertical total depth.
    /// </summary>
    public double? TotalDepthTvd { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoreholeExport"/>'s true vertical top fresh bedrock depth.
    /// </summary>
    public double? TopBedrockFreshTvd { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoreholeExport"/>'s true vertical top weathered bedrock depth.
    /// </summary>
    public double? TopBedrockWeatheredTvd { get; set; }
}
