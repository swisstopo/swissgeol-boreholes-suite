using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a content entity in the database.
/// </summary>
[Table("contents")]
public class Content : IIdentifyable
{
    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s id.
    /// </summary>
    [Key]
    [Column("id_cnt")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s name.
    /// </summary>
    [Column("name_cnt")]
    public string Name { get; set; } = null!;

    /// <summary>
    /// Gets or sets whether the <see cref="Content"/> is a draft.
    /// </summary>
    [Column("draft_cnt")]
    public bool? IsDraft { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s english title.
    /// </summary>
    [Column("title_cnt_en")]
    public string? TitleEn { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s english text.
    /// </summary>
    [Column("text_cnt_en")]
    public string? TextEn { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s german title.
    /// </summary>
    [Column("title_cnt_de")]
    public string? TitleDe { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s german text.
    /// </summary>
    [Column("text_cnt_de")]
    public string? TextDe { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s french title.
    /// </summary>
    [Column("title_cnt_fr")]
    public string? TitleFr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s french text.
    /// </summary>
    [Column("text_cnt_fr")]
    public string? TextFr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s italian title.
    /// </summary>
    [Column("title_cnt_it")]
    public string? TitleIt { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s italian text.
    /// </summary>
    [Column("text_cnt_it")]
    public string? TextIt { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s romansch title.
    /// </summary>
    [Column("title_cnt_ro")]
    public string? TitelRo { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s romansch text.
    /// </summary>
    [Column("text_cnt_ro")]
    public string? TextRo { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s creation date.
    /// </summary>
    [Column("creation_cnt")]
    public DateTime? Creation { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Content"/>'s expiration date.
    /// </summary>
    [Column("expired_cnt")]
    public DateTime? Expired { get; set; }
}
