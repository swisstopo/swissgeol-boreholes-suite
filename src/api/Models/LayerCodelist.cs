using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a borehole entity in the database.
/// </summary>
[Table("layer_codelist")]
public class LayerCodelist
{
    [Column("id_lay_fk")]
    public int LayerId { get; set; }
    public Layer Layer { get; set; }

    [Column("id_cli_fk")]
    public int CodelistId { get; set; }
    public Codelist Codelist { get; set; }

    [Column("code_cli")]
    public string SchemaName { get; set; }
}
