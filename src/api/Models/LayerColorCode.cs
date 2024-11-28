using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'color' attached to a <see cref="Models.Layer"/>.
/// </summary>
[Table("layer_color_codelist")]
public class LayerColorCode : ILayerCode
{
    /// <inheritdoc/>
    [Column("layer_id")]
    public int LayerId { get; set; }

    /// <inheritdoc/>
    [JsonIgnore]
    public Layer Layer { get; set; }

    /// <inheritdoc/>
    [Column("color_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    [JsonIgnore]
    public Codelist Codelist { get; set; }
}
