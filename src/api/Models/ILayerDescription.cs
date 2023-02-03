namespace BDMS.Models;

/// <summary>
/// A Layer inside a <see cref="Models.Stratigraphy"/> with defined depth.
/// </summary>
public interface ILayerDescription
{
    /// <summary>
    /// Gets or sets foreign key for the <see cref="Models.Stratigraphy"/> of this <see cref="ILayerDescription"/>.
    /// </summary>
    public int StratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Models.Stratigraphy"/> of this <see cref="ILayerDescription"/>.
    /// </summary>
    public Stratigraphy? Stratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="ILayerDescription"/>'s upper depth.
    /// </summary>
    public double? FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="ILayerDescription"/>'s lower depth.
    /// </summary>
    public double? ToDepth { get; set; }

    /// <summary>
    /// Gets or sets whether this <see cref="ILayerDescription"/> is the last, deepest description.
    /// </summary>
    public bool? IsLast { get; set; }
}
