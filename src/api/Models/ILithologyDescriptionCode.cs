using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Interface for join table entities for a <see cref="Models.Codelist"/> attached to a <see cref="Models.LithologyDescription"/>.
/// </summary>
public interface ILithologyDescriptionCode
{
    /// <summary>
    /// Gets or sets the ID of the lithology description in the join table.
    /// </summary>
    int LithologyDescriptionId { get; set; }

    /// <summary>
    /// Gets or sets the lithology description in the join table.
    /// </summary>
    LithologyDescription? LithologyDescription { get; set; }

    /// <summary>
    /// Gets or sets the ID of the codelist in the join table.
    /// </summary>
    int CodelistId { get; set; }

    /// <summary>
    /// Gets or sets the codelist in the join table.
    /// </summary>
    Codelist? Codelist { get; set; }
}
