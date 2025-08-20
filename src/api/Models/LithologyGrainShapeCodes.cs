using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'grain_shape' attached to a <see cref="Models.Lithology"/>.
/// </summary>
[Table("lithology_grain_shape_codelist")]
public class LithologyGrainShapeCodes : ILithologyCode
{
    /// <inheritdoc/>
    [Column("lithology_id")]
    public int LithologyId { get; set; }

    /// <inheritdoc/>
    public Lithology? Lithology { get; set; }

    /// <inheritdoc/>
    [Column("grain_shape_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
