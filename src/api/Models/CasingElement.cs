using BDMS.Json;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a CasingElement entity in the database.
/// </summary>
[Table("casing_element")]
public class CasingElement : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Casing"/> of this <see cref="CasingElement"/>.
    /// </summary>
    [Column("casing_id")]
    public int CasingId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/> of this <see cref="CasingElement"/>.
    /// </summary>
    public Casing? Casing { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="CasingElement"/>'s upper depth.
    /// </summary>
    [IncludeInExport]
    [Column("from_depth")]
    public double FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="CasingElement"/>'s lower depth.
    /// </summary>
    [IncludeInExport]
    [Column("to_depth")]
    public double ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s kind id.
    /// </summary>
    [IncludeInExport]
    [Column("kind_id")]
    public int KindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s kind.
    /// </summary>
    public Codelist? Kind { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Casing"/>'s material.
    /// </summary>
    [IncludeInExport]
    [Column("material_id")]
    public int? MaterialId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s material.
    /// </summary>
    public Codelist? Material { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s inner diameter.
    /// </summary>
    [IncludeInExport]
    [Column("inner_diameter")]
    public double? InnerDiameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s outer diameter.
    /// </summary>
    [IncludeInExport]
    [Column("outer_diameter")]
    public double? OuterDiameter { get; set; }

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
}
