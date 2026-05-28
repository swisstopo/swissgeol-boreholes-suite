using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a users_roles entity in the database.
/// </summary>
[Table("users_roles")]
public class UserWorkgroupRole
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
    /// Gets or sets the foreign key to the <see cref="Workgroup"/> entity.
    /// </summary>
    [Column("workgroup_id")]
    [Required]
    public int WorkgroupId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Workgroup"/>.
    /// </summary>
    public Workgroup? Workgroup { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Role"/>.
    /// </summary>
    [Column("role_id", TypeName = "int")]
    public Role Role { get; set; }

    /// <summary>
    /// Gets or sets whether the role is active or not.
    /// </summary>
    [NotMapped]
    public bool? IsActive { get; set; }

    /// <inheritdoc/>
    public override string ToString() => $"WorkgroupId: {WorkgroupId}, {Role}";
}
