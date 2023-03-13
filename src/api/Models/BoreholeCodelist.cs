using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> attached to a <see cref="Models.Borehole"/> to store multiple borehole ids.
/// </summary>
[Table("borehole_codelist")]
public class BoreholeCodelist
{
    [Column("id_bho_fk")]
    public int BoreholeId { get; set; }
    public Borehole Borehole { get; set; }

    [Column("id_cli_fk")]
    public int CodelistId { get; set; }
    public Codelist Codelist { get; set; }

    [Column("code_cli")]
    public string SchemaName { get; set; }

    [Column("value_bco")]
    public string Value { get; set; }
}
