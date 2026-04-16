using Amazon.S3;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.IO.Compression;
using System.Security.Claims;
using System.Text;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class LogExportControllerTest : TestControllerBase
{
    private const string TestFileName = "test_logfile.las";
    private User adminUser;
    private LogExportController controller;
    private LogController logController;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        Context = ContextFactory.GetTestContext();
        adminUser = Context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) }));

        var s3ClientMock = new AmazonS3Client(
            configuration["S3:ACCESS_KEY"],
            configuration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = configuration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = configuration["S3:SECURE"] == "0",
            });

        var logFileCloudServiceLoggerMock = new Mock<ILogger<LogFileCloudService>>(MockBehavior.Strict);
        logFileCloudServiceLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        var logFileCloudService = new LogFileCloudService(logFileCloudServiceLoggerMock.Object, s3ClientMock, configuration, contextAccessorMock.Object, Context);

        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();

        var logControllerLoggerMock = new Mock<ILogger<LogController>>(MockBehavior.Strict);
        logControllerLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        logController = new LogController(Context, logControllerLoggerMock.Object, boreholePermissionServiceMock.Object, logFileCloudService) { ControllerContext = GetControllerContextAdmin() };

        var logExportControllerLoggerMock = new Mock<ILogger<LogExportController>>();
        controller = new LogExportController(Context, logExportControllerLoggerMock.Object, boreholePermissionServiceMock.Object, logFileCloudService) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await Context.DisposeAsync();

    // ExportLogRunsAsync
    [TestMethod]
    public async Task ExportLogRunsWithoutAttachments()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunAsync(borehole.Id, "RUN-A");
        await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportLogRunsAsync([logRun.Id], withAttachments: false, locale: "en").ConfigureAwait(false);

        var fileResult = response as FileContentResult;
        Assert.IsNotNull(fileResult);
        Assert.AreEqual("application/zip", fileResult.ContentType);
        StringAssert.StartsWith(fileResult.FileDownloadName, "log_export_");
        StringAssert.EndsWith(fileResult.FileDownloadName, ".zip");

        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);

        // Expect exactly 2 entries (log_runs CSV + log_files CSV), no attachment
        Assert.AreEqual(2, archive.Entries.Count);
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith("log_runs_") && e.FullName.EndsWith(".csv")));
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith("log_files_") && e.FullName.EndsWith(".csv")));
    }

    [TestMethod]
    public async Task ExportLogRunsWithAttachments()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunAsync(borehole.Id, "RUN-ATT");
        var uploadedFile = await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportLogRunsAsync([logRun.Id], withAttachments: true, locale: "en").ConfigureAwait(false);

        var fileResult = response as FileContentResult;
        Assert.IsNotNull(fileResult);

        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);

        // 2 CSVs + 1 attachment
        Assert.AreEqual(3, archive.Entries.Count);
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith("log_runs_") && e.FullName.EndsWith(".csv")));
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith("log_files_") && e.FullName.EndsWith(".csv")));
        Assert.IsTrue(archive.Entries.Any(e => e.FullName == $"{uploadedFile.NameUuid}_{uploadedFile.Name}"));
    }

    [TestMethod]
    public async Task ExportLogRunsCsvHeadersAndContent()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunAsync(borehole.Id, "RUN-CSV");
        var uploadedFile = await UploadTestLogFile(logRun.Id);

        // Add two tool type codes out of alphabetic order so we can verify sorting
        await SetLogFileToolTypeCodesAsync(uploadedFile.Id, [100003033, 100003032]);

        var response = await controller.ExportLogRunsAsync([logRun.Id], withAttachments: false, locale: "en").ConfigureAwait(false);
        var fileResult = (FileContentResult)response;

        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);

        var logRunCsvEntry = archive.Entries.Single(e => e.FullName.StartsWith("log_runs_"));
        var logRunCsv = ReadEntryAsText(logRunCsvEntry);
        var lines = logRunCsv.Split("\r\n", StringSplitOptions.RemoveEmptyEntries);

        Assert.AreEqual("RunNumber;FromDepth;ToDepth;ToolType;BoreholeStatus;RunDate;BitSize;ConveyanceMethod;ServiceCo;Comment", lines[0]);
        Assert.AreEqual(2, lines.Length);

        var fields = lines[1].Split(';');
        Assert.AreEqual("RUN-CSV", fields[0]);
        Assert.AreEqual("10", fields[1]);
        Assert.AreEqual("20", fields[2]);
        Assert.AreEqual("CAL,GYRO", fields[3]); // Tool types have to be alphabetically sorted by Codelist.Code
        Assert.AreEqual("CH", fields[4]);
        Assert.AreEqual("01/06/2023", fields[5]); // RunDate dd/MM/yyyy (uses InvariantCulture "/" separator)
        Assert.AreEqual("80.970", fields[6]); // BitSize "F3"
        Assert.AreEqual("LWD", fields[7]);
        Assert.AreEqual("TestCo", fields[8]);
        Assert.AreEqual("Export test log run", fields[9]);
    }

    [TestMethod]
    public async Task ExportLogRunsMultipleLogRunsSameBorehole()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun1 = await AddTestLogRunAsync(borehole.Id, "R1");
        var logRun2 = await AddTestLogRunAsync(borehole.Id, "R2");

        var response = await controller.ExportLogRunsAsync([logRun1.Id, logRun2.Id], withAttachments: false, locale: "en").ConfigureAwait(false);

        var fileResult = (FileContentResult)response;
        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);
        var logRunCsvEntry = archive.Entries.Single(e => e.FullName.StartsWith("log_runs_"));
        var logRunCsv = ReadEntryAsText(logRunCsvEntry);

        var lines = logRunCsv.Split("\r\n", StringSplitOptions.RemoveEmptyEntries);
        Assert.AreEqual(3, lines.Length); // header + 2 data rows
    }

    [TestMethod]
    public async Task ExportLogRunsWithoutLogFilesOmitsLogFileCsv()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id, "NO-FILES");

        var response = await controller.ExportLogRunsAsync([logRun.Id], withAttachments: false, locale: "en").ConfigureAwait(false);

        var fileResult = (FileContentResult)response;
        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);

        Assert.AreEqual(1, archive.Entries.Count);
        Assert.IsTrue(archive.Entries.Single().FullName.StartsWith("log_runs_"));
        Assert.IsFalse(archive.Entries.Any(e => e.FullName.StartsWith("log_files_")));
    }

    [TestMethod]
    public async Task ExportLogRunsFromDifferentBoreholesReturnsBadRequest()
    {
        var borehole1 = await AddTestBoreholeAsync();
        var borehole2 = await AddTestBoreholeAsync();
        var logRun1 = await AddTestLogRunAsync(borehole1.Id, "A1");
        var logRun2 = await AddTestLogRunAsync(borehole2.Id, "B1");

        var response = await controller.ExportLogRunsAsync([logRun1.Id, logRun2.Id], withAttachments: false, locale: "en").ConfigureAwait(false);

        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("All log runs must belong to the same borehole.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportLogRunsWithInexistentIdsReturnsNotFound()
    {
        var response = await controller.ExportLogRunsAsync([999_999_001, 999_999_002], withAttachments: false, locale: "en").ConfigureAwait(false);
        Assert.IsInstanceOfType(response, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task ExportLogRunsWithoutPermissionsReturnsUnauthorized()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", borehole.Id))
            .ReturnsAsync(false);

        var response = await controller.ExportLogRunsAsync([logRun.Id], withAttachments: false, locale: "en").ConfigureAwait(false);
        Assert.IsInstanceOfType(response, typeof(UnauthorizedResult));
    }

    [TestMethod]
    [DataRow("en", "Not specified", "Other")]
    [DataRow("de", "Keine Angabe", "Anderer")]
    [DataRow("fr", "Sans indication", "Autre")]
    [DataRow("it", "Senza indicazioni", "Altro")]
    [DataRow("xx", "Not specified", "Other")] // unknown locale falls back to en
    public async Task ExportLogRunsUsesLocaleForCodelistText(string locale, string expectedBoreholeStatus, string expectedConveyanceMethod)
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = new LogRun
        {
            BoreholeId = borehole.Id,
            RunNumber = $"LOC-{locale}",
            FromDepth = 0,
            ToDepth = 100,
            BitSize = 0.5,
            ConveyanceMethodId = 100003002, // Other / Anderer / Autre / Altro
            BoreholeStatusId = 100003008,   // Not specified / Keine Angabe / Sans indication / Senza indicazioni
        };
        await Context.LogRuns.AddAsync(logRun);
        await Context.SaveChangesAsync();

        var response = await controller.ExportLogRunsAsync([logRun.Id], withAttachments: false, locale: locale).ConfigureAwait(false);
        var fileResult = (FileContentResult)response;

        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);
        var logRunCsvEntry = archive.Entries.Single(e => e.FullName.StartsWith("log_runs_"));
        var csv = ReadEntryAsText(logRunCsvEntry);

        var fields = csv.Split("\r\n", StringSplitOptions.RemoveEmptyEntries)[1].Split(';');

        Assert.AreEqual(expectedBoreholeStatus, fields[4]);
        Assert.AreEqual(expectedConveyanceMethod, fields[7]);
    }

    [TestMethod]
    public async Task ExportLogRunsWithAttachmentsFailsWhenFileMissingInS3ReturnsProblem()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id, "RUN-ORPH");

        // Add a log file record pointing to a non-existent S3 object.
        var orphanFile = new LogFile
        {
            LogRunId = logRun.Id,
            Name = "orphan.las",
            NameUuid = $"{Guid.NewGuid()}.las",
            Public = false,
        };
        Context.LogFiles.Add(orphanFile);
        await Context.SaveChangesAsync();

        var response = await controller.ExportLogRunsAsync([logRun.Id], withAttachments: true, locale: "en").ConfigureAwait(false);
        var objectResult = response as ObjectResult;
        Assert.IsNotNull(objectResult);
        var problem = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problem.Detail, "An error occurred while fetching a file from the cloud storage.");
    }

    // ExportLogFilesAsync
    [TestMethod]
    public async Task ExportLogFilesWithoutAttachments()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunAsync(borehole.Id, "LF-01");
        var logFile = await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportLogFilesAsync([logFile.Id], withAttachments: false, locale: "en").ConfigureAwait(false);

        var fileResult = response as FileContentResult;
        Assert.IsNotNull(fileResult);
        Assert.AreEqual("application/zip", fileResult.ContentType);

        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);

        Assert.AreEqual(2, archive.Entries.Count);
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith("log_runs_") && e.FullName.EndsWith(".csv")));
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith("log_files_") && e.FullName.EndsWith(".csv")));
    }

    [TestMethod]
    public async Task ExportLogFilesWithAttachments()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunAsync(borehole.Id, "LF-ATT");
        var logFile = await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportLogFilesAsync([logFile.Id], withAttachments: true, locale: "en").ConfigureAwait(false);

        var fileResult = (FileContentResult)response;
        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);
        Assert.AreEqual(3, archive.Entries.Count);
        Assert.IsNotNull(archive.Entries.SingleOrDefault(e => e.FullName == $"{logFile.NameUuid}_{logFile.Name}"));
    }

    [TestMethod]
    public async Task ExportLogFilesCsvContent()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunAsync(borehole.Id, "LF-CSV");
        var logFile = await UploadTestLogFile(logRun.Id);

        // configure file details to validate CSV
        logFile.PassTypeId = 100003022;
        logFile.DataPackageId = 100003013;
        logFile.DepthTypeId = 100003028;
        logFile.Pass = 3;
        logFile.DeliveryDate = new DateOnly(2024, 3, 15);
        logFile.Public = true;
        Context.LogFiles.Update(logFile);
        await Context.SaveChangesAsync();

        await SetLogFileToolTypeCodesAsync(logFile.Id, [100003033, 100003032]);

        var response = await controller.ExportLogFilesAsync([logFile.Id], withAttachments: false, locale: "en").ConfigureAwait(false);

        var fileResult = (FileContentResult)response;
        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);
        var logFileCsv = ReadEntryAsText(archive.Entries.Single(e => e.FullName.StartsWith("log_files_")));

        var lines = logFileCsv.Split("\r\n", StringSplitOptions.RemoveEmptyEntries);
        Assert.AreEqual("RunNumber;Name;LogFileToolTypeCodes;Extension;Pass;PassType;DataPackage;DepthType;DeliveryDate;Public", lines[0]);
        Assert.AreEqual(2, lines.Length);

        var fields = lines[1].Split(';');
        Assert.AreEqual("LF-CSV", fields[0]);
        Assert.AreEqual("test_logfile", fields[1]);
        Assert.AreEqual("CAL,GYRO", fields[2]); // Tool codes alphabetically sorted
        Assert.AreEqual("las", fields[3]);
        Assert.AreEqual("3", fields[4]);
        Assert.AreEqual("Main & repeat", fields[5]); // PassType 100003022
        Assert.AreEqual("Memory data (LWD)", fields[6]); // DataPackage 100003013
        Assert.AreEqual("TVD", fields[7]); // DepthType 100003028
        Assert.AreEqual("15/03/2024", fields[8]);
        Assert.AreEqual("Yes", fields[9]);
    }

    [TestMethod]
    [DataRow(true, "en", "Yes")]
    [DataRow(false, "en", "No")]
    [DataRow(true, "de", "Ja")]
    [DataRow(false, "de", "Nein")]
    [DataRow(true, "fr", "Oui")]
    [DataRow(false, "fr", "Non")]
    [DataRow(true, "it", "Sì")]
    [DataRow(false, "it", "No")]
    [DataRow(true, "xx", "Yes")]
    public async Task ExportLogFilesLocalizesPublicBoolean(bool isPublic, string locale, string expected)
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunAsync(borehole.Id, $"PUB-{locale}-{isPublic}");
        var logFile = await UploadTestLogFile(logRun.Id);
        logFile.Public = isPublic;
        Context.LogFiles.Update(logFile);
        await Context.SaveChangesAsync();

        var response = await controller.ExportLogFilesAsync([logFile.Id], withAttachments: false, locale: locale).ConfigureAwait(false);

        var fileResult = (FileContentResult)response;
        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read);
        var csv = ReadEntryAsText(archive.Entries.Single(e => e.FullName.StartsWith("log_files_")));
        var fields = csv.Split("\r\n", StringSplitOptions.RemoveEmptyEntries)[1].Split(';');
        Assert.AreEqual(expected, fields[9]);
    }

    [TestMethod]
    public async Task ExportLogFilesFromDifferentLogRunsReturnsBadRequest()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun1 = await AddTestLogRunAsync(borehole.Id, "LR1");
        var logRun2 = await AddTestLogRunAsync(borehole.Id, "LR2");
        var logFile1 = await UploadTestLogFile(logRun1.Id);
        var logFile2 = await UploadTestLogFile(logRun2.Id);

        var response = await controller.ExportLogFilesAsync([logFile1.Id, logFile2.Id], withAttachments: false, locale: "en").ConfigureAwait(false);

        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("All log files must belong to the same log run.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportLogFilesWithInexistentIdsReturnsNotFound()
    {
        var response = await controller.ExportLogFilesAsync([999_999_101, 999_999_102], withAttachments: false, locale: "en").ConfigureAwait(false);
        Assert.IsInstanceOfType(response, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task ExportLogFilesWithoutPermissionsReturnsUnauthorized()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);
        var logFile = await UploadTestLogFile(logRun.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", borehole.Id))
            .ReturnsAsync(false);

        var response = await controller.ExportLogFilesAsync([logFile.Id], withAttachments: false, locale: "en").ConfigureAwait(false);
        Assert.IsInstanceOfType(response, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task ExportLogFilesWithAttachmentsFailsWhenFileMissingInS3ReturnsProblem()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id, "MISS");
        var orphanFile = new LogFile
        {
            LogRunId = logRun.Id,
            Name = "missing.las",
            NameUuid = $"{Guid.NewGuid()}.las",
            Public = false,
        };
        Context.LogFiles.Add(orphanFile);
        await Context.SaveChangesAsync();

        var response = await controller.ExportLogFilesAsync([orphanFile.Id], withAttachments: true, locale: "en").ConfigureAwait(false);
        var objectResult = response as ObjectResult;
        Assert.IsNotNull(objectResult);
        var problem = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problem.Detail, "An error occurred while fetching a file from the cloud storage.");
    }

    // Helpers
    private async Task<LogRun> AddCompleteTestLogRunAsync(int boreholeId, string runNumber)
    {
        var logRun = new LogRun
        {
            BoreholeId = boreholeId,
            RunNumber = runNumber,
            FromDepth = 10,
            ToDepth = 20,
            BitSize = 80.97,
            RunDate = new DateOnly(2023, 6, 1),
            Comment = "Export test log run",
            ConveyanceMethodId = 100003000,
            BoreholeStatusId = 100003005,
            ServiceCo = "TestCo",
        };

        await Context.LogRuns.AddAsync(logRun);
        await Context.SaveChangesAsync();
        return logRun;
    }

    private async Task<LogFile> UploadTestLogFile(int logRunId)
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, TestFileName);
        var response = await logController.UploadAsync(formFile, logRunId);
        var okResult = (OkObjectResult)response;
        return (LogFile)okResult.Value!;
    }

    private async Task SetLogFileToolTypeCodesAsync(int logFileId, IEnumerable<int> codelistIds)
    {
        foreach (var codelistId in codelistIds)
        {
            Context.Add(new LogFileToolTypeCodes { LogFileId = logFileId, CodelistId = codelistId });
        }

        await Context.SaveChangesAsync();
    }

    private static string ReadEntryAsText(ZipArchiveEntry entry)
    {
        using var stream = entry.Open();
        using var reader = new StreamReader(stream, Encoding.UTF8);
        return reader.ReadToEnd();
    }
}
