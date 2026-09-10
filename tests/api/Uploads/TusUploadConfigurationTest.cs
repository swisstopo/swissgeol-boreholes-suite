using Amazon.S3;
using BDMS.Services;
using BDMS.Uploads.S3;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using System.Text;
using tusdotnet.Models;

namespace BDMS.Uploads;

[TestClass]
public class TusUploadConfigurationTest
{
    private const string SubAdmin = "sub_admin";
    private const string TestFileName = "gamma.las";
    private const string TextPlainContentType = "text/plain";

    private BdmsContext context;
    private Mock<IBoreholePermissionService> permissionServiceMock;
    private TusUploadConfiguration configuration;

    [TestInitialize]
    public void TestInitialize()
    {
        var appConfiguration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.GetTestContext();
        permissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);

        var adminUser = context.Users.FirstOrDefault(u => u.SubjectId == SubAdmin) ?? throw new InvalidOperationException("No User found in database.");
        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) }));

        var s3Client = new AmazonS3Client(
            appConfiguration["S3:ACCESS_KEY"],
            appConfiguration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = appConfiguration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = appConfiguration["S3:SECURE"] == "0",
            });

        var logFileCloudService = new LogFileCloudService(
            new Mock<ILogger<LogFileCloudService>>().Object,
            s3Client,
            appConfiguration,
            contextAccessorMock.Object,
            context);

        var bucketName = appConfiguration["S3:LOGFILES_BUCKET_NAME"].ToLowerInvariant();
        var tusStore = new S3TusStore(s3Client, new S3UploadStateStore(s3Client, bucketName), bucketName);

        configuration = new TusUploadConfiguration(context, permissionServiceMock.Object, logFileCloudService, tusStore);
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    private static ClaimsPrincipal CreateUser(string subjectId) =>
        new(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, subjectId) }));

    [TestMethod]
    public async Task CanUploadAsyncRefusesABoreholeTheUserCannotEdit()
    {
        var logRun = context.LogRuns.First();
        permissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string>(), It.IsAny<int?>()))
            .ReturnsAsync(false);

        Assert.IsFalse(await configuration.CanUploadAsync(CreateUser(SubAdmin), logRun.Id));
    }

    [TestMethod]
    public async Task CanUploadAsyncAllowsABoreholeTheUserCanEdit()
    {
        var logRun = context.LogRuns.First();
        permissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(SubAdmin, logRun.BoreholeId))
            .ReturnsAsync(true);

        Assert.IsTrue(await configuration.CanUploadAsync(CreateUser(SubAdmin), logRun.Id));
    }

    [TestMethod]
    public async Task CanUploadAsyncRefusesALogRunThatDoesNotExist()
    {
        Assert.IsFalse(await configuration.CanUploadAsync(CreateUser(SubAdmin), 0));
    }

    [TestMethod]
    public async Task CanUploadAsyncRefusesAUserWithoutASubject()
    {
        Assert.IsFalse(await configuration.CanUploadAsync(new ClaimsPrincipal(new ClaimsIdentity()), context.LogRuns.First().Id));
    }

    [TestMethod]
    public void TryReadAcceptsTheMetadataTheClientSends()
    {
        var header = $"logRunId {Encode("42")},filename {Encode(TestFileName)},contentType {Encode(TextPlainContentType)}";

        Assert.IsTrue(TusUploadMetadata.TryReadHeader(header, out var metadata));
        Assert.AreEqual(42, metadata.LogRunId);
        Assert.IsNull(metadata.LogFileId);
        Assert.AreEqual(TestFileName, metadata.FileName);
        Assert.AreEqual(TextPlainContentType, metadata.ContentType);
    }

    [TestMethod]
    public void TryReadReadsTheFileBeingReplaced()
    {
        var header = $"logRunId {Encode("42")},logFileId {Encode("7")},filename {Encode(TestFileName)},contentType {Encode(TextPlainContentType)}";

        Assert.IsTrue(TusUploadMetadata.TryReadHeader(header, out var metadata));
        Assert.AreEqual(7, metadata.LogFileId);
    }

    [TestMethod]
    public void TryReadRejectsMetadataWithoutALogRun()
    {
        var header = $"filename {Encode(TestFileName)},contentType {Encode(TextPlainContentType)}";

        Assert.IsFalse(TusUploadMetadata.TryReadHeader(header, out _));
    }

    [TestMethod]
    public void TryReadRejectsAValueThatIsNotBase64()
    {
        Assert.IsFalse(TusUploadMetadata.TryReadHeader("logRunId not-base64!", out _));
    }

    [TestMethod]
    public void TryReadStoredAgreesWithTheHeaderTheUploadWasCreatedFrom()
    {
        var header = $"logRunId {Encode("42")},logFileId {Encode("7")},filename {Encode(TestFileName)},contentType {Encode(TextPlainContentType)}";

        Assert.IsTrue(TusUploadMetadata.TryReadHeader(header, out var fromHeader));
        Assert.IsTrue(TusUploadMetadata.TryReadStored(Metadata.Parse(header), out var fromStore));
        Assert.AreEqual(fromHeader, fromStore);
    }

    [TestMethod]
    public void TryReadStoredTreatsALogFileIdThatIsNotAnIdAsReplacingNothing()
    {
        var header = $"logRunId {Encode("42")},logFileId {Encode("not-an-id")},filename {Encode(TestFileName)},contentType {Encode(TextPlainContentType)}";

        // Creating the upload accepts this, so completing it has to accept it too rather than
        // failing once the whole file has already been sent.
        Assert.IsTrue(TusUploadMetadata.TryReadStored(Metadata.Parse(header), out var metadata));
        Assert.IsNull(metadata.LogFileId);
    }

    [TestMethod]
    public void TryReadStoredRejectsMetadataWithoutALogRun()
    {
        var header = $"filename {Encode(TestFileName)},contentType {Encode(TextPlainContentType)}";

        Assert.IsFalse(TusUploadMetadata.TryReadStored(Metadata.Parse(header), out _));
    }

    private static string Encode(string value) => Convert.ToBase64String(Encoding.UTF8.GetBytes(value));
}
