using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;
using System.Text;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class BoreholeFileUploadServiceTest
{
    private AmazonS3Client s3Client;
    private BdmsContext context;
    private BoreholeFileUploadService boreholeFileUploadService;
    private string bucketName;
    private Models.User adminUser;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.CreateContext();
        adminUser = context.Users.FirstOrDefault(u => u.Name == "admin") ?? throw new InvalidOperationException("No User found in database.");

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, adminUser.Name) }));

        var loggerMock = new Mock<ILogger<BoreholeFileUploadService>>(MockBehavior.Strict);
        loggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));

        var s3ClientMock = new AmazonS3Client(
            configuration["S3:ACCESS_KEY"],
            configuration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                AuthenticationRegion = configuration["S3:REGION"],
                ServiceURL = configuration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = configuration["S3:SECURE"] == "0",
            });

        boreholeFileUploadService = new BoreholeFileUploadService(context, configuration, loggerMock.Object, contextAccessorMock.Object, s3ClientMock);

        bucketName = configuration["S3:BUCKET_NAME"];
        s3Client = s3ClientMock;
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task UploadFileAndLinkToBoreholeShouldStoreFileInCloudStorageAndLinkFile()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, fileName);

        // Upload file
        await boreholeFileUploadService.UploadFileAndLinkToBorehole(firstPdfFormFile, minBoreholeId);

        // Get borehole with file linked from db
        var borehole = context.Boreholes
           .Include(b => b.BoreholeFiles)
           .ThenInclude(bf => bf.File)
           .Single(b => b.Id == minBoreholeId);

        // Check if file is linked to borehole
        Assert.AreEqual(borehole.BoreholeFiles.First().File.Name, fileName);

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
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);

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
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);

        // Get all files with same key after upload
        var listObjectsRequest = new ListObjectsV2Request { BucketName = bucketName, MaxKeys = 1000, Prefix = pdfFormFile.FileName };
        var listObjectResponse = await s3Client.ListObjectsV2Async(listObjectsRequest).ConfigureAwait(false);

        // Get all files with same key after upload
        var files = listObjectResponse.S3Objects.Where(file => file.Key == pdfFormFile.FileName).ToList();
        Assert.AreEqual(1, files.Count);

        // Get upload date of file
        var uploadDate = files.First().LastModified;

        // Second Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);

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
        await Assert.ThrowsExceptionAsync<AmazonS3Exception>(() => boreholeFileUploadService.GetObject("doesNotExist"));
    }

    [TestMethod]
    public async Task GetObjectShouldReturnFileBytes()
    {
        // Create file to upload
        var content = Guid.NewGuid().ToString();
        var pdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        // Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);

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
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);

        // Ensure file exists
        await boreholeFileUploadService.GetObject(pdfFormFile.FileName);

        // Delete file
        await boreholeFileUploadService.DeleteObject(pdfFormFile.FileName);

        // Ensure file does not exist
        await Assert.ThrowsExceptionAsync<AmazonS3Exception>(() => boreholeFileUploadService.GetObject(pdfFormFile.FileName));
    }

    [TestMethod]
    public async Task UploadObjectWithNotExistingBucketShouldCreateBucketAndUplaodObject()
    {
        // If bucket exists delete it
        if (await AmazonS3Util.DoesS3BucketExistV2Async(s3Client, bucketName).ConfigureAwait(false))
        {
            // Delete all files in bucket
            var listObjectRequest = new ListObjectsV2Request { BucketName = bucketName, MaxKeys = 1000 };
            var listObjectResponse = await s3Client.ListObjectsV2Async(listObjectRequest).ConfigureAwait(false);

            foreach (var item in listObjectResponse.S3Objects)
            {
                var deleteRequest = new DeleteObjectRequest { BucketName = bucketName, Key = item.Key };
                await s3Client.DeleteObjectAsync(deleteRequest);
            }

            // Delete bucket
            var bucketDeleteRequest = new DeleteBucketRequest() { BucketName = bucketName };
            await s3Client.DeleteBucketAsync(bucketDeleteRequest).ConfigureAwait(false);
        }

        // Ensure bucket does not exist
        Assert.IsFalse(await AmazonS3Util.DoesS3BucketExistV2Async(s3Client, bucketName).ConfigureAwait(false));

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), "file_1.pdf");

        // Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);
    }
}
