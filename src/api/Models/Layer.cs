using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a layer entity in the database.
/// </summary>
[Table("layer")]
public class Layer : ILayerDescription, IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id_lay")]
    public int Id { get; set; }

    /// <inheritdoc />
    [Column("id_sty_fk")]
    public int StratigraphyId { get; set; }

    /// <inheritdoc />
    public Stratigraphy? Stratigraphy { get; set; }

    /// <inheritdoc />
    [Column("creator_lay")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <inheritdoc />
    [Column("creation_lay")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
    [Column("updater_lay")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <inheritdoc />
    [Column("update_lay")]
    public DateTime? Updated { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Layer"/> is undefined.
    /// </summary>
    [Column("undefined_lay")]
    public bool? IsUndefined { get; set; }

    /// <inheritdoc />
    [Column("depth_from_lay")]
    public double? FromDepth { get; set; }

    /// <inheritdoc />
    [Column("depth_to_lay")]
    public double? ToDepth { get; set; }

    /// <summary>
    /// Gets or sets whether this <see cref="Layer"/> is the last.
    /// </summary>
    [Column("last_lay")]
    public bool? IsLast { get; set; }

    /// <summary>
    /// Gets or sets the id of the quality of the <see cref="Layer"/>'s description.
    /// </summary>
    [Column("qt_description_id_cli")]
    public int? DescriptionQualityId { get; set; }

    /// <summary>
    /// Gets or sets the quality of the <see cref="Layer"/>'s description.
    /// </summary>
    public Codelist? DescriptionQuality { get; set; }

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
    /// Gets or sets the id of the <see cref="Layer"/>'s uscs type id 1.
    /// </summary>
    [Column("uscs_1_id_cli")]
    public int? Uscs1Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s uscs type 1.
    /// </summary>
    public Codelist? Uscs1 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s uscs type id 2.
    /// </summary>
    [Column("uscs_2_id_cli")]
    public int? Uscs2Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s uscs type 2.
    /// </summary>
    public Codelist? Uscs2 { get; set; }

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
    /// Gets or sets the id of the <see cref="Layer"/>'s gradation.
    /// </summary>
    [Column("gradation_id_cli")]
    public int? GradationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s gradation.
    /// </summary>
    public Codelist? Gradation { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Layer"/>'s lithology top bedrock.
    /// </summary>
    [Column("lithology_top_bedrock_id_cli")]
    public int? LithologyTopBedrockId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Layer"/>'s lithology top bedrock.
    /// </summary>
    public Codelist? LithologyTopBedrock { get; set; }

    /// <summary>
    /// Gets or sets the original lithology of the <see cref="Layer"/>.
    /// </summary>
    [Column("original_lithology")]
    public string? OriginalLithology { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LayerColorCode"/> join table entities.
    /// </summary>
    public IList<LayerColorCode>? LayerColorCodes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LayerDebrisCode"/> join table entities.
    /// </summary>
    public IList<LayerDebrisCode>? LayerDebrisCodes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LayerGrainShapeCode"/> join table entities.
    /// </summary>
    public IList<LayerGrainShapeCode>? LayerGrainShapeCodes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LayerGrainAngularityCode"/> join table entities.
    /// </summary>
    public IList<LayerGrainAngularityCode>? LayerGrainAngularityCodes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LayerOrganicComponentCode"/> join table entities.
    /// </summary>
    public IList<LayerOrganicComponentCode>? LayerOrganicComponentCodes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LayerUscs3Code"/> join table entities.
    /// </summary>
    public IList<LayerUscs3Code>? LayerUscs3Codes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'colour' of the <see cref="Layer"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    public ICollection<int>? ColorCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'colour' used by the <see cref="Layer"/>.
    /// </summary>
    public ICollection<Codelist>? ColorCodelists { get; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'debris' of the <see cref="Layer"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    public ICollection<int>? DebrisCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'debris' used by the <see cref="Layer"/>.
    /// </summary>
    public ICollection<Codelist>? DebrisCodelists { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'grain_shape' of the <see cref="Layer"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    public ICollection<int>? GrainShapeCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'grain_shape' used by the <see cref="Layer"/>.
    /// </summary>
    public ICollection<Codelist>? GrainShapeCodelists { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'grain_angularity' of the <see cref="Layer"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    public ICollection<int>? GrainAngularityCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'grain_angularity' used by the <see cref="Layer"/>.
    /// </summary>
    public ICollection<Codelist>? GrainAngularityCodelists { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'organic_components' of the <see cref="Layer"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    public ICollection<int>? OrganicComponentCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'organic_components' used by the <see cref="Layer"/>.
    /// </summary>
    public ICollection<Codelist>? OrganicComponentCodelists { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'uscs3' of the <see cref="Layer"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    public ICollection<int>? Uscs3CodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'uscs3' used by the <see cref="Layer"/>.
    /// </summary>
    public ICollection<Codelist>? Uscs3Codelists { get; set; }
}
