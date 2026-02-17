using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;
using System.Text;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class BoreholeFileCloudServiceTest
{
    private AmazonS3Client s3Client;
    private BdmsContext context;
    private BoreholeFileCloudService boreholeFileUploadService;
    private string bucketName;
    private Models.User adminUser;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.GetTestContext();
        adminUser = context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) }));

        var loggerMock = new Mock<ILogger<BoreholeFileCloudService>>(MockBehavior.Strict);
        loggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));

        var s3ClientMock = new AmazonS3Client(
            configuration["S3:ACCESS_KEY"],
            configuration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = configuration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = configuration["S3:SECURE"] == "0",
            });

        boreholeFileUploadService = new BoreholeFileCloudService(context, configuration, loggerMock.Object, contextAccessorMock.Object, s3ClientMock);

        bucketName = configuration["S3:BUCKET_NAME"].ToLowerInvariant();
        s3Client = s3ClientMock;
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task UploadFileWithWhiteSpaceShouldReplaceWithUnderscoreBeforeSaving()
    {
        var fileName = $"  {Guid.NewGuid()}   file  .pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), fileName);

        await boreholeFileUploadService.UploadFileAndLinkToBoreholeAsync(pdfFormFile.OpenReadStream(), pdfFormFile.FileName, null, null, pdfFormFile.ContentType, minBoreholeId);

        fileName = fileName.Replace(" ", "_");

        // Get borehole with file linked from db
        var borehole = context.BoreholesWithIncludes.Single(b => b.Id == minBoreholeId);

        // Check if fileName whitespace is replaced with underscore
        Assert.AreEqual(borehole.BoreholeFiles.First().File.Name, fileName);
    }

    [TestMethod]
    public async Task UploadFileAndLinkToBoreholeShouldStoreFileInCloudStorageAndLinkFile()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, fileName);

        // Upload file
        await boreholeFileUploadService.UploadFileAndLinkToBoreholeAsync(firstPdfFormFile.OpenReadStream(), firstPdfFormFile.FileName, "New description", false, firstPdfFormFile.ContentType, minBoreholeId).ConfigureAwait(false);

        // Get borehole with file linked from db
        var borehole = context.BoreholesWithIncludes.Single(b => b.Id == minBoreholeId);

        // Check if file is linked to borehole
        var boreholeFile = borehole.BoreholeFiles.First();
        Assert.AreEqual(boreholeFile.File.Name, fileName);
        Assert.AreEqual(boreholeFile.Description, "New description");
        Assert.AreEqual(boreholeFile.Public, false);

        // Ensure file exists in cloud storage
        var request = new GetObjectMetadataRequest { BucketName = bucketName, Key = borehole.BoreholeFiles.First().File.NameUuid };
        await s3Client.GetObjectMetadataAsync(request);
    }

    [TestMethod]
    public async Task UploadObjectShouldStoreFileInCloudStorage()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), fileName);

        // Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile.OpenReadStream(), pdfFormFile.FileName, pdfFormFile.ContentType);

        // Get all objects in the bucket with provided name
        var listObjectsRequest = new ListObjectsV2Request { BucketName = bucketName, MaxKeys = 1000, Prefix = fileName };
        var listObjectResponse = await s3Client.ListObjectsV2Async(listObjectsRequest).ConfigureAwait(false);

        // Get all files with same key after upload
        var filesAfterUpload = listObjectResponse.S3Objects.Where(file => file.Key == fileName).ToList();

        Assert.AreEqual(1, filesAfterUpload.Count);
    }

    [TestMethod]
    public async Task UploadObjectSameFileTwiceShouldReplaceFileInCloudStorage()
    {
        // Create file to upload
        var content = Guid.NewGuid().ToString();
        var pdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        // First Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile.OpenReadStream(), pdfFormFile.FileName, pdfFormFile.ContentType);

        // Get all files with same key after upload
        var listObjectsRequest = new ListObjectsV2Request { BucketName = bucketName, MaxKeys = 1000, Prefix = pdfFormFile.FileName };
        var listObjectResponse = await s3Client.ListObjectsV2Async(listObjectsRequest).ConfigureAwait(false);

        // Get all files with same key after upload
        var files = listObjectResponse.S3Objects.Where(file => file.Key == pdfFormFile.FileName).ToList();
        Assert.AreEqual(1, files.Count);

        // Get upload date of file
        var uploadDate = files.First().LastModified;

        // Second Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile.OpenReadStream(), pdfFormFile.FileName, pdfFormFile.ContentType);

        // Get all objects in the bucket with provided name
        listObjectResponse = await s3Client.ListObjectsV2Async(listObjectsRequest).ConfigureAwait(false);

        // Get all files with same key after upload
        files = listObjectResponse.S3Objects.Where(file => file.Key == pdfFormFile.FileName).ToList();
        Assert.AreEqual(1, files.Count);

        // Check uploaded file was replaced
        Assert.AreNotEqual(uploadDate, files.First().LastModified);
    }

    [TestMethod]
    public async Task GetObjectWithNotExistingObjectNameShouldThrowException()
    {
        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => boreholeFileUploadService.GetObject("doesNotExist"));
    }

    [TestMethod]
    public async Task GetObjectShouldReturnFileBytes()
    {
        // Create file to upload
        var content = Guid.NewGuid().ToString();
        var pdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        // Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile.OpenReadStream(), pdfFormFile.FileName, pdfFormFile.ContentType);

        // Download file
        var result = await boreholeFileUploadService.GetObject(pdfFormFile.FileName);
        Assert.AreEqual(content, Encoding.UTF8.GetString(result));
    }

    [TestMethod]
    public async Task DeleteObjectShouldDeleteObjectFromStorage()
    {
        // Create file to upload
        var content = Guid.NewGuid().ToString();
        var pdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        // Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile.OpenReadStream(), pdfFormFile.FileName, pdfFormFile.ContentType);

        // Ensure file exists
        await boreholeFileUploadService.GetObject(pdfFormFile.FileName);

        // Delete file
        await boreholeFileUploadService.DeleteObject(pdfFormFile.FileName);

        // Ensure file does not exist
        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => boreholeFileUploadService.GetObject(pdfFormFile.FileName));
    }
}
