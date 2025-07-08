using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Represents a request to apply a change to a borehole's workflow's tab status.
/// Either on the reviewed or published tab.
/// </summary>
public class WorkflowTabStatusChangeRequest
{
    /// <summary>
    /// Gets or sets the identifier of the borehole whose workflow is being updated.
    /// </summary>
    [Required]
    public required int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the tab for which the field status changes.
    /// </summary>
    [Required]
    public required WorkflowTabType Tab { get; set; }

    /// <summary>
    /// Gets or sets the map of field names (string) to their new status values (bool). The provided field names must be a valid field type contained in <see cref="WorkflowStatusField"/>.
    /// </summary>
    [Required]
    public required Dictionary<string, bool> Changes { get; set; }
}
