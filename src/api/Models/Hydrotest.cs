using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a hydrotest in the boring process.
/// </summary>
public class Hydrotest : Observation
{
    /// <summary>
    /// Gets the <see cref="Codelist"/>s used by the <see cref="Hydrotest"/>.
    /// </summary>
    public ICollection<Codelist>? Codelists { get; set; }

    /// <summary>
    /// Gets the<see cref= "HydrotestCodelist"/> join table entities.
    /// </summary>
    public IList<HydrotestCodelist>? HydrotestCodelists { get; }

    [NotMapped]
    public ICollection<int>? CodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="HydrotestResult"/>s associated with the <see cref="Hydrotest"/>.
    /// </summary>
    public ICollection<HydrotestResult>? HydrotestResults { get; set; }
}
