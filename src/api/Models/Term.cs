using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a term entity in the database.
/// </summary>
[Table("terms")]
public class Term : IIdentifyable
{
    /// <inheritdoc />
    [Column("id")]
    [Required]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets whetther the <see cref="Term"/> is a draft.
    /// </summary>
    [Column("draft")]
    public bool IsDraft { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s english text.
    /// </summary>
    [Column("text_en")]
    public string TextEn { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s german text.
    /// </summary>
    [Column("text_de")]
    public string? TextDe { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s french text.
    /// </summary>
    [Column("text_fr")]
    public string? TextFr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s italian text.
    /// </summary>
    [Column("text_it")]
    public string? TextIt { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s romansch text.
    /// </summary>
    [Column("text_ro")]
    public string? TextRo { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s creation date.
    /// </summary>
    [Column("creation")]
    public DateTime Creation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Term"/>'s expiration date.
    /// </summary>
    [Column("expired")]
    public DateTime? Expiration { get; set; }
}
