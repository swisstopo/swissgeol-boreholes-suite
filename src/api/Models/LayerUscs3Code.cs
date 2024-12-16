using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'uscs3' attached to a <see cref="Models.Layer"/>.
/// </summary>
[Table("layer_uscs3_codelist")]
public class LayerUscs3Code : ILayerCode
{
    /// <inheritdoc/>
    [Column("layer_id")]
    public int LayerId { get; set; }

    /// <inheritdoc/>
    public Layer? Layer { get; set; }

    /// <inheritdoc/>
    [Column("uscs3_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
