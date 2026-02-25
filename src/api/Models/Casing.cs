using BDMS.Json;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a Casing entity in the database.
/// </summary>
[Table("casing")]
public class Casing : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [IncludeInExport]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Completion"/> of this <see cref="Casing"/>.
    /// </summary>
    [IncludeInExport]
    [Column("completion_id")]
    public int CompletionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/> of this <see cref="Casing"/>.
    /// </summary>
    public Completion? Completion { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s name.
    /// </summary>
    [IncludeInExport]
    [Column("name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s start date.
    /// </summary>
    [IncludeInExport]
    [Column("date_start")]
    public DateOnly? DateStart { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s finish date.
    /// </summary>
    [IncludeInExport]
    [Column("date_finish")]
    public DateOnly? DateFinish { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s notes.
    /// </summary>
    [IncludeInExport]
    [Column("notes")]
    public string? Notes { get; set; }

    /// <summary>
    /// Gets the <see cref="Instrumentation"/>s associated with the <see cref="Casing"/>.
    /// </summary>
    public ICollection<Instrumentation>? Instrumentations { get; }

    /// <summary>
    /// Gets the <see cref="Backfill"/>s associated with the <see cref="Casing"/>.
    /// </summary>
    public ICollection<Backfill>? Backfills { get; }

    /// <summary>
    /// Gets the <see cref="Observation"/>s associated with the <see cref="Casing"/>.
    /// </summary>
    public ICollection<Observation>? Observations { get; }

    /// <summary>
    /// Gets the <see cref="CasingElement"/>s of the <see cref="Casing"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<CasingElement> CasingElements { get; set; }

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
