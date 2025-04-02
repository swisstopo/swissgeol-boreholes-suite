using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a stratigraphy entity in the database.
/// </summary>
[Table("stratigraphy")]
public class Stratigraphy : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
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
    [IncludeInExport]
    [Column("primary_sty")]
    public bool? IsPrimary { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s date.
    /// </summary>
    [IncludeInExport]
    [Column("date_sty")]
    public DateTime? Date { get; set; }

    /// <inheritdoc />
    [Column("update_sty")]
    public DateTime? Updated { get; set; }

    /// <inheritdoc />
    [Column("updater_sty")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <inheritdoc />
    [Column("creation_sty")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
    [Column("author_sty")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s name.
    /// </summary>
    [IncludeInExport]
    [Column("name_sty")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s quality id.
    /// </summary>
    [IncludeInExport]
    [Column("quality_id")]
    public int? QualityId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s quality.
    /// </summary>
    public Codelist? Quality { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s notes.
    /// </summary>
    [IncludeInExport]
    [Column("notes_sty")]
    public string? Notes { get; set; }

    /// <summary>
    /// Gets the <see cref="Layer"/>s associated with the <see cref="Stratigraphy"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<Layer>? Layers { get; set; }

    /// <summary>
    /// Gets the <see cref="LithologicalDescription"/>s associated with the <see cref="Stratigraphy"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<LithologicalDescription>? LithologicalDescriptions { get; set; }

    /// <summary>
    /// Gets the <see cref="FaciesDescription"/>s associated with the <see cref="Stratigraphy"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<FaciesDescription>? FaciesDescriptions { get; set; }

    /// <summary>
    /// Gets the <see cref="ChronostratigraphyLayer"/>s associated with the <see cref="Stratigraphy"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<ChronostratigraphyLayer>? ChronostratigraphyLayers { get; set; }

    /// <summary>
    /// Gets the <see cref="LithostratigraphyLayer"/>s associated with the <see cref="Stratigraphy"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<LithostratigraphyLayer>? LithostratigraphyLayers { get; set; }
}
