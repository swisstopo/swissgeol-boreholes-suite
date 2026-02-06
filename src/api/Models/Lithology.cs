using BDMS.Json;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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
    [JsonRequired]
    [Column("id")]
    public int Id { get; set; }

    /// <inheritdoc />
    [JsonRequired]
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
    [JsonRequired]
    [Column("depth_from")]
    public double FromDepth { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [JsonRequired]
    [Column("depth_to")]
    public double ToDepth { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Lithology"/> is unconsolidated or consolidated.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("unconsolidated")]
    public bool IsUnconsolidated { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Lithology"/> has bedding.
    /// </summary>
    [IncludeInExport]
    [Column("bedding")]
    public bool HasBedding { get; set; } = false;

    /// <summary>
    /// Gets or sets the share of the bedding.
    /// </summary>
    [IncludeInExport]
    [Column("bedding_share")]
    public int? Share { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyDescription"/>  entities.
    /// </summary>
    [IncludeInExport]
    public ICollection<LithologyDescription>? LithologyDescriptions { get; set; }

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
    public ICollection<Codelist>? UscsTypeCodelists { get; set; }

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
    public ICollection<Codelist>? RockConditionCodelists { get; set; }

    /*
     * Consolidated properties
     */

    /// <summary>
    /// Gets or sets the <see cref="Models.LithologyTextureMetaCodes"/> join table entities.
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
