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
    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s id.
    /// </summary>
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
    /// Gets or sets the <see cref="Codelist"/>'s english description.
    /// </summary>
    [Column("description_cli_en")]
    public string DescriptionEn { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s german text.
    /// </summary>
    [Column("text_cli_de")]
    public string? De { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s german description.
    /// </summary>
    [Column("description_cli_de")]
    public string? DescriptionDe { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/> 's french text.
    /// </summary>
    [Column("text_cli_fr")]
    public string? Fr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s french description.
    /// </summary>
    [Column("description_cli_fr")]
    public string? DescriptionFr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s italian text.
    /// </summary>
    [Column("text_cli_it")]
    public string? It { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s italian description.
    /// </summary>
    [Column("description_cli_it")]
    public string? DescriptionIt { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s romantsch text.
    /// </summary>
    [Column("text_cli_ro")]
    public string? Ro { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/>'s romantsch description.
    /// </summary>
    [Column("description_cli_ro")]
    public string? DescriptionRo { get; set; }

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
    /// Gets the <see cref="Layer"/>s that use this <see cref="Codelist"/>.
    /// </summary>
    [JsonIgnore]
    public ICollection<Layer>? Layers { get; }

    /// <summary>
    /// Gets the <see cref="LayerCodelist"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public ICollection<LayerCodelist>? LayerCodelists { get; }
}
