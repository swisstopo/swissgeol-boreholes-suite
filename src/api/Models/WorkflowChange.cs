using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a status change of a <see cref="WorkflowV2"/>.
/// </summary>
[Table("workflow_change")]
public class WorkflowChange : IIdentifyable, IChangeTracking
{
    /// <inheritdoc />
    [Key]
    [Column("workflow_change_id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the comment for the change.
    /// </summary>
    [Column("comment")]
    public string Comment { get; set; }

    /// <summary>
    /// Gets or sets the status of the <see cref="WorkflowV2"/> before the change.
    /// </summary>
    [Column("from_status")]
    public WorkflowStatus FromStatus { get; set; }

    /// <summary>
    /// Gets or sets the status of the <see cref="WorkflowV2"/> after the change.
    /// </summary>
    [Column("to_status")]
    public WorkflowStatus ToStatus { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Workflow"/>.
    /// </summary>
    [Column("workflow_id")]
    public int WorkflowId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="WorkflowV2"/> of this <see cref="WorkflowChange"/>.
    /// </summary>
    public WorkflowV2 Workflow { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who created the entity.
    /// </summary>
    [Column("created_by_id")]
    public int? CreatedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who created the entity.
    /// </summary>
    public User? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the creation date.
    /// </summary>
    [Column("created_at")]
    public DateTime? Created { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who is assigned to the change.
    /// </summary>
    [Column("assignee_id")]
    public int? AssigneeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who is assigned to the change.
    /// </summary>
    public User? Assignee { get; set; }

    /// <summary>
    /// Not stored in database, <see cref="WorkflowChange"/> entries are read-only.
    /// </summary>
    [NotMapped]
    [JsonIgnore]
    int? IChangeTracking.UpdatedById { get; set; }

    /// <summary>
    /// Not stored in database, <see cref="WorkflowChange"/> entries are read-only.
    /// </summary>
    [NotMapped]
    [JsonIgnore]
    User? IChangeTracking.UpdatedBy { get; set; }

    /// <summary>
    /// Not stored in database, <see cref="WorkflowChange"/> entries are read-only.
    /// </summary>
    [NotMapped]
    [JsonIgnore]
    DateTime? IChangeTracking.Updated { get; set; }

    /// <summary>
    /// Gets the creation date (swissgeol ui core alias for Created).
    /// </summary>
    [NotMapped]
    public DateTime? CreatedAt => Created;

    /// <summary>
    /// Gets the user who created the entity (swissgeol ui core alias for CreatedBy).
    /// </summary>
    [NotMapped]
    public User? Creator => CreatedBy;

    /// <summary>
    /// Gets the <see cref="User"/> who is assigned to the change (swissgeol ui core alias for Assignee).
    /// </summary>
    [NotMapped]
    public User? ToAssignee => Assignee;
}
