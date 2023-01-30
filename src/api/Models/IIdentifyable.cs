namespace BDMS.Models;

/// <summary>
/// An object that can be identified by a numeric ID.
/// </summary>
public interface IIdentifyable
{
    /// <summary>
    /// Gets or sets the entity's id.
    /// </summary>
    public int Id { get; set; }
}
