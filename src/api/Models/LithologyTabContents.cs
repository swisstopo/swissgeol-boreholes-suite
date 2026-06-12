using System.Collections.ObjectModel;

namespace BDMS.Models;

/// <summary>
/// The full editable contents of the Lithology tab of a <see cref="Stratigraphy"/>:
/// the three sibling collections that <see cref="Services.LithologyTabContentService"/> manages
/// together as a single unit.
/// </summary>
public class LithologyTabContents
{
    /// <summary>
    /// Gets or sets the <see cref="Lithology"/> rows of the stratigraphy.
    /// </summary>
    public Collection<Lithology> Lithologies { get; set; } = new();

    /// <summary>
    /// Gets or sets the <see cref="LithologicalDescription"/> rows of the stratigraphy.
    /// </summary>
    public Collection<LithologicalDescription> LithologicalDescriptions { get; set; } = new();

    /// <summary>
    /// Gets or sets the <see cref="FaciesDescription"/> rows of the stratigraphy.
    /// </summary>
    public Collection<FaciesDescription> FaciesDescriptions { get; set; } = new();
}
