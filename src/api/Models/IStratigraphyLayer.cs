namespace BDMS.Models;

/// <summary>
/// A layer inside a <see cref="Models.Stratigraphy"/> with defined depth.
/// </summary>
public interface IStratigraphyLayer
{
    /// <summary>
    /// Gets or sets foreign key for the <see cref="Models.Stratigraphy"/> of this <see cref="IStratigraphyLayer"/>.
    /// </summary>
    public int StratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Models.Stratigraphy"/> of this <see cref="IStratigraphyLayer"/>.
    /// </summary>
    public Stratigraphy? Stratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="IStratigraphyLayer"/>'s upper depth.
    /// </summary>
    public double FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="IStratigraphyLayer"/>'s lower depth.
    /// </summary>
    public double ToDepth { get; set; }
}
