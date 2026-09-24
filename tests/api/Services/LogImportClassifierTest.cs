using BDMS.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS.Services;

[TestClass]
public class LogImportClassifierTest
{
    private const string TestRunNumber = "RUN-1";
    private const string TestFileName = "a.las";
    private const string TestAttachmentName = $"{TestRunNumber}/{TestFileName}";

    private static LogRunRow RunRow(string runNumber, params LogRowError[] errors)
    {
        var row = new LogRunRow
        {
            RowIndex = 1,
            RunNumber = runNumber,
            LogRun = new LogRun { RunNumber = runNumber, FromDepth = 0, ToDepth = 1 },
        };
        foreach (var error in errors) row.Errors.Add(error);
        return row;
    }

    private static LogFileRow FileRow(string runNumber, string fileName, params LogRowError[] errors)
    {
        var row = new LogFileRow
        {
            RowIndex = 1,
            RunNumber = runNumber,
            FileName = fileName,
            LogFile = new LogFile { Name = fileName },
        };
        foreach (var error in errors) row.Errors.Add(error);
        return row;
    }

    private static LogImportClassification Classify(
        List<LogRunRow>? runs = null,
        List<LogFileRow>? files = null,
        List<ExistingLogRun>? existingRuns = null,
        List<ExistingLogFile>? existingFiles = null,
        IEnumerable<string>? provided = null) =>
        LogImportClassifier.Classify(
            runs ?? [],
            files ?? [],
            existingRuns ?? [],
            existingFiles ?? [],
            provided ?? []);

    [TestMethod]
    public void NewRunIsAdded()
    {
        var result = Classify(runs: [RunRow(TestRunNumber)]);

        Assert.AreEqual(LogImportOutcome.Added, result.Items.Single().Outcome);
        Assert.AreEqual(TestRunNumber, result.RunsToAdd.Single().RunNumber);
    }

    [TestMethod]
    public void StoredRunIsAlreadyExists()
    {
        var result = Classify(runs: [RunRow(TestRunNumber)], existingRuns: [new ExistingLogRun(5, TestRunNumber)]);

        Assert.AreEqual(LogImportOutcome.AlreadyExists, result.Items.Single().Outcome);
        Assert.AreEqual(0, result.RunsToAdd.Count);
    }

    [TestMethod]
    public void RunRepeatedInTheCsvIsAnErrorOnTheSecondRow()
    {
        var result = Classify(runs: [RunRow(TestRunNumber), RunRow(TestRunNumber)]);

        Assert.AreEqual(LogImportOutcome.Added, result.Items[0].Outcome);
        Assert.AreEqual(LogImportOutcome.Error, result.Items[1].Outcome);
        Assert.AreEqual("importErrorDuplicateRunNumber", result.Items[1].MessageKey);
        Assert.AreEqual(1, result.RunsToAdd.Count);
    }

    [TestMethod]
    public void RunRepeatedInTheCsvIsAnErrorEvenWhenItIsAlreadyStored()
    {
        var result = Classify(runs: [RunRow(TestRunNumber), RunRow(TestRunNumber)], existingRuns: [new ExistingLogRun(5, TestRunNumber)]);

        Assert.AreEqual(LogImportOutcome.AlreadyExists, result.Items[0].Outcome);
        Assert.AreEqual(LogImportOutcome.Error, result.Items[1].Outcome);
        Assert.AreEqual("importErrorDuplicateRunNumber", result.Items[1].MessageKey);
        Assert.AreEqual(0, result.RunsToAdd.Count);
    }

    [TestMethod]
    public void RunWithParseErrorIsAnError()
    {
        var result = Classify(runs: [RunRow(TestRunNumber, new LogRowError("importErrorInvalidNumberFormat"))]);

        Assert.AreEqual(LogImportOutcome.Error, result.Items.Single().Outcome);
        Assert.AreEqual("importErrorInvalidNumberFormat", result.Items.Single().MessageKey);
        Assert.AreEqual(0, result.RunsToAdd.Count);
    }

    [TestMethod]
    public void FileAttachesToARunAddedInTheSameBatch()
    {
        var result = Classify(
            runs: [RunRow(TestRunNumber)],
            files: [FileRow(TestRunNumber, TestFileName)],
            provided: [TestAttachmentName]);

        var fileItem = result.Items.Single(i => i.Type == LogImportItemType.File);
        Assert.AreEqual(LogImportOutcome.Added, fileItem.Outcome);
        Assert.AreEqual(TestRunNumber, result.FilesToAdd.Single().RunNumber);
    }

    [TestMethod]
    public void FileAttachesToAStoredRun()
    {
        var result = Classify(
            files: [FileRow(TestRunNumber, TestFileName)],
            existingRuns: [new ExistingLogRun(5, TestRunNumber)],
            provided: [TestAttachmentName]);

        Assert.AreEqual(LogImportOutcome.Added, result.Items.Single().Outcome);
        Assert.AreEqual(5, result.FilesToAdd.Single().LogFile.LogRunId);
    }

    [TestMethod]
    public void FileWithoutItsRunIsSkippedAsIncomplete()
    {
        var result = Classify(files: [FileRow("RUN-9", TestFileName)], provided: ["RUN-9/a.las"]);

        var item = result.Items.Single();
        Assert.AreEqual(LogImportOutcome.SkippedIncomplete, item.Outcome);
        Assert.AreEqual("importSkippedRunNotFound", item.MessageKey);
    }

    [TestMethod]
    public void FileWithABlankRunNumberIsAnError()
    {
        var result = Classify(files: [FileRow(string.Empty, TestFileName)], provided: ["/a.las"]);

        var item = result.Items.Single();
        Assert.AreEqual(LogImportOutcome.Error, item.Outcome);
        Assert.AreEqual("importErrorRunNumberRequired", item.MessageKey);
    }

    [TestMethod]
    public void FileWithoutItsAttachmentIsSkippedAsIncomplete()
    {
        var result = Classify(runs: [RunRow(TestRunNumber)], files: [FileRow(TestRunNumber, TestFileName)]);

        var item = result.Items.Single(i => i.Type == LogImportItemType.File);
        Assert.AreEqual(LogImportOutcome.SkippedIncomplete, item.Outcome);
        Assert.AreEqual("importSkippedAttachmentMissing", item.MessageKey);
        Assert.AreEqual(0, result.FilesToAdd.Count);
    }

    [TestMethod]
    public void StoredFileWithItsAttachmentIsAlreadyExists()
    {
        var result = Classify(
            files: [FileRow(TestRunNumber, TestFileName)],
            existingRuns: [new ExistingLogRun(5, TestRunNumber)],
            existingFiles: [new ExistingLogFile(9, 5, TestFileName, HasAttachment: true)],
            provided: [TestAttachmentName]);

        Assert.AreEqual(LogImportOutcome.AlreadyExists, result.Items.Single().Outcome);
        Assert.AreEqual(0, result.FilesToAdd.Count);
    }

    [TestMethod]
    public void StoredFileWithoutItsAttachmentIsCompleted()
    {
        var result = Classify(
            files: [FileRow(TestRunNumber, TestFileName)],
            existingRuns: [new ExistingLogRun(5, TestRunNumber)],
            existingFiles: [new ExistingLogFile(9, 5, TestFileName, HasAttachment: false)],
            provided: [TestAttachmentName]);

        var item = result.Items.Single();
        Assert.AreEqual(LogImportOutcome.Added, item.Outcome);
        Assert.AreEqual(9, item.LogFileId);
        Assert.AreEqual(5, item.LogRunId);
        Assert.AreEqual(0, result.FilesToAdd.Count);
    }

    [TestMethod]
    public void FileNameRepeatedInTheSameRunIsAnErrorOnTheSecondRow()
    {
        var result = Classify(
            runs: [RunRow(TestRunNumber)],
            files: [FileRow(TestRunNumber, TestFileName), FileRow(TestRunNumber, TestFileName)],
            provided: [TestAttachmentName]);

        var fileItems = result.Items.Where(i => i.Type == LogImportItemType.File).ToList();
        Assert.AreEqual(LogImportOutcome.Added, fileItems[0].Outcome);
        Assert.AreEqual(LogImportOutcome.Error, fileItems[1].Outcome);
        Assert.AreEqual("importErrorDuplicateFileName", fileItems[1].MessageKey);
    }

    [TestMethod]
    public void FileNameComparisonIgnoresCase()
    {
        var result = Classify(
            files: [FileRow(TestRunNumber, "A.LAS")],
            existingRuns: [new ExistingLogRun(5, TestRunNumber)],
            existingFiles: [new ExistingLogFile(9, 5, TestFileName, HasAttachment: true)],
            provided: ["run-1/a.las"]);

        Assert.AreEqual(LogImportOutcome.AlreadyExists, result.Items.Single().Outcome);
    }

    [TestMethod]
    public void RunsAreReportedBeforeFiles()
    {
        var result = Classify(
            runs: [RunRow(TestRunNumber)],
            files: [FileRow(TestRunNumber, TestFileName)],
            provided: [TestAttachmentName]);

        Assert.AreEqual(LogImportItemType.Run, result.Items[0].Type);
        Assert.AreEqual(LogImportItemType.File, result.Items[1].Type);
    }
}
