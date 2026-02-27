namespace BDMS.Maintenance;

/// <summary>
/// Represents the current state of a maintenance task.
/// </summary>
public class MaintenanceTaskState
{
    /// <summary>
    /// Gets or sets the type of maintenance task.
    /// </summary>
    public MaintenanceTaskType Type { get; set; }

    /// <summary>
    /// Gets or sets the current status of the task.
    /// </summary>
    public MaintenanceTaskStatus Status { get; set; } = MaintenanceTaskStatus.Idle;

    /// <summary>
    /// Gets or sets the number of records affected by the task.
    /// </summary>
    public int? AffectedCount { get; set; }

    /// <summary>
    /// Gets or sets the error message if the task failed.
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Gets or sets when the task started.
    /// </summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>
    /// Gets or sets when the task completed.
    /// </summary>
    public DateTime? CompletedAt { get; set; }
}
