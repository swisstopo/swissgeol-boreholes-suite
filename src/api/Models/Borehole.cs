using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a borehole entity in the database.
/// </summary>
[Table("borehole")]
public class Borehole : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id_bho")]
    public int Id { get; set; }

    /// <inheritdoc />
    [Column("created_by_bho")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <inheritdoc />
    [Column("created_bho")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
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
    [Column("public_bho")]
    public bool? IsPublic { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s type id.
    /// </summary>
    [Column("borehole_type_id")]
    public int? TypeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s type.
    /// </summary>
    public Codelist? Type { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s X-location using LV95 coordinates.
    /// </summary>
    [Column("location_x_bho")]
    public double? LocationX { get; set; }

    /// <summary>
    /// Gets or sets the precision for the <see cref="Borehole"/>'s X-location (LV95).
    /// </summary>
    [Column("precision_location_x")]
    public int? PrecisionLocationX { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Y-location using LV95 coordinates.
    /// </summary>
    [Column("location_y_bho")]
    public double? LocationY { get; set; }

    /// <summary>
    /// Gets or sets the precision for the <see cref="Borehole"/>'s Y-location (LV95).
    /// </summary>
    [Column("precision_location_y")]
    public int? PrecisionLocationY { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s X-location using LV03 coordinates.
    /// </summary>
    [Column("location_x_lv03_bho")]
    public double? LocationXLV03 { get; set; }

    /// <summary>
    /// Gets or sets the precision for the <see cref="Borehole"/>'s X-location (LV03).
    /// </summary>
    [Column("precision_location_x_lv03")]
    public int? PrecisionLocationXLV03 { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Y-location using LV03 coordinates.
    /// </summary>
    [Column("location_y_lv03_bho")]
    public double? LocationYLV03 { get; set; }

    /// <summary>
    /// Gets or sets the precision for the <see cref="Borehole"/>'s Y-location (LV03).
    /// </summary>
    [Column("precision_location_y_lv03")]
    public int? PrecisionLocationYLV03 { get; set; }

    /// <summary>
    /// Gets or sets the original reference system.
    /// </summary>
    [Column("srs_id_cli")]
    public ReferenceSystem? OriginalReferenceSystem { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Elevation(Z).
    /// </summary>
    [Column("elevation_z_bho")]
    public double? ElevationZ { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s HrsId.
    /// </summary>
    [Column("hrs_id_cli")]
    public int? HrsId { get; set; }

    public Codelist? Hrs { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s total depth.
    /// </summary>
    [Column("total_depth_bho")]
    public double? TotalDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s restriction id.
    /// </summary>
    [Column("restriction_id_cli")]
    public int? RestrictionId { get; set; }
    public Codelist? Restriction { get; set; }

    /// <summary>
    /// Gets or sets the timestamp until when a <see cref="Borehole"/> is restricted.
    /// </summary>
    [Column("restriction_until_bho")]
    public DateTime? RestrictionUntil { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s national interest.
    /// </summary>
    [Column("national_interest")]
    public bool? NationalInterest { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s original name.
    /// </summary>
    [Column("original_name_bho")]
    public string? OriginalName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s alternate name.
    /// </summary>
    [Column("alternate_name_bho")]
    public string? AlternateName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s location precision.
    /// </summary>
    [Column("qt_location_id_cli")]
    public int? LocationPrecisionId { get; set; }
    public Codelist? LocationPrecision { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s elevation precision id.
    /// </summary>
    [Column("qt_elevation_id_cli")]
    public int? ElevationPrecisionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s elevation precision.
    /// </summary>
    public Codelist? ElevationPrecision { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s project name.
    /// </summary>
    [Column("project_name_bho")]
    public string? ProjectName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s country.
    /// </summary>
    [Column("country_bho")]
    public string? Country { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s canton.
    /// </summary>
    [Column("canton_bho")]
    public string? Canton { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s municipality.
    /// </summary>
    [Column("municipality_bho")]
    public string? Municipality { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s purpose id.
    /// </summary>
    [Column("purpose_id_cli")]
    public int? PurposeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s purpose.
    /// </summary>
    public Codelist? Purpose { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s status id.
    /// </summary>
    [Column("status_id_cli")]
    public int? StatusId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s status.
    /// </summary>
    public Codelist? Status { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s QtDepth id.
    /// </summary>
    [Column("qt_depth_id_cli")]
    public int? QtDepthId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s QtDepth.
    /// </summary>
    public Codelist? QtDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s top bedrock.
    /// </summary>
    [Column("top_bedrock_fresh_md")]
    public double? TopBedrockFreshMd { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s weathered top bedrock.
    /// </summary>
    [Column("top_bedrock_weathered_md")]
    public double? TopBedrockWeatheredMd { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Borehole"/> has groundwater.
    /// </summary>
    [Column("groundwater_bho")]
    public bool? HasGroundwater { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s geometry.
    /// </summary>
    [Column("geom_bho")]
    [JsonIgnore]
    public Point? Geometry { get; set; }

    /// <summary>
    /// Gets or sets remarks for  the <see cref="Borehole"/>.
    /// </summary>
    [Column("remarks_bho")]
    public string? Remarks { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s lithology top bedrock id.
    /// </summary>
    [Column("lithology_top_bedrock_id_cli")]
    public int? LithologyTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s lithology top bedrock.
    /// </summary>
    public Codelist? LithologyTopBedrock { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s lithostratigraphy id.
    /// </summary>
    [Column("lithostrat_id_cli")]
    public int? LithostratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s lithostratigraphy.
    /// </summary>
    public Codelist? Lithostratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s chronostratigraphy id.
    /// </summary>
    [Column("chronostrat_id_cli")]
    public int? ChronostratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s chronostratigraphy.
    /// </summary>
    public Codelist? Chronostratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s reference elevation.
    /// </summary>
    [Column("reference_elevation_bho")]
    public double? ReferenceElevation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Qt reference elevation id.
    /// </summary>
    [Column("qt_reference_elevation_id_cli")]
    public int? QtReferenceElevationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Qt reference elevation.
    /// </summary>
    public Codelist? QtReferenceElevation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s reference elevation type id.
    /// </summary>
    [Column("reference_elevation_type_id_cli")]
    public int? ReferenceElevationTypeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s reference elevation type.
    /// </summary>
    public Codelist? ReferenceElevationType { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s stratigraphies.
    /// </summary>
    public ICollection<Stratigraphy>? Stratigraphies { get; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s completions.
    /// </summary>
    public ICollection<Completion>? Completions { get; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s <see cref="Section"/>s.
    /// </summary>
    public ICollection<Section>? Sections { get; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s <see cref="BoreholeGeometry"/>.
    /// </summary>
    [JsonIgnore]
    public IList<BoreholeGeometryElement>? BoreholeGeometry { get; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s observations.
    /// </summary>
    public ICollection<Observation>? Observations { get; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s workflows.
    /// </summary>
    public ICollection<Workflow> Workflows { get; } = new List<Workflow>();

    /// <summary>
    /// Gets the <see cref="File"/>s attached to the <see cref="Borehole"/>.
    /// </summary>
    public ICollection<File>? Files { get; }

    /// <summary>
    /// Gets the <see cref="BoreholeFile"/> join table entities.
    /// </summary>
    public ICollection<BoreholeFile>? BoreholeFiles { get; }

    /// <summary>
    /// Gets the <see cref="Codelist"/>s used by the <see cref="Borehole"/> to store multiple id types.
    /// </summary>
    public ICollection<Codelist>? Codelists { get; }

    /// <summary>
    /// Gets the<see cref="BoreholeCodelist"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public IList<BoreholeCodelist>? BoreholeCodelists { get; set; } = new List<BoreholeCodelist>();
}
