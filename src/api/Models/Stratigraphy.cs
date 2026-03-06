using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a stratigraphy entity in the database.
/// </summary>
[Table("stratigraphy")]
public class Stratigraphy : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [IncludeInExport]
    [JsonRequired]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the foreign key for the <see cref="Borehole"/> associated  with the <see cref="Stratigraphy"/>.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("borehole_id")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/> associated  with the <see cref="Stratigraphy"/>.
    /// </summary>
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s name.
    /// </summary>
    [IncludeInExport]
    [Column("name")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Stratigraphy"/>'s date.
    /// </summary>
    [IncludeInExport]
    [Column("date")]
    public DateTime? Date { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Stratigraphy"/> is primary.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("is_primary")]
    public bool IsPrimary { get; set; }

    /// <inheritdoc />
    [Column("update")]
    public DateTime? Updated { get; set; }

    /// <inheritdoc />
    [Column("updater")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <inheritdoc />
    [Column("creation")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
    [Column("creator")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <summary>
    /// Gets the <see cref="Lithology"/>s associated with the <see cref="Stratigraphy"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<Lithology>? Lithologies { get; set; }

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
