using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a canton in the database.
/// </summary>
[Table("cantons")]
public class Canton
{
    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s id.
    /// </summary>
    [Key]
    [Column("gid")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s uuid.
    /// </summary>
    [Column("uuid")]
    public string? Uuid { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s change date.
    /// </summary>
    [Column("datum_aend")]
    public DateOnly? DatumAenderung { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s creation date.
    /// </summary>
    [Column("datum_erst")]
    public DateOnly? DatumErstellung { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s creation year.
    /// </summary>
    [Column("erstell_j")]
    public int? ErstellungsJahr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s creation month.
    /// </summary>
    [Column("erstell_m")]
    public string? ErstellungsMonat { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s change year.
    /// </summary>
    [Column("revision_j")]
    public int? RevisionJahr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s month.
    /// </summary>
    [Column("revision_m")]
    public string? RevisionMonat { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s reason for change.
    /// </summary>
    [Column("grund_aend")]
    public string? GrundAenderung { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s origin.
    /// </summary>
    [Column("herkunft")]
    public string? Herkunft { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s origin year.
    /// </summary>
    [Column("herkunft_j")]
    public int? HerkunftJahr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s month.
    /// </summary>
    [Column("herkunft_m")]
    public string? HerkunftMonat { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s object type.
    /// </summary>
    [Column("objektart")]
    public string? Objektart { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s revision quality.
    /// </summary>
    [Column("revision_q")]
    public string? RevisionQualitaet { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s icc.
    /// </summary>
    [Column("icc")]
    public string? Icc { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s number.
    /// </summary>
    [Column("kantonsnum")]
    public string? Kantonsnummer { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s area.
    /// </summary>
    [Column("kantonsfla")]
    public decimal? Kantonsflaeche { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s part.
    /// </summary>
    [Column("kt_teil")]
    public string? KantonsTeil { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s lake area.
    /// </summary>
    [Column("see_flaech")]
    public decimal? SeeFlaeche { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s population.
    /// </summary>
    [Column("einwohnerz")]
    public int? Einwohnerzahl { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Canton"/>'s name.
    /// </summary>
    [Column("name")]
    public int? Name { get; set; }

    /// <summary>
    /// Gets the <see cref="Borehole"/>s associated with the <see cref="Canton"/>.
    /// </summary>
    public virtual ICollection<Borehole> Boreholes { get; }
}
