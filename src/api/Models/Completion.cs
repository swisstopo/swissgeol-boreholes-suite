﻿using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a completion entity in the database.
/// </summary>
[Table("completion")]
public class Completion : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
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
    [Column("is_primary")]
    public bool? IsPrimary { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s name.
    /// </summary>
    [Column("name")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s type id.
    /// </summary>
    [Column("kind_id")]
    public int KindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s type.
    /// </summary>
    public Codelist? Kind { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s notes.
    /// </summary>
    [Column("notes")]
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Completion"/>'s abandon date.
    /// </summary>
    [Column("abandon_date")]
    public DateTime? AbandonDate { get; set; }

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
