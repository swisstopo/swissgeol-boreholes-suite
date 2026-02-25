using BDMS.Json;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a completion entity in the database.
/// </summary>
[Table("completion")]
public class Completion : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [IncludeInExport]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Models.Borehole"/> of this <see cref="Completion"/>.
    /// </summary>
    [Column("borehole_id")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s borehole.
    /// </summary>
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets whether this <see cref="Completion"/> is the primary <see cref="Completion"/>.
    /// </summary>
    [IncludeInExport]
    [Column("is_primary")]
    public bool IsPrimary { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s name.
    /// </summary>
    [IncludeInExport]
    [Column("name")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s type id.
    /// </summary>
    [IncludeInExport]
    [Column("kind_id")]
    public int KindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s type.
    /// </summary>
    public Codelist? Kind { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s notes.
    /// </summary>
    [IncludeInExport]
    [Column("notes")]
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s abandon date.
    /// </summary>
    [IncludeInExport]
    [Column("abandon_date")]
    public DateOnly? AbandonDate { get; set; }

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
    /// Gets the <see cref="Instrumentation"/>s associated with the <see cref="Completion"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<Instrumentation>? Instrumentations { get; set; }

    /// <summary>
    /// Gets the <see cref="Backfill"/>s associated with the <see cref="Completion"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<Backfill>? Backfills { get; set; }

    /// <summary>
    /// Gets the <see cref="Casing"/>s associated with the <see cref="Completion"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<Casing>? Casings { get; set; }
}
