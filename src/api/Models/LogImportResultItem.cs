using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Whether a <see cref="LogImportResultItem"/> describes a log run or a log file.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LogImportItemType
{
    /// <summary>A row of the log runs CSV.</summary>
    Run,

    /// <summary>A row of the log files CSV.</summary>
    File,
}

/// <summary>
/// What the import did with one row.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LogImportOutcome
{
    /// <summary>The row was written by this import.</summary>
    Added,

    /// <summary>The item the row describes is already stored, so the row was skipped.</summary>
    AlreadyExists,

    /// <summary>
    /// The row is valid but something it depends on is missing, so a later import can still add
    /// it. Its parent run does not exist yet, or its attachment was not provided.
    /// </summary>
    SkippedIncomplete,

    /// <summary>The row itself cannot be imported as written and has to be corrected.</summary>
    Error,
}

/// <summary>
/// What happened to one row of an import, as reported back to the client.
/// </summary>
/// <param name="Type">Whether the row is a log run or a log file.</param>
/// <param name="Identifier">The run number, or the run number and file name, naming the row for the user.</param>
/// <param name="Outcome">Which of the four outcomes the row landed in.</param>
/// <param name="MessageKey">The translation key explaining the outcome.</param>
/// <param name="Values">The placeholder values the translation needs.</param>
/// <param name="LogRunId">The stored log run, set only on added items.</param>
/// <param name="LogFileId">The stored log file, set only on added file items, so the client knows what to upload against.</param>
public record LogImportResultItem(
    LogImportItemType Type,
    string Identifier,
    LogImportOutcome Outcome,
    string MessageKey,
    Dictionary<string, string>? Values = null,
    int? LogRunId = null,
    int? LogFileId = null);
