using BDMS.Maintenance;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a persistent log entry for a maintenance task execution.
/// </summary>
[Table("maintenance_task_log")]
public class MaintenanceTaskLog : IIdentifyable
{
    /// <inheritdoc />
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the type of maintenance task that was executed.
    /// </summary>
    [Column("task_type")]
    public MaintenanceTaskType TaskType { get; set; }

    /// <summary>
    /// Gets or sets the final status of the task execution.
    /// </summary>
    [Column("status")]
    public MaintenanceTaskStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the number of records affected by the task execution.
    /// Set on success, null on failure.
    /// </summary>
    [Column("affected_count")]
    public int? AffectedCount { get; set; }

    /// <summary>
    /// Gets or sets the error message from the task execution.
    /// Set on failure, null on success.
    /// </summary>
    [Column("message")]
    public string? Message { get; set; }

    /// <summary>
    /// Gets or sets the parameters used for this task execution, stored as JSON.
    /// </summary>
    [Column("parameters", TypeName = "jsonb")]
    public string? Parameters { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this was a dry-run execution.
    /// </summary>
    [Column("is_dry_run")]
    public bool IsDryRun { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether only missing values were processed.
    /// </summary>
    [Column("only_missing")]
    public bool OnlyMissing { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who started the task.
    /// </summary>
    [Column("started_by_id")]
    public int? StartedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who started the task.
    /// </summary>
    public User? StartedBy { get; set; }

    /// <summary>
    /// Gets or sets when the task execution started.
    /// </summary>
    [Column("started_at")]
    public DateTime StartedAt { get; set; }

    /// <summary>
    /// Gets or sets when the task execution completed (success or failure).
    /// </summary>
    [Column("completed_at")]
    public DateTime CompletedAt { get; set; }
}
