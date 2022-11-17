namespace BDMS.Models;

/// <summary>
/// Represents a reference system.
/// </summary>
public enum ReferenceSystem
{
    /// <summary>
    /// The default value.
    /// </summary>
    None = 0,

    /// <summary>
    /// CH1903+ LV 95 (EPSG:2056).
    /// </summary>
    LV95 = 20104001,

    /// <summary>
    /// CH1903 LV 03 (EPSG:21781).
    /// </summary>
    LV03 = 20104002,
}
