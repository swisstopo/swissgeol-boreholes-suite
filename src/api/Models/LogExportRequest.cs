namespace BDMS.Models;

/// <summary>
/// Represents a request to export log files, allowing the client to specify which log runs or log files to include, whether to include attachments, and the locale for any localized content in the export.
/// </summary>
public class LogExportRequest
{
    /// <summary>
    /// The list of log run IDs to include in the export. Cannot be provided together with LogFileIds.
    /// </summary>
    public IReadOnlyList<int> LogRunIds { get; set; } = [];

    /// <summary>
    /// The list of log file IDs to include in the export. Cannot be provided together with LogRunIds.
    /// </summary>
    public IReadOnlyList<int> LogFileIds { get; set; } = [];

    /// <summary>
    /// Whether to include attachments in the exported log files. If true, any attachments associated with the specified log files will be included in the export. If false, attachments will be excluded. Default is false.
    /// </summary>
    public bool? WithAttachments { get; set; } = false;

    /// <summary>
    /// The locale to use for any localized content in the exported log files. This can affect the language of any messages, labels, or other localized content included in the export. Default is "en" (English).
    /// </summary>
    public string Locale { get; set; } = "en";
}
