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
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Completion"/> of this <see cref="Casing"/>.
    /// </summary>
    [Column("completion_id")]
    public int CompletionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/> of this <see cref="Casing"/>.
    /// </summary>
    public Completion? Completion { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s name.
    /// </summary>
    [Column("name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s upper depth.
    /// </summary>
    [Column("from_depth")]
    public double FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s lower depth.
    /// </summary>
    [Column("to_depth")]
    public double ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s kind id.
    /// </summary>
    [Column("kind_id")]
    public int KindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s kind.
    /// </summary>
    public Codelist? Kind { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="Casing"/>'s material.
    /// </summary>
    [Column("material_id")]
    public int MaterialId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s material.
    /// </summary>
    public Codelist? Material { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s inner diameter.
    /// </summary>
    [Column("inner_diameter")]
    public double InnerDiameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s outer diameter.
    /// </summary>
    [Column("outer_diameter")]
    public double OuterDiameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s start date.
    /// </summary>
    [Column("date_start")]
    public DateOnly DateStart { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s finish date.
    /// </summary>
    [Column("date_finish")]
    public DateOnly DateFinish { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Casing"/>'s notes.
    /// </summary>
    [Column("notes")]
    public string? Notes { get; set; }

    /// <summary>
    /// Gets the <see cref="Instrumentation"/>s associated with the <see cref="Casing"/>.
    /// </summary>
    public ICollection<Instrumentation>? Instrumentations { get; }

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
