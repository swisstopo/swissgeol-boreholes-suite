namespace BDMS.Models;

/// <summary>
/// Represents the editable properties of a <see cref="Profile"/>.
/// </summary>
public class ProfileUpdate
{
    /// <summary>
    /// Gets or sets the description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the profile is public.
    /// </summary>
    public bool? Public { get; set; }
}
