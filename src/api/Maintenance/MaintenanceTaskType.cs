using System.Text.Json.Serialization;

namespace BDMS.Maintenance;

/// <summary>
/// Represents the type of a maintenance task.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MaintenanceTaskType
{
    /// <summary>
    /// Updates country, canton and municipality for boreholes using the swisstopo location API.
    /// </summary>
    LocationMigration,

    /// <summary>
    /// Recalculates LV03/LV95 coordinates for boreholes using the swisstopo coordinate API.
    /// </summary>
    CoordinateMigration,
}
