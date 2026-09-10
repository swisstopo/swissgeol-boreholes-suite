using Amazon.S3;
using BDMS.Authentication;
using BDMS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BDMS.Uploads;

/// <summary>
/// Drives real requests through the tus endpoint, which is the only way to see what the endpoint
/// contributes rather than what the store does: the authorization, the row written once an upload
/// finishes, and the problem response the client reads a reason out of.
/// </summary>
[TestClass]
public class TusUploadEndpointTest
{
    private static BdmsWebApplicationFactory factory;

    private readonly List<string> startedUploadPaths = [];
    private readonly List<string> storedObjectKeys = [];

    private BdmsContext context;
    private AmazonS3Client s3Client;
    private string bucketName;

    [ClassInitialize]
    public static void ClassInitialize(TestContext testContext) => factory = new BdmsWebApplicationFactory();

    [ClassCleanup(ClassCleanupBehavior.EndOfClass)]
    public static void ClassCleanup() => factory?.Dispose();

    [TestInitialize]
    public void TestInitialize()
    {
        var appConfiguration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.GetTestContext();
        bucketName = appConfiguration["S3:LOGFILES_BUCKET_NAME"]!.ToLowerInvariant();

        s3Client = new AmazonS3Client(
            appConfiguration["S3:ACCESS_KEY"],
            appConfiguration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = appConfiguration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = appConfiguration["S3:SECURE"] == "0",
            });
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        // An upload that was created and never finished still holds a multipart upload and the
        // state object beside it, so it is terminated rather than left for the sweeper.
        using (var client = factory.CreateClient())
        {
            foreach (var path in startedUploadPaths)
            {
                using var request = new HttpRequestMessage(HttpMethod.Delete, path);
                request.Headers.Add("Tus-Resumable", "1.0.0");
                request.Headers.Add(TestAuthHandler.SubjectIdHeader, "sub_admin");
                using var response = await client.SendAsync(request);
            }
        }

        foreach (var key in storedObjectKeys)
        {
            await s3Client.DeleteObjectAsync(bucketName, key, CancellationToken.None);
        }

        s3Client.Dispose();
        await context.DisposeAsync();
    }

    private static string Encode(string value) => Convert.ToBase64String(Encoding.UTF8.GetBytes(value));

    private static string Metadata(int logRunId, string fileName, int? logFileId = null)
    {
        var values = new List<string>
        {
            $"logRunId {Encode(logRunId.ToString(CultureInfo.InvariantCulture))}",
            $"filename {Encode(fileName)}",
            $"contentType {Encode("text/plain")}",
        };

        if (logFileId is int id)
        {
            values.Add($"logFileId {Encode(id.ToString(CultureInfo.InvariantCulture))}");
        }

        return string.Join(',', values);
    }

    private static HttpRequestMessage CreateUpload(string? subjectId, int logRunId, string fileName, long uploadLength = 1_000, int? logFileId = null)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, TusUploadConfiguration.EndpointPath);
        request.Headers.Add("Tus-Resumable", "1.0.0");
        request.Headers.Add("Upload-Length", uploadLength.ToString(CultureInfo.InvariantCulture));
        request.Headers.Add("Upload-Metadata", Metadata(logRunId, fileName, logFileId));

        if (subjectId is not null)
        {
            request.Headers.Add(TestAuthHandler.SubjectIdHeader, subjectId);
        }

        return request;
    }

    /// <summary>
    /// Sends a whole file the way the client does, and answers with the id the server stored it as.
    /// </summary>
    private async Task<int> UploadAsync(HttpClient client, int logRunId, string fileName, byte[] content, int? logFileId = null)
    {
        using var created = await client.SendAsync(CreateUpload("sub_admin", logRunId, fileName, content.Length, logFileId));
        Assert.AreEqual(HttpStatusCode.Created, created.StatusCode);

        var uploadPath = created.Headers.Location!.ToString();
        startedUploadPaths.Add(uploadPath);

        using var patch = new HttpRequestMessage(HttpMethod.Patch, uploadPath);
        patch.Headers.Add("Tus-Resumable", "1.0.0");
        patch.Headers.Add("Upload-Offset", "0");
        patch.Headers.Add(TestAuthHandler.SubjectIdHeader, "sub_admin");
        patch.Content = new ByteArrayContent(content);
        patch.Content.Headers.ContentType = new MediaTypeHeaderValue("application/offset+octet-stream");

        using var response = await client.SendAsync(patch);
        Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode, await response.Content.ReadAsStringAsync());

        var reported = response.Headers.GetValues(TusUploadConfiguration.LogFileIdHeader).Single();
        return int.Parse(reported, CultureInfo.InvariantCulture);
    }

    [TestMethod]
    public async Task CreatingAnUploadWithoutAUserIsRefused()
    {
        var logRun = context.LogRuns.First();
        using var client = factory.CreateClient();

        using var response = await client.SendAsync(CreateUpload(null, logRun.Id, $"{Guid.NewGuid()}.las"));

        Assert.IsFalse(response.IsSuccessStatusCode);
    }

    /// <summary>
    /// The endpoint names the role it admits, rather than leaving that to the fallback policy.
    /// The fallback admits administrators alone, which would refuse every user the per-borehole
    /// check is there to admit, and would do so with the status that check answers with itself.
    /// </summary>
    [TestMethod]
    public void TheEndpointAdmitsTheSameRoleAsTheUploadEndpointItStandsIn()
    {
        // Reading the services starts the application, which is what builds the route table.
        var tusRoutes = factory.Services
            .GetServices<EndpointDataSource>()
            .SelectMany(source => source.Endpoints)
            .OfType<RouteEndpoint>()
            .Where(route => $"/{route.RoutePattern.RawText?.TrimStart('/')}"
                .StartsWith(TusUploadConfiguration.EndpointPath, StringComparison.OrdinalIgnoreCase))
            .ToList();

        Assert.IsTrue(tusRoutes.Count > 0, "The tus endpoint is not in the route table.");

        // The endpoint may be reached under more than one route, and each of them is a way in.
        foreach (var route in tusRoutes)
        {
            var policies = route.Metadata
                .GetOrderedMetadata<IAuthorizeData>()
                .Select(data => data.Policy)
                .ToList();

            CollectionAssert.Contains(policies, PolicyNames.Viewer, $"<{route.RoutePattern.RawText}> does not name the role it admits.");
        }
    }

    /// <summary>
    /// Names a user the permission model refuses for the given borehole, so that the test does not
    /// have to assume which of the seeded users that is. Only real users are offered: a subject id
    /// nobody holds would be refused for having no account rather than for lacking the permission.
    /// </summary>
    private async Task<string> RefusedUserAsync(int boreholeId)
    {
        using var scope = factory.Services.CreateScope();
        var permissions = scope.ServiceProvider.GetRequiredService<IBoreholePermissionService>();

        foreach (var subjectId in context.Users.Select(user => user.SubjectId).ToList())
        {
            if (!await permissions.CanEditBoreholeAsync(subjectId, boreholeId))
            {
                return subjectId;
            }
        }

        Assert.Fail($"Every seeded user may edit borehole <{boreholeId}>, so there is nobody to refuse.");
        return string.Empty;
    }

    /// <summary>
    /// A request naming an upload that already exists is authorized against the log run the store
    /// holds for it, not only against the request that created it. Without that an upload id would
    /// be enough to append to, read, or discard an upload somebody else started.
    ///
    /// The role stays at the default the test handler gives, so the endpoint's own policy admits
    /// the request and the refusal can only come from the per-borehole check.
    /// </summary>
    [TestMethod]
    public async Task TouchingAnExistingUploadWithoutEditPermissionIsRefused()
    {
        var logRun = context.LogRuns.First();
        var refusedUser = await RefusedUserAsync(logRun.BoreholeId);
        using var client = factory.CreateClient();

        using var created = await client.SendAsync(CreateUpload("sub_admin", logRun.Id, $"{Guid.NewGuid()}.las"));
        Assert.AreEqual(HttpStatusCode.Created, created.StatusCode);

        var uploadPath = created.Headers.Location!.ToString();
        startedUploadPaths.Add(uploadPath);

        foreach (var method in new[] { HttpMethod.Head, HttpMethod.Patch, HttpMethod.Delete })
        {
            using var request = new HttpRequestMessage(method, uploadPath);
            request.Headers.Add("Tus-Resumable", "1.0.0");
            request.Headers.Add(TestAuthHandler.SubjectIdHeader, refusedUser);

            if (method == HttpMethod.Patch)
            {
                request.Headers.Add("Upload-Offset", "0");
                request.Content = new ByteArrayContent(new byte[10]);
                request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/offset+octet-stream");
            }

            using var response = await client.SendAsync(request);

            Assert.AreEqual(
                HttpStatusCode.Unauthorized,
                response.StatusCode,
                $"{method} by <{refusedUser}>, who may not edit the borehole, was not refused.");
        }

        // The refused DELETE has to have left the upload alone rather than quietly removing it.
        using var stillThere = new HttpRequestMessage(HttpMethod.Head, uploadPath);
        stillThere.Headers.Add("Tus-Resumable", "1.0.0");
        stillThere.Headers.Add(TestAuthHandler.SubjectIdHeader, "sub_admin");

        using var headResponse = await client.SendAsync(stillThere);

        // Answered rather than answered with a particular code: what matters is that the upload is
        // still known and still holds nothing, not which success the protocol reports it with.
        Assert.IsTrue(headResponse.IsSuccessStatusCode, $"The upload is gone: {headResponse.StatusCode}.");
        Assert.IsTrue(
            headResponse.Headers.TryGetValues("Upload-Offset", out var offsets),
            "The upload no longer reports an offset.");
        Assert.AreEqual("0", offsets!.Single());
    }

    [TestMethod]
    public async Task CreatingAnUploadAnswersWithSomewhereToSendTheChunks()
    {
        var logRun = context.LogRuns.First();
        using var client = factory.CreateClient();

        using var response = await client.SendAsync(CreateUpload("sub_admin", logRun.Id, $"{Guid.NewGuid()}.las"));

        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        Assert.IsNotNull(response.Headers.Location);

        startedUploadPaths.Add(response.Headers.Location.ToString());
    }

    [TestMethod]
    public async Task CreatingAnUploadForANameTheLogRunHoldsIsRefusedBeforeAnyBytesAreSent()
    {
        var existing = context.LogFiles.First(f => f.Name != null);
        using var client = factory.CreateClient();

        using var response = await client.SendAsync(CreateUpload("sub_admin", existing.LogRunId, existing.Name!));

        Assert.IsFalse(response.IsSuccessStatusCode, "The upload is refused before the client sends anything.");

        // The client shows the reason only for a problem body marked as one the user can act on.
        // Anything else reaches it as a bare transport failure with no message to display.
        var body = await response.Content.ReadAsStringAsync();
        var problem = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(body);

        Assert.IsNotNull(problem, $"The refusal carries a problem body the client can read. It carried: {body}");
        Assert.IsTrue(problem.TryGetValue("type", out var type), $"The refusal names a problem type. It carried: {body}");
        Assert.AreEqual("userError", type.GetString());
        StringAssert.Contains(problem["detail"].GetString(), existing.Name!);
    }

    [TestMethod]
    public async Task FinishingAnUploadRecordsTheFileAndSaysWhatItStored()
    {
        var logRun = context.LogRuns.First();
        var fileName = $"{Guid.NewGuid()}.las";
        var content = Encoding.UTF8.GetBytes("log data");
        using var client = factory.CreateClient();

        var logFileId = await UploadAsync(client, logRun.Id, fileName, content);

        Assert.IsTrue(logFileId > 0, "The client is told which log file the server stored.");

        var logFile = await context.LogFiles.AsNoTracking().SingleOrDefaultAsync(f => f.Id == logFileId);
        Assert.IsNotNull(logFile);
        Assert.AreEqual(fileName, logFile.Name);
        Assert.AreEqual(logRun.Id, logFile.LogRunId);
        Assert.IsNotNull(logFile.NameUuid);
        storedObjectKeys.Add(logFile.NameUuid);

        var stored = await s3Client.GetObjectMetadataAsync(bucketName, logFile.NameUuid, CancellationToken.None);
        Assert.AreEqual(content.Length, stored.ContentLength, "The object holds every byte that was sent.");
    }

    [TestMethod]
    public async Task FinishingAnUploadThatReplacesAFileKeepsOneEntryUnderThatName()
    {
        var logRun = context.LogRuns.First();
        var fileName = $"{Guid.NewGuid()}.las";
        using var client = factory.CreateClient();

        var logFileId = await UploadAsync(client, logRun.Id, fileName, Encoding.UTF8.GetBytes("first"));
        var replacedKey = (await context.LogFiles.AsNoTracking().SingleAsync(f => f.Id == logFileId)).NameUuid!;

        var replacement = Encoding.UTF8.GetBytes("second content");
        var replacedId = await UploadAsync(client, logRun.Id, fileName, replacement, logFileId);

        Assert.AreEqual(logFileId, replacedId, "Replacing a file keeps the entry it replaces.");

        var logFile = await context.LogFiles.AsNoTracking().SingleAsync(f => f.Id == logFileId);
        Assert.AreNotEqual(replacedKey, logFile.NameUuid, "The row points at the object that was just uploaded.");
        storedObjectKeys.Add(logFile.NameUuid!);

        var stored = await s3Client.GetObjectMetadataAsync(bucketName, logFile.NameUuid!, CancellationToken.None);
        Assert.AreEqual(replacement.Length, stored.ContentLength);

        // Nothing points at the object the row moved off, and its name is never handed out again,
        // so leaving it would keep it in the bucket for good.
        var exception = await Assert.ThrowsExactlyAsync<AmazonS3Exception>(async () =>
            await s3Client.GetObjectMetadataAsync(bucketName, replacedKey, CancellationToken.None));
        Assert.AreEqual(HttpStatusCode.NotFound, exception.StatusCode, "The object it pointed at before is gone.");

        Assert.AreEqual(
            1,
            await context.LogFiles.CountAsync(f => f.LogRunId == logRun.Id && f.Name == fileName),
            "The run holds one entry under that name.");
    }
}
