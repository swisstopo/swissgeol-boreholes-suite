using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a terms_accepted entity in the database.
/// </summary>
[Table("terms_accepted")]
public class TermsAccepted
{
    /// <summary>
    /// Gets or sets the foreign key to the <see cref="User"/> entity.
    /// </summary>
    [Column("user_id")]
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>.
    /// </summary>
    public User? User { get; set; }

    /// <summary>
    /// Gets or sets the foreign key to the <see cref="Term"/> entity.
    /// </summary>
    [Column("term_id")]
    [Required]
    public int TermId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>.
    /// </summary>
    public Term? Term { get; set; }

    /// <summary>
    /// Gets or sets the timestamp from the moment the terms got accepted.
    /// </summary>
    [Column("accepted")]
    public DateTime AcceptedAt { get; set; }
}
