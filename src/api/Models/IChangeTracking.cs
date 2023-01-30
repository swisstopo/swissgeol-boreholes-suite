namespace BDMS.Models;

/// <summary>
/// Defines properties to track changes on an entity.
/// </summary>
public interface IChangeTracking
{
    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who created the entity.
    /// </summary>
    public int? CreatedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who created the entity.
    /// </summary>
    public User? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the creation date.
    /// </summary>
    public DateTime? Created { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who updated the entity.
    /// </summary>
    public int? UpdatedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who updated the entity.
    /// </summary>
    public User? UpdatedBy { get; set; }

    /// <summary>
    /// Gets or sets the update date.
    /// </summary>
    public DateTime? Updated { get; set; }
}
