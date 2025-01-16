namespace BDMS.Models;

/// <summary>
/// An object that has a reference to a <see cref="Models.Casing"/>.
/// </summary>
public interface ICasingReference
{
    /// <summary>
    /// Gets or sets the ID of the casing in the join table.
    /// </summary>
    int? CasingId { get; set; }

    /// <summary>
    /// Gets or sets the casing in the join table.
    /// </summary>
    Casing? Casing { get; set; }
}
