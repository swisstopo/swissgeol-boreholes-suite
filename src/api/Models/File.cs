using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a file entity in the database.
/// </summary>
[Table("files")]
public class File : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id_fil")]
    public int Id { get; set; }

    /// <inheritdoc />
    [Column("id_usr_fk")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <inheritdoc />
    [Column("updated_by_fil")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <inheritdoc />
    [Column("updated_fil")]
    public DateTime? Updated { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>'s name.
    /// </summary>
    [IncludeInExport]
    [Column("name_fil")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the unique <see cref="File"/> name.
    /// </summary>
    [IncludeInExport]
    [Column("name_uuid_fil")]
    public string? NameUuid { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>'s type.
    /// </summary>
    [IncludeInExport]
    [Column("type_fil")]
    public string Type { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>'s upload date.
    /// </summary>
    [Column("uploaded_fil")]
    public DateTime? Created { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>s that have this <see cref="File"/> attached.
    /// </summary>
    public ICollection<Borehole>? Boreholes { get; }

    /// <summary>
    /// Gets the <see cref="Profile"/> join table entities.
    /// </summary>
    public ICollection<Profile>? Profiles { get; }
}
