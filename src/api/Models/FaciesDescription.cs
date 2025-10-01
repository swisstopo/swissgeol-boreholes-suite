using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a facies description entity in the database.
/// </summary>
[Table("facies_description")]
public class FaciesDescription : ILithology, IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id")]
    [Key]
    public int Id { get; set; }

    /// <inheritdoc />
    [Column("stratigraphy_id")]
    public int StratigraphyId { get; set; }

    /// <inheritdoc />
    public StratigraphyV2? Stratigraphy { get; set; }

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
    /// Gets or sets the id of the <see cref="FaciesDescription"/>'s facies.
    /// </summary>
    [IncludeInExport]
    [Column("facies_id")]
    public int? FaciesId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FaciesDescription"/>'s facies.
    /// </summary>
    public Codelist? Facies { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [JsonRequired]
    [Column("depth_from")]
    public double FromDepth { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [JsonRequired]
    [Column("depth_to")]
    public double ToDepth { get; set; }
}
