namespace BDMS.Models;

/// <summary>
/// A lithology inside a <see cref="Models.Stratigraphy"/> with defined depth.
/// </summary>
public interface ILayerCode
{
    /// <summary>
    /// Gets or sets foreign key for the <see cref="Models.Stratigraphy"/> of this <see cref="ILayerCode"/>.
    /// </summary>
    public int StratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Models.Stratigraphy"/> of this <see cref="ILayerCode"/>.
    /// </summary>
    public Stratigraphy? Stratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="ILayerCode"/>'s upper depth.
    /// </summary>
    public double FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="ILayerCode"/>'s lower depth.
    /// </summary>
    public double ToDepth { get; set; }
}
