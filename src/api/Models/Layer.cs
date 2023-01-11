using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a layer entity in the database.
/// </summary>
[Table("layer")]
public class Layer
{
    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s id.
    /// </summary>
    [Column("id_lay")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Stratigraphy"/> of the <see cref="Layer"/>.
    /// </summary>
    [Column("id_sty_fk")]
    public int? StratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/> of the <see cref="Layer"/>.
    /// </summary>
    public Stratigraphy? Stratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who created the <see cref="Layer"/>.
    /// </summary>
    [Column("creator_lay")]
    public int CreatedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who created the <see cref="Layer"/>.
    /// </summary>
    public User? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s creation date.
    /// </summary>
    [Column("creation_lay")]
    public DateTime? Creation { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who updated the <see cref="Layer"/>.
    /// </summary>
    [Column("updater_lay")]
    public int UpdatedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who updated the <see cref="Layer"/>.
    /// </summary>
    public User? UpdatedBy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s update date.
    /// </summary>
    [Column("update_lay")]
    public DateTime? Update { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Layer"/> is undefined.
    /// </summary>
    [Column("undefined_lay")]
    public bool? IsUndefined { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s upper depth.
    /// </summary>
    [Column("depth_from_lay")]
    public double? FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s lower depth.
    /// </summary>
    [Column("depth_to_lay")]
    public double? ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s lithological description.
    /// </summary>
    [Column("lithological_description_lay")]
    public string? DescriptionLithological { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s facies description.
    /// </summary>
    [Column("facies_description_lay")]
    public string? DescriptionFacies { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Layer"/> is the last layer.
    /// </summary>
    [Column("last_lay")]
    public bool? IsLast { get; set; }

    /// <summary>
    /// Gets or sets the id of the quality of the <see cref="Layer"/>'s description.
    /// </summary>
    [Column("qt_description_id_cli")]
    public int? QtDescriptionId { get; set; }

    /// <summary>
    /// Gets or sets the quality of the <see cref="Layer"/>'s description.
    /// </summary>
    public Codelist? QtDescription { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s lithology.
    /// </summary>
    [Column("lithology_id_cli")]
    public int? LithologyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s lithology.
    /// </summary>
    public Codelist? Lithology { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s chronostratigraphy.
    /// </summary>
    [Column("chronostratigraphy_id_cli")]
    public int? ChronostratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s chronostratigraphy.
    /// </summary>
    public Codelist? Chronostratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s plasticity.
    /// </summary>
    [Column("plasticity_id_cli")]
    public int? PlasticityId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s plasticity.
    /// </summary>
    public Codelist? Plasticity { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s consitance.
    /// </summary>
    [Column("consistance_id_cli")]
    public int? ConsistanceId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s consitance.
    /// </summary>
    public Codelist? Consistance { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s alteration.
    /// </summary>
    [Column("alteration_id_cli")]
    public int? AlterationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s consitance.
    /// </summary>
    public Codelist? Alteration { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s compactness.
    /// </summary>
    [Column("compactness_id_cli")]
    public int? CompactnessId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s compactness.
    /// </summary>
    public Codelist? Compactness { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s grain size 1.
    /// </summary>
    [Column("grain_size_1_id_cli")]
    public int? GrainSize1Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s grain size 1.
    /// </summary>
    public Codelist? GrainSize1 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s grain size 2.
    /// </summary>
    [Column("grain_size_2_id_cli")]
    public int? GrainSize2Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s grain size 2.
    /// </summary>
    public Codelist? GrainSize2 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s cohesion.
    /// </summary>
    [Column("cohesion_id_cli")]
    public int? CohesionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s cohesion.
    /// </summary>
    public Codelist? Cohesion { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s Uscs 1.
    /// </summary>
    [Column("uscs_1_id_cli")]
    public int? Uscs1Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s Uscs 1.
    /// </summary>
    public Codelist? Uscs1 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s Uscs 2.
    /// </summary>
    [Column("uscs_2_id_cli")]
    public int? Uscs2Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s Uscs 2.
    /// </summary>
    public Codelist? Uscs2 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s Uscs 3.
    /// </summary>
    [Column("uscs_3_id_cli")]
    public int? Uscs3Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s Uscs 3.
    /// </summary>
    public Codelist? Uscs3 { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s Original Uscs.
    /// </summary>
    [Column("uscs_original_lay")]
    public string? OriginalUscs { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s Uscs determination.
    /// </summary>
    [Column("uscs_determination_id_cli")]
    public int? UscsDeterminationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s Uscs determination.
    /// </summary>
    public Codelist? UscsDetermination { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s notes.
    /// </summary>
    [Column("notes_lay")]
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s lithostratigraphy.
    /// </summary>
    [Column("lithostratigraphy_id_cli")]
    public int? LithostratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s lithostratigraphy.
    /// </summary>
    public Codelist? Lithostratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s humidity.
    /// </summary>
    [Column("humidity_id_cli")]
    public int? HumidityId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s humidity.
    /// </summary>
    public Codelist? Humidity { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Layer"/> is striae.
    /// </summary>
    [Column("striae_lay")]
    public bool? IsStriae { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s instrument.
    /// </summary>
    [Column("instr_id")]
    public string? Instrument { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s instrument kind.
    /// </summary>
    [Column("instr_kind_id_cli")]
    public int? InstrumentKindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s instrument kind.
    /// </summary>
    public Codelist? InstrumentKind { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s instrument status.
    /// </summary>
    [Column("instr_status_id_cli")]
    public int? InstrumentStatusId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s instrument status.
    /// </summary>
    public Codelist? InstrumentStatus { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s instrument stratigraphy.
    /// </summary>
    [Column("instr_id_sty_fk")]
    public int? InstrumentCasingId { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s instrument stratigraphy.
    /// </summary>
    [Column("instr_id_lay_fk")]
    public int? InstrumentCasingLayerId { get; set; }

    /// <summary>
    /// Gets or sets the instrument <see cref="Stratigraphy"/> of the <see cref="Layer"/>.
    /// </summary>
    public Stratigraphy? InstrumentCasing { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s casing kind.
    /// </summary>
    [Column("casng_kind_id_cli")]
    public int? CasingKindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s casing kind.
    /// </summary>
    public Codelist? CasingKind { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s casing material.
    /// </summary>
    [Column("casng_material_id_cli")]
    public int? CasingMaterialId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s casing material.
    /// </summary>
    public Codelist? CasingMaterial { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s fill material.
    /// </summary>
    [Column("fill_material_id_cli")]
    public int? FillMaterialId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s fill material.
    /// </summary>
    public Codelist? FillMaterial { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s casing inner diameter.
    /// </summary>
    [Column("casng_inner_diameter_lay")]
    public double? CasingInnerDiameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s casing outer diameter.
    /// </summary>
    [Column("casng_outer_diameter_lay")]
    public double? CasingOuterDiameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s casing spud date.
    /// </summary>
    [Column("casng_date_spud_lay")]
    public DateOnly? CasingDateSpud { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s casing finish date.
    /// </summary>
    [Column("casng_date_finish_lay")]
    public DateOnly? CasingDateFinish { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s gradation.
    /// </summary>
    [Column("gradation_id_cli")]
    public int? GradationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s gradation.
    /// </summary>
    public Codelist? Gradation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s casing.
    /// </summary>
    [Column("casng_id")]
    public string? Casing { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s fill kind.
    /// </summary>
    [Column("fill_kind_id_cli")]
    public int? FillKindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s fill kind.
    /// </summary>
    public Codelist? FillKind { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s lithology top bedrock.
    /// </summary>
    [Column("lithology_top_bedrock_id_cli")]
    public int? LithologyTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s lithology top bedrock.
    /// </summary>
    public Codelist? LithologyTopBedrock { get; set; }

    [Column("original_lithology")]
    public string? OriginalLithology { get; set; }
}
