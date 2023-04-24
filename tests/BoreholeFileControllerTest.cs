using BDMS.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minio;
using Minio.Exceptions;
using System.Net;
using System.Reactive.Linq;
using System.Text;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class BoreholeFileControllerTest
{
    private MinioClient minioClient;
    private BdmsContext context;
    private BoreholeFileController controller;
    private CloudStorageService cloudStorageService;

    private int boreholeCount;

    [TestInitialize]
    public void TestInitialize()
    {
        var builder = new ConfigurationBuilder();
        builder.AddJsonFile("appsettings.development.json", optional: true, reloadOnChange: true);
        var configuration = builder.Build();

        context = ContextFactory.CreateContext();
        this.cloudStorageService = new CloudStorageService(configuration);
        controller = new BoreholeFileController(context, cloudStorageService);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();

        boreholeCount = context.Boreholes.Count();

        minioClient = new MinioClient()
            .WithEndpoint(configuration.GetConnectionString("S3_ENDPOINT"))
            .WithCredentials(configuration.GetConnectionString("S3_ACCESS_KEY"), configuration.GetConnectionString("S3_SECRET_KEY"))
            .WithSSL(false)
            .Build();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Assert.AreEqual(boreholeCount, context.Boreholes.Count(), "Tests need to remove boreholes they created.");
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task UploadAndDownload()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        // Upload
        IActionResult response = await controller.Upload(firstPdfFormFile, minBoreholeId);
        OkResult okResult = (OkResult)response;
        Assert.AreEqual((int)HttpStatusCode.OK, okResult.StatusCode);

        // Get all boreholeFiles of borehole
        var boreholeFilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);

        // Download uploaded file
        response = await controller.Download(boreholeFilesOfBorehole.Last().FileId);

        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
        Assert.AreEqual(content, contentResult);
    }

    [TestMethod]
    public async Task DownloadFileShouldReturnDownLoadedFile()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        // Upload
        await controller.Upload(firstPdfFormFile, minBoreholeId);

        // Get all boreholeFiles of borehole
        var boreholeFilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);

        // Download uploaded file
        var response = await controller.Download(boreholeFilesOfBorehole.Last().FileId);
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

        var firstPdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), "file_1.pdf");
        var secondPdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), "file_2.pdf");

        await controller.Upload(firstPdfFormFile, minBoreholeId);
        await controller.Upload(secondPdfFormFile, minBoreholeId);

        // Get all boreholeFiles of borehole
        var boreholeFilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);

        Assert.AreEqual(boreholeFilesBeforeUpload + 2, boreholeFilesOfBorehole.Count());
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
        await cloudStorageService.GetObject(latestFileInDb.NameUuid!);
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
        //await controller.Upload(pdfFormFile, secondBoreholeId);

        // Get latest file in db
        var latestFileInDb = context.Files.OrderBy(f => f.Id).Last();

        // Ensure file exists
        await cloudStorageService.GetObject(latestFileInDb.NameUuid!);

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
        await Assert.ThrowsExceptionAsync<ObjectNotFoundException>(() => cloudStorageService.GetObject(latestFileInDb.NameUuid!));
    }
}
