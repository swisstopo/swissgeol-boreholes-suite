namespace BDMS.Models;

/// <summary>
/// Represents an observation type.
/// </summary>
public enum ObservationType
{
    None = 0,

    /// <summary>
    /// The observation type water ingress.
    /// </summary>
    WaterIngress = 1,

    /// <summary>
    /// The observation type groundwater level measurement.
    /// </summary>
    GroundwaterLevelMeasurement = 2,

    /// <summary>
    /// The observation type hydrotest.
    /// </summary>
    Hydrotest = 3,

    /// <summary>
    /// The observation type field measurement.
    /// </summary>
    FieldMeasurement = 4,
}
