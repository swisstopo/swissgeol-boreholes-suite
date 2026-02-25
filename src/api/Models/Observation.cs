using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents an observation in the boring process.
/// </summary>
[Table("observation")]
public class Observation : IChangeTracking, IIdentifyable, ICasingReference
{
    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s id.
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s type.
    /// </summary>
    [IncludeInExport]
    [Column("observation_type")]
    public ObservationType Type { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s start time.
    /// </summary>
    [IncludeInExport]
    [Column("start_time")]
    public DateTime? StartTime { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s end time.
    /// </summary>
    [IncludeInExport]
    [Column("end_time")]
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s duration.
    /// </summary>
    [Column("duration")]
    public double? Duration { get; set; }

    /// <summary>
    /// Gets or sets the original vertical reference system.
    /// </summary>
    [IncludeInExport]
    [Column("original_vertical_reference_system")]
    public VerticalReferenceSystem OriginalVerticalReferenceSystem { get; set; } = VerticalReferenceSystem.Unknown;

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s from depth in m.
    /// </summary>
    [IncludeInExport]
    [Column("from_depth_m")]
    public double? FromDepthM { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s to depth in m.
    /// </summary>
    [IncludeInExport]
    [Column("to_depth_m")]
    public double? ToDepthM { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s from depth in m a.s.l.
    /// </summary>
    [IncludeInExport]
    [Column("from_depth_masl")]
    public double? FromDepthMasl { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s to depth in m a.s.l.
    /// </summary>
    [IncludeInExport]
    [Column("to_depth_masl")]
    public double? ToDepthMasl { get; set; }

    /// <summary>
    /// Gets or sets id of the <see cref="Observation"/>'s casing.
    /// </summary>
    [IncludeInExport]
    [Column("casing_id")]
    public int? CasingId { get; set; }

    /// <summary>
    /// Gets or sets whether or not the <see cref="Observation"/> belongs to an open borehole.
    /// </summary>
    [IncludeInExport]
    [Column("is_open_borehole")]
    public bool IsOpenBorehole { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s casing.
    /// </summary>
    public Casing? Casing { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s comment.
    /// </summary>
    [IncludeInExport]
    [Column("comment")]
    public string? Comment { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s reliability id.
    /// </summary>
    [IncludeInExport]
    [Column("reliability")]
    public int? ReliabilityId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s reliability.
    /// </summary>
    public Codelist? Reliability { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s borehole id.
    /// </summary>
    [Column("borehole_id")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Observation"/>'s borehole.
    /// </summary>
    [JsonIgnore]
    public Borehole? Borehole { get; set; }

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
}
