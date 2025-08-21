using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'strucutre_post_gen' attached to a <see cref="Models.LithologyDescription"/>.
/// </summary>
[Table("lithology_description_strucutre_post_gen_codelist")]
public class LithologyDescriptionStructurePostGenCodes : ILithologyDescriptionCode
{
    /// <inheritdoc/>
    [Column("lithology_description_id")]
    public int LithologyDescriptionId { get; set; }

    /// <inheritdoc/>
    public LithologyDescription? LithologyDescription { get; set; }

    /// <inheritdoc/>
    [Column("lithology_strucutre_post_gen_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
