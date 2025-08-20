using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'texture_meta' attached to a <see cref="Models.Lithology"/>.
/// </summary>
[Table("lithology_texture_meta_codelist")]
public class LithologyTextureMetaCodes : ILithologyCode
{
    /// <inheritdoc/>
    [Column("lithology_id")]
    public int LithologyId { get; set; }

    /// <inheritdoc/>
    public Lithology? Lithology { get; set; }

    /// <inheritdoc/>
    [Column("lithology_texture_meta_id")]
    public int CodelistId { get; set; }

    /// <inheritdoc/>
    public Codelist? Codelist { get; set; }
}
