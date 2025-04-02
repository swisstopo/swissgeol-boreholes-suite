using BDMS.Json;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a Instrumentation entity in the database.
/// </summary>
[Table("instrumentation")]
public class Instrumentation : IChangeTracking, IIdentifyable, ICasingReference
{
    /// <inheritdoc />
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Completion"/> of this <see cref="Instrumentation"/>.
    /// </summary>
    [Column("completion_id")]
    public int CompletionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/> of this <see cref="Instrumentation"/>.
    /// </summary>
    public Completion? Completion { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Instrumentation"/>'s upper depth.
    /// </summary>
    [IncludeInExport]
    [Column("from_depth")]
    public double? FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Instrumentation"/>'s lower depth.
    /// </summary>
    [IncludeInExport]
    [Column("to_depth")]
    public double? ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Instrumentation"/>'s name.
    /// </summary>
    [IncludeInExport]
    [Column("name")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the id <see cref="Instrumentation"/>'s kind.
    /// </summary>
    [IncludeInExport]
    [Column("kind_id")]
    public int? KindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Instrumentation"/>'s kind.
    /// </summary>
    public Codelist? Kind { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Instrumentation"/>'s status.
    /// </summary>
    [IncludeInExport]
    [Column("status_id")]
    public int? StatusId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Instrumentation"/>'s status.
    /// </summary>
    public Codelist? Status { get; set; }

    /// <summary>
    /// Gets or sets whether or not the <see cref="Instrumentation"/> belongs to an open borehole.
    /// </summary>
    [IncludeInExport]
    [Column("is_open_borehole")]
    public bool IsOpenBorehole { get; set; }

    /// <summary>
    /// Gets or sets id of the <see cref="Instrumentation"/>'s casing.
    /// </summary>
    [IncludeInExport]
    [Column("casing_id")]
    public int? CasingId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Instrumentation"/>'s casing.
    /// </summary>
    public Casing? Casing { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Instrumentation"/>'s notes.
    /// </summary>
    [IncludeInExport]
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
