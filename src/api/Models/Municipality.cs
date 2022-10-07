using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a municipality in the database.
/// </summary>
[Table("municipalities")]
public class Municipality
{
    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s id.
    /// </summary>
    [Key]
    [Column("gid")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s uuid.
    /// </summary>
    [Column("uuid")]
    public string? Uuid { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s change date.
    /// </summary>
    [Column("datum_aend")]
    public DateOnly? DatumAenderung { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s creation date.
    /// </summary>
    [Column("datum_erst")]
    public DateOnly? DatumErstellung { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s creation year..
    /// </summary>
    [Column("erstell_j")]
    public int? ErstellungJahr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s creation month.
    /// </summary>
    [Column("erstell_m")]
    public string? ErstellungMonat { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s revision year.
    /// </summary>
    [Column("revision_j")]
    public int? RevisionsJahr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s revision month.
    /// </summary>
    [Column("revision_m")]
    public string? RevisionMontat { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s change reason.
    /// </summary>
    [Column("grund_aend")]
    public string? GrundAenderung { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s origin.
    /// </summary>
    [Column("herkunft")]
    public string? Herkunft { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s origin year.
    /// </summary>
    [Column("herkunft_j")]
    public int? HerkunftJahr { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s origin month.
    /// </summary>
    [Column("herkunft_m")]
    public string? HerkunftMonat { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s object type.
    /// </summary>
    [Column("objektart")]
    public string? Objektart { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s district number.
    /// </summary>
    [Column("bezirksnum")]
    public int? Bezirksnummer { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s lake area.
    /// </summary>
    [Column("see_flaech")]
    public decimal? SeeFlaeche { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s revision quality.
    /// </summary>
    [Column("revision_q")]
    public string? RevisionQualitaet { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s name.
    /// </summary>
    [Column("name")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s canton number.
    /// </summary>
    [Column("kantonsnum")]
    public int? Kantonsnummer { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s icc.
    /// </summary>
    [Column("icc")]
    public string? Icc { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s population.
    /// </summary>
    [Column("einwohnerz")]
    public int? Einwohnerzahl { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s bfs number.
    /// </summary>
    [Column("bfs_nummer")]
    public int? BfsNummer { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s community part.
    /// </summary>
    [Column("gem_teil")]
    public string? GemeindeTeil { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s community area.
    /// </summary>
    [Column("gem_flaech")]
    public decimal? GemeindeFlaeche { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Municipality"/>'s shn.
    /// </summary>
    [Column("shn")]
    public string? Shn { get; set; }

    /// <summary>
    /// Gets  the <see cref="Municipality"/>'s  <see cref="Borehole"/>s.
    /// </summary>
    public ICollection<Borehole> Boreholes { get; }
}
