using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> attached to a <see cref="Models.Hydrotest"/>.
/// </summary>
[Table("hydrotest_codelist")]
public class HydrotestCodelist
{
    [Column("id_ht_fk")]
    [Required]
    public int HydrotestId { get; set; }

    public Hydrotest Hydrotest { get; set; }

    [Column("id_cli_fk")]
    [Required]
    public int CodelistId { get; set; }

    public Codelist Codelist { get; set; }
}
