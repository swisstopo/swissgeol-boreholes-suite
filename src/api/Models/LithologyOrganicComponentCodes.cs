using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'component_uncon_organic' attached to a <see cref="Models.Lithology"/>.
/// </summary>
[Table("lithology_organic_component_codelist")]
public class LithologyOrganicComponentCodes : ILithologyCode
{
    /// <inheritdoc/>
    [Column("lithology_id")]
    public int LithologyId { get; set; }

    /// <inheritdoc/>
    public Lithology? Lithology { get; set; }

    /// <inheritdoc/>
    [Column("organic_components_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
