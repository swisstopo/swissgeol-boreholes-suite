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
public class LogControllerTest : TestControllerBase
{
    private const string TestFileName = "test_logfile.las";
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
        var response = await controller.DownloadAsync(999999);
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
        var response = await controller.DownloadAsync(uploadedFile.Id);
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

        response = await controller.DownloadAsync(uploadedFile.Id);

        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
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
        Assert.AreEqual(3, firstLogRun.CreatedById);
        Assert.AreEqual(4, firstLogRun.UpdatedById);
        Assert.AreEqual(24000849, firstLogRun.Id);
        Assert.AreEqual("driver", firstLogRun.ServiceCo);
        Assert.AreEqual("R80", firstLogRun.RunNumber);
        Assert.AreEqual(0, firstLogRun.FromDepth);
        Assert.AreEqual(10, firstLogRun.ToDepth);
        Assert.AreEqual(1000085, firstLogRun.BoreholeId);
        Assert.AreEqual(5.8903691782105572, firstLogRun.BitSize);
        Assert.AreEqual(new DateOnly(2021, 4, 1), firstLogRun.RunDate);
        Assert.AreEqual("Odit enim vero ab eaque qui est ducimus reiciendis eligendi.", firstLogRun.Comment);
        Assert.AreEqual(100003002, firstLogRun.ConveyanceMethod.Id);
        Assert.AreEqual(100003005, firstLogRun.BoreholeStatus.Id);
        Assert.AreEqual(4, firstLogRun.LogFiles.Count);

        var logFile = firstLogRun.LogFiles!.OrderBy(f => f.Id).First();
        Assert.AreEqual(25002122, logFile.Id);
        Assert.AreEqual(24000849, logFile.LogRunId);
        Assert.AreEqual(4, logFile.CreatedById);
        Assert.AreEqual(1, logFile.UpdatedById);
        Assert.AreEqual("png.ecelp4800", logFile.Name);
        Assert.AreEqual(100003014, logFile.DataPackageId);
        Assert.AreEqual(100003029, logFile.DepthTypeId);
        Assert.AreEqual(100003021, logFile.PassTypeId);
        Assert.AreEqual(new DateOnly(2021, 7, 20), logFile.DeliveryDate);
        Assert.AreEqual("0d9b13e0-5ff0-5351-8a35-af2b6a8f9da5", logFile.NameUuid);
        Assert.AreEqual(true, logFile.Public);
        Assert.AreEqual(5, logFile.Pass);
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
        var logFile2 = await UploadTestLogFile(logRunId);

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
        await UploadTestLogFile(logRunId);
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
        var response = await controller.ExportAsync(request).ConfigureAwait(false);
        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("LogRunIds and LogFileIds should not be provided together.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportWithNeitherLogRunIdsNorLogFileIdsReturnsBadRequest()
    {
        var request = new LogExportRequest { WithAttachments = false };
        var response = await controller.ExportAsync(request).ConfigureAwait(false);
        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("No ids were provided.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportWithEmptyLogRunIdsReturnsBadRequest()
    {
        var request = new LogExportRequest { LogRunIds = [], WithAttachments = false };
        var response = await controller.ExportAsync(request).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);

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
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, "RUN-ATT");
        var uploadedFile = await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = true, Locale = "en" }).ConfigureAwait(false);

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
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, "RUN-CSV");
        var uploadedFile = await UploadTestLogFile(logRun.Id);

        // Add two tool type codes out of alphabetic order so we can verify sorting
        await SetLogFileToolTypeCodesAsync(uploadedFile.Id, [100003033, 100003032]);

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);
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
        Assert.AreEqual("10.00", fields[1]);
        Assert.AreEqual("20.00", fields[2]);
        Assert.AreEqual("CAL,GYRO", fields[3]); // Tool types have to be alphabetically sorted by Codelist.Code
        Assert.AreEqual("CH", fields[4]);
        Assert.AreEqual("01/06/2023", fields[5]);
        Assert.AreEqual("80.970", fields[6]);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun1.Id, logRun2.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);

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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);

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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun1.Id, logRun2.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);

        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("All log runs must belong to the same borehole.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportLogRunsWithInexistentIdsReturnsNotFound()
    {
        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [999_999_001, 999_999_002], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = false, Locale = locale }).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogRunIds = [logRun.Id], WithAttachments = true, Locale = "en" }).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);

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
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, "LF-ATT");
        var logFile = await UploadTestLogFile(logRun.Id);

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = true, Locale = "en" }).ConfigureAwait(false);

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

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);

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
        var logRun = await AddCompleteTestLogRunForExportAsync(borehole.Id, $"PUB-{locale}-{isPublic}");
        var logFile = await UploadTestLogFile(logRun.Id);
        logFile.Public = isPublic;
        Context.LogFiles.Update(logFile);
        await Context.SaveChangesAsync();

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = false, Locale = locale }).ConfigureAwait(false);

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

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile1.Id, logFile2.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);

        var badRequest = response as BadRequestObjectResult;
        Assert.IsNotNull(badRequest);
        Assert.AreEqual("All log files must belong to the same log run.", badRequest.Value);
    }

    [TestMethod]
    public async Task ExportLogFilesWithInexistentIdsReturnsNotFound()
    {
        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [999_999_101, 999_999_102], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [logFile.Id], WithAttachments = false, Locale = "en" }).ConfigureAwait(false);
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

        var response = await controller.ExportAsync(new LogExportRequest { LogFileIds = [orphanFile.Id], WithAttachments = true, Locale = "en" }).ConfigureAwait(false);
        var objectResult = response as ObjectResult;
        Assert.IsNotNull(objectResult);
        var problem = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problem.Detail, "An error occurred while fetching a file from the cloud storage.");
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

    private async Task<LogFile> UploadTestLogFile(int logRunId)
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, TestFileName);
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
