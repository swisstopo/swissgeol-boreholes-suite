using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'log_tool_type' attached to a <see cref="LogFile"/>.
/// </summary>
[Table("log_file_tool_type_codelist")]
public class LogFileToolTypeCodes
{
    /// <summary>
    /// Gets or sets the ID of the <see cref="LogFile"/> in the join table.
    /// </summary>
    [Column("logfile_id")]
    [Required]
    public int LogFileId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogFile"/> in the join table.
    /// </summary>
    public LogFile LogFile { get; set; }

    /// <summary>
    /// Gets or sets the ID of the codelist in the join table.
    /// </summary>
    [Column("codelist_id")]
    [Required]
    public int CodelistId { get; set; }

    /// <summary>
    /// Gets or sets the codelist in the join table.
    /// </summary>
    public Codelist Codelist { get; set; }
}
