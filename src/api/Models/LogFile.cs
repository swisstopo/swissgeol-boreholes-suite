using BDMS.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a LogFile entity in the database.
/// </summary>
[Table("log_file")]
public class LogFile : IIdentifyable, IChangeTracking
{
    /// <inheritdoc />
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogRun"/> id.
    /// </summary>
    [IncludeInExport]
    [Column("log_run_id")]
    public int LogRunId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogRun"/>.
    /// </summary>
    public LogRun? LogRun { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogFile"/>'s name.
    /// </summary>
    [IncludeInExport]
    [Column("name")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the unique <see cref="LogFile"/> name.
    /// </summary>
    [IncludeInExport]
    [Column("name_uuid")]
    public string? NameUuid { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogFile"/>'s type.
    /// </summary>
    [JsonIgnore]
    [Column("file_type")]
    public string? FileType { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LogFile"/>'s pass type.
    /// </summary>
    [IncludeInExport]
    [Column("pass_type_id")]
    public int? PassTypeId { get; set; }

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'log_pass_type' used by the <see cref="LogFile"/>.
    /// </summary>
    public Codelist? PassType { get; set; }

    /// <summary>
    /// Gets the <see cref="LogFile"/>s pass.
    /// </summary>
    [IncludeInExport]
    [Column("pass")]
    public int? Pass { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LogFile"/>'s data package.
    /// </summary>
    [IncludeInExport]
    [Column("data_package_id")]
    public int? DataPackageId { get; set; }

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'log_data_package' used by the <see cref="LogFile"/>.
    /// </summary>
    public Codelist? DataPackage { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogFile"/>'s date.
    /// </summary>
    [IncludeInExport]
    [Column("delivery_date")]
    public DateOnly? DeliveryDate { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="LogFile"/>'s depth type.
    /// </summary>
    [IncludeInExport]
    [Column("depth_type_id")]
    public int? DepthTypeId { get; set; }

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'log_depth_type' used by the <see cref="LogFile"/>.
    /// </summary>
    public Codelist? DepthType { get; set; }

    /// <summary>
    /// Gets or sets the codelist ids with schema name 'log_tool_type' of the <see cref="LogFile"/>'s many to many codelist relations.
    /// </summary>
    [NotMapped]
    [IncludeInExport]
    public ICollection<int>? ToolTypeCodelistIds { get; set; } = new List<int>();

    /// <summary>
    /// Gets the <see cref="Codelist"/>s with schema name 'log_tool_type' used by the <see cref="LogFile"/>.
    /// </summary>
    public ICollection<Codelist>? ToolTypeCodelists { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogFileToolTypeCodes"/> join table entities.
    /// </summary>
    [JsonIgnore]
    public IList<LogFileToolTypeCodes>? LogFileToolTypeCodes { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="LogFile"/> is publicly visible.
    /// </summary>
    [IncludeInExport]
    [Column("public")]
    public bool Public { get; set; }

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
