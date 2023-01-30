using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a term entity in the database.
/// </summary>
[Table("terms")]
public class Term : IIdentifyable
{
    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s id.
    /// </summary>
    [Column("id_tes")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets whetther the <see cref="Term"/> is a draft.
    /// </summary>
    [Column("draft_tes")]
    public bool IsDraft { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s english text.
    /// </summary>
    [Column("text_tes_en")]
    public string TextEn { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s german text.
    /// </summary>
    [Column("text_tes_de")]
    public string? TextDe { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s french text.
    /// </summary>
    [Column("text_tes_fr")]
    public string? TextFr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s italian text.
    /// </summary>
    [Column("text_tes_it")]
    public string? TextIt { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s romansch text.
    /// </summary>
    [Column("text_tes_ro")]
    public string? TextRo { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s creation date.
    /// </summary>
    [Column("creation_tes")]
    public DateTime Creation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s expiration date.
    /// </summary>
    [Column("expired_tes")]
    public DateTime? Expiration { get; set; }
}
