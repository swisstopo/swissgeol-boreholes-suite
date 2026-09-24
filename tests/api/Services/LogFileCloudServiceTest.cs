using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
using BDMS.Uploads;
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
    private const string TextPlainContentType = "text/plain";

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
        await Assert.ThrowsExactlyAsync<NoSuchKeyException>(() => logFileCloudService.GetObjectBytes("doesNotExist", NoSizeLimit));
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
        await Assert.ThrowsExactlyAsync<NoSuchKeyException>(() => logFileCloudService.GetObjectStream("doesNotExist"));
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
        await Assert.ThrowsExactlyAsync<NoSuchKeyException>(() => logFileCloudService.GetObjectBytes(formFile.FileName, NoSizeLimit));
    }

    /// <summary>
    /// Covers the multipart path, which starts above TransferUtility's 16 MB threshold. It is
    /// long running because moving that much through the storage holds the shared test database
    /// open long enough to disturb the tests that count rows.
    /// </summary>
    [TestMethod]
    [TestCategory("LongRunning")]
    public async Task UploadObjectStoresAFileLargerThanOnePart()
    {
        var objectName = $"{Guid.NewGuid()}.las";
        var content = new byte[20 * 1024 * 1024];
        Random.Shared.NextBytes(content);

        using var stream = new MemoryStream(content);
        await logFileCloudService.UploadObject(stream, objectName, "application/octet-stream");

        using var readBack = await logFileCloudService.GetObjectStream(objectName);
        using var buffer = new MemoryStream();
        await readBack.CopyToAsync(buffer);

        var readBytes = buffer.ToArray();
        Assert.AreEqual(content.Length, readBytes.Length);
        Assert.IsTrue(content.AsSpan().SequenceEqual(readBytes), "the stored bytes should match what was uploaded");
    }

    [TestMethod]
    public async Task LinkUploadedLogFileAsyncWritesTheRowForAnObjectAlreadyStored()
    {
        var logRun = context.LogRuns.First();
        var fileName = $"{Guid.NewGuid()}.las";
        var objectName = $"{Guid.NewGuid()}.las";

        var logFile = await logFileCloudService.LinkUploadedLogFileAsync(
            fileName,
            TextPlainContentType,
            objectName,
            logRun.Id,
            CancellationToken.None);

        Assert.IsTrue(logFile.Id > 0);
        Assert.AreEqual(fileName, logFile.Name);
        Assert.AreEqual(objectName, logFile.NameUuid);
        Assert.IsNotNull(context.LogFiles.SingleOrDefault(f => f.Id == logFile.Id));
    }

    [TestMethod]
    public async Task LinkUploadedLogFileAsyncReplacesWhiteSpaceInTheName()
    {
        var logRun = context.LogRuns.First();

        var logFile = await logFileCloudService.LinkUploadedLogFileAsync(
            $"gamma {Guid.NewGuid()}.las",
            TextPlainContentType,
            $"{Guid.NewGuid()}.las",
            logRun.Id,
            CancellationToken.None);

        StringAssert.StartsWith(logFile.Name, "gamma_");
    }

    [TestMethod]
    public async Task LinkUploadedLogFileAsyncRefusesANameTheLogRunAlreadyHolds()
    {
        var existing = context.LogFiles.First();

        // A distinct type, because this is the one upload failure the user is told about in words.
        var exception = await Assert.ThrowsExactlyAsync<LogFileNameTakenException>(async () =>
            await logFileCloudService.LinkUploadedLogFileAsync(
                existing.Name,
                TextPlainContentType,
                $"{Guid.NewGuid()}.las",
                existing.LogRunId,
                CancellationToken.None));

        Assert.AreEqual(existing.Name, exception.FileName);
    }

    [TestMethod]
    public async Task LinkUploadedLogFileAsyncRefusesALogRunThatDoesNotExist()
    {
        await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () =>
            await logFileCloudService.LinkUploadedLogFileAsync(
                $"{Guid.NewGuid()}.las",
                TextPlainContentType,
                $"{Guid.NewGuid()}.las",
                0,
                CancellationToken.None));
    }

    [TestMethod]
    public async Task IsNameTakenAsyncFindsANameTheLogRunHolds()
    {
        var existing = context.LogFiles.First();

        Assert.IsTrue(await logFileCloudService.IsNameTakenAsync(existing.LogRunId, existing.Name, CancellationToken.None));
    }

    [TestMethod]
    public async Task IsNameTakenAsyncAllowsANameTheLogRunDoesNotHold()
    {
        var logRun = context.LogRuns.First();

        Assert.IsFalse(await logFileCloudService.IsNameTakenAsync(logRun.Id, $"{Guid.NewGuid()}.las", CancellationToken.None));
    }

    [TestMethod]
    public async Task GetLogFileAsyncRefusesAFileBelongingToAnotherLogRun()
    {
        var existing = context.LogFiles.First();
        var otherRun = context.LogRuns.First(lr => lr.Id != existing.LogRunId);

        // An upload is authorized against the log run it names, so a file belonging to a different
        // run must not be reachable by passing its id.
        await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () =>
            await logFileCloudService.GetLogFileAsync(existing.Id, otherRun.Id, CancellationToken.None));
    }
}
