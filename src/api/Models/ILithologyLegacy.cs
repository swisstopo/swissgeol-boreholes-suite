namespace BDMS.Models;

/// <summary>
/// A lithology inside a <see cref="Models.StratigraphyV2"/> with defined depth. This is a legacy interface for existing chronostratigraphy and lithostratigraphy. After they have been migrated they should use <see cref="Models.ILithology"/>.
/// </summary>
public interface ILithologyLegacy
{
    /// <summary>
    /// Gets or sets foreign key for the <see cref="Models.StratigraphyV2"/> of this <see cref="ILithology"/>.
    /// </summary>
    public int StratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Models.StratigraphyV2"/> of this <see cref="ILithology"/>.
    /// </summary>
    public StratigraphyV2? Stratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="ILithology"/>'s upper depth.
    /// </summary>
    public double? FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="ILithology"/>'s lower depth.
    /// </summary>
    public double? ToDepth { get; set; }
}
