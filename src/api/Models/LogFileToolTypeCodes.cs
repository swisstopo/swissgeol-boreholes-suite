using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.Codelist"/> with the schemaName 'tool_type' attached to a <see cref="LogFile"/>.
/// </summary>
[Table("logfile_tooltype_codelist")]
public class LogFileToolTypeCodes
{
    /// <summary>
    /// Gets or sets the ID of the <see cref="LogFile"/> in the join table.
    /// </summary>
    [Column("logfile_id")]
    public int LogFileId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LogFile"/> in the join table.
    /// </summary>
    public LogFile LogFile { get; set; }

    /// <summary>
    /// Gets or sets the ID of the codelist in the join table.
    /// </summary>
    [Column("codelist_id")]
    public int CodelistId { get; set; }

    /// <summary>
    /// Gets or sets the codelist in the join table.
    /// </summary>
    public Codelist Codelist { get; set; }
}
