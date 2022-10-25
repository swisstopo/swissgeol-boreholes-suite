using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a file entity in the database.
/// </summary>
[Table("files")]
public class File
{
    /// <summary>
    /// Gets or sets the <see cref="File"/>'s id.
    /// </summary>
    [Column("id_fil")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who created the <see cref="File"/>.
    /// </summary>
    [Column("id_usr_fk")]
    public int? UserId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who created the <see cref="File"/>.
    /// </summary>
    public User? User { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>'s name.
    /// </summary>
    [Column("name_fil")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>'s hash.
    /// </summary>
    [Column("hash_fil")]
    public string Hash { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>'s type.
    /// </summary>
    [Column("type_fil")]
    public string Type { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>'s upload date.
    /// </summary>
    [Column("uploaded_fil")]
    public DateTime? Uploaded { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>'s configuration.
    /// </summary>
    [Column("conf_fil", TypeName = "json")]
    public string? Conf { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>s that have this <see cref="File"/> attached.
    /// </summary>
    public ICollection<Borehole> Boreholes { get; }

    /// <summary>
    /// Gets the <see cref="BoreholeFile"/> join table entities.
    /// </summary>
    public ICollection<BoreholeFile> BoreholeFiles { get; }
}
