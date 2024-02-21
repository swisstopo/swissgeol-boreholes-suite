using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'debris' attached to a <see cref="Models.Layer"/>.
/// </summary>
[Table("layer_debris_codelist")]
public class LayerDebrisCode : ILayerCode
{
    [Column("id_lay_fk")]
    public int LayerId { get; set; }
    public Layer Layer { get; set; }

    [Column("id_cli_fk")]
    public int CodelistId { get; set; }
    public Codelist Codelist { get; set; }
}
