namespace BDMS.Models;

/// <summary>
/// The system that is used to describe borehole depths.
/// </summary>
public enum VerticalReferenceSystem
{
    /// <summary>
    /// The default value.
    /// </summary>
    Unknown = 0,

    /// <summary>
    /// Measured Depth.
    /// </summary>
    MD = 1,

    /// <summary>
    /// Meters above sea level.
    /// </summary>
    Masl = 2,
}
