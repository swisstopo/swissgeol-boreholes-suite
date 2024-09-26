using Amazon.S3;
using Amazon.S3.Model;
using Azure;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;
using System.Text;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[DeploymentItem("TestData")]
[TestClass]
public class BoreholeFileControllerTest
{
    private BdmsContext context;
    private BoreholeFileController controller;
    private BoreholeFileCloudService boreholeFileCloudService;
    private User adminUser;

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

        var boreholeFileCloudServiceLoggerMock = new Mock<ILogger<BoreholeFileCloudService>>(MockBehavior.Strict);
        boreholeFileCloudServiceLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        boreholeFileCloudService = new BoreholeFileCloudService(context, configuration, boreholeFileCloudServiceLoggerMock.Object, contextAccessorMock.Object, s3ClientMock);

        var boreholeFileControllerLoggerMock = new Mock<ILogger<BoreholeFileController>>(MockBehavior.Strict);
        boreholeFileControllerLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        controller = new BoreholeFileController(context, boreholeFileControllerLoggerMock.Object, boreholeFileCloudService);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task UploadAndDownload()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, fileName);

        // Upload
        var response = await controller.Upload(firstPdfFormFile, minBoreholeId);
        ActionResultAssert.IsOk(response);

        // Get uploaded file from db
        var file = context.Files.Single(f => f.Name == fileName);

        // Download uploaded file
        response = await controller.Download(file.Id);

        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
        Assert.AreEqual(content, contentResult);

        // Get file
        Assert.AreNotEqual(null, file.Hash);
        Assert.AreEqual(DateTime.UtcNow.Date, file.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, file.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, file.CreatedById);

        var boreholefile = context.BoreholeFiles.Single(bf => bf.FileId == file.Id);
        Assert.AreEqual(DateTime.UtcNow.Date, boreholefile.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, boreholefile.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, boreholefile.CreatedById);
        Assert.AreEqual(DateTime.UtcNow.Date, boreholefile.Updated?.Date);
        Assert.AreEqual(adminUser.SubjectId, boreholefile.UpdatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, boreholefile.UpdatedById);
        Assert.AreEqual(DateTime.UtcNow.Date, boreholefile.Attached?.Date);
    }

    [TestMethod]
    public async Task DownloadFileShouldReturnDownloadedFile()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, fileName);

        // Upload
        await controller.Upload(firstPdfFormFile, minBoreholeId);

        // Get all boreholeFiles of borehole
        var boreholeFilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);
        Assert.IsNotNull(boreholeFilesOfBorehole.Value);

        // Get the uploaded borehole file in the response list
        var uploadedBoreholeFile = boreholeFilesOfBorehole.Value.FirstOrDefault(bf => bf.File.Name == fileName);
        Assert.IsNotNull(uploadedBoreholeFile);

        // Download uploaded file
        var response = await controller.Download(uploadedBoreholeFile.FileId);
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

        var firstBoreholeFile = boreholeFilesOfBorehole.Value?.FirstOrDefault(bf => bf.File.Name == firstFileName);
        var secondBoreholeFile = boreholeFilesOfBorehole.Value?.FirstOrDefault(bf => bf.File.Name == secondFileName);

        Assert.AreEqual(firstFileName, firstBoreholeFile.File.Name);
        Assert.AreEqual(adminUser.SubjectId, firstBoreholeFile.User.SubjectId);
        Assert.AreEqual(secondFileName, secondBoreholeFile.File.Name);
        Assert.AreEqual(adminUser.SubjectId, secondBoreholeFile.User.SubjectId);
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

        // Clear context to ensure file has no info about its boreholeFiles
        context.ChangeTracker.Clear();

        // Detach borehole file from first borehole
        await controller.DetachFromBorehole(firstBoreholeId, latestFileInDb.BoreholeFiles.First(bf => bf.BoreholeId == firstBoreholeId).FileId);

        // Check counts after detach
        Assert.AreEqual(filesCountBeforeUpload + 1, context.Files.Count());
        Assert.AreEqual(boreholeFilesCountBeforeUpload + 1, context.BoreholeFiles.Count());
        Assert.AreEqual(firstBoreholeBoreholeFilesBeforeUpload, context.BoreholeFiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());
        Assert.AreEqual(secondBoreholeBoreholeFilesBeforeUpload + 1, context.BoreholeFiles.Where(bf => bf.BoreholeId == secondBoreholeId).Count());

        // Ensure file exists
        await boreholeFileCloudService.GetObject(latestFileInDb.NameUuid!);
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
        await boreholeFileCloudService.GetObject(latestFileInDb.NameUuid!);

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
        await Assert.ThrowsExceptionAsync<AmazonS3Exception>(() => boreholeFileCloudService.GetObject(latestFileInDb.NameUuid!));
    }

    [TestMethod]
    public async Task UpdateWithValidBoreholeFile()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);

        var file = new Models.File() { Name = $"{Guid.NewGuid}.pdf", NameUuid = $"{Guid.NewGuid}.pdf", Hash = Guid.NewGuid().ToString(), Type = "pdf" };
        context.Files.Add(file);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var boreholeFile = new BoreholeFile() { BoreholeId = borehole.Id, FileId = file.Id, Description = null, Public = null };
        context.BoreholeFiles.Add(boreholeFile);
        await context.SaveChangesAsync().ConfigureAwait(false);

        // Create update borehole file object
        var updateBoreholeFile = new BoreholeFileUpdate() { Description = "Changed Description", Public = true };

        // Update borehole file
        var response = await controller.Update(updateBoreholeFile, borehole.Id, file.Id).ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        Assert.AreEqual(true, boreholeFile.Public);
        Assert.AreEqual("Changed Description", boreholeFile.Description);
    }

    [TestMethod]
    public async Task UploadWithFileToLargeShouldThrowError()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        long targetSizeInBytes = 210 * 1024 * 1024; // 210MB
        byte[] content = new byte[targetSizeInBytes];
        var stream = new MemoryStream(content);

        var formFile = new FormFile(stream, 0, stream.Length, "file", "dummy.txt");

        await AssertIsBadRequestResponse(() => controller.Upload(formFile, minBoreholeId));
    }

    [TestMethod]
    public async Task UploadWithMissingBoreholeFileId()
    {
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        await AssertIsBadRequestResponse(() => controller.Upload(firstPdfFormFile, 0));
    }

    [TestMethod]
    public async Task UploadWithFileAlreadyAttachedShouldThrowError()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), fileName);

        await controller.Upload(pdfFormFile, minBoreholeId);

        await AssertIsBadRequestResponse(() => controller.Upload(pdfFormFile, minBoreholeId));
    }

    [TestMethod]
    public async Task UploadWithMissingFile() => await AssertIsBadRequestResponse(() => controller.Upload(null, 1));

    [TestMethod]
    public async Task DownloadWithMissingBoreholeFileId() => await AssertIsBadRequestResponse(() => controller.Download(0));

    [TestMethod]
    public async Task GetAllOfBoreholeWithMissingBoreholeId()
    {
        var result = await controller.GetAllOfBorehole(0);
        ActionResultAssert.IsBadRequest(result.Result);
    }

    [TestMethod]
    public async Task DetachFromBoreholeWithMissingBoreholeId() => await AssertIsBadRequestResponse(() => controller.DetachFromBorehole(0, 5000));

    [TestMethod]
    public async Task DetachFromBoreholeWithMissingBoreholeFileId() => await AssertIsBadRequestResponse(() => controller.DetachFromBorehole(123, 0));

    [TestMethod]
    public async Task UpdateWithMissingBoreholeId() => await AssertIsBadRequestResponse(() => controller.Update(new BoreholeFileUpdate(), 0, 1));

    [TestMethod]
    public async Task UpdateWithMissingBoreholeFileId() => await AssertIsBadRequestResponse(() => controller.Update(new BoreholeFileUpdate(), 1, 0));

    [TestMethod]
    public async Task UpdateWithBoreholeFileNotFound()
    {
        var result = await controller.Update(new BoreholeFileUpdate(), 1, 1);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task GetDataExtractionInfo()
    {
        // Test setup
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var labelingFile = GetFormFileByExistingFile("labeling_attachment.pdf");
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var file = (uploadResult as OkObjectResult)?.Value as BoreholeFile;
        var fileUuid = file.File.NameUuid.Replace(".pdf","");

        var image1 = GetFormFileByExistingFile("labeling_attachment-1.png");
        await boreholeFileCloudService.UploadObject(image1, $"dataextraction/{fileUuid}-1.png");
        var image2 = GetFormFileByExistingFile("labeling_attachment-2.png");
        await boreholeFileCloudService.UploadObject(image2, $"dataextraction/{fileUuid}-2.png");
        var image3 = GetFormFileByExistingFile("labeling_attachment-3.png");
        await boreholeFileCloudService.UploadObject(image3, $"dataextraction/{fileUuid}-3.png");

        // Test
        var result = await controller.GetDataExtractionFileInfo(file.FileId, 1);
        ActionResultAssert.IsOk(result);
        var dataExtractionInfo = (result as OkObjectResult)?.Value as DataExtractionInfo;
        Assert.IsNotNull(dataExtractionInfo);
        Assert.AreEqual($"{fileUuid}-1.png", dataExtractionInfo.fileName);
        Assert.AreEqual(1786, dataExtractionInfo.width);
        Assert.AreEqual(2526, dataExtractionInfo.height);
        Assert.AreEqual(3, dataExtractionInfo.count);

        // Reset data
        await boreholeFileCloudService.DeleteObject($"dataextraction/{fileUuid}-1.png");
        await boreholeFileCloudService.DeleteObject($"dataextraction/{fileUuid}-2.png");
        await boreholeFileCloudService.DeleteObject($"dataextraction/{fileUuid}-3.png");
    }

    [TestMethod]
    public async Task GetDataExtractionInfoFileNoPngFound()
    {
        // Test setup
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var labelingFile = GetFormFileByExistingFile("labeling_attachment.pdf");
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var file = (uploadResult as OkObjectResult)?.Value as BoreholeFile;
        var fileUuid = file.File.NameUuid.Replace(".pdf", "");

        // Test
        var result = await controller.GetDataExtractionFileInfo(file.FileId, 1);
        ActionResultAssert.IsOk(result);
        var dataExtractionInfo = (result as OkObjectResult)?.Value as DataExtractionInfo;
        Assert.IsNotNull(dataExtractionInfo);
        Assert.AreEqual(fileUuid, dataExtractionInfo.fileName);
        Assert.AreEqual(0, dataExtractionInfo.width);
        Assert.AreEqual(0, dataExtractionInfo.height);
        Assert.AreEqual(0, dataExtractionInfo.count);
    }

    [TestMethod]
    public async Task GetDataExtractionInfoFileNotFound()
    {
        var result = await controller.Update(new BoreholeFileUpdate(), 1, 1);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task GetDataExtractionImage()
    {
        // Test setup
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var labelingFile = GetFormFileByExistingFile("labeling_attachment.pdf");
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var file = (uploadResult as OkObjectResult)?.Value as BoreholeFile;
        var fileUuid = file.File.NameUuid.Replace(".pdf", "");

        var image1 = GetFormFileByExistingFile("labeling_attachment-1.png");
        await boreholeFileCloudService.UploadObject(image1, $"dataextraction/{fileUuid}-1.png");

        // Test
        var response = await controller.GetDataExtractionImage($"{fileUuid}-1.png");
        Assert.IsNotNull(response);
        var fileContentResult = (FileContentResult)response;
        Assert.AreEqual("image/png", fileContentResult.ContentType);

        byte[] originalBytes = new byte[image1.Length];
        using (var ms = new MemoryStream())
        {
            image1.CopyTo(ms);
            originalBytes = ms.ToArray();
        }

        CollectionAssert.AreEqual(originalBytes, fileContentResult.FileContents);

        // Reset data
        await boreholeFileCloudService.DeleteObject($"dataextraction/{fileUuid}-1.png");
    }

    private async Task AssertIsBadRequestResponse(Func<Task<IActionResult>> action)
    {
        var result = await action();
        ActionResultAssert.IsBadRequest(result);
    }
}
