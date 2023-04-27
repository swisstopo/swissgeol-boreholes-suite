using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minio;
using Minio.DataModel;
using Minio.Exceptions;
using Moq;
using System.Reactive.Linq;
using System.Text;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class BoreholeFileUploadServiceTest
{
    private MinioClient minioClient;
    private BdmsContext context;
    private BoreholeFileUploadService boreholeFileUploadService;
    private string bucketName;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

        context = ContextFactory.CreateContext();

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        var loggerMock = new Mock<ILogger<BoreholeFileUploadService>>(MockBehavior.Strict);
        loggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        boreholeFileUploadService = new BoreholeFileUploadService(context, configuration, loggerMock.Object, contextAccessorMock.Object);

        minioClient = new MinioClient()
            .WithEndpoint(configuration["S3:ENDPOINT"])
            .WithCredentials(configuration["S3:ACCESS_KEY"], configuration["S3:SECRET_KEY"])
            .WithSSL(false)
            .Build();

        bucketName = configuration["S3:BUCKET_NAME"];
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
        minioClient.Dispose();
    }

    [TestMethod]
    public async Task UploadObjectShouldStoreFileInCloudStorage()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";

        var listObjectsArgs = new ListObjectsArgs().WithBucket(bucketName);

        // List all objects in the bucket
        var observable = minioClient.ListObjectsAsync(listObjectsArgs);

        // Get all files with same key before upload
        var filesBeforeUpload = await observable.Where(file => file.Key == fileName).ToList();

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), fileName);

        // Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);

        // List all objects in the bucket
        observable = minioClient.ListObjectsAsync(listObjectsArgs);

        // Get all files with same key after upload
        var filesAfterUpload = await observable.Where(file => file.Key == fileName).ToList();

        Assert.AreEqual(filesBeforeUpload.Count + 1, filesAfterUpload.Count);
    }

    [TestMethod]
    public async Task UploadObjectSameFileTwiceShouldReplaceFileInCloudStorage()
    {
        // Create file to upload
        var content = Guid.NewGuid().ToString();
        var pdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        var listObjectsArgs = new ListObjectsArgs().WithBucket(bucketName);

        // First Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);

        // List all objects in the bucket
        IObservable<Item> observable = minioClient.ListObjectsAsync(listObjectsArgs);

        // Get all files on the storage with same key as uploaded file
        var files = await observable.Where(file => file.Key == pdfFormFile.FileName).ToList();
        Assert.AreEqual(1, files.Count);

        // Get upload date of file
        var uploadDate = files.First().LastModifiedDateTime;

        // Second Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);

        // List all objects in the bucket
        observable = minioClient.ListObjectsAsync(listObjectsArgs);

        // Get all files on the storage with same key as uploaded file
        files = await observable.Where(file => file.Key == pdfFormFile.FileName).ToList();
        Assert.AreEqual(1, files.Count);

        // Check uploaded file was replaced
        Assert.AreNotEqual(uploadDate, files.First().LastModifiedDateTime);
    }

    [TestMethod]
    public async Task GetObjectWithNotExistingObjectNameShouldThrowException()
    {
        await Assert.ThrowsExceptionAsync<ObjectNotFoundException>(() => boreholeFileUploadService.GetObject("doesNotExist"));
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
        await Assert.ThrowsExceptionAsync<ObjectNotFoundException>(() => boreholeFileUploadService.GetObject(pdfFormFile.FileName));
    }

    [TestMethod]
    public async Task UploadObjectWithNotExistingBucketShouldCreateBucketAndUplaodObject()
    {
        // List all objects in the bucket
        var listObjectsArgs = new ListObjectsArgs().WithBucket(bucketName);

        var objects = minioClient.ListObjectsAsync(listObjectsArgs);

        // Loop through all objects in the bucket and delete them
        foreach (var obj in objects)
        {
            var removeObjectArgs = new RemoveObjectArgs().WithBucket(bucketName).WithObject(obj.Key);

            await minioClient.RemoveObjectAsync(removeObjectArgs);
        }

        // Delete bucket
        var removeBucketArgs = new RemoveBucketArgs().WithBucket(bucketName);
        await minioClient.RemoveBucketAsync(removeBucketArgs);

        // Check that bucket does not exist
        var bucketExistsArgs = new BucketExistsArgs().WithBucket(bucketName);
        Assert.IsFalse(await minioClient.BucketExistsAsync(bucketExistsArgs).ConfigureAwait(false));

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), "file_1.pdf");

        // Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);
    }
}
