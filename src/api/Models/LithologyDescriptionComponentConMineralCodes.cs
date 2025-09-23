using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'component_con_mineral' attached to a <see cref="Models.LithologyDescription"/>.
/// </summary>
[Table("lithology_description_component_con_mineral_codelist")]
public class LithologyDescriptionComponentConMineralCodes : ILithologyDescriptionCode
{
    /// <inheritdoc/>
    [Column("lithology_description_id")]
    public int LithologyDescriptionId { get; set; }

    /// <inheritdoc/>
    public LithologyDescription? LithologyDescription { get; set; }

    /// <inheritdoc/>
    [Column("component_con_mineral_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
