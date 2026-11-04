using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'source_type' attached to a <see cref="Models.Borehole"/>.
/// </summary>
[Table("borehole_source_type_codelist")]
public class BoreholeSourceTypeCodes
{
    /// <summary>
    /// Gets or sets the ID of the <see cref="Borehole"/> in the join table.
    /// </summary>
    [Column("borehole_id")]
    [Required]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/> in the join table.
    /// </summary>
    public Borehole Borehole { get; set; }

    /// <summary>
    /// Gets or sets the ID of the codelist in the join table.
    /// </summary>
    [Column("codelist_id")]
    [Required]
    public int CodelistId { get; set; }

    /// <summary>
    /// Gets or sets the codelist in the join table.
    /// </summary>
    public Codelist Codelist { get; set; }
}
