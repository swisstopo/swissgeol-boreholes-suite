using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'strucutre_syn_gen' attached to a <see cref="Models.Lithology"/>.
/// </summary>
[Table("lithology_strucutre_syn_gen_codelist")]
public class LithologyStructureSynGenCodes : ILithologyCode
{
    /// <inheritdoc/>
    [Column("lithology_id")]
    public int LithologyId { get; set; }

    /// <inheritdoc/>
    public Lithology? Lithology { get; set; }

    /// <inheritdoc/>
    [Column("lithology_strucutre_syn_gen_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
