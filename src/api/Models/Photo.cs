using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a Photo entity in the database.
/// </summary>
[Table("photo")]
public class Photo : IIdentifyable, IChangeTracking
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
    /// Gets or sets the <see cref="Photo"/>'s name.
    /// </summary>
    [IncludeInExport]
    [Column("name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the unique <see cref="Photo"/> name.
    /// </summary>
    [IncludeInExport]
    [Column("name_uuid")]
    public string NameUuid { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Photo"/>'s file type.
    /// </summary>
    [IncludeInExport]
    [Column("file_type")]
    public string FileType { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Photo"/>'s upper depth.
    /// </summary>
    [IncludeInExport]
    [Column("from_depth")]
    public double FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Photo"/>'s lower depth.
    /// </summary>
    [IncludeInExport]
    [Column("to_depth")]
    public double ToDepth { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Photo"/> is publicly visible.
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
