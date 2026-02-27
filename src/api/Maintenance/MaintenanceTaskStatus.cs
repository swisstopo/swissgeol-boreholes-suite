using System.Text.Json.Serialization;

namespace BDMS.Maintenance;

/// <summary>
/// Represents the status of a maintenance task.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MaintenanceTaskStatus
{
    /// <summary>
    /// The task is not running.
    /// </summary>
    Idle,

    /// <summary>
    /// The task is currently executing.
    /// </summary>
    Running,

    /// <summary>
    /// The task completed successfully.
    /// </summary>
    Completed,

    /// <summary>
    /// The task failed with an error.
    /// </summary>
    Failed,
}
