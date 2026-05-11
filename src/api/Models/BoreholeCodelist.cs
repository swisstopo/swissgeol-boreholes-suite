using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> attached to a <see cref="Models.Borehole"/> to store multiple borehole ids.
/// </summary>
[Table("borehole_identifiers_codelist")]
public class BoreholeCodelist : IIdentifyable
{
    [Column("id")]
    [Required]
    public int Id { get; set; }

    [Column("borehole_id")]
    [Required]
    public int BoreholeId { get; set; }

    [JsonIgnore]
    public Borehole? Borehole { get; set; }

    [IncludeInExport]
    [Column("identifier_id")]
    [Required]
    public int CodelistId { get; set; }

    [JsonIgnore]
    public Codelist? Codelist { get; set; }

    [IncludeInExport]
    [Column("identifier_value")]
    public string Value { get; set; }

    [IncludeInExport]
    [Column("comment")]
    public string? Comment { get; set; }
}
