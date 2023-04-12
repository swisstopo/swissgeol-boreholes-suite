namespace BDMS.Models;

/// <summary>
/// Represents a borehole from the csv import.
/// </summary>
public class BoreholeImport : Borehole
{
    /// <summary>
    /// Gets or sets the <see cref="BoreholeImport"/>'s X-location using LV95 or LV03 coordinates.
    /// </summary>
#pragma warning disable CA1707 // Identifiers should not contain underscores
    public double? Location_x { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoreholeImport"/>'s Y-location using LV95 or LV03 coordinates.
    /// </summary>
    public double? Location_y { get; set; }
#pragma warning restore CA1707 // Identifiers should not contain underscores
}
