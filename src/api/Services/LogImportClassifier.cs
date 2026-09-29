using BDMS.Models;

namespace BDMS.Services;

/// <summary>
/// Sorts every parsed row into one of the four import outcomes.
///
/// Nothing here reads or writes anything. The stored state it judges against is passed in, which
/// is what lets the rules be exercised directly instead of through an import request.
/// </summary>
public static class LogImportClassifier
{
    /// <summary>
    /// Classifies the rows of one import.
    /// </summary>
    /// <param name="runRows">The parsed log run rows, in file order.</param>
    /// <param name="fileRows">The parsed log file rows, in file order.</param>
    /// <param name="existingRuns">The log runs already stored for the target borehole.</param>
    /// <param name="existingFiles">The log files already stored for those runs.</param>
    /// <param name="providedAttachmentNames">What the client holds, each as "runNumber/fileName".</param>
    /// <returns>The report and the work to commit.</returns>
    public static LogImportClassification Classify(
        IReadOnlyList<LogRunRow> runRows,
        IReadOnlyList<LogFileRow> fileRows,
        IReadOnlyList<ExistingLogRun> existingRuns,
        IReadOnlyList<ExistingLogFile> existingFiles,
        IEnumerable<string> providedAttachmentNames)
    {
        var items = new List<LogImportResultItem>();
        var runsToAdd = new List<LogRun>();
        var filesToAdd = new List<PendingLogFile>();

        var storedRunIdByNumber = existingRuns.ToDictionary(r => r.RunNumber, r => r.Id, StringComparer.OrdinalIgnoreCase);
        var addedRunNumbers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var seenRunNumbers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var provided = new HashSet<string>(providedAttachmentNames, StringComparer.OrdinalIgnoreCase);

        foreach (var row in runRows)
        {
            items.Add(ClassifyRun(row, storedRunIdByNumber, addedRunNumbers, seenRunNumbers, runsToAdd));
        }

        var fileContext = new FileClassificationContext(
            storedRunIdByNumber,
            addedRunNumbers,
            existingFiles,
            provided,
            new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase),
            filesToAdd);

        foreach (var row in fileRows)
        {
            items.Add(ClassifyFile(row, fileContext));
        }

        return new LogImportClassification(items, runsToAdd, filesToAdd);
    }

    private static LogImportResultItem ClassifyRun(
        LogRunRow row,
        Dictionary<string, int> storedRunIdByNumber,
        HashSet<string> addedRunNumbers,
        HashSet<string> seenRunNumbers,
        List<LogRun> runsToAdd)
    {
        var values = new Dictionary<string, string> { ["runNumber"] = row.RunNumber, ["rowNumber"] = row.RowIndex.ToString(System.Globalization.CultureInfo.InvariantCulture) };

        if (row.Errors.Count > 0)
        {
            return RunError(row, row.Errors[0], values);
        }

        if (!seenRunNumbers.Add(row.RunNumber))
        {
            return RunError(row, new LogRowError("importErrorDuplicateRunNumber"), values);
        }

        if (storedRunIdByNumber.ContainsKey(row.RunNumber))
        {
            // Skipping rather than failing is what lets the same file be imported again to add
            // only what is new.
            return new LogImportResultItem(LogImportItemType.Run, row.RunNumber, LogImportOutcome.AlreadyExists, "importResultRunAlreadyExists", values);
        }

        addedRunNumbers.Add(row.RunNumber);
        runsToAdd.Add(row.LogRun);
        return new LogImportResultItem(LogImportItemType.Run, row.RunNumber, LogImportOutcome.Added, "importResultRunAdded", values);
    }

    private static LogImportResultItem RunError(LogRunRow row, LogRowError error, Dictionary<string, string> values)
    {
        return new LogImportResultItem(
            LogImportItemType.Run,
            row.RunNumber,
            LogImportOutcome.Error,
            error.MessageKey,
            Merge(values, error.Values));
    }

    /// <summary>
    /// What classifying one log file row is judged against, and where its work is collected.
    /// </summary>
    /// <param name="StoredRunIdByNumber">The ids of the runs already stored, by run number.</param>
    /// <param name="AddedRunNumbers">The run numbers this same import is about to create.</param>
    /// <param name="ExistingFiles">The log files already stored for the target borehole.</param>
    /// <param name="Provided">What the client holds, each as "runNumber/fileName".</param>
    /// <param name="NamesSeenPerRun">The file names already met in this import, by run number.</param>
    /// <param name="FilesToAdd">The files to write, appended to as rows are accepted.</param>
    private sealed record FileClassificationContext(
        Dictionary<string, int> StoredRunIdByNumber,
        HashSet<string> AddedRunNumbers,
        IReadOnlyList<ExistingLogFile> ExistingFiles,
        HashSet<string> Provided,
        Dictionary<string, HashSet<string>> NamesSeenPerRun,
        List<PendingLogFile> FilesToAdd);

    private static LogImportResultItem ClassifyFile(LogFileRow row, FileClassificationContext context)
    {
        var identifier = $"{row.RunNumber} / {row.FileName}";
        var values = new Dictionary<string, string>
        {
            ["runNumber"] = row.RunNumber,
            ["fileName"] = row.FileName,
            ["rowNumber"] = row.RowIndex.ToString(System.Globalization.CultureInfo.InvariantCulture),
        };

        if (row.Errors.Count > 0)
        {
            return FileError(identifier, row.Errors[0], values);
        }

        // A row naming no run can never find one, however often the import is repeated, so it is
        // the user's to correct rather than something to wait for.
        if (string.IsNullOrWhiteSpace(row.RunNumber))
        {
            return FileError(identifier, new LogRowError("importErrorRunNumberRequired"), values);
        }

        if (!context.NamesSeenPerRun.TryGetValue(row.RunNumber, out var namesSeen))
        {
            namesSeen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            context.NamesSeenPerRun[row.RunNumber] = namesSeen;
        }

        if (!namesSeen.Add(row.FileName))
        {
            return FileError(identifier, new LogRowError("importErrorDuplicateFileName"), values);
        }

        var storedRunId = context.StoredRunIdByNumber.TryGetValue(row.RunNumber, out var id) ? id : (int?)null;
        var runIsInThisBatch = context.AddedRunNumbers.Contains(row.RunNumber);

        if (storedRunId is null && !runIsInThisBatch)
        {
            return new LogImportResultItem(LogImportItemType.File, identifier, LogImportOutcome.SkippedIncomplete, "importSkippedRunNotFound", values);
        }

        var stored = storedRunId is int runId
            ? context.ExistingFiles.FirstOrDefault(f => f.LogRunId == runId && string.Equals(f.Name, row.FileName, StringComparison.OrdinalIgnoreCase))
            : null;

        if (stored is { HasAttachment: true })
        {
            return new LogImportResultItem(LogImportItemType.File, identifier, LogImportOutcome.AlreadyExists, "importResultFileAlreadyExists", values);
        }

        if (!context.Provided.Contains($"{row.RunNumber}/{row.FileName}"))
        {
            return new LogImportResultItem(LogImportItemType.File, identifier, LogImportOutcome.SkippedIncomplete, "importSkippedAttachmentMissing", values);
        }

        // A stored record without its object is a row an earlier import left unfinished. Its
        // attachment is accepted now, and its metadata stays as it was stored.
        if (stored is { HasAttachment: false })
        {
            return new LogImportResultItem(LogImportItemType.File, identifier, LogImportOutcome.Added, "importResultFileAdded", values, stored.LogRunId, stored.Id);
        }

        if (storedRunId is int parentId) row.LogFile.LogRunId = parentId;
        context.FilesToAdd.Add(new PendingLogFile(row.RunNumber, row.LogFile));
        return new LogImportResultItem(LogImportItemType.File, identifier, LogImportOutcome.Added, "importResultFileAdded", values, storedRunId);
    }

    private static LogImportResultItem FileError(string identifier, LogRowError error, Dictionary<string, string> values) =>
        new(LogImportItemType.File, identifier, LogImportOutcome.Error, error.MessageKey, Merge(values, error.Values));

    private static Dictionary<string, string> Merge(Dictionary<string, string> values, Dictionary<string, string>? extra)
    {
        if (extra == null) return values;

        foreach (var pair in extra) values[pair.Key] = pair.Value;
        return values;
    }
}

/// <summary>A log run of the target borehole as it is stored.</summary>
/// <param name="Id">The stored id.</param>
/// <param name="RunNumber">The run number, unique within the borehole.</param>
public record ExistingLogRun(int Id, string RunNumber);

/// <summary>A log file of the target borehole as it is stored.</summary>
/// <param name="Id">The stored id.</param>
/// <param name="LogRunId">The run the file belongs to.</param>
/// <param name="Name">The stored file name.</param>
/// <param name="HasAttachment">Whether an object in the cloud storage backs the record.</param>
public record ExistingLogFile(int Id, int LogRunId, string Name, bool HasAttachment);

/// <summary>
/// A log file to write, together with the run number naming its parent.
///
/// The run number is carried rather than the id, because a file may belong to a run this same
/// import is about to create, whose id is only known once it is saved.
/// </summary>
/// <param name="RunNumber">The run the file belongs to.</param>
/// <param name="LogFile">The file to write. <see cref="LogFile.LogRunId"/> is set when the run is already stored.</param>
public record PendingLogFile(string RunNumber, LogFile LogFile);

/// <summary>
/// What the import should do, and what to tell the user about it.
/// </summary>
/// <param name="Items">One entry per row, runs before files, in file order.</param>
/// <param name="RunsToAdd">The runs to write.</param>
/// <param name="FilesToAdd">The files to write.</param>
public record LogImportClassification(
    IReadOnlyList<LogImportResultItem> Items,
    IReadOnlyList<LogRun> RunsToAdd,
    IReadOnlyList<PendingLogFile> FilesToAdd);
