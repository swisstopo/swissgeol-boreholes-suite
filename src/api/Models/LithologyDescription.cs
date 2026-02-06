using BDMS.Json;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a description section of a lithology entity in the database.
/// </summary>
[Table("lithology_description")]
public class LithologyDescription : IChangeTracking, IIdentifyable
{
    /*
     * Base properties
     */

    /// <inheritdoc />
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s lithology.
    /// </summary>
    [Column("lithology_id")]
    public int LithologyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s lithology.
    /// </summary>
    public Lithology? Lithology { get; set; }

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

    /// <summary>
    /// Gets or sets whether the <see cref="LithologyDescription"/> is the first of maximum two.
    /// </summary>
    [IncludeInExport]
    [Column("first")]
    public bool IsFirst { get; set; } = true;

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s primary color.
    /// </summary>
    [IncludeInExport]
    [Column("color_primary_id")]
    public int? ColorPrimaryId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s primary color.
    /// </summary>
    public Codelist? ColorPrimary { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s secondary color.
    /// </summary>
    [IncludeInExport]
    [Column("color_secondary_id")]
    public int? ColorSecondaryId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s secondary color.
    /// </summary>
    public Codelist? ColorSecondary { get; set; }

    /*
     * Unconsolidated properties
     */

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s main fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_main_id")]
    public int? LithologyUnconMainId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s main fraction.
    /// </summary>
    public Codelist? LithologyUnconMain { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s second fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_2_id")]
    public int? LithologyUncon2Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s second fraction.
    /// </summary>
    public Codelist? LithologyUncon2 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s third fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_3_id")]
    public int? LithologyUncon3Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s third fraction.
    /// </summary>
    public Codelist? LithologyUncon3 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s fourth fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_4_id")]
    public int? LithologyUncon4Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s fourth fraction.
    /// </summary>
    public Codelist? LithologyUncon4 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s fift fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_5_id")]
    public int? LithologyUncon5Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s fift fraction.
    /// </summary>
    public Codelist? LithologyUncon5 { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s fourth fraction.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_uncon_6_id")]
    public int? LithologyUncon6Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s sixt fraction.
    /// </summary>
    public Codelist? LithologyUncon6 { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescriptionComponentUnconOrganicCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDescriptionComponentUnconOrganicCodes>? LithologyDescriptionComponentUnconOrganicCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'organic_components' of the <see cref="LithologyDescription"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? ComponentUnconOrganicCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'organic_components' used by the <see cref="LithologyDescription"/>.
    /// </summary>
    public ICollection<Codelist>? ComponentUnconOrganicCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescriptionComponentUnconDebrisCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDescriptionComponentUnconDebrisCodes>? LithologyDescriptionComponentUnconDebrisCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'debris' of the <see cref="LithologyDescription"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? ComponentUnconDebrisCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'debris' used by the <see cref="LithologyDescription"/>.
    /// </summary>
    public ICollection<Codelist>? ComponentUnconDebrisCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescriptionGrainShapeCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDescriptionGrainShapeCodes>? LithologyDescriptionGrainShapeCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'grain_shape' of the <see cref="LithologyDescription"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? GrainShapeCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'grain_shape' used by the <see cref="LithologyDescription"/>.
    /// </summary>
    public ICollection<Codelist>? GrainShapeCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescriptionGrainAngularityCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDescriptionGrainAngularityCodes>? LithologyDescriptionGrainAngularityCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'grain_angularity' of the <see cref="LithologyDescription"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? GrainAngularityCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'grain_angularity' used by the <see cref="LithologyDescription"/>.
    /// </summary>
    public ICollection<Codelist>? GrainAngularityCodelists { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="LithologyDescription"/> has striae.
    /// </summary>
    [IncludeInExport]
    [Column("striae")]
    public bool HasStriae { get; set; } = false;

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescriptionLithologyUnconDebrisCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDescriptionLithologyUnconDebrisCodes>? LithologyDescriptionLithologyUnconDebrisCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'lithology_con' of the <see cref="LithologyDescription"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? LithologyUnconDebrisCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'lithology_con' used by the <see cref="LithologyDescription"/>.
    /// </summary>
    public ICollection<Codelist>? LithologyUnconDebrisCodelists { get; set; }

    /*
     * Consolidated properties
     */

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s consolidated lithology.
    /// </summary>
    [IncludeInExport]
    [Column("lithology_con_id")]
    public int? LithologyConId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s consolidated lithology.
    /// </summary>
    public Codelist? LithologyCon { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescriptionComponentConParticleCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDescriptionComponentConParticleCodes>? LithologyDescriptionComponentConParticleCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'component_con_particle' of the <see cref="LithologyDescription"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? ComponentConParticleCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'component_con_particle' used by the <see cref="LithologyDescription"/>.
    /// </summary>
    public ICollection<Codelist>? ComponentConParticleCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescriptionComponentConMineralCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDescriptionComponentConMineralCodes>? LithologyDescriptionComponentConMineralCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'component_con_mineral' of the <see cref="LithologyDescription"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? ComponentConMineralCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'component_con_mineral' used by the <see cref="LithologyDescription"/>.
    /// </summary>
    public ICollection<Codelist>? ComponentConMineralCodelists { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s grain size.
    /// </summary>
    [IncludeInExport]
    [Column("grain_size_id")]
    public int? GrainSizeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s grain size.
    /// </summary>
    public Codelist? GrainSize { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s grain angularity.
    /// </summary>
    [IncludeInExport]
    [Column("grain_angularity_id")]
    public int? GrainAngularityId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s grain angularity.
    /// </summary>
    public Codelist? GrainAngularity { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s gradation.
    /// </summary>
    [IncludeInExport]
    [Column("gradation_id")]
    public int? GradationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s gradation.
    /// </summary>
    public Codelist? Gradation { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LithologyDescription"/>'s cementation.
    /// </summary>
    [IncludeInExport]
    [Column("cementation_id")]
    public int? CementationId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>'s cementation.
    /// </summary>
    public Codelist? Cementation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescriptionStructureSynGenCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDescriptionStructureSynGenCodes>? LithologyDescriptionStructureSynGenCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'structure_syn_gen' of the <see cref="LithologyDescription"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? StructureSynGenCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'structure_syn_gen' used by the <see cref="LithologyDescription"/>.
    /// </summary>
    public ICollection<Codelist>? StructureSynGenCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescriptionStructurePostGenCodes"/> join table entities.
    /// </summary>
    public IList<LithologyDescriptionStructurePostGenCodes>? LithologyDescriptionStructurePostGenCodes { get; set; }

    /// <summary>
    /// Gets or sets the code list ids with schema name 'structure_post_gen' of the <see cref="LithologyDescription"/>'s many to many code list relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? StructurePostGenCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'structure_post_gen' used by the <see cref="LithologyDescription"/>.
    /// </summary>
    public ICollection<Codelist>? StructurePostGenCodelists { get; set; }
}
