using Amazon.S3;
using BDMS.Models;
using BDMS.Services;
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
public class LogControllerTest : TestControllerBase
{
    private const string TestFileName = "test_logfile.las";
    private const string LogRunCsvPrefix = "log_runs_";
    private const string LogFileCsvPrefix = "log_files_";
    private User adminUser;
    private LogController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    private static int testBoreholeId = 1000085;

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
        controller = new LogController(Context, logControllerLoggerMock.Object, boreholePermissionServiceMock.Object, logFileCloudService) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await Context.DisposeAsync();

    [TestMethod]
    public async Task Upload()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);

        var fileName = TestFileName;
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.UploadAsync(file, logRun.Id);
        ActionResultAssert.IsOk(response);

        var logFile = Context.LogFiles.Single(f => f.Name == fileName);
        Assert.AreEqual(adminUser.SubjectId, logFile.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, logFile.CreatedById);
        Assert.AreEqual(adminUser.SubjectId, logFile.UpdatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, logFile.UpdatedById);
    }

    [TestMethod]
    public async Task DownloadUnknownFileReturnsNotFound()
    {
        var response = await controller.DownloadAsync(999999, CancellationToken.None);
        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task DownloadFailsWithoutPermissions()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);
        await UploadTestLogFile(logRun.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", logRun.BoreholeId))
            .ReturnsAsync(false);

        var uploadedFile = Context.LogFiles.Single(f => f.LogRunId == logRun.Id);
        var response = await controller.DownloadAsync(uploadedFile.Id, CancellationToken.None);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UploadAndDownload()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);

        var fileName = "another-log.las";
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.UploadAsync(file, logRun.Id);
        ActionResultAssert.IsOk(response);

        var uploadedFile = Context.LogFiles.Single(f => f.Name == fileName);

        response = await controller.DownloadAsync(uploadedFile.Id, CancellationToken.None);

        var fileStreamResult = (FileStreamResult)response;
        using var downloadReader = new StreamReader(fileStreamResult.FileStream);
        string contentResult = await downloadReader.ReadToEndAsync();
        Assert.AreEqual(content, contentResult);

        Assert.AreEqual(DateTime.UtcNow.Date, uploadedFile.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, uploadedFile.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, uploadedFile.CreatedById);

        var logFile = Context.LogFiles.Single(lf => lf.Id == uploadedFile.Id);
        Assert.AreEqual(DateTime.UtcNow.Date, logFile.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, logFile.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, logFile.CreatedById);
    }

    [TestMethod]
    public async Task UploadFailsWithoutPermissions()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", logRun.BoreholeId))
            .ReturnsAsync(false);

        var fileName = TestFileName;
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.UploadAsync(file, logRun.Id);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UploadReturnsNotFoundWithNonExistentLogRun()
    {
        var fileName = TestFileName;
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);
        var response = await controller.UploadAsync(file, 999999);
        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task UploadReturnsBadRequestWithoutFile()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);
        var response = await controller.UploadAsync(null, logRun.Id);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task UploadReturnsBadRequestWithFileTooLarge()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);

        var mockStream = new Mock<Stream>();
        mockStream.Setup(s => s.Length).Returns(5_000_000_001); // over the 5GB limit
        mockStream.Setup(s => s.Read(It.IsAny<byte[]>(), It.IsAny<int>(), It.IsAny<int>())).Returns(0);

        var formFile = new FormFile(mockStream.Object, 0, mockStream.Object.Length, "file", "testfile.las");
        var response = await controller.UploadAsync(formFile, logRun.Id);
        ActionResultAssert.IsInternalServerError(response, "RUN01 - testfile.las: File size exceeds maximum file size of 5000000000 bytes.");
    }

    [TestMethod]
    public async Task UploadReturnsBadRequestWithDuplicateFileName()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);
        await UploadTestLogFile(logRun.Id);

        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, TestFileName);
        var response = await controller.UploadAsync(formFile, logRun.Id);
        ActionResultAssert.IsBadRequest(response);

        var problemDetails = (ProblemDetails)((ObjectResult)response).Value!;
        StringAssert.Contains(problemDetails.Detail, $"A file named '{TestFileName}' already exists in this log run.");
    }

    [TestMethod]
    public async Task GetFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var response = await controller.GetAsync(Context.Boreholes.First().Id).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        var notFoundResponse = await controller.GetAsync(94578122).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(notFoundResponse.Result);
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeId()
    {
        var boreholeId = testBoreholeId;
        var response = await controller.GetAsync(boreholeId).ConfigureAwait(false);
        var logRuns = response.Value;

        Assert.IsNotNull(logRuns);
        Assert.IsTrue(logRuns.All(lr => lr.BoreholeId == boreholeId));
        Assert.AreEqual(10, logRuns.Count());

        var firstLogRun = logRuns.OrderBy(lr => lr.Id).First();
        Assert.AreEqual(24000850, firstLogRun.Id);
        Assert.AreEqual(4, firstLogRun.UpdatedById);
        Assert.AreEqual("R33", firstLogRun.RunNumber);
        Assert.AreEqual("Fresh", firstLogRun.ServiceCo);
        Assert.AreEqual(20, firstLogRun.ToDepth);
        Assert.AreEqual(1000085, firstLogRun.BoreholeId);
        Assert.AreEqual(new DateOnly(2021, 12, 15), firstLogRun.RunDate);
        Assert.AreEqual(2, firstLogRun.LogFiles.Count);

        var logFile = firstLogRun.LogFiles!.OrderBy(f => f.Id).First();
        Assert.AreEqual(25002126, logFile.Id);
        Assert.AreEqual(24000850, logFile.LogRunId);
        Assert.AreEqual(3, logFile.CreatedById);
        Assert.AreEqual(4, logFile.UpdatedById);
        Assert.AreEqual("awesome_rubber_towels.crd", logFile.Name);
        Assert.AreEqual(100003018, logFile.DataPackageId);
        Assert.IsNull(logFile.DepthTypeId);
        Assert.AreEqual(100003023, logFile.PassTypeId);
        Assert.IsNull(logFile.DeliveryDate);
        Assert.AreEqual("008c3b98-16b8-4359-0e1e-40d20d8afd07", logFile.NameUuid);
        Assert.AreEqual(true, logFile.Public);
        Assert.IsNull(logFile.Pass);
        Assert.AreEqual(1, logFile.ToolTypeCodelistIds.Count);
        Assert.AreEqual(100003032, logFile.ToolTypeCodelistIds.First());
    }

    [TestMethod]
    public async Task CreateLogRun()
    {
        var logRun = new LogRun
        {
            BoreholeId = testBoreholeId,
            RunNumber = "RUN-001",
            FromDepth = 10,
            ToDepth = 20,
            BitSize = 80.97,
            RunDate = new DateOnly(2023, 5, 30),
            Comment = "Test log run",
            ConveyanceMethodId = 100003000,
            BoreholeStatusId = 100003005,
        };

        var response = await controller.CreateAsync(logRun);
        ActionResultAssert.IsOk(response.Result);

        var updatedLogRun = Context.LogRunsWithIncludes.SingleOrDefault(x => x.Id == logRun.Id);
        Assert.IsNotNull(updatedLogRun);
        Assert.AreEqual("RUN-001", updatedLogRun.RunNumber);
        Assert.AreEqual(10, updatedLogRun.FromDepth);
        Assert.AreEqual(20, updatedLogRun.ToDepth);
        Assert.AreEqual(80.97, updatedLogRun.BitSize);
        Assert.AreEqual(100003000, updatedLogRun.ConveyanceMethod.Id);
        Assert.AreEqual(100003005, updatedLogRun.BoreholeStatus.Id);
        Assert.AreEqual(new DateOnly(2023, 5, 30), updatedLogRun.RunDate);
    }

    [TestMethod]
    public async Task CreateFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var response = await controller.CreateAsync(new LogRun { BoreholeId = testBoreholeId });
        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        var objectResult = (ObjectResult)response.Result;
        var problemDetails = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problemDetails.Detail, "The borehole is locked by another user or you are missing permissions.");
    }

    [TestMethod]
    public async Task DeleteLogRun()
    {
        var logRunId = await CreateCompleteLogRunAsync();
        var logFile1 = await UploadTestLogFile(logRunId);
        var logFile2 = await UploadTestLogFile(logRunId, "test_logfile_2.las");

        var response = await controller.DeleteAsync(logRunId);
        ActionResultAssert.IsOk(response);

        response = await controller.DeleteAsync(logRunId);
        ActionResultAssert.IsNotFound(response);

        Assert.AreEqual(null, Context.LogRuns.SingleOrDefault(x => x.Id == logRunId));
        Assert.IsFalse(Context.LogFiles.Any(lf => lf.Id == logFile1.Id));
        Assert.IsFalse(Context.LogFiles.Any(lf => lf.Id == logFile2.Id));
    }

    [TestMethod]
    public async Task DeleteMultipleLogRuns()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun1 = await AddTestLogRunAsync(borehole.Id);
        var logRun2 = await AddTestLogRunAsync(borehole.Id, "RUN02");

        Assert.AreEqual(2, Context.LogRuns.Count(lr => lr.BoreholeId == borehole.Id));

        var response = await controller.DeleteMultipleAsync([logRun1.Id, logRun2.Id]);
        ActionResultAssert.IsOk(response);

        Assert.AreEqual(0, Context.LogRuns.Count(lr => lr.BoreholeId == borehole.Id));
    }

    [TestMethod]
    public async Task DeleteFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var logRunId = await CreateCompleteLogRunAsync();
        var response = await controller.DeleteAsync(logRunId);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task DeleteWithInexistentId()
    {
        var response = await controller.DeleteAsync(9815784);
        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task EditLogRun()
    {
        var logRunId = await CreateCompleteLogRunAsync();
        var logFile1 = await UploadTestLogFile(logRunId);
        await UploadTestLogFile(logRunId, "test_logfile_2.las");
        var initialLogRun = Context.LogRuns.SingleOrDefault(x => x.Id == logRunId);
        Assert.IsNotNull(initialLogRun);
        Assert.AreEqual(2, initialLogRun.LogFiles.Count);

        logFile1.PassTypeId = 100003022;
        logFile1.Pass = 2;
        logFile1.DataPackageId = 100003013;
        logFile1.DeliveryDate = new DateOnly(2023, 6, 1);
        logFile1.DepthTypeId = 100003028;
        logFile1.ToolTypeCodelistIds = new List<int> { 100003032, 100003033 };
        logFile1.Public = true;

        var changedLogRun = new LogRun
        {
            Id = logRunId,
            BoreholeId = testBoreholeId,
            RunNumber = "RUN-002",
            FromDepth = 30,
            ToDepth = 40,
            BitSize = 100,
            RunDate = new DateOnly(2022, 4, 29),
            Comment = "Updated test log run",
            ConveyanceMethodId = 100003001,
            BoreholeStatusId = 100003006,
            LogFiles = new List<LogFile> { logFile1 },
        };

        var response = await controller.EditAsync(changedLogRun);
        ActionResultAssert.IsOk(response.Result);

        var updatedLogRun = Context.LogRuns.SingleOrDefault(x => x.Id == logRunId);
        Assert.IsNotNull(updatedLogRun);
        Assert.AreEqual("RUN-002", updatedLogRun.RunNumber);
        Assert.AreEqual(30, updatedLogRun.FromDepth);
        Assert.AreEqual(40, updatedLogRun.ToDepth);
        Assert.AreEqual(100, updatedLogRun.BitSize);
        Assert.AreEqual(new DateOnly(2022, 4, 29), updatedLogRun.RunDate);
        Assert.AreEqual("Updated test log run", updatedLogRun.Comment);
        Assert.AreEqual(100003001, updatedLogRun.ConveyanceMethodId);
        Assert.AreEqual(100003006, updatedLogRun.BoreholeStatusId);
        Assert.AreEqual(1, updatedLogRun.LogFiles.Count);
        var updatedLogFile1 = updatedLogRun.LogFiles.First();
        Assert.AreEqual(logFile1.Id, updatedLogFile1.Id);
        Assert.AreEqual(100003022, updatedLogFile1.PassTypeId);
        Assert.AreEqual(2, updatedLogFile1.Pass);
        Assert.AreEqual(100003013, updatedLogFile1.DataPackageId);
        Assert.AreEqual(new DateOnly(2023, 6, 1), updatedLogFile1.DeliveryDate);
        Assert.AreEqual(100003028, updatedLogFile1.DepthTypeId);
        CollectionAssert.AreEqual(new List<int> { 100003032, 100003033 }, updatedLogFile1.LogFileToolTypeCodes.Select(c => c.CodelistId).ToList());
        Assert.AreEqual(true, updatedLogFile1.Public);

        updatedLogFile1.ToolTypeCodelistIds = new List<int> { 100003033, 100003043 };
        updatedLogRun.LogFiles = new List<LogFile> { updatedLogFile1 };
        response = await controller.EditAsync(updatedLogRun);
        ActionResultAssert.IsOk(response.Result);
        updatedLogRun = Context.LogRuns.SingleOrDefault(x => x.Id == logRunId);
        Assert.AreEqual(1, updatedLogRun.LogFiles.Count);
        CollectionAssert.AreEqual(new List<int> { 100003033, 100003043 }, updatedLogRun.LogFiles.First().LogFileToolTypeCodes.Select(c => c.CodelistId).ToList());
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9815784;
        var logRun = new LogRun
        {
            Id = id,
            BoreholeId = testBoreholeId,
        };

        var response = await controller.EditAsync(logRun);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutContentReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task EditFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var response = await controller.EditAsync(new LogRun { Id = 561227, BoreholeId = testBoreholeId });
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task EditWithExistingRunNumber()
    {
        var borehole = await AddTestBoreholeAsync();
        await AddTestLogRunAsync(borehole.Id, "Number1");
        var logRun2 = await AddTestLogRunAsync(borehole.Id, "Number2");

        logRun2.RunNumber = "Number1";

        var createResult = await controller.EditAsync(logRun2);
        ActionResultAssert.IsInternalServerError(createResult.Result, "Run number must be unique");
    }

    [TestMethod]
    public async Task CreateWithExistingRunNumber()
    {
        var borehole = await AddTestBoreholeAsync();
        await AddTestLogRunAsync(borehole.Id, "RUN01");

        var logRun = new LogRun
        {
            BoreholeId = borehole.Id,
            RunNumber = "RUN01",
            FromDepth = 0,
            ToDepth = 100,
        };

        var createResult = await controller.CreateAsync(logRun);
        ActionResultAssert.IsInternalServerError(createResult.Result, "Run number must be unique");
    }

    // Export tests
    [TestMethod]
    public async Task ExportWithBothLogRunIdsAndLogFileIdsReturnsBadRequest()
    {
        var request = new LogExportRequest { LogRunIds = [1], LogFileIds = [1], WithAttachments = false };
        var response = await controller.ExportAsync(request, CancellationToken.None).ConfigureAwait(false);
        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("LogRunIds and LogFileIds should not be provided together.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportWithNeitherLogRunIdsNorLogFileIdsReturnsBadRequest()
    {
        var request = new LogExportRequest { WithAttachments = false };
        var response = await controller.ExportAsync(request, CancellationToken.None).ConfigureAwait(false);
        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("No ids were provided.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportWithEmptyLogRunIdsReturnsBadRequest()
    {
        var request = new LogExportRequest { LogRunIds = [], WithAttachments = false };
        var response = await controller.ExportAsync(request, CancellationToken.None).ConfigureAwait(false);
        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("No ids were provided.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportLogRunsWithoutAttachments()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, "RUN-A");
        await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);

        var fileResult = response as StreamedZipResult;
        Assert.IsNotNull(fileResult);
        StringAssert.StartsWith(fileResult.FileName, "log_export_");
        StringAssert.EndsWith(fileResult.FileName, ".zip");

        // The zip content type is asserted inside ExecuteZipResultAsync for every export test.
        using var archive = await ExecuteZipResultAsync(response);

        // Expect exactly 2 entries (log_runs CSV + log_files CSV), no attachment
        Assert.AreEqual(2, archive.Entries.Count);
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith(LogRunCsvPrefix) && e.FullName.EndsWith(".csv")));
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith(LogFileCsvPrefix) && e.FullName.EndsWith(".csv")));
    }

    [TestMethod]
    public async Task ExportLogRunsWithAttachments()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, "RUN-ATT");
        var uploadedFile = await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = true, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);

        using var archive = await ExecuteZipResultAsync(response);

        // 2 CSVs + 1 attachment
        Assert.AreEqual(3, archive.Entries.Count);
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith(LogRunCsvPrefix) && e.FullName.EndsWith(".csv")));
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith(LogFileCsvPrefix) && e.FullName.EndsWith(".csv")));
        Assert.IsTrue(archive.Entries.Any(e => e.FullName == $"RUN-ATT/{uploadedFile.Name}"));
    }

    [TestMethod]
    public async Task ExportLogRunsCsvHeadersAndContent()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, "RUN-CSV");
        var uploadedFile = await UploadTestLogFile(logRun.Id);

        // Add two tool type codes out of alphabetic order so we can verify sorting
        await SetLogFileToolTypeCodesAsync(uploadedFile.Id, [100003033, 100003032]);

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);
        using var archive = await ExecuteZipResultAsync(response);

        var logRunCsvEntry = archive.Entries.Single(e => e.FullName.StartsWith(LogRunCsvPrefix));
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
        Assert.AreEqual("01.06.2023", fields[5]);
        Assert.AreEqual("80.97", fields[6]);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun1.Id, logRun2.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);

        using var archive = await ExecuteZipResultAsync(response);
        var logRunCsvEntry = archive.Entries.Single(e => e.FullName.StartsWith(LogRunCsvPrefix));
        var logRunCsv = ReadEntryAsText(logRunCsvEntry);

        var lines = logRunCsv.Split("\r\n", StringSplitOptions.RemoveEmptyEntries);
        Assert.AreEqual(3, lines.Length); // header + 2 data rows
    }

    [TestMethod]
    public async Task ExportLogRunsWithoutLogFilesOmitsLogFileCsv()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id, "NO-FILES");

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);

        using var archive = await ExecuteZipResultAsync(response);

        Assert.AreEqual(1, archive.Entries.Count);
        Assert.IsTrue(archive.Entries.Single().FullName.StartsWith(LogRunCsvPrefix));
        Assert.IsFalse(archive.Entries.Any(e => e.FullName.StartsWith(LogFileCsvPrefix)));
    }

    [TestMethod]
    public async Task ExportLogRunsFromDifferentBoreholesReturnsBadRequest()
    {
        var borehole1 = await AddTestBoreholeAsync();
        var borehole2 = await AddTestBoreholeAsync();
        var logRun1 = await AddTestLogRunAsync(borehole1.Id, "A1");
        var logRun2 = await AddTestLogRunAsync(borehole2.Id, "B1");

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun1.Id, logRun2.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);

        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("All log runs must belong to the same borehole.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportLogRunsWithInexistentIdsReturnsNotFound()
    {
        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [999_999_001, 999_999_002], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);
        Assert.IsInstanceOfType(response, typeof(UnauthorizedResult));
    }

    [TestMethod]
    [DataRow("en", "not specified", "other")]
    [DataRow("de", "keine Angabe", "anderer")]
    [DataRow("fr", "sans indication", "autre")]
    [DataRow("it", "senza indicazioni", "altro")]
    [DataRow("xx", "not specified", "other")] // unknown locale falls back to en
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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = locale }, CancellationToken.None).ConfigureAwait(false);
        using var archive = await ExecuteZipResultAsync(response);
        var logRunCsvEntry = archive.Entries.Single(e => e.FullName.StartsWith(LogRunCsvPrefix));
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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = true, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);
        var objectResult = response as ObjectResult;
        Assert.IsNotNull(objectResult);
        var problem = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problem.Detail, "An error occurred while fetching a file from the cloud storage.");
    }

    [TestMethod]
    public async Task ExportLogFilesWithoutAttachments()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, "LF-01");
        var logFile = await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);

        using var archive = await ExecuteZipResultAsync(response);

        Assert.AreEqual(2, archive.Entries.Count);
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith(LogRunCsvPrefix) && e.FullName.EndsWith(".csv")));
        Assert.IsTrue(archive.Entries.Any(e => e.FullName.StartsWith(LogFileCsvPrefix) && e.FullName.EndsWith(".csv")));
    }

    [TestMethod]
    public async Task ExportLogFilesWithAttachments()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, "LF-ATT");
        var logFile = await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = true, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);

        using var archive = await ExecuteZipResultAsync(response);
        Assert.AreEqual(3, archive.Entries.Count);
        Assert.IsNotNull(archive.Entries.SingleOrDefault(e => e.FullName == $"LF-ATT/{logFile.Name}"));
    }

    [TestMethod]
    public async Task ExportLogFilesCsvContent()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, "LF-CSV");
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

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);

        using var archive = await ExecuteZipResultAsync(response);
        var logFileCsv = ReadEntryAsText(archive.Entries.Single(e => e.FullName.StartsWith(LogFileCsvPrefix)));

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
        Assert.AreEqual("15.03.2024", fields[8]);
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
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, $"PUB-{locale}-{isPublic}");
        var logFile = await UploadTestLogFile(logRun.Id);
        logFile.Public = isPublic;
        Context.LogFiles.Update(logFile);
        await Context.SaveChangesAsync();

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = false, Locale = locale }, CancellationToken.None).ConfigureAwait(false);

        using var archive = await ExecuteZipResultAsync(response);
        var csv = ReadEntryAsText(archive.Entries.Single(e => e.FullName.StartsWith(LogFileCsvPrefix)));
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

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile1.Id, logFile2.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);

        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("All log files must belong to the same log run.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportLogFilesWithInexistentIdsReturnsNotFound()
    {
        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [999_999_101, 999_999_102], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = false, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [orphanFile.Id], WithAttachments = true, Locale = "en" }, CancellationToken.None).ConfigureAwait(false);
        var objectResult = response as ObjectResult;
        Assert.IsNotNull(objectResult);
        var problem = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problem.Detail, "An error occurred while fetching a file from the cloud storage.");
    }

    // Import tests
    private static List<LogImportResultItem> AssertImportOk(IActionResult response)
    {
        var okResult = (OkObjectResult)response;
        return (List<LogImportResultItem>)okResult.Value!;
    }

    [TestMethod]
    public async Task ImportWithoutAnyCsvReturnsBadRequest()
    {
        var borehole = await AddTestBoreholeAsync();

        var response = await controller.ImportAsync(borehole.Id, null, null, []);

        Assert.IsInstanceOfType(response, typeof(BadRequestObjectResult));
    }

    /// <summary>
    /// Reads the message key out of the anonymous body a refused import returns.
    /// </summary>
    private static string AssertBadRequestMessageKey(IActionResult response)
    {
        Assert.IsInstanceOfType(response, typeof(BadRequestObjectResult));
        var value = ((BadRequestObjectResult)response).Value!;
        var messageKey = value.GetType().GetProperty("messageKey")!.GetValue(value);
        return (string)messageKey!;
    }

    [TestMethod]
    public async Task ImportWithMissingRunColumnReturnsBadRequest()
    {
        var borehole = await AddTestBoreholeAsync();
        var csvFile = GetFormFileByContent("RunNumber;FromDepth\nRUN-1;10\n", "log_runs.csv");

        var response = await controller.ImportAsync(borehole.Id, csvFile, null, []);

        Assert.AreEqual("importErrorMissingRunColumns", AssertBadRequestMessageKey(response));
    }

    [TestMethod]
    public async Task ImportWithMissingFileColumnNamesTheLogFilesCsv()
    {
        var borehole = await AddTestBoreholeAsync();
        var runsCsvFile = GetFormFileByContent("RunNumber;FromDepth;ToDepth\nRUN-A;10;20\n", "log_runs.csv");
        var filesCsvFile = GetFormFileByContent("RunNumber\nRUN-A\n", "log_files.csv");

        var response = await controller.ImportAsync(borehole.Id, runsCsvFile, filesCsvFile, []);

        Assert.AreEqual("importErrorMissingFileColumns", AssertBadRequestMessageKey(response));
    }

    [TestMethod]
    public async Task ImportAddsRuns()
    {
        var borehole = await AddTestBoreholeAsync();
        var csvFile = GetFormFileByContent("RunNumber;FromDepth;ToDepth\nRUN-A;10;20\n", "log_runs.csv");

        var items = AssertImportOk(await controller.ImportAsync(borehole.Id, csvFile, null, []));

        var item = items.Single();
        Assert.AreEqual(LogImportOutcome.Added, item.Outcome);
        Assert.IsNotNull(item.LogRunId);
        Assert.IsTrue(Context.LogRuns.Any(lr => lr.Id == item.LogRunId));
    }

    [TestMethod]
    public async Task ImportReportsAnInvalidRowAndStillWritesTheValidOne()
    {
        var borehole = await AddTestBoreholeAsync();
        var csv = "RunNumber;FromDepth;ToDepth\nRUN-A;10;20\nRUN-B;10;nonsense\n";
        var csvFile = GetFormFileByContent(csv, "log_runs.csv");

        var items = AssertImportOk(await controller.ImportAsync(borehole.Id, csvFile, null, []));

        Assert.AreEqual(LogImportOutcome.Added, items[0].Outcome);
        Assert.AreEqual(LogImportOutcome.Error, items[1].Outcome);
        Assert.IsTrue(Context.LogRuns.Any(lr => lr.BoreholeId == borehole.Id && lr.RunNumber == "RUN-A"));
        Assert.IsFalse(Context.LogRuns.Any(lr => lr.BoreholeId == borehole.Id && lr.RunNumber == "RUN-B"));
    }

    [TestMethod]
    public async Task ImportRunTwiceReportsAlreadyExistsAndWritesOnce()
    {
        var borehole = await AddTestBoreholeAsync();
        var csv = "RunNumber;FromDepth;ToDepth\nRUN-A;10;20\n";

        AssertImportOk(await controller.ImportAsync(borehole.Id, GetFormFileByContent(csv, "log_runs.csv"), null, []));
        var items = AssertImportOk(await controller.ImportAsync(borehole.Id, GetFormFileByContent(csv, "log_runs.csv"), null, []));

        Assert.AreEqual(LogImportOutcome.AlreadyExists, items.Single().Outcome);
        Assert.AreEqual(1, Context.LogRuns.Count(lr => lr.BoreholeId == borehole.Id && lr.RunNumber == "RUN-A"));
    }

    [TestMethod]
    public async Task ImportFilesOnlyAgainstAStoredRun()
    {
        var borehole = await AddTestBoreholeAsync();
        var runsCsv = GetFormFileByContent("RunNumber;FromDepth;ToDepth\nRUN-A;10;20\n", "log_runs.csv");
        AssertImportOk(await controller.ImportAsync(borehole.Id, runsCsv, null, []));

        var filesCsv = GetFormFileByContent("RunNumber;Name;Extension\nRUN-A;alpha;las\n", "log_files.csv");
        var items = AssertImportOk(await controller.ImportAsync(borehole.Id, null, filesCsv, ["RUN-A/alpha.las"]));

        var item = items.Single();
        Assert.AreEqual(LogImportOutcome.Added, item.Outcome);
        Assert.IsNotNull(item.LogFileId);

        var stored = Context.LogFiles.Single(lf => lf.Id == item.LogFileId);
        Assert.AreEqual("alpha.las", stored.Name);
        Assert.IsNull(stored.NameUuid);
    }

    [TestMethod]
    public async Task ImportFileWithoutItsAttachmentIsSkipped()
    {
        var borehole = await AddTestBoreholeAsync();
        var runsCsv = GetFormFileByContent("RunNumber;FromDepth;ToDepth\nRUN-A;10;20\n", "log_runs.csv");
        var filesCsv = GetFormFileByContent("RunNumber;Name;Extension\nRUN-A;alpha;las\n", "log_files.csv");

        var items = AssertImportOk(await controller.ImportAsync(borehole.Id, runsCsv, filesCsv, []));

        var fileItem = items.Single(i => i.Type == LogImportItemType.File);
        Assert.AreEqual(LogImportOutcome.SkippedIncomplete, fileItem.Outcome);
        Assert.IsFalse(Context.LogFiles.Any(lf => lf.Name == "alpha.las"));
    }

    [TestMethod]
    public async Task ImportCompletesAFileThatIsStillWaitingForItsAttachment()
    {
        var borehole = await AddTestBoreholeAsync();
        var runsCsv = GetFormFileByContent("RunNumber;FromDepth;ToDepth\nRUN-A;10;20\n", "log_runs.csv");
        var filesCsv = GetFormFileByContent("RunNumber;Name;Extension\nRUN-A;alpha;las\n", "log_files.csv");
        var first = AssertImportOk(await controller.ImportAsync(borehole.Id, runsCsv, filesCsv, ["RUN-A/alpha.las"]));
        var logFileId = first.Single(i => i.Type == LogImportItemType.File).LogFileId;

        var again = GetFormFileByContent("RunNumber;Name;Extension\nRUN-A;alpha;las\n", "log_files.csv");
        var items = AssertImportOk(await controller.ImportAsync(borehole.Id, null, again, ["RUN-A/alpha.las"]));

        var item = items.Single();
        Assert.AreEqual(LogImportOutcome.Added, item.Outcome);
        Assert.AreEqual(logFileId, item.LogFileId);
        Assert.AreEqual(1, Context.LogFiles.Count(lf => lf.Name == "alpha.las"));
    }

    [TestMethod]
    public async Task ImportReportsTheCorrectIdForEachAddedFile()
    {
        var borehole = await AddTestBoreholeAsync();
        var storedRun = await AddTestLogRunAsync(borehole.Id, "RUN-STORED");

        // Already stored with an attachment: a row naming it must be reported AlreadyExists.
        var existingWithAttachment = new LogFile { LogRunId = storedRun.Id, Name = "existing.las", NameUuid = $"{Guid.NewGuid()}.las", Public = false };

        // Stored by an earlier import but still waiting for its attachment (NameUuid == null).
        var waitingForAttachment = new LogFile { LogRunId = storedRun.Id, Name = "waiting.las", Public = false };
        Context.LogFiles.AddRange(existingWithAttachment, waitingForAttachment);
        await Context.SaveChangesAsync();

        var runsCsv = GetFormFileByContent("RunNumber;FromDepth;ToDepth\nRUN-NEW;10;20\n", "log_runs.csv");
        var filesCsv = GetFormFileByContent(
            "RunNumber;Name;Extension\n" +
            "RUN-NEW;first;las\n" +
            "RUN-NEW;second;las\n" +
            "RUN-STORED;waiting;las\n" +
            "RUN-STORED;existing;las\n" +
            "RUN-STORED;missing;las\n",
            "log_files.csv");

        var providedAttachmentNames = new[]
        {
            "RUN-NEW/first.las",
            "RUN-NEW/second.las",
            "RUN-STORED/waiting.las",
            "RUN-STORED/existing.las",

            // "RUN-STORED/missing.las" is deliberately not provided.
        };

        var items = AssertImportOk(await controller.ImportAsync(borehole.Id, runsCsv, filesCsv, providedAttachmentNames));

        var fileItems = items.Where(i => i.Type == LogImportItemType.File).ToList();
        Assert.AreEqual(5, fileItems.Count);

        var newRun = Context.LogRuns.Single(lr => lr.BoreholeId == borehole.Id && lr.RunNumber == "RUN-NEW");

        var firstItem = fileItems.Single(i => i.Identifier == "RUN-NEW / first.las");
        var secondItem = fileItems.Single(i => i.Identifier == "RUN-NEW / second.las");
        var waitingItem = fileItems.Single(i => i.Identifier == "RUN-STORED / waiting.las");
        var existingItem = fileItems.Single(i => i.Identifier == "RUN-STORED / existing.las");
        var missingItem = fileItems.Single(i => i.Identifier == "RUN-STORED / missing.las");

        Assert.AreEqual(LogImportOutcome.Added, firstItem.Outcome);
        Assert.AreEqual(LogImportOutcome.Added, secondItem.Outcome);
        Assert.AreEqual(LogImportOutcome.Added, waitingItem.Outcome);
        Assert.AreEqual(LogImportOutcome.AlreadyExists, existingItem.Outcome);
        Assert.AreEqual(LogImportOutcome.SkippedIncomplete, missingItem.Outcome);

        Assert.AreEqual(newRun.Id, firstItem.LogRunId);
        Assert.AreEqual(newRun.Id, secondItem.LogRunId);
        Assert.AreNotEqual(firstItem.LogFileId, secondItem.LogFileId);

        // The completing file must carry the id its stored record already had, not a fresh one.
        Assert.AreEqual(waitingForAttachment.Id, waitingItem.LogFileId);
        Assert.AreEqual(storedRun.Id, waitingItem.LogRunId);

        // The point of the test: every Added file item's id must resolve to the row with the
        // matching name on the matching run, so a regression that dequeues the wrong pending file
        // (e.g. per Added item instead of per file item still needing a fresh id) fails loudly.
        foreach (var item in fileItems.Where(i => i.Outcome == LogImportOutcome.Added))
        {
            var expectedName = item.Identifier.Split(" / ")[1];
            var stored = Context.LogFiles.Single(lf => lf.Id == item.LogFileId);
            Assert.AreEqual(expectedName, stored.Name);
            Assert.AreEqual(item.LogRunId, stored.LogRunId);
        }

        // No duplicate was written for the completing file, and the skipped row wrote nothing.
        Assert.AreEqual(4, Context.LogFiles.Count(lf => lf.LogRun.BoreholeId == borehole.Id));
    }

    [TestMethod]
    public async Task ImportForUnknownBoreholeReturnsNotFound()
    {
        var csvFile = GetFormFileByContent("RunNumber;FromDepth;ToDepth\nRUN-A;10;20\n", "log_runs.csv");

        var response = await controller.ImportAsync(99999999, csvFile, null, []);

        Assert.IsInstanceOfType(response, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task ImportWithoutEditPermissionReturnsUnauthorized()
    {
        var borehole = await AddTestBoreholeAsync();
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", borehole.Id))
            .ReturnsAsync(false);

        var csvFile = GetFormFileByContent("RunNumber;FromDepth;ToDepth\nUNAUTH-01;10;20\n", "log_runs.csv");
        var response = await controller.ImportAsync(borehole.Id, csvFile, null, []);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UploadWithLogFileIdLinksToExistingLogFile()
    {
        const string importedFileName = "imported_file.las";
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);

        var nameUuid = $"{Guid.NewGuid()}.las";
        var logFile = new LogFile { LogRunId = logRun.Id, Name = importedFileName, NameUuid = nameUuid, Public = false };
        Context.LogFiles.Add(logFile);
        await Context.SaveChangesAsync();

        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, importedFileName);

        var uploadResponse = await controller.UploadAsync(file, logRun.Id, logFile.Id);
        ActionResultAssert.IsOk(uploadResponse);

        var updatedLogFile = Context.LogFiles.Single(f => f.Id == logFile.Id);
        Assert.AreEqual(importedFileName, updatedLogFile.Name);
        Assert.AreEqual(nameUuid, updatedLogFile.NameUuid, "NameUuid should not change because the upload links to the existing LogFile.");

        // Verify the upload actually linked the bytes to the existing LogFile by downloading them back.
        var downloadResponse = await controller.DownloadAsync(updatedLogFile.Id, CancellationToken.None);
        var downloadedFile = (FileStreamResult)downloadResponse;
        Assert.AreEqual(importedFileName, downloadedFile.FileDownloadName);
        using var downloadedReader = new StreamReader(downloadedFile.FileStream);
        Assert.AreEqual(content, await downloadedReader.ReadToEndAsync());
    }

    [TestMethod]
    public async Task UploadWithInvalidLogFileIdReturnsNotFound()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = await AddTestLogRunAsync(borehole.Id);

        var file = GetFormFileByContent("content", "test.las");
        var response = await controller.UploadAsync(file, logRun.Id, 99999999);
        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task DeleteIncompleteLogFileRemovesTheRecord()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = new LogRun { BoreholeId = borehole.Id, RunNumber = "RUN-DEL", FromDepth = 0, ToDepth = 1 };
        Context.LogRuns.Add(logRun);
        await Context.SaveChangesAsync();

        var logFile = new LogFile { LogRunId = logRun.Id, Name = "waiting.las", NameUuid = null, Public = false };
        Context.LogFiles.Add(logFile);
        await Context.SaveChangesAsync();

        var response = await controller.DeleteLogFileAsync(logFile.Id);

        Assert.IsInstanceOfType(response, typeof(OkResult));
        Assert.IsFalse(Context.LogFiles.Any(lf => lf.Id == logFile.Id));
    }

    [TestMethod]
    public async Task DeleteLogFileRefusesARecordThatHasItsAttachment()
    {
        var borehole = await AddTestBoreholeAsync();
        var logRun = new LogRun { BoreholeId = borehole.Id, RunNumber = "RUN-KEEP", FromDepth = 0, ToDepth = 1 };
        Context.LogRuns.Add(logRun);
        await Context.SaveChangesAsync();

        var logFile = new LogFile { LogRunId = logRun.Id, Name = "stored.las", NameUuid = "object-key.las", Public = false };
        Context.LogFiles.Add(logFile);
        await Context.SaveChangesAsync();

        var response = await controller.DeleteLogFileAsync(logFile.Id);

        Assert.IsInstanceOfType(response, typeof(ObjectResult));
        Assert.IsTrue(Context.LogFiles.Any(lf => lf.Id == logFile.Id));
    }

    [TestMethod]
    public async Task DeleteLogFileForUnknownIdReturnsNotFound()
    {
        var response = await controller.DeleteLogFileAsync(99999999);

        Assert.IsInstanceOfType(response, typeof(NotFoundObjectResult));
    }

    // Helpers
    private async Task<int> CreateCompleteLogRunAsync()
    {
        var logRun = new LogRun
        {
            BoreholeId = testBoreholeId,
            RunNumber = "RUN-001",
            FromDepth = 10,
            ToDepth = 20,
            BitSize = 80.97,
            RunDate = new DateOnly(2023, 5, 30),
            Comment = "Test log run",
            ConveyanceMethodId = 100003000,
            BoreholeStatusId = 100003005,
        };
        await Context.AddAsync(logRun);
        await Context.SaveChangesAsync();
        return logRun.Id;
    }

    private async Task<LogRun> AddCompleteTestLogRunForExportAsync(int boreholeId, string runNumber)
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

    private async Task<LogFile> UploadTestLogFile(int logRunId, string? fileName = null)
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, fileName ?? TestFileName);
        var response = await controller.UploadAsync(formFile, logRunId);
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
