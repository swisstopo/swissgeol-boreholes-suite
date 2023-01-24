using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a lithological description entity in the database.
/// </summary>
[Table("lithological_description")]
public class LithologicalDescription : ILayerDescription
{
    /// <summary>
    /// Gets or sets the <see cref="LithologicalDescription"/>'s id.
    /// </summary>
    [Column("id_ldp")]
    [Key]
    public int Id { get; set; }

    /// <inheritdoc />
    [Column("id_sty_fk")]
    public int? StratigraphyId { get; set; }

    /// <inheritdoc />
    public Stratigraphy? Stratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who created the <see cref="LithologicalDescription"/>.
    /// </summary>
    [Column("creator")]
    public int CreatedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who created the <see cref="LithologicalDescription"/>.
    /// </summary>
    public User? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologicalDescription"/>'s creation date.
    /// </summary>
    [Column("creation")]
    public DateTime? Creation { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who updated the <see cref="LithologicalDescription"/>.
    /// </summary>
    [Column("updater")]
    public int UpdatedById { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who updated the <see cref="LithologicalDescription"/>.
    /// </summary>
    public User? UpdatedBy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologicalDescription"/>'s update date.
    /// </summary>
    [Column("update")]
    public DateTime? Update { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologicalDescription"/>'s description.
    /// </summary>
    [Column("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the id of the quality of the <see cref="LithologicalDescription"/>'s description.
    /// </summary>
    [Column("qt_description_id")]
    public int? QtDescriptionId { get; set; }

    /// <summary>
    /// Gets or sets the quality of the <see cref="LithologicalDescription"/>'s description.
    /// </summary>
    public Codelist? QtDescription { get; set; }

    /// <inheritdoc />
    [Column("depth_from")]
    public double? FromDepth { get; set; }

    /// <inheritdoc />
    [Column("depth_to")]
    public double? ToDepth { get; set; }

    /// <inheritdoc />
    [Column("is_last")]
    public bool? IsLast { get; set; }
}
