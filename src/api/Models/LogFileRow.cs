namespace BDMS.Models;

/// <summary>
/// One row of the log files CSV, as read from the file.
/// </summary>
public class LogFileRow
{
    /// <summary>The position of the row in the CSV, counted from one, excluding the header.</summary>
    public int RowIndex { get; init; }

    /// <summary>The value of the RunNumber column, trimmed, naming the run the file belongs to.</summary>
    public string RunNumber { get; init; } = string.Empty;

    /// <summary>
    /// The file name as it is stored: the Name column, the Extension column appended when it is
    /// not blank, spaces replaced by underscores.
    /// </summary>
    public string FileName { get; init; } = string.Empty;

    /// <summary>The log file built from the row, with the values that could be read.</summary>
    public LogFile LogFile { get; init; } = new();

    /// <summary>Everything about the row that makes it unimportable.</summary>
    public IList<LogRowError> Errors { get; } = [];
}
