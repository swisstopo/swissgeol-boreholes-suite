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
    /// Gets or sets the <see cref="Borehole"/>'s kind id.
    /// </summary>
    [Column("kind_id_cli")]
    public int? KindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s kind.
    /// </summary>
    public Codelist? Kind { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s X-location using LV95 coordinates.
    /// </summary>
    [Column("location_x_bho")]
    public double? LocationX { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Y-location using LV95 coordinates.
    /// </summary>
    [Column("location_y_bho")]
    public double? LocationY { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s X-location using LV03 coordinates.
    /// </summary>
    [Column("location_x_lv03_bho")]
    public double? LocationXLV03 { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Y-location using LV03 coordinates.
    /// </summary>
    [Column("location_y_lv03_bho")]
    public double? LocationYLV03 { get; set; }

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
    /// Gets or sets the <see cref="Borehole"/>'s QTLocationId.
    /// </summary>
    [Column("qt_location_id_cli")]
    public int? QtLocationId { get; set; }
    public Codelist? QtLocation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s QTElevationId.
    /// </summary>
    [Column("qt_elevation_id_cli")]
    public int? QtElevationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s QTElevation.
    /// </summary>
    public Codelist? QtElevation { get; set; }

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
    /// Gets or sets the <see cref="Borehole"/>'s drilling method Id.
    /// </summary>
    [Column("drilling_method_id_cli")]
    public int? DrillingMethodId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s drilling method.
    /// </summary>
    public Codelist? DrillingMethod { get; set; }

    /// <summary>
    /// Gets or sets the timestamp from the drilling date of the  <see cref="Borehole"/>.
    /// </summary>
    [Column("drilling_date_bho")]
    public DateTime? DrillingDate { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s cuttings id.
    /// </summary>
    [Column("cuttings_id_cli")]
    public int? CuttingsId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s cuttings id.
    /// </summary>
    public Codelist? Cuttings { get; set; }

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
    /// Gets or sets the <see cref="Borehole"/>'s drilling diameter.
    /// </summary>
    [Column("drilling_diameter_bho")]
    public double? DrillingDiameter { get; set; }

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
    /// Gets or sets the <see cref="Borehole"/>'s inclination.
    /// </summary>
    [Column("inclination_bho")]
    public double? Inclination { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s inclinationdirection.
    /// </summary>
    [Column("inclination_direction_bho")]
    public double? InclinationDirection { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s QtInclinationDirection id.
    /// </summary>
    [Column("qt_inclination_direction_id_cli")]
    public int? QtInclinationDirectionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s QtInclinationDirection.
    /// </summary>
    public Codelist? QtInclinationDirection { get; set; }

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
    [Column("top_bedrock_bho")]
    public double? TopBedrock { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s QtTopBedrock id.
    /// </summary>
    [Column("qt_top_bedrock_id_cli")]
    public int? QtTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s QtTopBedrock.
    /// </summary>
    public Codelist? QtTopBedrock { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Borehole"/> has groundwater.
    /// </summary>
    [Column("groundwater_bho")]
    public bool? HasGroundwater { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s geometry.
    /// </summary>
    [Column("geom_bho")]
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
    /// Gets or sets the timestamp from the spud date of the  <see cref="Borehole"/>.
    /// </summary>
    [Column("spud_date_bho")]
    public DateTime? SpudDate { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s top bedrock tvd.
    /// </summary>
    [Column("top_bedrock_tvd_bho")]
    public double? TopBedrockTvd { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Qt top bedrock tvd id.
    /// </summary>
    [Column("qt_top_bedrock_tvd_id_cli")]
    public int? QtTopBedrockTvdId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Qt top bedrock tvd.
    /// </summary>
    public Codelist? QtTopBedrockTvd { get; set; }

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
    /// Gets or sets the <see cref="Borehole"/>'s total depth tvd.
    /// </summary>
    [Column("total_depth_tvd_bho")]
    public double? TotalDepthTvd { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Qt total depth tvd id.
    /// </summary>
    [Column("qt_total_depth_tvd_id_cli")]
    public int? QtTotalDepthTvdId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>'s Qt total depth tvd.
    /// </summary>
    public Codelist? QtTotalDepthTvd { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s stratigraphies.
    /// </summary>
    public ICollection<Stratigraphy> Stratigraphies { get; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>'s workflows.
    /// </summary>
    public ICollection<Workflow> Workflows { get; } = new List<Workflow>();

    /// <summary>
    /// Gets the <see cref="File"/>s attached to the <see cref="Borehole"/>.
    /// </summary>
    public ICollection<File> Files { get; }

    /// <summary>
    /// Gets the <see cref="BoreholeFile"/> join table entities.
    /// </summary>
    public ICollection<BoreholeFile> BoreholeFiles { get; }

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
