using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a Document entity in the database.
/// </summary>
[Table("document")]
public class Document : IIdentifyable, IChangeTracking
{
    /// <inheritdoc />
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/> id.
    /// </summary>
    [Column("borehole_id")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>.
    /// </summary>
    public Borehole Borehole { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Document"/>'s url.
    /// </summary>
    [IncludeInExport]
    [Column("url")]
    public Uri Url { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Document"/>'s description.
    /// </summary>
    [IncludeInExport]
    [Column("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Document"/> is publicly visible.
    /// </summary>
    [IncludeInExport]
    [Column("public")]
    public bool Public { get; set; }

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
