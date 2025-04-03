using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a chronostratigraphy entity in the database.
/// </summary>
[Table("chronostratigraphy")]
public class ChronostratigraphyLayer : ILayerDescription, IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id_chr")]
    [Key]
    public int Id { get; set; }

    /// <inheritdoc />
    [Column("id_sty_fk")]
    public int StratigraphyId { get; set; }

    /// <inheritdoc />
    public Stratigraphy? Stratigraphy { get; set; }

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

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_from")]
    public double? FromDepth { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_to")]
    public double? ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/> id of the chronostratigraphy.
    /// </summary>
    [IncludeInExport]
    [Column("chronostratigraphy_id")]
    public int? ChronostratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the chronostratigraphy <see cref="Codelist"/>.
    /// </summary>
    public Codelist? Chronostratigraphy { get; set; }
}
