using Amazon.S3;
using Amazon.S3.Model;
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
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class LogFileControllerTest
{
    private BdmsContext context;
    private User adminUser;
    private Mock<IAmazonS3> s3ClientMock;
    private LogFileCloudService logFileCloudService;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;
    private LogFileController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string> { { "S3:LOGFILES_BUCKET_NAME", "CANNONFLEA-LOGFILES" } })
            .Build();

        context = ContextFactory.GetTestContext();
        adminUser = context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) }));

        var loggerMock = new Mock<ILogger<LogFileCloudService>>();

        s3ClientMock = new Mock<IAmazonS3>(MockBehavior.Strict);
        s3ClientMock
            .Setup(x => x.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new PutObjectResponse());
        s3ClientMock
            .Setup(x => x.GetObjectAsync(It.IsAny<GetObjectRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new GetObjectResponse { ResponseStream = Stream.Null });
        s3ClientMock
            .Setup(x => x.DeleteObjectsAsync(It.IsAny<DeleteObjectsRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new DeleteObjectsResponse());

        logFileCloudService = new LogFileCloudService(loggerMock.Object, s3ClientMock.Object, configuration, contextAccessorMock.Object, context);

        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();

        var controllerLoggerMock = new Mock<ILogger<LogFileController>>();
        controller = new LogFileController(context, controllerLoggerMock.Object, boreholePermissionServiceMock.Object, logFileCloudService);
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
        // Create a log run to use in the test
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);

        var fileName = "test_logfile.las";
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        // Upload
        var response = await controller.UploadAsync(file, logRun.Id);
        ActionResultAssert.IsOk(response);

        // Get uploaded log file from db
        var logFile = context.LogFiles.Single(f => f.Name == fileName);
        Assert.AreEqual(DateTime.UtcNow.Date, logFile.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, logFile.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, logFile.CreatedById);
        Assert.AreEqual(DateTime.UtcNow.Date, logFile.Updated?.Date);
        Assert.AreEqual(adminUser.SubjectId, logFile.UpdatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, logFile.UpdatedById);
    }

    [TestMethod]
    public async Task UploadFailsForUserWithInsufficientPermissions()
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
    public async Task GetAllForLogRun()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        await CreateTestLogFileAsync(logRun.Id);

        var response = await controller.GetAllForLogRunAsync(logRun.Id);
        Assert.IsNotNull(response.Value);
        Assert.AreEqual(1, response.Value.Count());
    }

    [TestMethod]
    public async Task GetAllFailsForUserWithInsufficientPermissions()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        await CreateTestLogFileAsync(logRun.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", borehole.Id))
            .ReturnsAsync(false);

        IConvertToActionResult response = await controller.GetAllForLogRunAsync(logRun.Id);
        ActionResultAssert.IsUnauthorized(response.Convert());
    }

    [TestMethod]
    public async Task GetFile()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile = await CreateTestLogFileAsync(logRun.Id);
        logFile.Type = "application/las";
        await context.SaveChangesAsync();

        var response = await controller.GetFileAsync(logFile.Id);
        Assert.IsInstanceOfType<FileResult>(response);

        var fileResult = (FileResult)response;
        Assert.AreEqual("application/las", fileResult.ContentType);
    }

    [TestMethod]
    public async Task GetFileFailsForUserWithInsufficientPermissions()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile = await CreateTestLogFileAsync(logRun.Id);

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
        var logFile1 = await CreateTestLogFileAsync(logRun.Id);
        var logFile2 = await CreateTestLogFileAsync(logRun.Id);

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
        var logFile = await CreateTestLogFileAsync(logRun.Id);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", borehole.Id))
            .ReturnsAsync(false);

        var response = await controller.DeleteAsync([logFile.Id]);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UpdateMultipleLogFilesPublicState()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile1 = await CreateTestLogFileAsync(logRun.Id);
        var logFile2 = await CreateTestLogFileAsync(logRun.Id);

        var updateData = new Collection<LogFileUpdate>
        {
            new() { Id = logFile1.Id, Public = true },
            new() { Id = logFile2.Id, Public = true },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsOk(result);

        var updatedLogFile1 = context.LogFiles.Single(lf => lf.Id == logFile1.Id);
        Assert.IsTrue(updatedLogFile1.Public);
        var updatedLogFile2 = context.LogFiles.Single(lf => lf.Id == logFile2.Id);
        Assert.IsTrue(updatedLogFile2.Public);
    }

    [TestMethod]
    public async Task UpdateFailsWithoutPermissions()
    {
        var borehole = await CreateTestBoreholeAsync();
        var logRun = await CreateTestLogRunAsync(borehole.Id);
        var logFile = await CreateTestLogFileAsync(logRun.Id);

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

    private async Task<LogFile> CreateTestLogFileAsync(int logRunId)
    {
        var fileName = $"test_logfile_{Guid.NewGuid()}.las";

        var logFile = new LogFile
        {
            LogRunId = logRunId,
            Name = fileName,
            NameUuid = Guid.NewGuid().ToString() + ".las",
            Type = "application/las",
            Public = false,
        };

        context.LogFiles.Add(logFile);
        await context.SaveChangesAsync();

        return logFile;
    }

    private static Mock<IBoreholePermissionService> CreateBoreholePermissionServiceMock()
    {
        var mock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        mock.Setup(x => x.CanViewBoreholeAsync(It.IsAny<string>(), It.IsAny<int?>())).ReturnsAsync(true);
        mock.Setup(x => x.CanEditBoreholeAsync(It.IsAny<string>(), It.IsAny<int?>())).ReturnsAsync(true);
        return mock;
    }

    private static FormFile GetFormFileByContent(string content, string fileName)
    {
        var stream = new MemoryStream();
        var writer = new StreamWriter(stream);
        writer.Write(content);
        writer.Flush();
        stream.Position = 0;

        return new FormFile(stream, 0, stream.Length, "file", fileName);
    }
}
