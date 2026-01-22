using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
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
public class LogFileCloudServiceTest
{
    private BdmsContext context;
    private AmazonS3Client s3Client;
    private string bucketName;
    private LogFileCloudService logFileCloudService;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.GetTestContext();
        var adminUser = context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) }));

        var loggerMock = new Mock<ILogger<LogFileCloudService>>();

        s3Client = new AmazonS3Client(
            configuration["S3:ACCESS_KEY"],
            configuration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = configuration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = configuration["S3:SECURE"] == "0",
            });
        bucketName = configuration["S3:LOGFILES_BUCKET_NAME"].ToLowerInvariant();

        logFileCloudService = new LogFileCloudService(loggerMock.Object, s3Client, configuration, contextAccessorMock.Object, context);
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task UploadFileWithWhiteSpaceShouldReplaceWithUnderscoreBeforeSaving()
    {
        var fileName = $"  {Guid.NewGuid()}   file  .las";
        var minLogRunId = context.LogRuns.Min(b => b.Id);
        var formFile = GetFormFileByContent(Guid.NewGuid().ToString(), fileName);
        await logFileCloudService.UploadLogFileAndLinkToLogRunAsync(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType, minLogRunId);
        fileName = fileName.Replace(" ", "_");
        var logRun = context.LogRunsWithIncludes.Single(b => b.Id == minLogRunId);
        Assert.IsNotNull(logRun.LogFiles.SingleOrDefault(f => f.Name == fileName));
    }

    [TestMethod]
    public async Task UploadFileAndLinkToLogRunShouldStoreFileInCloudStorageAndLinkFile()
    {
        var fileName = $"{Guid.NewGuid()}.las";
        var minLogRunId = context.LogRuns.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var fistLogFile = GetFormFileByContent(content, fileName);
        await logFileCloudService.UploadLogFileAndLinkToLogRunAsync(fistLogFile.OpenReadStream(), fistLogFile.FileName, fistLogFile.ContentType, minLogRunId).ConfigureAwait(false);
        var logRun = context.LogRunsWithIncludes.Single(b => b.Id == minLogRunId);

        // Check if file is linked to logRun
        var uploadedFile = logRun.LogFiles.SingleOrDefault(f => f.Name == fileName);
        Assert.IsNotNull(uploadedFile);

        // Ensure file exists in cloud storage
        var request = new GetObjectMetadataRequest { BucketName = bucketName, Key = uploadedFile.NameUuid };
        await s3Client.GetObjectMetadataAsync(request);
    }

    [TestMethod]
    public async Task UploadObjectSameFileTwiceShouldReplaceFileInCloudStorage()
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, "file_1.las");

        // Upload file
        await logFileCloudService.UploadObject(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType);

        // Get all files with same key after upload
        var listObjectsRequest = new ListObjectsV2Request { BucketName = bucketName, MaxKeys = 1000, Prefix = formFile.FileName };
        var listObjectResponse = await s3Client.ListObjectsV2Async(listObjectsRequest).ConfigureAwait(false);
        var files = listObjectResponse.S3Objects.Where(file => file.Key == formFile.FileName).ToList();
        Assert.AreEqual(1, files.Count);

        var uploadDate = files.First().LastModified;

        // Upload file again
        await logFileCloudService.UploadObject(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType);

        // Get all objects in the bucket with provided name
        listObjectResponse = await s3Client.ListObjectsV2Async(listObjectsRequest).ConfigureAwait(false);

        files = listObjectResponse.S3Objects.Where(file => file.Key == formFile.FileName).ToList();
        Assert.AreEqual(1, files.Count);

        // Check uploaded file was replaced
        Assert.AreNotEqual(uploadDate, files.First().LastModified);
    }

    [TestMethod]
    public async Task GetObjectWithNotExistingObjectNameShouldThrowException()
    {
        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => logFileCloudService.GetObject("doesNotExist"));
    }

    [TestMethod]
    public async Task GetObjectShouldReturnFileBytes()
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, "file_1.las");

        await logFileCloudService.UploadObject(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType);
        var result = await logFileCloudService.GetObject(formFile.FileName);
        Assert.AreEqual(content, Encoding.UTF8.GetString(result));
    }

    [TestMethod]
    public async Task DeleteObjectShouldDeleteObjectFromStorage()
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, "file_1.las");

        await logFileCloudService.UploadObject(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType);
        await logFileCloudService.GetObject(formFile.FileName);
        await logFileCloudService.DeleteObject(formFile.FileName);
        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => logFileCloudService.GetObject(formFile.FileName));
    }
}
