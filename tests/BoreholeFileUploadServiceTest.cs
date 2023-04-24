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
    private IConfiguration configuration;

    [TestInitialize]
    public void TestInitialize()
    {
        var builder = new ConfigurationBuilder();
        builder.AddJsonFile("appsettings.development.json", optional: true, reloadOnChange: true);
        var configuration = builder.Build();

        context = ContextFactory.CreateContext();

        var loggerMock = new Mock<ILogger<BoreholeFileUploadService>>(MockBehavior.Strict);
        loggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        boreholeFileUploadService = new BoreholeFileUploadService(context, configuration, loggerMock.Object);

        this.configuration = configuration;

        minioClient = new MinioClient()
            .WithEndpoint(configuration.GetConnectionString("S3_ENDPOINT"))
            .WithCredentials(configuration.GetConnectionString("S3_ACCESS_KEY"), configuration.GetConnectionString("S3_SECRET_KEY"))
            .WithSSL(false)
            .Build();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task UploadObjectShouldStoreFileInCloudStorage()
    {
        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), "file_1.pdf");

        // Upload file
        await boreholeFileUploadService.UploadObject(pdfFormFile, pdfFormFile.FileName);
    }

    [TestMethod]
    public async Task UploadObjectSameFileTwiceShouldReplaceFileInCloudStorage()
    {
        // Create file to upload
        var content = Guid.NewGuid().ToString();
        var pdfFormFile = GetFormFileByContent(content, "file_1.pdf");

        ListObjectsArgs listObjectsArgs = new ListObjectsArgs()
                    .WithBucket(configuration.GetConnectionString("S3_BUCKET_NAME"));

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
}
