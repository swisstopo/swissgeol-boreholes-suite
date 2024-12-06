using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'debris' attached to a <see cref="Models.Layer"/>.
/// </summary>
[Table("layer_debris_codelist")]
public class LayerDebrisCode : ILayerCode
{
    /// <inheritdoc/>
    [Column("layer_id")]
    public int LayerId { get; set; }

    /// <inheritdoc/>
    public Layer? Layer { get; set; }

    /// <inheritdoc/>
    [Column("debris_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
