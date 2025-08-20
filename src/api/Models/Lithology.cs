using BDMS.Json;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a lithology entity in the database.
/// </summary>
[Table("lithology")]
public class Lithology : ILithology, IChangeTracking, IIdentifyable
{
    /*
     * Base properties
     */

    /// <inheritdoc />
    [Column("id")]
    public int Id { get; set; }

    /// <inheritdoc />
    [Column("stratigraphy_id")]
    public int StratigraphyId { get; set; }

    /// <inheritdoc />
    public StratigraphyV2? Stratigraphy { get; set; }

    /// <inheritdoc />
    [Column("creator")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <inheritdoc />
    [Column("creation")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
    [Column("updater")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <inheritdoc />
    [Column("update")]
    public DateTime? Updated { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_from")]
    public double FromDepth { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_to")]
    public double ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s lithological description.
    /// </summary>
    [Column("description")]
    public int? DescriptionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s lithological description.
    /// </summary>
    public LithologicalDescription? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Lithology"/> is unconsolidated or consolidated.
    /// </summary>
    [Column("unconsolidated")]
    public bool IsUnconsolidated { get; set; } = true;

    /// <summary>
    /// Gets or sets whether the <see cref="Lithology"/> has bedding.
    /// </summary>
    [Column("bedding")]
    public bool HasBedding { get; set; } = false;

    /// <summary>
    /// Gets or sets the share of the bedding.
    /// </summary>
    [Column("bedding_share")]
    public int? Share { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s primary color.
    /// </summary>
    [IncludeInExport]
    [Column("color_primary_id")]
    public int? ColorPrimaryId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s primary color.
    /// </summary>
    public Codelist? ColorPrimary { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s secondary color.
    /// </summary>
    [IncludeInExport]
    [Column("color_secondary_id")]
    public int? ColorSecondaryId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s secondary color.
    /// </summary>
    public Codelist? ColorSecondary { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s alteration degree.
    /// </summary>
    [IncludeInExport]
    [Column("alteration_degree_id")]
    public int? AlterationDegreeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s alteration degree.
    /// </summary>
    public Codelist? AlterationDegree { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s notes.
    /// </summary>
    [IncludeInExport]
    [Column("notes")]
    public string? Notes { get; set; }

    /*
     * Unconsolidated properties
     */

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s main fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_main_id")]
    public int? LithologyUnconMainId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s main fraction.
    /// </summary>
    public Codelist? LithologyUnconMain { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s second fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_2_id")]
    public int? LithologyUncon2Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s second fraction.
    /// </summary>
    public Codelist? LithologyUncon2 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s third fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_3_id")]
    public int? LithologyUncon3Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s third fraction.
    /// </summary>
    public Codelist? LithologyUncon3 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s fourth fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_4_id")]
    public int? LithologyUncon4Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s fourth fraction.
    /// </summary>
    public Codelist? LithologyUncon4 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s fift fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_5_id")]
    public int? LithologyUncon5Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s fift fraction.
    /// </summary>
    public Codelist? LithologyUncon5 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s fourth fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_6_id")]
    public int? LithologyUncon6Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s sixt fraction.
    /// </summary>
    public Codelist? LithologyUncon6 { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyOrganicComponentCodes"/> join table entities.
    /// </summary>
    public IList<LithologyOrganicComponentCodes>? LithologyOrganicComponentCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'organic_components' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? OrganicComponentCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'organic_components' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? OrganicComponentCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDebrisCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDebrisCodes>? LithologyDebrisCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'debris' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? DebrisCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'debris' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? DebrisCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyGrainShapeCodes"/> join table entities.
    /// </summary>
    public IList<LithologyGrainShapeCodes>? LithologyGrainShapeCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'grain_shape' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? GrainShapeCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'grain_shape' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? GrainShapeCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyGrainAngularityCodes"/> join table entities.
    /// </summary>
    public IList<LithologyGrainAngularityCodes>? LithologyGrainAngularityCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'grain_angularity' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? GrainAngularityCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'grain_angularity' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? GrainAngularityCodelists { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Lithology"/> has striae.
    /// </summary>
    [IncludeInExport]
    [Column("striae")]
    public bool HasStriae { get; set; } = false;

    /// <summary>
    /// Gets or sets the <see cref="LithologyUnconCoarseCodes"/> join table entities.
    /// </summary>
    public IList<LithologyUnconCoarseCodes>? LithologyUnconCoarseCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'lithology_con' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? LithologyUnconCoarseCodeCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'lithology_con' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? LithologyUnconCoarseCodeCodelists { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s compactness.
    /// </summary>
    [IncludeInExport]
    [Column("compactness_id")]
    public int? CompactnessId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s compactness.
    /// </summary>
    public Codelist? Compactness { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s cohesion.
    /// </summary>
    [IncludeInExport]
    [Column("cohesion_id")]
    public int? CohesionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s cohesion.
    /// </summary>
    public Codelist? Cohesion { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s humidity.
    /// </summary>
    [IncludeInExport]
    [Column("humidity_id")]
    public int? HumidityId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s humidity.
    /// </summary>
    public Codelist? Humidity { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s consistency.
    /// </summary>
    [IncludeInExport]
    [Column("consistency_id")]
    public int? ConsistencyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s consistency.
    /// </summary>
    public Codelist? Consistency { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s plasticity.
    /// </summary>
    [IncludeInExport]
    [Column("plasticity_id")]
    public int? PlasticityId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s plasticity.
    /// </summary>
    public Codelist? Plasticity { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyUscsTypeCodes"/> join table entities.
    /// </summary>
    public IList<LithologyUscsTypeCodes>? LithologyUscsTypeCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'uscs_type' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? UscsTypeCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'uscs_type' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? UscsTypeCodelist { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s uscs determination.
    /// </summary>
    [IncludeInExport]
    [Column("uscs_determination_id")]
    public int? UscsDeterminationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s uscs determination.
    /// </summary>
    public Codelist? UscsDetermination { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyRockConditionCodes"/> join table entities.
    /// </summary>
    public IList<LithologyRockConditionCodes>? LithologyRockConditionCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'rock_condition' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? RockConditionCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'rock_condition' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? RockConditionCodelist { get; set; }

    /*
     * Consolidated properties
     */

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s lithology.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_con_id")]
    public int? LithologyConId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s lithology.
    /// </summary>
    public Codelist? LithologyCon { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyComponentConParticleCodes"/> join table entities.
    /// </summary>
    public IList<LithologyComponentConParticleCodes>? LithologyComponentConParticleCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'component_con_particle' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? ComponentConParticleCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'component_con_particle' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? ComponentConParticleCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyComponentConMineralCodes"/> join table entities.
    /// </summary>
    public IList<LithologyComponentConMineralCodes>? LithologyComponentConMineralCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'component_con_mineral' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? ComponentConMineralCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'component_con_mineral' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? ComponentConMineralCodelists { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s grain size.
    /// </summary>
    [IncludeInExport]
    [Column("grain_size_id")]
    public int? GrainSizeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s grain size.
    /// </summary>
    public Codelist? GrainSize { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s grain angularity.
    /// </summary>
    [IncludeInExport]
    [Column("grain_angularitye_id")]
    public int? GrainAngularityId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s grain angularity.
    /// </summary>
    public Codelist? GrainAngularity { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s gradation.
    /// </summary>
    [IncludeInExport]
    [Column("gradation_id")]
    public int? GradationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s gradation.
    /// </summary>
    public Codelist? Gradation { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Lithology"/>'s cementation.
    /// </summary>
    [IncludeInExport]
    [Column("cementation_id")]
    public int? CementationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Lithology"/>'s cementation.
    /// </summary>
    public Codelist? Cementation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyStructureSynGenCodes"/> join table entities.
    /// </summary>
    public IList<LithologyStructureSynGenCodes>? LithologyStructureSynGenCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'strucutre_syn_gen' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? StructureSynGenCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'strucutre_syn_gen' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? StructureSynGenCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyStructurePostGenCodes"/> join table entities.
    /// </summary>
    public IList<LithologyStructurePostGenCodes>? LithologyStructurePostGenCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'strucutre_post_gen' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? StructurePostGenCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'strucutre_post_gen' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? StructurePostGenCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyTextureMetaCodes"/> join table entities.
    /// </summary>
    public IList<LithologyTextureMetaCodes>? LithologyTextureMetaCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'texture_meta' of the <see cref="Lithology"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? TextureMetaCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'texture_meta' used by the <see cref="Lithology"/>.
    /// </summary>
    public ICollection<Codelist>? TextureMetaCodelists { get; set; }
}
