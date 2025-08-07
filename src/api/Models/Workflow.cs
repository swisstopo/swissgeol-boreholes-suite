using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a workflow entity in the database.
/// </summary>
[Table("workflow")]
public class Workflow : IIdentifyable
{
    /// <inheritdoc />
    [Key]
    [Column("workflow_id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets if a reviewer has requested changes for the borehole.
    /// </summary>
    [Column("has_requested_changes")]
    public bool HasRequestedChanges { get; set; }

    /// <summary>
    /// Gets or sets the current workflow status of the borehole.
    /// </summary>
    [Column("status")]
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Draft;

    /// <summary>
    /// Gets or sets the id of the <see cref="Borehole"/>.
    /// </summary>
    [Column("borehole_id")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the borehole of this <see cref="Workflow"/>.
    /// </summary>
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="ReviewedTabs"/>.
    /// </summary>
    [Column("reviewed_tabs_id")]
    public int ReviewedTabsId { get; set; }

    /// <summary>
    /// Gets or sets the tabs that have been reviewed.
    /// </summary>
    public TabStatus ReviewedTabs { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="PublishedTabs"/>.
    /// </summary>
    [Column("published_tabs_id")]
    public int PublishedTabsId { get; set; }

    /// <summary>
    /// Gets or sets the tabs that have been published.
    /// </summary>
    public TabStatus PublishedTabs { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Assignee"/>.
    /// </summary>
    [Column("assignee_id")]
    public int? AssigneeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> that is currently assigned to this <see cref="Workflow"/>.
    /// </summary>
    public User? Assignee { get; set; }

    /// <summary>
    /// Get the <see cref="WorkflowChange"/>s associated with this <see cref="Workflow"/>.
    /// </summary>
    public ICollection<WorkflowChange> Changes { get; } = new List<WorkflowChange>();
}
