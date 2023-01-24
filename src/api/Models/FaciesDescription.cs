using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a facies description entity in the database.
/// </summary>
[Table("facies_description")]
public class FaciesDescription
{
    /// <summary>
    /// Gets or sets the <see cref="FaciesDescription"/>'s id.
    /// </summary>
    [Column("id_fac")]
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Stratigraphy"/> of the <see cref="FaciesDescription"/>.
    /// </summary>
    [Column("id_sty_fk")]
    public int? StratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/> of the <see cref="FaciesDescription"/>.
    /// </summary>
    public Stratigraphy? Stratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who created the <see cref="FaciesDescription"/>.
    /// </summary>
    [Column("creator")]
    public int CreatedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who created the <see cref="FaciesDescription"/>.
    /// </summary>
    public User? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FaciesDescription"/>'s creation date.
    /// </summary>
    [Column("creation")]
    public DateTime? Creation { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who updated the <see cref="FaciesDescription"/>.
    /// </summary>
    [Column("updater")]
    public int UpdatedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who updated the <see cref="FaciesDescription"/>.
    /// </summary>
    public User? UpdatedBy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FaciesDescription"/>'s update date.
    /// </summary>
    [Column("update")]
    public DateTime? Update { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FaciesDescription"/>'s description.
    /// </summary>
    [Column("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the id of the quality of the <see cref="FaciesDescription"/>'s description.
    /// </summary>
    [Column("qt_description_id")]
    public int? QtDescriptionId { get; set; }

    /// <summary>
    /// Gets or sets the quality of the <see cref="FaciesDescription"/>'s description.
    /// </summary>
    public Codelist? QtDescription { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FaciesDescription"/>'s upper depth.
    /// </summary>
    [Column("depth_from")]
    public double? FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FaciesDescription"/>'s lower depth.
    /// </summary>
    [Column("depth_to")]
    public double? ToDepth { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="FaciesDescription"/> is the last facies description.
    /// </summary>
    [Column("is_last")]
    public bool? IsLast { get; set; }
}
