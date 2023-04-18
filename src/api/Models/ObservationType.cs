namespace BDMS.Models;

/// <summary>
/// Represents an observation type.
/// </summary>
#pragma warning disable CA1008 // Enums should have zero value
public enum ObservationType
#pragma warning restore CA1008 // Enums should have zero value
{
    /// <summary>
    /// The observation type water ingress.
    /// </summary>
    WaterIngress = 1,

    /// <summary>
    /// The observation type groundwater level.
    /// </summary>
    GroundwaterLevel = 2,

    /// <summary>
    /// The observation type hydrotest.
    /// </summary>
    Hydrotest = 3,

    /// <summary>
    /// The observation type field measurement.
    /// </summary>
    FieldMeasurement = 4,
}
