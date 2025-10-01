using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a lithostratigraphy entity in the database.
/// </summary>
[Table("lithostratigraphy")]
public class LithostratigraphyLayer : ILithologyLegacy, IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Key]
    [Column("id")]
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

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_from")]
    public double? FromDepth { get; set; }

    /// <inheritdoc />
    [IncludeInExport]
    [Column("depth_to")]
    public double? ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Codelist"/> id of the lithostratigraphy.
    /// </summary>
    [IncludeInExport]
    [Column("lithostratigraphy_id")]
    public int? LithostratigraphyId { get; set; }

    /// <summary>
    /// Gets or sets the lithostratigraphy <see cref="Codelist"/>.
    /// </summary>
    public Codelist? Lithostratigraphy { get; set; }
}
