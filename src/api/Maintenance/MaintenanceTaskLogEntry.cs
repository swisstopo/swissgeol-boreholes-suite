namespace BDMS.Maintenance;

/// <summary>
/// Serializable representation of a log entry for the API response.
/// </summary>
public class MaintenanceTaskLogEntry
{
    /// <summary>
    /// Gets or sets the type of maintenance task that was executed.
    /// </summary>
    public MaintenanceTaskType TaskType { get; set; }

    /// <summary>
    /// Gets or sets the final status of the task execution.
    /// </summary>
    public MaintenanceTaskStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the number of records affected by the task execution.
    /// </summary>
    public int? AffectedCount { get; set; }

    /// <summary>
    /// Gets or sets the error message if the task failed.
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Gets or sets the parameters used for this task execution, stored as JSON.
    /// </summary>
    public string? Parameters { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this was a dry-run execution.
    /// </summary>
    public bool IsDryRun { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether only missing values were processed.
    /// </summary>
    public bool OnlyMissing { get; set; }

    /// <summary>
    /// Gets or sets the display name of the user who started the task.
    /// </summary>
    public string? StartedByName { get; set; }

    /// <summary>
    /// Gets or sets when the task execution started.
    /// </summary>
    public DateTime StartedAt { get; set; }

    /// <summary>
    /// Gets or sets when the task execution completed.
    /// </summary>
    public DateTime CompletedAt { get; set; }
}
