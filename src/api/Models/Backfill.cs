using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a Backfill entity in the database.
/// </summary>
[Table("backfill")]
public class Backfill : IChangeTracking, IIdentifyable, ICasingReference
{
    /// <inheritdoc />
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Completion"/> of this <see cref="Backfill"/>.
    /// </summary>
    [Column("completion_id")]
    public int CompletionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/> of this <see cref="Backfill"/>.
    /// </summary>
    public Completion? Completion { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Backfill"/>'s upper depth.
    /// </summary>
    [Column("from_depth")]
    public double? FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Backfill"/>'s lower depth.
    /// </summary>
    [Column("to_depth")]
    public double? ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the id <see cref="Backfill"/>'s kind.
    /// </summary>
    [Column("kind_id")]
    public int? KindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Backfill"/>'s kind.
    /// </summary>
    public Codelist? Kind { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Backfill"/>'s status.
    /// </summary>
    [Column("material_id")]
    public int? MaterialId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Backfill"/>'s status.
    /// </summary>
    public Codelist? Material { get; set; }

    /// <summary>
    /// Gets or sets whether or not the <see cref="Backfill"/> belongs to an open borehole.
    /// </summary>
    [Column("is_open_borehole")]
    public bool IsOpenBorehole { get; set; }

    /// <summary>
    /// Gets or sets id of the <see cref="Backfill"/>'s casing.
    /// </summary>
    [Column("casing_id")]
    public int? CasingId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Backfill"/>'s casing.
    /// </summary>
    public Casing? Casing { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Backfill"/>'s notes.
    /// </summary>
    [Column("notes")]
    public string? Notes { get; set; }

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
