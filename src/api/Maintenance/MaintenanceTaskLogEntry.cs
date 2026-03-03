namespace BDMS.Maintenance;

/// <summary>
/// Serializable representation of a log entry for the API response.
/// </summary>
public sealed record MaintenanceTaskLogEntry
{
    /// <summary>
    /// Gets the type of maintenance task that was executed.
    /// </summary>
    public MaintenanceTaskType TaskType { get; init; }

    /// <summary>
    /// Gets the final status of the task execution.
    /// </summary>
    public MaintenanceTaskStatus Status { get; init; }

    /// <summary>
    /// Gets the number of records affected by the task execution.
    /// </summary>
    public int? AffectedCount { get; init; }

    /// <summary>
    /// Gets the error message if the task failed.
    /// </summary>
    public string? Message { get; init; }

    /// <summary>
    /// Gets the parameters used for this task execution, stored as JSON.
    /// </summary>
    public string? Parameters { get; init; }

    /// <summary>
    /// Gets a value indicating whether this was a dry-run execution.
    /// </summary>
    public bool IsDryRun { get; init; }

    /// <summary>
    /// Gets a value indicating whether only missing values were processed.
    /// </summary>
    public bool OnlyMissing { get; init; }

    /// <summary>
    /// Gets the display name of the user who started the task.
    /// </summary>
    public string? StartedByName { get; init; }

    /// <summary>
    /// Gets when the task execution started.
    /// </summary>
    public DateTime StartedAt { get; init; }

    /// <summary>
    /// Gets when the task execution completed.
    /// </summary>
    public DateTime CompletedAt { get; init; }
}
