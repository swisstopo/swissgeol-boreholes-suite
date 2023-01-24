using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a lithological description entity in the database.
/// </summary>
[Table("lithological_description_profile")]
public class LithologicalDescriptionProfile
{
    /// <summary>
    /// Gets or sets the <see cref="LithologicalDescriptionProfile"/>'s id.
    /// </summary>
    [Column("id")]
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Stratigraphy"/> of the <see cref="LithologicalDescriptionProfile"/>.
    /// </summary>
    [Column("id_sty")]
    public int? StratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/> of the <see cref="LithologicalDescriptionProfile"/>.
    /// </summary>
    public Stratigraphy? Stratigraphy { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologicalDescription"/>s associated with the <see cref="LithologicalDescriptionProfile"/>.
    /// </summary>
    public ICollection<LithologicalDescription> LithologicalDescriptions { get; }
}
