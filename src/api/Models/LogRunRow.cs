namespace BDMS.Models;

/// <summary>
/// One row of the log runs CSV, as read from the file.
///
/// The values are kept even when the row carries errors, because the run number is what names
/// the row in the report.
/// </summary>
public class LogRunRow
{
    /// <summary>The position of the row in the CSV, counted from one, excluding the header.</summary>
    public int RowIndex { get; init; }

    /// <summary>The value of the RunNumber column, trimmed.</summary>
    public string RunNumber { get; init; } = string.Empty;

    /// <summary>The log run built from the row, with the values that could be read.</summary>
    public LogRun LogRun { get; init; } = new();

    /// <summary>Everything about the row that makes it unimportable.</summary>
    public IList<LogRowError> Errors { get; } = [];
}
