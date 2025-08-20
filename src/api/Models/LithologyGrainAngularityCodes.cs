using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'grain_angularity' attached to a <see cref="Models.Lithology"/>.
/// </summary>
[Table("lithology_grain_angularity_codelist")]
public class LithologyGrainAngularityCodes : ILithologyCode
{
    /// <inheritdoc/>
    [Column("lithology_id")]
    public int LithologyId { get; set; }

    /// <inheritdoc/>
    public Lithology? Lithology { get; set; }

    /// <inheritdoc/>
    [Column("grain_angularity_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
