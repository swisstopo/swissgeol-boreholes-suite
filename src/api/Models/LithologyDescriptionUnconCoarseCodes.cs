using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'lithology_con' attached to a <see cref="Models.LithologyDescription"/>.
/// </summary>
[Table("lithology_description_uncon_coarse_codelist")]
public class LithologyDescriptionUnconCoarseCodes : ILithologyDescriptionCode
{
    /// <inheritdoc/>
    [Column("lithology_description_id")]
    public int LithologyDescriptionId { get; set; }

    /// <inheritdoc/>
    public LithologyDescription? LithologyDescription { get; set; }

    /// <inheritdoc/>
    [Column("lithology_uncon_coarse_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
