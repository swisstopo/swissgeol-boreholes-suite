using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Represents a request to apply a change to a borehole's workflow's tab status.
/// Either on the reviewed or published tab.
/// </summary>
public class TabStatusChangeRequest
{
    /// <summary>
    /// Gets or sets the identifier of the borehole whose workflow is being updated.
    /// </summary>
    [Required]
    public required int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the tab for which the field status changes.
    /// </summary>
    public TabType Tab { get; set; }

    /// <summary>
    /// Gets or sets the field for which the status changes.
    /// </summary>
    public string Field { get; set; }

    /// <summary>
    /// Gets or sets the new status of the field.
    /// </summary>
    public bool NewStatus { get; set; }
}

public enum TabType
{
    Reviewed,
    Published,
}
