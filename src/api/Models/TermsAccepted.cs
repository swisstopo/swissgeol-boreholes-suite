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
    [Column("id_usr_fk")]
    public int UserId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>.
    /// </summary>
    public User? User { get; set; }

    /// <summary>
    /// Gets or sets the foreign key to the <see cref="Term"/> entity.
    /// </summary>
    [Column("id_tes_fk")]
    public int TermId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>.
    /// </summary>
    public Term? Term { get; set; }

    /// <summary>
    /// Gets or sets the timestamp from the moment the terms got accepted.
    /// </summary>
    [Column("accepted_tea")]
    public DateTime AcceptedAt { get; set; }
}
