using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a user entity in the database.
/// </summary>
[Table("users")]
public class User : IIdentifyable
{
    /// <inheritdoc />
    [Key]
    [Column("id_usr")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> name.
    /// </summary>
    [Column("username")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>s subject id provided by oidc.
    /// </summary>
    [Column("subject_id")]
    public string SubjectId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>s firstname.
    /// </summary>
    [Column("firstname")]
    public string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>s lastname.
    /// </summary>
    [Column("lastname")]
    public string LastName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>s email.
    /// </summary>
    [Column("email")]
    public string Email { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="User"/> has admin privileges.
    /// </summary>
    [Column("admin_usr")]
    public bool IsAdmin { get; set; }

    /// <summary>
    /// Gets the value whether the <see cref="User"/> is disabled or not.
    /// </summary>
    public bool IsDisabled => DisabledAt.HasValue;

    /// <summary>
    /// Gets or sets the timestamp from the moment a <see cref="User"/> got disabled.
    /// </summary>
    [Column("disabled_usr")]
    public DateTime? DisabledAt { get; set; }

    /// <summary>
    /// Gets or sets the timestamp from the moment a <see cref="User"/> got disabled.
    /// </summary>
    [Column("created_usr")]
    public DateTime? CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>s settings.
    /// </summary>
    [Column("settings_usr")]
    public string? Settings { get; set; }

    /// <summary>
    /// Gets the WorkgroupRoles.
    /// </summary>
    public ICollection<UserWorkgroupRole> WorkgroupRoles { get; } = new List<UserWorkgroupRole>();

    /// <summary>
    /// Gets the TermsAccepted.
    /// </summary>
    public ICollection<TermsAccepted> TermsAccepted { get; } = new List<TermsAccepted>();

    /// <summary>
    /// Gets or sets whether this user can be deleted.
    /// </summary>
    [NotMapped]
    public bool? Deletable { get; set; }

    /// <inheritdoc/>
    public override string ToString() => Name;
}
