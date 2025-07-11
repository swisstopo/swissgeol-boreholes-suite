using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Represents a request to apply a change to a borehole's workflow,
/// including updates to the status, assignee, and optional comments.
/// </summary>
public class WorkflowChangeRequest
{
    /// <summary>
    /// Gets or sets the identifier of the borehole whose workflow is being updated.
    /// </summary>
    [Required]
    public required int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the new workflow status to be applied to the borehole.
    /// If null, the status will remain unchanged.
    /// </summary>
    public WorkflowStatus? NewStatus { get; set; }

    /// <summary>
    /// Gets or sets an optional comment.
    /// </summary>
    public string? Comment { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the new user assigned to the workflow.
    /// </summary>
    public int? NewAssigneeId { get; set; }

    /// <summary>
    /// Gets or sets whether the workflow has requested changes.
    /// </summary>
    public bool? HasRequestedChanges { get; set; }
}
