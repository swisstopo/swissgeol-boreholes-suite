using BDMS.Json;
using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a borehole entity in the database.
/// </summary>
[Table("borehole")]
public class Borehole : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [IncludeInExport]
    [Column("id_bho")]
    public int Id { get; set; }

    /// <inheritdoc />
    [Column("created_by_bho")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("created_bho")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("updated_bho")]
    public DateTime? Updated { get; set; }

    /// <inheritdoc />
    [Column("updated_by_bho")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/> locked date.
    /// </summary>
    [Column("locked_bho")]
    public DateTime? Locked { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who locked the <see cref="Borehole"/>.
    /// </summary>
    [Column("locked_by_bho")]
    public int? LockedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who locked the <see cref="Borehole"/>.
    /// </summary>
    public User? LockedBy { get; set; }

    /// <summary>
    /// Gets or sets the foreign key to the <see cref="Workgroup"/> entity.
    /// </summary>
    [Column("id_wgp_fk")]
    public int? WorkgroupId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Workgroup"/>.
    /// </summary>
    public Workgroup? Workgroup { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Borehole"/> is public.
    /// </summary>
    [IncludeInExport]
    [Column("public_bho")]
    public bool? IsPublic { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s type id.
    /// </summary>
    [IncludeInExport]
    [Column("borehole_type_id")]
    public int? TypeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s type.
    /// </summary>
    public Codelist? Type { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s X-location using LV95 coordinates.
    /// </summary>
    [IncludeInExport]
    [Column("location_x_bho")]
    public double? LocationX { get; set; }

    /// <summary>
    /// Gets or sets the precision for the <see cref="Borehole"/>'s X-location (LV95).
    /// </summary>
    [IncludeInExport]
    [Column("precision_location_x")]
    public int? PrecisionLocationX { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Y-location using LV95 coordinates.
    /// </summary>
    [IncludeInExport]
    [Column("location_y_bho")]
    public double? LocationY { get; set; }

    /// <summary>
    /// Gets or sets the precision for the <see cref="Borehole"/>'s Y-location (LV95).
    /// </summary>
    [IncludeInExport]
    [Column("precision_location_y")]
    public int? PrecisionLocationY { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s X-location using LV03 coordinates.
    /// </summary>
    [IncludeInExport]
    [Column("location_x_lv03_bho")]
    public double? LocationXLV03 { get; set; }

    /// <summary>
    /// Gets or sets the precision for the <see cref="Borehole"/>'s X-location (LV03).
    /// </summary>
    [IncludeInExport]
    [Column("precision_location_x_lv03")]
    public int? PrecisionLocationXLV03 { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Y-location using LV03 coordinates.
    /// </summary>
    [IncludeInExport]
    [Column("location_y_lv03_bho")]
    public double? LocationYLV03 { get; set; }

    /// <summary>
    /// Gets or sets the precision for the <see cref="Borehole"/>'s Y-location (LV03).
    /// </summary>
    [IncludeInExport]
    [Column("precision_location_y_lv03")]
    public int? PrecisionLocationYLV03 { get; set; }

    /// <summary>
    /// Gets or sets the original reference system.
    /// </summary>
    [IncludeInExport]
    [Column("srs_id_cli")]
    public ReferenceSystem? OriginalReferenceSystem { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Elevation(Z).
    /// </summary>
    [IncludeInExport]
    [Column("elevation_z_bho")]
    public double? ElevationZ { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s HrsId.
    /// </summary>
    [IncludeInExport]
    [Column("hrs_id_cli")]
    public int? HrsId { get; set; }

    public Codelist? Hrs { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s total depth.
    /// </summary>
    [IncludeInExport]
    [Column("total_depth_bho")]
    public double? TotalDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s restriction id.
    /// </summary>
    [IncludeInExport]
    [Column("restriction_id_cli")]
    public int? RestrictionId { get; set; }

    public Codelist? Restriction { get; set; }

    /// <summary>
    /// Gets or sets the timestamp until when a <see cref="Borehole"/> is restricted.
    /// </summary>
    [IncludeInExport]
    [Column("restriction_until_bho")]
    public DateTime? RestrictionUntil { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s national interest.
    /// </summary>
    [IncludeInExport]
    [Column("national_interest")]
    public bool? NationalInterest { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s original name.
    /// </summary>
    [IncludeInExport]
    [Column("original_name_bho")]
    public string? OriginalName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s alternate name.
    /// </summary>
    [IncludeInExport]
    [Column("alternate_name_bho")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s location precision.
    /// </summary>
    [IncludeInExport]
    [Column("qt_location_id_cli")]
    public int? LocationPrecisionId { get; set; }

    public Codelist? LocationPrecision { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s elevation precision id.
    /// </summary>
    [IncludeInExport]
    [Column("qt_elevation_id_cli")]
    public int? ElevationPrecisionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s elevation precision.
    /// </summary>
    public Codelist? ElevationPrecision { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s project name.
    /// </summary>
    [IncludeInExport]
    [Column("project_name_bho")]
    public string? ProjectName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s country.
    /// </summary>
    [IncludeInExport]
    [Column("country_bho")]
    public string? Country { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s canton.
    /// </summary>
    [IncludeInExport]
    [Column("canton_bho")]
    public string? Canton { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s municipality.
    /// </summary>
    [IncludeInExport]
    [Column("municipality_bho")]
    public string? Municipality { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s purpose id.
    /// </summary>
    [IncludeInExport]
    [Column("purpose_id_cli")]
    public int? PurposeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s purpose.
    /// </summary>
    public Codelist? Purpose { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s status id.
    /// </summary>
    [IncludeInExport]
    [Column("status_id_cli")]
    public int? StatusId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s status.
    /// </summary>
    public Codelist? Status { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Depth presicion id.
    /// </summary>
    [IncludeInExport]
    [Column("qt_depth_id_cli")]
    public int? DepthPrecisionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Depth presicion.
    /// </summary>
    public Codelist? DepthPrecision { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s top bedrock.
    /// </summary>
    [IncludeInExport]
    [Column("top_bedrock_fresh_md")]
    public double? TopBedrockFreshMd { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s weathered top bedrock.
    /// </summary>
    [IncludeInExport]
    [Column("top_bedrock_weathered_md")]
    public double? TopBedrockWeatheredMd { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Borehole"/> has groundwater.
    /// </summary>
    [IncludeInExport]
    [Column("groundwater_bho")]
    public bool? HasGroundwater { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s geometry.
    /// </summary>
    [IncludeInExport]
    [Column("geom_bho")]
    public Point? Geometry { get; set; }

    /// <summary>
    /// Gets or sets remarks for  the <see cref="Borehole"/>.
    /// </summary>
    [IncludeInExport]
    [Column("remarks_bho")]
    public string? Remarks { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s lithology top bedrock id.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_top_bedrock_id_cli")]
    public int? LithologyTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s lithology top bedrock.
    /// </summary>
    public Codelist? LithologyTopBedrock { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s lithostratigraphy top bedrock id.
    /// </summary>
    [IncludeInExport]
    [Column("lithostrat_id_cli")]
    public int? LithostratigraphyTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s lithostratigraphy top bedrock.
    /// </summary>
    public Codelist? LithostratigraphyTopBedrock { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s chronostratigraphy top bedrock id.
    /// </summary>
    [IncludeInExport]
    [Column("chronostrat_id_cli")]
    public int? ChronostratigraphyTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s chronostratigraphy top bedrock.
    /// </summary>
    public Codelist? ChronostratigraphyTopBedrock { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s reference elevation.
    /// </summary>
    [IncludeInExport]
    [Column("reference_elevation_bho")]
    public double? ReferenceElevation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s reference elevation precision id.
    /// </summary>
    [IncludeInExport]
    [Column("qt_reference_elevation_id_cli")]
    public int? ReferenceElevationPrecisionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s reference elevation precision.
    /// </summary>
    public Codelist? ReferenceElevationPrecision { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s reference elevation type id.
    /// </summary>
    [IncludeInExport]
    [Column("reference_elevation_type_id_cli")]
    public int? ReferenceElevationTypeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s true vertical total depth.
    /// </summary>
    [NotMapped]
    public double? TotalDepthTvd { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s true vertical top bedrock fresh depth.
    /// </summary>
    [NotMapped]
    public double? TopBedrockFreshTvd { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s true vertical top bedrock weathered depth.
    /// </summary>
    [NotMapped]
    public double? TopBedrockWeatheredTvd { get; set; }

    /// <summary>
    /// Gets or sets whether <see cref="Borehole"/>'s top bedrock was intersected.
    /// </summary>
    [IncludeInExport]
    [Column("top_bedrock_intersected")]
    public bool? TopBedrockIntersected { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s reference elevation type.
    /// </summary>
    public Codelist? ReferenceElevationType { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s workflow.
    /// </summary>
    public Workflow? Workflow { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s stratigraphies.
    /// </summary>
    [IncludeInExport]
    public ICollection<StratigraphyV2>? Stratigraphies { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s completions.
    /// </summary>
    [IncludeInExport]
    public ICollection<Completion>? Completions { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s <see cref="Section"/>s.
    /// </summary>
    [IncludeInExport]
    public ICollection<Section>? Sections { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s <see cref="BoreholeGeometry"/>.
    /// </summary>
    [IncludeInExport]
    public IList<BoreholeGeometryElement>? BoreholeGeometry { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s observations.
    /// </summary>
    [IncludeInExport]
    public ICollection<Observation>? Observations { get; set; }

    /// <summary>
    /// Gets the <see cref="File"/>s attached to the <see cref="Borehole"/>.
    /// </summary>
    public ICollection<File>? Files { get; }

    /// <summary>
    /// Gets the <see cref="Profile"/> join table entities.
    /// </summary>
    [IncludeInExport]
    public ICollection<Profile>? Profiles { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s photos.
    /// </summary>
    public ICollection<Photo>? Photos { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s documents.
    /// </summary>
    [IncludeInExport]
    public ICollection<Document>? Documents { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s log runs.
    /// </summary>
    [IncludeInExport]
    public ICollection<LogRun>? LogRuns { get; set; }

    /// <summary>
    /// Gets the <see cref="Codelist"/>s used by the <see cref="Borehole"/> to store multiple id types.
    /// </summary>
    public ICollection<Codelist>? Codelists { get; }

    /// <summary>
    /// Gets the<see cref="BoreholeCodelist"/> join table entities.
    /// </summary>
    [IncludeInExport]
    public IList<BoreholeCodelist>? BoreholeCodelists { get; set; } = new List<BoreholeCodelist>();
}
