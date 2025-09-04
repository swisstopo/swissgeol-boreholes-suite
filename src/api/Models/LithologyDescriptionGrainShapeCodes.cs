using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'grain_shape' attached to a <see cref="Models.LithologyDescription"/>.
/// </summary>
[Table("lithology_description_grain_shape_codelist")]
public class LithologyDescriptionGrainShapeCodes : ILithologyDescriptionCode
{
    /// <inheritdoc/>
    [Column("lithology_description_id")]
    public int LithologyDescriptionId { get; set; }

    /// <inheritdoc/>
    public LithologyDescription? LithologyDescription { get; set; }

    /// <inheritdoc/>
    [Column("grain_shape_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
