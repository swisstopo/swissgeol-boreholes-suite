using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a lithological description entity in the database.
/// </summary>
[Table("lithological_description")]
public class LithologicalDescription : ILayerDescription, IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id_ldp")]
    [Key]
    public int Id { get; set; }

    /// <inheritdoc />
    [Column("id_sty_fk")]
    public int StratigraphyId { get; set; }

    /// <inheritdoc />
    public Stratigraphy? Stratigraphy { get; set; }

    /// <inheritdoc />
    [Column("creator")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <inheritdoc />
    [Column("creation")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
    [Column("updater")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <inheritdoc />
    [Column("update")]
    public DateTime? Updated { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologicalDescription"/>'s description.
    /// </summary>
    [IncludeInExport]
    [Column("description")]
    public string? Description { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_from")]
    public double? FromDepth { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_to")]
    public double? ToDepth { get; set; }
}
