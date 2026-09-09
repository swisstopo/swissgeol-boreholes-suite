using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using System.Text;
using static BDMS.Helpers;

namespace BDMS.Services;

[TestClass]
public class LogFileCloudServiceTest
{
    private const string TestLasFileName = "file_1.las";

    /// <summary>
    /// A limit no test object can reach, for the tests that are not about the size guard.
    /// </summary>
    private const long NoSizeLimit = long.MaxValue;

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
        var formFile = GetFormFileByContent(content, TestLasFileName);

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
    public async Task GetObjectBytesWithNotExistingObjectNameShouldThrowException()
    {
        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => logFileCloudService.GetObjectBytes("doesNotExist", NoSizeLimit));
    }

    [TestMethod]
    public async Task GetObjectBytesShouldReturnFileBytes()
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, TestLasFileName);

        await logFileCloudService.UploadObject(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType);
        var result = await logFileCloudService.GetObjectBytes(formFile.FileName, NoSizeLimit);
        Assert.AreEqual(content, Encoding.UTF8.GetString(result));
    }

    [TestMethod]
    public async Task GetObjectBytesShouldRejectObjectLargerThanTheLimit()
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, TestLasFileName);

        await logFileCloudService.UploadObject(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType);

        var exception = await Assert.ThrowsExactlyAsync<InvalidOperationException>(() => logFileCloudService.GetObjectBytes(formFile.FileName, content.Length - 1));
        StringAssert.Contains(exception.Message, "exceeds the maximum");
    }

    [TestMethod]
    public async Task GetObjectStreamShouldReturnFileContent()
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, TestLasFileName);

        await logFileCloudService.UploadObject(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType);

        using var stream = await logFileCloudService.GetObjectStream(formFile.FileName);
        using var reader = new StreamReader(stream);
        Assert.AreEqual(content, await reader.ReadToEndAsync());
    }

    [TestMethod]
    public async Task GetObjectStreamWithNotExistingObjectNameShouldThrowException()
    {
        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => logFileCloudService.GetObjectStream("doesNotExist"));
    }

    [TestMethod]
    public async Task ObjectExistsShouldDistinguishPresentFromMissingObject()
    {
        var formFile = GetFormFileByContent(Guid.NewGuid().ToString(), TestLasFileName);

        await logFileCloudService.UploadObject(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType);

        Assert.IsTrue(await logFileCloudService.ObjectExists(formFile.FileName));
        Assert.IsFalse(await logFileCloudService.ObjectExists("doesNotExist"));
    }

    [TestMethod]
    public async Task DeleteObjectShouldDeleteObjectFromStorage()
    {
        var content = Guid.NewGuid().ToString();
        var formFile = GetFormFileByContent(content, TestLasFileName);

        await logFileCloudService.UploadObject(formFile.OpenReadStream(), formFile.FileName, formFile.ContentType);
        await logFileCloudService.GetObjectBytes(formFile.FileName, NoSizeLimit);
        await logFileCloudService.DeleteObject(formFile.FileName);
        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => logFileCloudService.GetObjectBytes(formFile.FileName, NoSizeLimit));
    }

    [TestMethod]
    public async Task UploadLogFileAndLinkToLogRunAsyncRemovesTheObjectWhenTheLinkFails()
    {
        var fileName = $"{Guid.NewGuid()}.las";
        var minLogRunId = context.LogRuns.Min(b => b.Id);
        var formFile = GetFormFileByContent(Guid.NewGuid().ToString(), fileName);

        // The accessor is reached only after the object has been stored, so throwing here leaves
        // exactly the gap the cleanup has to cover.
        var failingAccessor = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        failingAccessor.Setup(x => x.HttpContext).Throws(new InvalidOperationException("no context"));
        var service = new LogFileCloudService(
            new Mock<ILogger<LogFileCloudService>>().Object,
            s3Client,
            new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build(),
            failingAccessor.Object,
            context);

        var objectsBefore = await CountStoredObjectsAsync();

        await Assert.ThrowsExactlyAsync<InvalidOperationException>(
            () => service.UploadLogFileAndLinkToLogRunAsync(
                formFile.OpenReadStream(), formFile.FileName, formFile.ContentType, minLogRunId));

        Assert.AreEqual(objectsBefore, await CountStoredObjectsAsync());
    }

    /// <summary>
    /// Counts what the bucket holds. The test bucket stays well under one page of results.
    /// </summary>
    private async Task<int> CountStoredObjectsAsync()
    {
        var stored = await s3Client.ListObjectsV2Async(new ListObjectsV2Request { BucketName = bucketName });
        return stored.S3Objects.Count;
    }

    /// <summary>
    /// Covers the multipart path, which starts above TransferUtility's 16 MB threshold. It is
    /// long running because moving that much through the storage holds the shared test database
    /// open long enough to disturb the tests that count rows.
    /// </summary>
    [TestMethod]
    [TestCategory("LongRunning")]
    public async Task UploadLogFileAndLinkToLogRunAsyncStoresAFileLargerThanOnePart()
    {
        var fileName = $"{Guid.NewGuid()}.las";
        var minLogRunId = context.LogRuns.Min(b => b.Id);
        var content = new byte[20 * 1024 * 1024];
        Random.Shared.NextBytes(content);

        using var stream = new MemoryStream(content);
        await logFileCloudService.UploadLogFileAndLinkToLogRunAsync(stream, fileName, "application/octet-stream", minLogRunId);

        var logRun = context.LogRunsWithIncludes.Single(b => b.Id == minLogRunId);
        var stored = logRun.LogFiles.Single(f => f.Name == fileName);
        Assert.IsNotNull(stored.NameUuid);

        using var readBack = await logFileCloudService.GetObjectStream(stored.NameUuid);
        using var buffer = new MemoryStream();
        await readBack.CopyToAsync(buffer);

        var readBytes = buffer.ToArray();
        Assert.AreEqual(content.Length, readBytes.Length);
        Assert.IsTrue(content.AsSpan().SequenceEqual(readBytes), "the stored bytes should match what was uploaded");
    }

    [TestMethod]
    public async Task UploadLogFileAndLinkToLogRunAsyncLinksNothingWhenCancelled()
    {
        var fileName = $"{Guid.NewGuid()}.las";
        var minLogRunId = context.LogRuns.Min(b => b.Id);
        var formFile = GetFormFileByContent(Guid.NewGuid().ToString(), fileName);

        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();

        await Assert.ThrowsAsync<OperationCanceledException>(
            () => logFileCloudService.UploadLogFileAndLinkToLogRunAsync(
                formFile.OpenReadStream(), formFile.FileName, formFile.ContentType, minLogRunId, cancellation.Token));

        var logRun = context.LogRunsWithIncludes.Single(b => b.Id == minLogRunId);
        Assert.IsNull(logRun.LogFiles.SingleOrDefault(f => f.Name == fileName));
    }

    [TestMethod]
    public async Task UploadLogFileAndLinkToLogRunAsyncKeepsTheCancellationWhenTheCleanupFails()
    {
        // The object reaches the bucket before its row is written, so a client that gives up in
        // between leaves an object nothing refers to and the cleanup runs. When that cleanup fails
        // as well, the cancellation still has to be what escapes, because the caller reads its type
        // to decide whether anybody is left to answer.
        using var cancellation = new CancellationTokenSource();

        var s3ClientMock = new Mock<IAmazonS3>(MockBehavior.Strict);
        s3ClientMock.Setup(x => x.Config).Returns(new AmazonS3Config());
        s3ClientMock
            .Setup(x => x.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()))
            .Callback(() => cancellation.Cancel())
            .ReturnsAsync(new PutObjectResponse());
        s3ClientMock
            .Setup(x => x.DeleteObjectAsync(It.IsAny<DeleteObjectRequest>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new AmazonS3Exception("the cleanup fails as well"));

        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();
        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "sub_admin") }));

        var serviceWithFailingCleanup = new LogFileCloudService(
            new Mock<ILogger<LogFileCloudService>>().Object,
            s3ClientMock.Object,
            configuration,
            contextAccessorMock.Object,
            context);

        var formFile = GetFormFileByContent(Guid.NewGuid().ToString(), $"{Guid.NewGuid()}.las");
        var minLogRunId = context.LogRuns.Min(b => b.Id);

        await Assert.ThrowsAsync<OperationCanceledException>(
            () => serviceWithFailingCleanup.UploadLogFileAndLinkToLogRunAsync(
                formFile.OpenReadStream(), formFile.FileName, formFile.ContentType, minLogRunId, cancellation.Token));

        s3ClientMock.Verify(x => x.DeleteObjectAsync(It.IsAny<DeleteObjectRequest>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
