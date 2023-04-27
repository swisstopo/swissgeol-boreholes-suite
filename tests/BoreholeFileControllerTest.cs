using BDMS.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minio.Exceptions;
using Moq;
using System.Net;
using System.Reactive.Linq;
using System.Security.Claims;
using System.Text;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class BoreholeFileControllerTest
{
    private BdmsContext context;
    private BoreholeFileController controller;
    private BoreholeFileUploadService boreholeFileUploadService;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

        context = ContextFactory.CreateContext();

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, context.Users.FirstOrDefault().Name) }));
        var boreholeFileUploadServiceLoggerMock = new Mock<ILogger<BoreholeFileUploadService>>(MockBehavior.Strict);
        boreholeFileUploadServiceLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        boreholeFileUploadService = new BoreholeFileUploadService(context, configuration, boreholeFileUploadServiceLoggerMock.Object, contextAccessorMock.Object);

        var boreholeFileControllerLoggerMock = new Mock<ILogger<BoreholeFileController>>(MockBehavior.Strict);
        boreholeFileControllerLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        controller = new BoreholeFileController(context, boreholeFileControllerLoggerMock.Object, boreholeFileUploadService);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task UploadAndDownload()
    {
        var user = context.Users.FirstOrDefault();

        var fileName = $"{Guid.NewGuid()}.pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, fileName);

        // Upload
        IActionResult response = await controller.Upload(firstPdfFormFile, minBoreholeId);
        OkResult okResult = (OkResult)response;
        Assert.AreEqual((int)HttpStatusCode.OK, okResult.StatusCode);

        // Get all boreholeFiles of borehole
        var boreholeFilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);
        Assert.IsNotNull(boreholeFilesOfBorehole.Value);

        // Download uploaded file
        response = await controller.Download(boreholeFilesOfBorehole.Value.Last().FileId);

        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
        Assert.AreEqual(content, contentResult);

        // Get file
        var file = context.Files.Single(f => f.Name == fileName);
        Assert.AreNotEqual(null, file.Hash);
        Assert.AreNotEqual(null, file.Created);
        Assert.AreNotEqual(null, file.CreatedBy);
        Assert.AreEqual(user.Id, file.CreatedById);

        var boreholefile = context.BoreholeFiles.Single(bf => bf.FileId == boreholeFilesOfBorehole.Value.Last().FileId);
        Assert.AreNotEqual(null, boreholefile.Created);
        Assert.AreNotEqual(null, boreholefile.CreatedBy);
        Assert.AreEqual(user.Id, boreholefile.CreatedById);
        Assert.AreNotEqual(null, boreholefile.Updated);
        Assert.AreNotEqual(null, boreholefile.UpdatedBy);
        Assert.AreEqual(user.Id, boreholefile.UpdatedById);
        Assert.AreNotEqual(null, boreholefile.Attached);
    }

    [TestMethod]
    public async Task DownloadFileShouldReturnDownloadedFile()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        // Upload
        await controller.Upload(firstPdfFormFile, minBoreholeId);

        // Get all boreholeFiles of borehole
        var boreholeFilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);
        Assert.IsNotNull(boreholeFilesOfBorehole.Value);

        // Download uploaded file
        var response = await controller.Download(boreholeFilesOfBorehole.Value.Last().FileId);
        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
        Assert.AreEqual(content, contentResult);
    }

    [TestMethod]
    public async Task GetAllOfBorehole()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        // Get counts before upload
        var boreholeFilesBeforeUpload = context.BoreholeFiles.Where(bf => bf.BoreholeId == minBoreholeId).Count();

        var firstFileName = $"{Guid.NewGuid}.pdf";
        var secondFileName = $"{Guid.NewGuid}.pdf";
        var firstPdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), firstFileName);
        var secondPdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), secondFileName);

        await controller.Upload(firstPdfFormFile, minBoreholeId);
        await controller.Upload(secondPdfFormFile, minBoreholeId);

        // Get boreholeFiles of borehole from controller
        var boreholeFilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);
        var boreholeFileIds = boreholeFilesOfBorehole.Value?.Select(bf => bf.FileId).ToList();

        // BoreholeFiles from db
        var boreholeFilesInDb = await context.BoreholeFiles.Include(bf => bf.File).Where(bf => boreholeFileIds.Contains(bf.FileId)).ToListAsync();

        // Get files from database
        var firstBoreholeFile = boreholeFilesInDb.FirstOrDefault(bf => bf.File.Name == firstFileName);
        var secondBoreholeFile = boreholeFilesInDb.FirstOrDefault(bf => bf.File.Name == secondFileName);

        Assert.AreEqual(firstBoreholeFile.File.Name, firstFileName);
        Assert.AreEqual(secondBoreholeFile.File.Name, secondFileName);
        Assert.AreEqual(boreholeFilesBeforeUpload + 2, boreholeFilesOfBorehole.Value?.Count());
    }

    [TestMethod]
    public async Task DetachFromBoreholeWithFileUsedByOtherBoreholeShouldDetachFile()
    {
        // Get borehole Ids
        var firstBoreholeId = context.Boreholes.First().Id;
        var secondBoreholeId = context.Boreholes.Skip(1).First().Id;

        // Get counts before upload
        var filesCountBeforeUpload = context.Files.Count();
        var boreholeFilesCountBeforeUpload = context.BoreholeFiles.Count();
        var firstBoreholeBoreholeFilesBeforeUpload = context.BoreholeFiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count();
        var secondBoreholeBoreholeFilesBeforeUpload = context.BoreholeFiles.Where(bf => bf.BoreholeId == secondBoreholeId).Count();

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), "file_1.pdf");

        // Upload file for boreholes
        await controller.Upload(pdfFormFile, firstBoreholeId);
        await controller.Upload(pdfFormFile, secondBoreholeId);

        // Check counts after upload
        Assert.AreEqual(filesCountBeforeUpload + 1, context.Files.Count());
        Assert.AreEqual(boreholeFilesCountBeforeUpload + 2, context.BoreholeFiles.Count());
        Assert.AreEqual(firstBoreholeBoreholeFilesBeforeUpload + 1, context.BoreholeFiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());
        Assert.AreEqual(secondBoreholeBoreholeFilesBeforeUpload + 1, context.BoreholeFiles.Where(bf => bf.BoreholeId == secondBoreholeId).Count());

        // Get latest file in db
        var latestFileInDb = context.Files.OrderBy(f => f.Id).Last();

        // Detach borehole file from first borehole
        await controller.DetachFromBorehole(firstBoreholeId, latestFileInDb.BoreholeFiles.First(bf => bf.BoreholeId == firstBoreholeId).FileId);

        // Check counts after detach
        Assert.AreEqual(filesCountBeforeUpload + 1, context.Files.Count());
        Assert.AreEqual(boreholeFilesCountBeforeUpload + 1, context.BoreholeFiles.Count());
        Assert.AreEqual(firstBoreholeBoreholeFilesBeforeUpload, context.BoreholeFiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());
        Assert.AreEqual(secondBoreholeBoreholeFilesBeforeUpload + 1, context.BoreholeFiles.Where(bf => bf.BoreholeId == secondBoreholeId).Count());

        // Ensure file exists
        await boreholeFileUploadService.GetObject(latestFileInDb.NameUuid!);
    }

    [TestMethod]
    public async Task DetachFromBoreholeWithFileNotUsedByOtherBoreholeShouldDetachAndDeleteFile()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";

        // Get borehole Ids
        var firstBoreholeId = context.Boreholes.First().Id;
        var secondBoreholeId = context.Boreholes.Skip(1).First().Id;

        // Get counts before upload
        var filesCountBeforeUpload = context.Files.Count();
        var boreholeFilesCountBeforeUpload = context.BoreholeFiles.Count();
        var boreholeFilesBeforeUpload = context.BoreholeFiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count();

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), "file_1.pdf");

        // Upload file for boreholes
        await controller.Upload(pdfFormFile, firstBoreholeId);

        // Get latest file in db
        var latestFileInDb = context.Files.OrderBy(f => f.Id).Last();

        // Ensure file exists
        await boreholeFileUploadService.GetObject(latestFileInDb.NameUuid!);

        // Check counts after upload
        Assert.AreEqual(filesCountBeforeUpload + 1, context.Files.Count());
        Assert.AreEqual(boreholeFilesCountBeforeUpload + 1, context.BoreholeFiles.Count());
        Assert.AreEqual(boreholeFilesBeforeUpload + 1, context.BoreholeFiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());

        // Detach borehole file from first borehole
        await controller.DetachFromBorehole(firstBoreholeId, latestFileInDb.BoreholeFiles.First(bf => bf.BoreholeId == firstBoreholeId).FileId);

        // Check counts after detach
        Assert.AreEqual(filesCountBeforeUpload, context.Files.Count());
        Assert.AreEqual(boreholeFilesCountBeforeUpload, context.BoreholeFiles.Count());
        Assert.AreEqual(boreholeFilesBeforeUpload, context.BoreholeFiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());

        // Ensure file does not exist
        await Assert.ThrowsExceptionAsync<ObjectNotFoundException>(() => boreholeFileUploadService.GetObject(latestFileInDb.NameUuid!));
    }

    [TestMethod]
    public async Task UploadWithMissingBoreholeFileId()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        await AssertIsBadRequestResponse(() => controller.Upload(firstPdfFormFile, 0));
    }

    [TestMethod]
    public async Task UploadWithMissingFile() => await AssertIsBadRequestResponse(() => controller.Upload(null, 1));

    [TestMethod]
    public async Task DownloadWithMissingBoreholeFileId() => await AssertIsBadRequestResponse(() => controller.Download(0));

    [TestMethod]
    public async Task GetAllOfBoreholeWithMissingBoreholeId()
    {
        var result = await controller.GetAllOfBorehole(0);
        Assert.IsInstanceOfType(result.Result, typeof(BadRequestObjectResult));
    }

    [TestMethod]
    public async Task DetachFromBoreholeWithMissingBoreholeId() => await AssertIsBadRequestResponse(() => controller.DetachFromBorehole(0, 5000));

    [TestMethod]
    public async Task DetachFromBoreholeWithMissingBoreholeFileId() => await AssertIsBadRequestResponse(() => controller.DetachFromBorehole(123, 0));

    private async Task AssertIsBadRequestResponse(Func<Task<IActionResult>> action)
    {
        var result = await action();
        Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
    }
}
