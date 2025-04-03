using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a facies description entity in the database.
/// </summary>
[Table("facies_description")]
public class FaciesDescription : ILayerDescription, IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id_fac")]
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

    /// <summary>
    /// Gets or sets the <see cref="FaciesDescription"/>'s description.
    /// </summary>
    [IncludeInExport]
    [Column("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the id of the quality of the <see cref="FaciesDescription"/>'s description.
    /// </summary>
    [IncludeInExport]
    [Column("qt_description_id")]
    public int? DescriptionQualityId { get; set; }

    /// <summary>
    /// Gets or sets the quality of the <see cref="FaciesDescription"/>'s description.
    /// </summary>
    public Codelist? DescriptionQuality { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_from")]
    public double? FromDepth { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_to")]
    public double? ToDepth { get; set; }
}
