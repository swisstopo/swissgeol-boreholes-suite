using Amazon.S3;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.ObjectModel;
using System.Security.Claims;
using System.Text;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class LogFileControllerTest
{
    private BdmsContext context;
    private User adminUser;
    private LogFileCloudService logFileCloudService;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;
    private LogFileController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.GetTestContext();
        adminUser = context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");

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
        logFileCloudService = new LogFileCloudService(logFileCloudServiceLoggerMock.Object, s3ClientMock,  configuration, contextAccessorMock.Object, context);

        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();

        var logFileControllerLoggerMock = new Mock<ILogger<LogFileController>>(MockBehavior.Strict);
        logFileControllerLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        controller = new LogFileController(context, logFileControllerLoggerMock.Object, boreholePermissionServiceMock.Object, logFileCloudService);
        controller.ControllerContext = GetControllerContextAdmin();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Mock.VerifyAll();
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task Upload()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);

        var fileName = "test_logfile.las";
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.UploadAsync(file, logRun.Id);
        ActionResultAssert.IsOk(response);

        var logFile = context.LogFiles.Single(f => f.Name == fileName);
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
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        await UploadTestLogFile(logRun.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", logRun.BoreholeId))
            .ReturnsAsync(false);

        var uploadedFile = context.LogFiles.Single(f => f.LogRunId == logRun.Id);
        var response = await controller.DownloadAsync(uploadedFile.Id);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UploadAndDownload()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);

        var fileName = "another-log.las";
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.UploadAsync(file, logRun.Id);
        ActionResultAssert.IsOk(response);

        var uploadedFile = context.LogFiles.Single(f => f.Name == fileName);

        response = await controller.DownloadAsync(uploadedFile.Id);

        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
        Assert.AreEqual(content, contentResult);

        Assert.AreEqual(DateTime.UtcNow.Date, uploadedFile.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, uploadedFile.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, uploadedFile.CreatedById);

        var logFile = context.LogFiles.Single(lf => lf.Id == uploadedFile.Id);
        Assert.AreEqual(DateTime.UtcNow.Date, logFile.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, logFile.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, logFile.CreatedById);
    }

    [TestMethod]
    public async Task UploadFailsWithoutPermissions()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", logRun.BoreholeId))
            .ReturnsAsync(false);

        var fileName = "test_logfile.las";
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.UploadAsync(file, logRun.Id);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UploadReturnsNotFoundWithNonExistentLogRun()
    {
        var fileName = "test_logfile.las";
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);
        var response = await controller.UploadAsync(file, 999999);
        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task UploadReturnsBadRequestWithoutFile()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var response = await controller.UploadAsync(null, logRun.Id);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task UploadReturnsBadRequestWithFileToLarge()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);

        long targetSizeInBytes = 210 * 1024 * 1024; // 210MB
        byte[] content = new byte[targetSizeInBytes];
        var stream = new MemoryStream(content);

        var formFile = new FormFile(stream, 0, stream.Length, "file", "testfile.las");
        var response = await controller.UploadAsync(formFile, logRun.Id);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task GetAllForLogRun()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        await UploadTestLogFile(logRun.Id);

        var response = await controller.GetAllForLogRunAsync(logRun.Id);
        Assert.IsNotNull(response.Value);
        Assert.AreEqual(1, response.Value.Count());
    }

    [TestMethod]
    public async Task GetAllFailsForUserWithInsufficientPermissions()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        await UploadTestLogFile(logRun.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", borehole.Id))
            .ReturnsAsync(false);

        IConvertToActionResult response = await controller.GetAllForLogRunAsync(logRun.Id);
        ActionResultAssert.IsUnauthorized(response.Convert());
    }

    [TestMethod]
    public async Task GetWithNonexistentId()
    {
        var response = await controller.GetFileAsync(999999);
        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task GetFile()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile = await UploadTestLogFile(logRun.Id);
        logFile.FileType = "application/las";
        await context.SaveChangesAsync();

        var response = await controller.GetFileAsync(logFile.Id);
        Assert.IsInstanceOfType<FileResult>(response);

        var fileResult = (FileResult)response;
        Assert.AreEqual("application/las", fileResult.ContentType);
    }

    [TestMethod]
    public async Task GetFileFailsWithoutPermissions()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile = await UploadTestLogFile(logRun.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", borehole.Id))
            .ReturnsAsync(false);

        var response = await controller.GetFileAsync(logFile.Id);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task DeleteMultipleLogFiles()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile1 = await UploadTestLogFile(logRun.Id);
        var logFile2 = await UploadTestLogFile(logRun.Id);

        var response = await controller.DeleteAsync([logFile1.Id, logFile2.Id]);
        ActionResultAssert.IsOk(response);

        Assert.IsFalse(context.LogFiles.Any(lf => lf.Id == logFile1.Id));
        Assert.IsFalse(context.LogFiles.Any(lf => lf.Id == logFile2.Id));
    }

    [TestMethod]
    public async Task DeleteFailsWithoutPermissions()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile = await UploadTestLogFile(logRun.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", borehole.Id))
            .ReturnsAsync(false);

        var response = await controller.DeleteAsync([logFile.Id]);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task DeleteWithNonexistentId()
    {
        var response = await controller.DeleteAsync([999999]);
        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task UpdateMultipleLogFilesPublicState()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile1 = await UploadTestLogFile(logRun.Id);
        var logFile2 = await UploadTestLogFile(logRun.Id);

        Assert.IsFalse(logFile1.Public);
        Assert.IsFalse(logFile2.Public);

        var updateData = new Collection<LogFileUpdate>
        {
            new() { Id = logFile1.Id, Public = true },
            new() { Id = logFile2.Id, Public = true },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsOk(result);

        var updatedLogFile1 = context.LogFiles.Single(lf => lf.Id == logFile1.Id);
        var updatedLogFile2 = context.LogFiles.Single(lf => lf.Id == logFile2.Id);
        Assert.IsTrue(updatedLogFile1.Public);
        Assert.IsTrue(updatedLogFile2.Public);
    }

    [TestMethod]
    public async Task UpdateAllUpdatableProps()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile = await UploadTestLogFile(logRun.Id);

        Assert.IsFalse(logFile.Public);
        Assert.IsNull(logFile.Pass);
        Assert.IsNull(logFile.DeliveryDate);
        Assert.IsNull(logFile.DepthTypeId);
        Assert.IsNull(logFile.PassTypeId);
        Assert.IsNull(logFile.DataPackageId);

        // update all updatable properties
        var updateData1 = new Collection<LogFileUpdate>
        {
            new()
            {
                Id = logFile.Id,
                Public = true,
                Pass = 4,
                DeliveryDate = new DateOnly(2023, 6, 1),
                DepthTypeId = 100003030,
                PassTypeId = 100003024,
                DataPackageId = 100003011,
            },
        };
        var result = await controller.UpdateAsync(updateData1);
        ActionResultAssert.IsOk(result);

        var updatedLogFile1 = context.LogFiles.Single(lf => lf.Id == logFile.Id);
        Assert.IsTrue(updatedLogFile1.Public);
        Assert.AreEqual(4, updatedLogFile1.Pass);
        Assert.AreEqual(new DateOnly(2023, 6, 1), updatedLogFile1.DeliveryDate);
        Assert.AreEqual(100003030, updatedLogFile1.DepthTypeId);
        Assert.AreEqual(100003024, updatedLogFile1.PassTypeId);
        Assert.AreEqual(100003011, updatedLogFile1.DataPackageId);
    }

    [TestMethod]
    public async Task UpdateFailsWithoutPermissions()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile = await UploadTestLogFile(logRun.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", borehole.Id))
            .ReturnsAsync(false);

        var updateData = new Collection<LogFileUpdate>
        {
            new() { Id = logFile.Id, Public = true },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsUnauthorized(result);
    }

    [TestMethod]
    public async Task UpdateWithNonexistentId()
    {
        var updateData = new Collection<LogFileUpdate>
        {
            new() { Id = 999999, Public = true },
        };
        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsNotFound(result);
    }

    private async Task<Borehole> CreateTestBoreholeAsync()
    {
        var borehole = new Borehole
        {
            Name = "Test Borehole",
            OriginalName = "Test Borehole Original",
        };

        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync();

        return borehole;
    }

    private async Task<LogRun> CreateTestLogRunAsync(int boreholeId)
    {
        var logRun = new LogRun
        {
            BoreholeId = boreholeId,
            RunNumber = "RUN01",
            FromDepth = 0,
            ToDepth = 100,
            BitSize = 0.2,
        };

        context.LogRuns.Add(logRun);
        await context.SaveChangesAsync();

        return logRun;
    }

    private async Task<LogFile> UploadTestLogFile(int logRunId)
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, "test_logfile.las");
        var response = await controller.UploadAsync(formFile, logRunId);
        var okResult = (OkObjectResult)response;
        return (LogFile)okResult.Value!;
    }
}
