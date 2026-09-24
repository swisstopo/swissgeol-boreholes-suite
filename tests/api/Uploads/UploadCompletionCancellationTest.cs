using Amazon.S3;
using BDMS.Models;
using BDMS.Services;
using BDMS.Uploads.S3;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using System.Security.Claims;

namespace BDMS.Uploads;

/// <summary>
/// What a completion does when the client gives up while it is writing.
///
/// By the time a completion runs, the object is whole in the cloud storage and the request that
/// carried its last chunk has been answered. A commit cancelled there leaves an outcome nobody can
/// read back, and the caller answers a failed completion by deleting the object, so a row that did
/// commit would be left naming an object that is gone. The request token therefore reaches the
/// lookups a completion makes and stops before the write.
/// </summary>
[TestClass]
public class UploadCompletionCancellationTest
{
    private const string PdfContentType = "application/pdf";
    private const string SubAdmin = "sub_admin";

    private BdmsContext context;
    private AmazonS3Client s3Client;
    private IConfiguration configuration;
    private ClaimsIdentity adminIdentity;

    [TestInitialize]
    public void TestInitialize()
    {
        configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();
        context = ContextFactory.GetTestContext();

        var adminUser = context.Users.FirstOrDefault(u => u.SubjectId == SubAdmin) ?? throw new InvalidOperationException("No User found in database.");
        adminIdentity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) });

        s3Client = new AmazonS3Client(
            configuration["S3:ACCESS_KEY"],
            configuration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = configuration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = configuration["S3:SECURE"] == "0",
            });
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        s3Client.Dispose();
        await context.DisposeAsync();
    }

    /// <summary>
    /// A profile row an upload creates is committed although the request it arrived on is gone.
    /// Without this the row is missing and the file is unreachable; worse, a commit the database
    /// accepted while the caller saw a failure leaves a row in <see cref="OcrStatus.Created"/>
    /// pointing at an object the caller has since deleted, which the OCR catch-up parks in the
    /// terminal <see cref="OcrStatus.Error"/> at the next startup.
    /// </summary>
    [TestMethod]
    public async Task LinkingAProfileCommitsAlthoughTheRequestIsGone()
    {
        using var disconnect = new CancellationTokenSource();
        var boreholeId = await context.Boreholes.Select(b => b.Id).FirstAsync();
        var objectKey = $"{Guid.NewGuid()}.pdf";
        var service = CreateProfileCloudService(disconnect);

        var profile = await service.LinkUploadedProfileAsync("report.pdf", PdfContentType, objectKey, boreholeId, null, disconnect.Token);

        Assert.IsTrue(disconnect.IsCancellationRequested, "The client never went away, so this says nothing about a write that outlives it.");
        Assert.IsTrue(profile.Id > 0, "The row was never given an id, so it was never written.");

        var written = await context.Profiles.AsNoTracking().SingleOrDefaultAsync(p => p.Id == profile.Id);
        Assert.IsNotNull(written, "The row is not in the database, so the commit was aborted.");
        Assert.AreEqual(objectKey, written.NameUuid);
    }

    /// <summary>
    /// The row an import left waiting is filled although the request it arrived on is gone. The
    /// lookup that finds the row runs before the client disappears, which is what makes the write
    /// the only thing the cancellation could still reach.
    /// </summary>
    [TestMethod]
    public async Task FillingAProfileCommitsAlthoughTheRequestIsGone()
    {
        using var disconnect = new CancellationTokenSource();
        var boreholeId = await context.Boreholes.Select(b => b.Id).FirstAsync();
        var awaiting = new Profile
        {
            BoreholeId = boreholeId,
            Name = "report.pdf",
            NameUuid = null,
            Type = PdfContentType,
            OcrStatus = OcrStatus.WillNotBeProcessed,
        };

        context.Profiles.Add(awaiting);
        await context.SaveChangesAsync();

        var objectKey = $"{Guid.NewGuid()}.pdf";
        var service = CreateProfileCloudService(disconnect);

        await service.LinkUploadedProfileAsync("report.pdf", PdfContentType, objectKey, boreholeId, awaiting.Id, disconnect.Token);

        Assert.IsTrue(disconnect.IsCancellationRequested, "The client never went away, so this says nothing about a write that outlives it.");

        var written = await context.Profiles.AsNoTracking().SingleAsync(p => p.Id == awaiting.Id);
        Assert.AreEqual(objectKey, written.NameUuid, "The row still names nothing, so the commit was aborted.");
    }

    /// <summary>
    /// A log file row an upload creates is committed although the request it arrived on is gone.
    /// The checks that precede it, which do take the request token, have already run by then.
    /// </summary>
    [TestMethod]
    public async Task LinkingALogFileCommitsAlthoughTheRequestIsGone()
    {
        using var disconnect = new CancellationTokenSource();
        var logRun = await context.LogRuns.FirstAsync();
        var objectKey = $"{Guid.NewGuid()}.las";
        var service = CreateLogFileCloudService(disconnect);

        var logFile = await service.LinkUploadedLogFileAsync($"{Guid.NewGuid()}.las", "text/plain", objectKey, logRun.Id, disconnect.Token);

        Assert.IsTrue(disconnect.IsCancellationRequested, "The client never went away, so this says nothing about a write that outlives it.");
        Assert.IsTrue(logFile.Id > 0, "The row was never given an id, so it was never written.");

        var written = await context.LogFiles.AsNoTracking().SingleOrDefaultAsync(f => f.Id == logFile.Id);
        Assert.IsNotNull(written, "The row is not in the database, so the commit was aborted.");
        Assert.AreEqual(objectKey, written.NameUuid);
    }

    /// <summary>
    /// Replacing a log file is committed although the request it arrived on is gone. This is the
    /// worst of the three to abort: the row has already been moved onto the new object, the caller
    /// deletes that object when the completion fails, and the line that removes the object the row
    /// held before is never reached, so the row would name nothing and the old content would stay
    /// in the bucket with nothing pointing at it.
    /// </summary>
    [TestMethod]
    public async Task ReplacingALogFileCommitsAlthoughTheRequestIsGone()
    {
        using var disconnect = new CancellationTokenSource();
        var logRun = await context.LogRuns.FirstAsync();

        // Written without an object, so that the completion has no old object to remove and the
        // test stays about the commit rather than about the cloud storage.
        var existing = new LogFile { LogRunId = logRun.Id, Name = $"{Guid.NewGuid()}.las", NameUuid = null, Public = false };
        context.LogFiles.Add(existing);
        await context.SaveChangesAsync();

        var objectKey = $"{Guid.NewGuid()}.las";
        var endpoint = new ReachableLogFileTusEndpoint(
            context,
            Mock.Of<IBoreholePermissionService>(),
            CreateLogFileCloudService(disconnect),
            CreateStore(configuration["S3:LOGFILES_BUCKET_NAME"]));

        var metadata = new TusUploadMetadata(logRun.Id, existing.Id, existing.Name, "text/plain");
        var storedId = await endpoint.CompleteForTestAsync(CreateDisconnectingContext(disconnect), metadata, objectKey, disconnect.Token);

        Assert.IsTrue(disconnect.IsCancellationRequested, "The client never went away, so this says nothing about a write that outlives it.");
        Assert.AreEqual(existing.Id, storedId);

        var written = await context.LogFiles.AsNoTracking().SingleAsync(f => f.Id == existing.Id);
        Assert.AreEqual(objectKey, written.NameUuid, "The row still names the object it held, so the commit was aborted.");
    }

    private ProfileCloudService CreateProfileCloudService(CancellationTokenSource disconnect) =>
        new(
            context,
            configuration,
            new Mock<ILogger<ProfileCloudService>>().Object,
            CreateDisconnectingAccessor(disconnect),
            s3Client,
            Mock.Of<IServiceScopeFactory>(),
            Mock.Of<IHostApplicationLifetime>());

    private LogFileCloudService CreateLogFileCloudService(CancellationTokenSource disconnect) =>
        new(
            new Mock<ILogger<LogFileCloudService>>().Object,
            s3Client,
            configuration,
            CreateDisconnectingAccessor(disconnect),
            context);

    private S3TusStore CreateStore(string? bucketName) =>
        new(NullLoggerFactory.Instance, s3Client, S3TusStore.CreateConfiguration(bucketName.ToLowerInvariant()));

    private IHttpContextAccessor CreateDisconnectingAccessor(CancellationTokenSource disconnect)
    {
        var accessor = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        accessor.Setup(x => x.HttpContext).Returns(CreateDisconnectingContext(disconnect));
        return accessor.Object;
    }

    private DefaultHttpContext CreateDisconnectingContext(CancellationTokenSource disconnect) =>
        new() { User = new DisconnectingUser(adminIdentity, disconnect) };

    /// <summary>
    /// Reaches the completion the shared endpoint core calls once the last chunk has been answered,
    /// which is otherwise only reachable by driving a whole tus upload.
    /// </summary>
    private sealed class ReachableLogFileTusEndpoint : LogFileTusEndpoint
    {
        public ReachableLogFileTusEndpoint(BdmsContext context, IBoreholePermissionService boreholePermissionService, LogFileCloudService logFileCloudService, S3TusStore store)
            : base(context, boreholePermissionService, logFileCloudService, store)
        {
        }

        public Task<int> CompleteForTestAsync(HttpContext httpContext, TusUploadMetadata metadata, string objectKey, CancellationToken cancellationToken) =>
            CompleteAsync(httpContext, metadata, objectKey, cancellationToken);
    }

    /// <summary>
    /// A user who goes away the moment the write asks who is making the request, which is the first
    /// thing the save does and the last one before it reaches the database. A client that
    /// disconnects while the completion handler is inside the commit arrives exactly here.
    /// </summary>
    private sealed class DisconnectingUser : ClaimsPrincipal
    {
        private readonly CancellationTokenSource disconnect;

        public DisconnectingUser(ClaimsIdentity identity, CancellationTokenSource disconnect)
            : base(identity) => this.disconnect = disconnect;

        public override Claim? FindFirst(string type)
        {
            disconnect.Cancel();
            return base.FindFirst(type);
        }
    }
}
