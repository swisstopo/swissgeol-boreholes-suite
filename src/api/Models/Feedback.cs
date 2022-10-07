using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a feedback entity in the database.
/// </summary>
[Table("feedbacks")]
public class Feedback
{
    /// <summary>
    /// Gets or sets the <see cref="Feedback"/>'s id.
    /// </summary>
    [Column("id_feb")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the User who created the <see cref="Feedback"/>.
    /// </summary>
    [Column("user_feb")]
    public string User { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Feedback"/>'s creation date.
    /// </summary>
    [Column("created_feb")]
    public DateTime? Created { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Feedback"/>'s message.
    /// </summary>
    [Column("message_feb")]
    public string? Message { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Feedback"/>'s tag.
    /// </summary>
    [Column("tag_feb")]
    public string? Tag { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Feedback"/> is Frw.
    /// </summary>
    [Column("frw_feb")]
    public bool? IsFrw { get; set; }
}
