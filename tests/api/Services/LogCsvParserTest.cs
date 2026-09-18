using BDMS.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS.Services;

[TestClass]
public class LogCsvParserTest
{
    private const string TestRunNumber = "RUN-1";

    private static TextReader ToReader(string content) => new StringReader(content);

    private static List<Codelist> Codelists =>
    [
        new() { Id = 100, Schema = LogSchemas.LogBoreholeStatusSchema, En = "open hole", De = "offenes Bohrloch" },
        new() { Id = 200, Schema = LogSchemas.LogConveyanceMethodSchema, En = "wireline", De = "Kabel" },
        new() { Id = 300, Schema = LogSchemas.LogToolTypeSchema, Code = "GR" },
    ];

    [TestMethod]
    public void MissingRunColumnsNamesEveryAbsentColumn()
    {
        var missing = LogCsvParser.MissingRunColumns(ToReader("RunNumber;Comment\n"));

        CollectionAssert.AreEquivalent(new[] { "FromDepth", "ToDepth" }, missing.ToList());
    }

    [TestMethod]
    public void MissingRunColumnsToleratesExtraAndReorderedColumns()
    {
        var missing = LogCsvParser.MissingRunColumns(ToReader("ToDepth;Unknown;FromDepth;RunNumber\n"));

        Assert.AreEqual(0, missing.Count);
    }

    [TestMethod]
    public void ParseRunsReadsValues()
    {
        var csv = "RunNumber;FromDepth;ToDepth;BoreholeStatus\nRUN-1;10.5;20.5;open hole\n";

        var rows = LogCsvParser.ParseRuns(ToReader(csv), Codelists, boreholeId: 7);

        var row = rows.Single();
        Assert.AreEqual(TestRunNumber, row.RunNumber);
        Assert.AreEqual(1, row.RowIndex);
        Assert.AreEqual(0, row.Errors.Count);
        Assert.AreEqual(10.5, row.LogRun.FromDepth);
        Assert.AreEqual(20.5, row.LogRun.ToDepth);
        Assert.AreEqual(7, row.LogRun.BoreholeId);
        Assert.AreEqual(100, row.LogRun.BoreholeStatusId);
    }

    [TestMethod]
    public void ParseRunsReportsBlankRunNumber()
    {
        var csv = "RunNumber;FromDepth;ToDepth\n;10;20\n";

        var row = LogCsvParser.ParseRuns(ToReader(csv), Codelists, boreholeId: 7).Single();

        Assert.AreEqual("importErrorRunNumberRequired", row.Errors.Single().MessageKey);
    }

    [TestMethod]
    public void ParseRunsReportsUnknownCodelistValue()
    {
        var csv = "RunNumber;FromDepth;ToDepth;ConveyanceMethod\nRUN-1;10;20;rocket\n";

        var row = LogCsvParser.ParseRuns(ToReader(csv), Codelists, boreholeId: 7).Single();

        var error = row.Errors.Single();
        Assert.AreEqual("importErrorUnknownCodelistValue", error.MessageKey);
        Assert.AreEqual("ConveyanceMethod", error.Values["fieldName"]);
        Assert.AreEqual("rocket", error.Values!["value"]);
    }

    [TestMethod]
    public void ParseRunsReportsUnparseableOptionalNumber()
    {
        var csv = "RunNumber;FromDepth;ToDepth;BitSize\nRUN-1;10;20;big\n";

        var row = LogCsvParser.ParseRuns(ToReader(csv), Codelists, boreholeId: 7).Single();

        Assert.AreEqual("importErrorInvalidNumberFormat", row.Errors.Single().MessageKey);
    }

    [TestMethod]
    public void ParseFilesBuildsStoredFileName()
    {
        var csv = "RunNumber;Name;Extension\nRUN-1;My Log;las\n";

        var row = LogCsvParser.ParseFiles(ToReader(csv), Codelists).Single();

        Assert.AreEqual("My_Log.las", row.FileName);
        Assert.AreEqual("My_Log.las", row.LogFile.Name);
        Assert.IsNull(row.LogFile.NameUuid);
    }

    [TestMethod]
    public void ParseFilesLeavesNameUnchangedWhenExtensionIsBlank()
    {
        var csv = "RunNumber;Name;Extension\nRUN-1;already.las;\n";

        var row = LogCsvParser.ParseFiles(ToReader(csv), Codelists).Single();

        Assert.AreEqual("already.las", row.FileName);
    }

    [TestMethod]
    public void ParseFilesReportsUnknownToolTypeCode()
    {
        var csv = "RunNumber;Name;LogFileToolTypeCodes\nRUN-1;a.las;GR,NOPE\n";

        var row = LogCsvParser.ParseFiles(ToReader(csv), Codelists).Single();

        Assert.AreEqual("importErrorUnknownToolTypeCode", row.Errors.Single().MessageKey);
    }

    [TestMethod]
    public void ParseFilesReadsLocalizedPublicValue()
    {
        var csv = "RunNumber;Name;Public\nRUN-1;a.las;Ja\n";

        var row = LogCsvParser.ParseFiles(ToReader(csv), Codelists).Single();

        Assert.IsTrue(row.LogFile.Public);
        Assert.AreEqual(0, row.Errors.Count);
    }

    [TestMethod]
    public void ParseFilesReportsUnknownPublicValue()
    {
        var csv = "RunNumber;Name;Public\nRUN-1;a.las;perhaps\n";

        var row = LogCsvParser.ParseFiles(ToReader(csv), Codelists).Single();

        Assert.AreEqual("importErrorUnknownPublicValue", row.Errors.Single().MessageKey);
    }

    [TestMethod]
    public void RequiredFileNamesReadsNamesPerRun()
    {
        var csv = "RunNumber;Name;Extension\nRUN-1;welllog;las\nRUN-2;data;txt\n";

        var namesPerRun = LogCsvParser.RequiredFileNames(ToReader(csv));

        CollectionAssert.AreEqual(new[] { "welllog.las" }, namesPerRun[TestRunNumber].ToList());
        CollectionAssert.AreEqual(new[] { "data.txt" }, namesPerRun["RUN-2"].ToList());
    }

    [TestMethod]
    public void RequiredFileNamesGroupsEveryFileOfARun()
    {
        var csv = "RunNumber;Name;Extension\nRUN-1;file1;las\nRUN-1;file2;txt\n";

        var namesPerRun = LogCsvParser.RequiredFileNames(ToReader(csv));

        CollectionAssert.AreEqual(new[] { "file1.las", "file2.txt" }, namesPerRun.Single().Value.ToList());
    }

    [TestMethod]
    public void RequiredFileNamesSpellsNamesTheWayTheImportMatchesThem()
    {
        // The name the import looks for carries no space, so neither may the name the user is
        // asked for: the two are compared against each other.
        var csv = "RunNumber;Name;Extension\nRUN-1;My Log;las\n";

        var namesPerRun = LogCsvParser.RequiredFileNames(ToReader(csv));

        CollectionAssert.AreEqual(new[] { "My_Log.las" }, namesPerRun[TestRunNumber].ToList());
    }

    [TestMethod]
    public void RequiredFileNamesReadsNameWithoutExtensionColumn()
    {
        var csv = "RunNumber;Name\nRUN-1;welllog.las\n";

        var namesPerRun = LogCsvParser.RequiredFileNames(ToReader(csv));

        CollectionAssert.AreEqual(new[] { "welllog.las" }, namesPerRun[TestRunNumber].ToList());
    }

    [TestMethod]
    public void RequiredFileNamesListsARunThatNamesNoFile()
    {
        // The run is still reported, so the step can say it expects nothing rather than stay silent.
        var csv = "RunNumber;Extension\nRUN-1;las\n";

        var namesPerRun = LogCsvParser.RequiredFileNames(ToReader(csv));

        Assert.AreEqual(0, namesPerRun[TestRunNumber].Count);
    }

    [TestMethod]
    public void RequiredFileNamesSkipsRowsWithoutRunNumber()
    {
        var csv = "RunNumber;Name;Extension\nRUN-1;file1;las\n;empty;txt\n";

        var namesPerRun = LogCsvParser.RequiredFileNames(ToReader(csv));

        Assert.AreEqual(1, namesPerRun.Count);
        CollectionAssert.AreEqual(new[] { "file1.las" }, namesPerRun[TestRunNumber].ToList());
    }

    [TestMethod]
    public void RequiredFileNamesReadsHeaderInAnyCasing()
    {
        var csv = "RUNNUMBER;NAME;EXTENSION\nRUN-1;file;las\n";

        var namesPerRun = LogCsvParser.RequiredFileNames(ToReader(csv));

        CollectionAssert.AreEqual(new[] { "file.las" }, namesPerRun[TestRunNumber].ToList());
    }

    [TestMethod]
    public void RequiredFileNamesIsEmptyWithoutRunNumberColumn()
    {
        var namesPerRun = LogCsvParser.RequiredFileNames(ToReader("Name;Extension\nfile;las\n"));

        Assert.AreEqual(0, namesPerRun.Count);
    }

    [TestMethod]
    public void RequiredFileNamesIsEmptyForAnEmptyFile()
    {
        var namesPerRun = LogCsvParser.RequiredFileNames(ToReader(string.Empty));

        Assert.AreEqual(0, namesPerRun.Count);
    }
}
