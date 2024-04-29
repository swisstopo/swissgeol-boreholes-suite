using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Interface for join table entities for a <see cref="Models.Codelist"/> attached to a <see cref="Models.Hydrotest"/>.
/// </summary>
public interface IHydrotestCode
{
    /// <summary>
    /// Gets or sets the ID of the hydrotest in the join table.
    /// </summary>
    int HydrotestId { get; set; }

    /// <summary>
    /// Gets or sets the layer in the join table.
    /// </summary>
    Hydrotest Hydrotest { get; set; }

    /// <summary>
    /// Gets or sets the ID of the codelist in the join table.
    /// </summary>
    int CodelistId { get; set; }

    /// <summary>
    /// Gets or sets the codelist in the join table.
    /// </summary>
    Codelist Codelist { get; set; }
}
