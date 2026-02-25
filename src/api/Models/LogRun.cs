using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a LogRun entity in the database.
/// </summary>
[Table("log_run")]
public class LogRun : IIdentifyable, IChangeTracking
{
    /// <inheritdoc />
    [Key]
    [JsonRequired]
    [IncludeInExport]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/> id.
    /// </summary>
    [JsonRequired]
    [IncludeInExport]
    [Column("borehole_id")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>.
    /// </summary>
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogRun"/>'s run number.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("run_number")]
    public string RunNumber { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogRun"/>'s upper depth.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("from_depth")]
    public double FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogRun"/>'s lower depth.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("to_depth")]
    public double ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the the <see cref="LogRun"/>'s date.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("run_date")]
    public DateOnly? RunDate { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogRun"/>'s comment.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("comment")]
    public string? Comment { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogRun"/>'s service co.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("service_co")]
    public string? ServiceCo { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogRun"/>'s bit size at the time of logging.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("bit_size")]
    public double? BitSize { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LogRun"/>'s conveyance method.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("conveyance_method_id")]
    public int? ConveyanceMethodId { get; set; }

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'log_conveyance_method' used by the <see cref="LogRun"/>.
    /// </summary>
    public Codelist? ConveyanceMethod { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LogRun"/>'s borehole status.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("borehole_status_id")]
    public int? BoreholeStatusId { get; set; }

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'log_borehole_status' used by the <see cref="LogRun"/>.
    /// </summary>
    public Codelist? BoreholeStatus { get; set; }

    /// <summary>
    /// Gets the <see cref="LogFile"/>s associated with the <see cref="LogRun"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<LogFile>? LogFiles { get; set; }

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
