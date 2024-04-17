using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> attached to a <see cref="Models.Borehole"/> to store multiple borehole ids.
/// </summary>
[Table("borehole_identifiers_codelist")]
public class BoreholeCodelist
{
    [Column("borehole_id")]
    public int BoreholeId { get; set; }
    public Borehole Borehole { get; set; }

    [Column("identifier_id")]
    public int CodelistId { get; set; }
    public Codelist Codelist { get; set; }

    [Column("identifier_value")]
    public string Value { get; set; }
}
