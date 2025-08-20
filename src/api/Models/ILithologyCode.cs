using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Interface for join table entities for a <see cref="Models.Codelist"/> attached to a <see cref="Models.Lithology"/>.
/// </summary>
public interface ILithologyCode
{
    /// <summary>
    /// Gets or sets the ID of the lithology in the join table.
    /// </summary>
    int LithologyId { get; set; }

    /// <summary>
    /// Gets or sets the lithology in the join table.
    /// </summary>
    Lithology? Lithology { get; set; }

    /// <summary>
    /// Gets or sets the ID of the codelist in the join table.
    /// </summary>
    int CodelistId { get; set; }

    /// <summary>
    /// Gets or sets the codelist in the join table.
    /// </summary>
    Codelist? Codelist { get; set; }
}
