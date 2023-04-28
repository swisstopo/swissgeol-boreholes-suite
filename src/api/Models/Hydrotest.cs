using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a hydrotest in the boring process.
/// </summary>
public class Hydrotest : Observation
{
    /// <summary>
    /// Gets or sets the <see cref="Hydrotest"/>'s hydrotestkind id.
    /// </summary>
    [Column("testkind")]
    public int TestKindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Hydrotest"/>'s test kind.
    /// </summary>
    public Codelist? TestKind { get; set; }

    /// <summary>
    /// Gets the <see cref="Codelist"/>s used by the <see cref="Hydrotest"/>.
    /// </summary>
    public ICollection<Codelist>? Codelists { get; }

    /// <summary>
    /// Gets the<see cref= "HydrotestCodelist"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public IList<HydrotestCodelist>? HydrotestCodelists { get; }

    /// <summary>
    /// Gets the <see cref="HydrotestResult"/>s associated with the <see cref="Hydrotest"/>.
    /// </summary>
    public ICollection<HydrotestResult> HydrotestResults { get; }
}
