using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'organic_components' attached to a <see cref="Models.Layer"/>.
/// </summary>
[Table("layer_organic_component_codelist")]
public class LayerOrganicComponentCode : ILayerCode
{
    /// <inheritdoc/>
    [Column("layer_id")]
    public int LayerId { get; set; }

    /// <inheritdoc/>
    public Layer? Layer { get; set; }

    /// <inheritdoc/>
    [Column("organic_components_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
