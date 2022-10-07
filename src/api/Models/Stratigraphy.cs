using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a stratigraphy entity in the database.
/// </summary>
[Table("stratigraphy")]
public class Stratigraphy
{
    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s id.
    /// </summary>
    [Column("id_sty")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the foreign key for the <see cref="Borehole"/> associated  with the <see cref="Stratigraphy"/>.
    /// </summary>
    [Column("id_bho_fk")]
    public int? BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/> associated  with the <see cref="Stratigraphy"/>.
    /// </summary>
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Stratigraphy"/> is primary.
    /// </summary>
    [Column("primary_sty")]
    public bool? IsPrimary { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s date.
    /// </summary>
    [Column("date_sty")]
    public DateOnly? Date { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s update date.
    /// </summary>
    [Column("update_sty")]
    public DateTime? Update { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who updated the <see cref="Stratigraphy"/>.
    /// </summary>
    [Column("updater_sty")]
    public int? UpdaterId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who updated the <see cref="Stratigraphy"/>.
    /// </summary>
    public User? Updater { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s creation date.
    /// </summary>
    [Column("creation_sty")]
    public DateTime? Creation { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who authored the <see cref="Stratigraphy"/>.
    /// </summary>
    [Column("author_sty")]
    public int? AuthorId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who authored the <see cref="Stratigraphy"/>.
    /// </summary>
    public User? Author { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s name.
    /// </summary>
    [Column("name_sty")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s import id.
    /// </summary>
    [Column("import_id")]
    public int? ImportId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s kind id.
    /// </summary>
    [Column("kind_id_cli")]
    public int KindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s kind.
    /// </summary>
    public Codelist Kind { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s casing.
    /// </summary>
    [Column("casng_id")]
    public string? Casng { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s casing date.
    /// </summary>
    [Column("casng_date_abd_sty")]
    public DateOnly? CasngDate { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s notes.
    /// </summary>
    [Column("notes_sty")]
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s fill casing id.
    /// </summary>
    [Column("fill_casng_id_sty_fk")]
    public int? FillCasngId { get; set; }

    /// <summary>
    /// Gets the <see cref="Layer"/>s associated with the <see cref="Stratigraphy"/>.
    /// </summary>
    public ICollection<Layer> Layers { get; }
}
