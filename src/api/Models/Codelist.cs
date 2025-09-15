using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a codelist entity in the database.
/// </summary>
[Table("codelist")]
public class Codelist : IIdentifyable
{
    /// <inheritdoc />
    [Key]
    [Column("id_cli")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s geolcode.
    /// </summary>
    [Column("geolcode")]
    public int? Geolcode { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s schema.
    /// </summary>
    [Column("schema_cli")]
    public string? Schema { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s code.
    /// </summary>
    [Column("code_cli")]
    public string Code { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s english text.
    /// </summary>
    [Column("text_cli_en")]
    public string En { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s german text.
    /// </summary>
    [Column("text_cli_de")]
    public string? De { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/> 's french text.
    /// </summary>
    [Column("text_cli_fr")]
    public string? Fr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s italian text.
    /// </summary>
    [Column("text_cli_it")]
    public string? It { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s romantsch text.
    /// </summary>
    [Column("text_cli_ro")]
    public string? Ro { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s order.
    /// </summary>
    [Column("order_cli")]
    public int? Order { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s configuration.
    /// </summary>
    [Column("conf_cli")]
    public string? Conf { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Codelist"/> is default.
    /// </summary>
    [Column("default_cli")]
    public bool? IsDefault { get; set; }

    /// <summary>
    /// Gets or sets the Path of this <see cref="Codelist"/> in a tree structure.
    /// </summary>
    [Column("path_cli")]
    public LTree? Path { get; set; }

    /// <summary>
    /// Gets the <see cref="Layer"/>s that use this <see cref="Codelist"/>.
    /// </summary>
    [JsonIgnore]
    public ICollection<Layer>? Layers { get; }

    /// <summary>
    /// Gets the <see cref="LayerColorCode"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LayerColorCode>? LayerColorCodes { get; }

    /// <summary>
    /// Gets the <see cref="LayerDebrisCode"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LayerDebrisCode>? LayerDebrisCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LayerGrainShapeCode"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LayerGrainShapeCode>? LayerGrainShapeCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LayerGrainAngularityCode"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LayerGrainAngularityCode>? LayerGrainAngularityCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LayerOrganicComponentCode"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LayerOrganicComponentCode>? LayerOrganicComponentCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LayerUscs3Code"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LayerUscs3Code>? LayerUscs3Codes { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>s that use this <see cref="Codelist"/>.
    /// </summary>
    [JsonIgnore]
    public ICollection<Borehole>? Boreholes { get; }

    /// <summary>
    /// Gets the <see cref="BoreholeCodelist"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<BoreholeCodelist>? BoreholeCodelists { get; }

    /// <summary>
    /// Gets the <see cref="Hydrotest"/>s that use this <see cref="Codelist"/>.
    /// </summary>
    [JsonIgnore]
    public ICollection<Hydrotest>? Hydrotests { get; }

    /// <summary>
    /// Gets the <see cref="HydrotestFlowDirectionCode"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<HydrotestFlowDirectionCode>? HydrotestFlowDirectionCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="HydrotestEvaluationMethodCode"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<HydrotestEvaluationMethodCode>? HydrotestEvaluationMethodCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="HydrotestKindCode"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<HydrotestKindCode>? HydrotestKindCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyDescriptionComponentConParticleCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyDescriptionComponentConParticleCodes>? LithologyDescriptionComponentConParticleCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyDescriptionComponentConMineralCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyDescriptionComponentConMineralCodes>? LithologyDescriptionComponentConMineralCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyDescriptionComponentUnconOrganicCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyDescriptionComponentUnconOrganicCodes>? LithologyDescriptionComponentUnconOrganicCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyDescriptionComponentUnconDebrisCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyDescriptionComponentUnconDebrisCodes>? LithologyDescriptionComponentUnconDebrisCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyDescriptionGrainShapeCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyDescriptionGrainShapeCodes>? LithologyDescriptionGrainShapeCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyDescriptionGrainAngularityCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyDescriptionGrainAngularityCodes>? LithologyDescriptionGrainAngularityCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyDescriptionLithologyUnconDebrisCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyDescriptionLithologyUnconDebrisCodes>? LithologyDescriptionLithologyUnconDebrisCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyDescriptionStructureSynGenCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyDescriptionStructureSynGenCodes>? LithologyDescriptionStructureSynGenCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyDescriptionStructurePostGenCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyDescriptionStructurePostGenCodes>? LithologyDescriptionStructurePostGenCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyRockConditionCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyRockConditionCodes>? LithologyRockConditionCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyUscsTypeCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyUscsTypeCodes>? LithologyUscsTypeCodes { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologyTextureMataCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LithologyTextureMataCodes>? LithologyTextureMataCodes { get; set; }
}
