using Amazon.S3;
using BDMS.Authentication;
using BDMS.Models;
using BDMS.Services;
using BDMS.Uploads.S3;
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
    // The route and the header the client depends on are pinned here rather than read back from
    // the endpoint, which would let the test move along with whatever it is meant to hold still.
    private const string EndpointPath = "/api/v2/log/upload/tus";
    private const string LogFileIdHeader = "Log-File-Id";

    // The segment every chunked upload route carries, so that a route added for another feature is
    // found without this test being told about it.
    private const string UploadPathSegment = "/upload/tus";

    private const string SubAdmin = "sub_admin";
    private const string TusResumableHeader = "Tus-Resumable";
    private const string TusVersion = "1.0.0";
    private const string UploadOffsetHeader = "Upload-Offset";
    private const string OffsetContentType = "application/offset+octet-stream";

    private static BdmsWebApplicationFactory factory;

    private readonly List<string> startedUploadPaths = [];
    private readonly List<string> storedObjectKeys = [];
    private readonly List<int> insertedLogFileIds = [];

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
        bucketName = appConfiguration["S3:LOGFILES_BUCKET_NAME"].ToLowerInvariant();

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
                request.Headers.Add(TusResumableHeader, TusVersion);
                request.Headers.Add(TestAuthHandler.SubjectIdHeader, SubAdmin);
                using var response = await client.SendAsync(request);
            }
        }

        foreach (var key in storedObjectKeys)
        {
            await s3Client.DeleteObjectAsync(bucketName, key, CancellationToken.None);
        }

        // Rows a test inserted to stand in for an import are written through a context of their
        // own, committed outside the class context's transaction so the server can see them; that
        // means the class context's rollback on dispose never removes them, so they are removed
        // here instead.
        if (insertedLogFileIds.Count > 0)
        {
            await using var cleanupContext = ContextFactory.CreateContext();
            cleanupContext.LogFiles.RemoveRange(cleanupContext.LogFiles.Where(f => insertedLogFileIds.Contains(f.Id)));
            await cleanupContext.SaveChangesAsync();
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
        var request = new HttpRequestMessage(HttpMethod.Post, EndpointPath);
        request.Headers.Add(TusResumableHeader, TusVersion);
        request.Headers.Add("Upload-Length", uploadLength.ToString(CultureInfo.InvariantCulture));
        request.Headers.Add("Upload-Metadata", Metadata(logRunId, fileName, logFileId));

        if (subjectId is not null)
        {
            request.Headers.Add(TestAuthHandler.SubjectIdHeader, subjectId);
        }

        return request;
    }

    /// <summary>
    /// Sends a whole file the way the client does, in chunks of the size it sends, and answers
    /// with the id the server stored it as.
    /// </summary>
    private async Task<int> UploadAsync(HttpClient client, int logRunId, string fileName, byte[] content, int? logFileId = null)
    {
        using var created = await client.SendAsync(CreateUpload(SubAdmin, logRunId, fileName, content.Length, logFileId));
        Assert.AreEqual(HttpStatusCode.Created, created.StatusCode);

        var uploadPath = created.Headers.Location.ToString();
        startedUploadPaths.Add(uploadPath);

        string? reported = null;
        for (var offset = 0; offset < content.Length; offset += S3TusStore.ChunkSize)
        {
            var length = Math.Min(S3TusStore.ChunkSize, content.Length - offset);

            using var patch = new HttpRequestMessage(HttpMethod.Patch, uploadPath);
            patch.Headers.Add(TusResumableHeader, TusVersion);
            patch.Headers.Add(UploadOffsetHeader, offset.ToString(CultureInfo.InvariantCulture));
            patch.Headers.Add(TestAuthHandler.SubjectIdHeader, SubAdmin);
            patch.Content = new ByteArrayContent(content, offset, length);
            patch.Content.Headers.ContentType = new MediaTypeHeaderValue(OffsetContentType);

            using var response = await client.SendAsync(patch);
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode, await response.Content.ReadAsStringAsync());

            response.Headers.TryGetValues(LogFileIdHeader, out var values);
            reported ??= values?.SingleOrDefault();
        }

        Assert.IsNotNull(reported, "The client is never told which log file the server stored.");
        return int.Parse(reported, CultureInfo.InvariantCulture);
    }

    [TestMethod]
    public async Task CreatingAnUploadWithoutAUserIsRefused()
    {
        var logRun = await context.LogRuns.FirstAsync();
        using var client = factory.CreateClient();

        using var response = await client.SendAsync(CreateUpload(null, logRun.Id, $"{Guid.NewGuid()}.las"));

        Assert.IsFalse(response.IsSuccessStatusCode);
    }

    /// <summary>
    /// The endpoint answers with the header its own subclass names, rather than one the base
    /// picked. A feature that reported another feature's header would leave its client reading an
    /// id that is not its own.
    /// </summary>
    [TestMethod]
    public void TheLogEndpointNamesItsOwnPathAndResultHeader()
    {
        using var scope = factory.Services.CreateScope();
        var endpoint = scope.ServiceProvider.GetRequiredService<LogFileTusEndpoint>();

        Assert.AreEqual(EndpointPath, endpoint.EndpointPath);
        Assert.AreEqual(LogFileIdHeader, endpoint.ResultHeaderName);
        Assert.IsInstanceOfType<TusUploadEndpoint<TusUploadMetadata>>(endpoint);
    }

    /// <summary>
    /// Every route an upload is mapped at is one the middleware that turns a refusal into a problem
    /// response is wrapped around. A route mapped outside it answers a refusal with a bare failure
    /// the client can read no reason out of, and nothing else would say so.
    /// </summary>
    [TestMethod]
    public void EveryMappedUploadRouteIsOneTheProblemResponseMiddlewareWraps()
    {
        // Reading the services starts the application, which is what builds the route table.
        var uploadPaths = factory.Services
            .GetServices<EndpointDataSource>()
            .SelectMany(source => source.Endpoints)
            .OfType<RouteEndpoint>()
            .Select(route => $"/{route.RoutePattern.RawText?.TrimStart('/')}")
            .Where(path => path.Contains(UploadPathSegment, StringComparison.OrdinalIgnoreCase))
            .ToList();

        Assert.IsTrue(uploadPaths.Count > 0, "No upload route is in the route table.");

        foreach (var path in uploadPaths)
        {
            Assert.IsTrue(UploadRoutes.Matches(path), $"<{path}> is mapped where the middleware does not reach it.");
        }
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
                .StartsWith(EndpointPath, StringComparison.OrdinalIgnoreCase))
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

        foreach (var subjectId in await context.Users.Select(user => user.SubjectId).ToListAsync())
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
        var logRun = await context.LogRuns.FirstAsync();
        var refusedUser = await RefusedUserAsync(logRun.BoreholeId);
        using var client = factory.CreateClient();

        using var created = await client.SendAsync(CreateUpload(SubAdmin, logRun.Id, $"{Guid.NewGuid()}.las"));
        Assert.AreEqual(HttpStatusCode.Created, created.StatusCode);

        var uploadPath = created.Headers.Location.ToString();
        startedUploadPaths.Add(uploadPath);

        foreach (var method in new[] { HttpMethod.Head, HttpMethod.Patch, HttpMethod.Delete })
        {
            using var request = new HttpRequestMessage(method, uploadPath);
            request.Headers.Add(TusResumableHeader, TusVersion);
            request.Headers.Add(TestAuthHandler.SubjectIdHeader, refusedUser);

            if (method == HttpMethod.Patch)
            {
                request.Headers.Add(UploadOffsetHeader, "0");
                request.Content = new ByteArrayContent(new byte[10]);
                request.Content.Headers.ContentType = new MediaTypeHeaderValue(OffsetContentType);
            }

            using var response = await client.SendAsync(request);

            Assert.AreEqual(
                HttpStatusCode.Unauthorized,
                response.StatusCode,
                $"{method} by <{refusedUser}>, who may not edit the borehole, was not refused.");
        }

        // The refused DELETE has to have left the upload alone rather than quietly removing it.
        using var stillThere = new HttpRequestMessage(HttpMethod.Head, uploadPath);
        stillThere.Headers.Add(TusResumableHeader, TusVersion);
        stillThere.Headers.Add(TestAuthHandler.SubjectIdHeader, SubAdmin);

        using var headResponse = await client.SendAsync(stillThere);

        // Answered rather than answered with a particular code: what matters is that the upload is
        // still known and still holds nothing, not which success the protocol reports it with.
        Assert.IsTrue(headResponse.IsSuccessStatusCode, $"The upload is gone: {headResponse.StatusCode}.");
        Assert.IsTrue(
            headResponse.Headers.TryGetValues(UploadOffsetHeader, out var offsets),
            "The upload no longer reports an offset.");
        Assert.AreEqual("0", offsets.Single());
    }

    [TestMethod]
    public async Task CreatingAnUploadAnswersWithSomewhereToSendTheChunks()
    {
        var logRun = await context.LogRuns.FirstAsync();
        using var client = factory.CreateClient();

        using var response = await client.SendAsync(CreateUpload(SubAdmin, logRun.Id, $"{Guid.NewGuid()}.las"));

        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        Assert.IsNotNull(response.Headers.Location);

        startedUploadPaths.Add(response.Headers.Location.ToString());
    }

    /// <summary>
    /// The ceiling the product allows is refused as the upload is created, before a single byte is
    /// sent. Nothing else holds the limit: it is handed to the upload package by the shared
    /// endpoint core, and a build that stopped handing it over would accept a file of any size
    /// while every other test still passed.
    /// </summary>
    [TestMethod]
    public async Task CreatingAnUploadLargerThanTheLimitIsRefused()
    {
        var logRun = await context.LogRuns.FirstAsync();
        using var client = factory.CreateClient();

        using var response = await client.SendAsync(
            CreateUpload(SubAdmin, logRun.Id, $"{Guid.NewGuid()}.las", FileSizeLimits.Large + 1));

        Assert.AreEqual(HttpStatusCode.RequestEntityTooLarge, response.StatusCode, await response.Content.ReadAsStringAsync());
        Assert.IsNull(response.Headers.Location, "The client was told where to send a file the server will not take.");
    }

    [TestMethod]
    public async Task CreatingAnUploadForANameTheLogRunHoldsIsRefusedBeforeAnyBytesAreSent()
    {
        var existing = await context.LogFiles.FirstAsync(f => f.Name != null);
        using var client = factory.CreateClient();

        using var response = await client.SendAsync(CreateUpload(SubAdmin, existing.LogRunId, existing.Name));

        Assert.IsFalse(response.IsSuccessStatusCode, "The upload is refused before the client sends anything.");

        // The client shows the reason only for a problem body marked as one the user can act on.
        // Anything else reaches it as a bare transport failure with no message to display.
        var body = await response.Content.ReadAsStringAsync();
        var problem = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(body);

        Assert.IsNotNull(problem, $"The refusal carries a problem body the client can read. It carried: {body}");
        Assert.IsTrue(problem.TryGetValue("type", out var type), $"The refusal names a problem type. It carried: {body}");
        Assert.AreEqual("userError", type.GetString());
        StringAssert.Contains(problem["detail"].GetString(), existing.Name);
        Assert.AreEqual(LogFileNameTakenException.MessageKeyValue, problem["messageKey"].GetString());
        Assert.AreEqual(existing.Name, problem["fileName"].GetString());
    }

    [TestMethod]
    public async Task FinishingAnUploadRecordsTheFileAndSaysWhatItStored()
    {
        var logRun = await context.LogRuns.FirstAsync();
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

    /// <summary>
    /// A file long enough to arrive over several requests, which is what the endpoint exists for.
    /// The cloud storage refuses to assemble an object out of parts that are not all of a legal
    /// size, and how the chunks are cut into parts is only visible once there is more than one.
    /// </summary>
    [TestMethod]
    public async Task FinishingAnUploadSentOverSeveralRequestsStoresEveryByte()
    {
        var logRun = await context.LogRuns.FirstAsync();
        var fileName = $"{Guid.NewGuid()}.las";
        var content = new byte[(2 * S3TusStore.ChunkSize) + 1_000];
        Random.Shared.NextBytes(content);
        using var client = factory.CreateClient();

        var logFileId = await UploadAsync(client, logRun.Id, fileName, content);

        var logFile = await context.LogFiles.AsNoTracking().SingleAsync(f => f.Id == logFileId);
        Assert.IsNotNull(logFile.NameUuid);
        storedObjectKeys.Add(logFile.NameUuid);

        var stored = await s3Client.GetObjectMetadataAsync(bucketName, logFile.NameUuid, CancellationToken.None);
        Assert.AreEqual(content.Length, stored.ContentLength, "The object holds every byte that was sent.");
    }

    /// <summary>
    /// A chunk arriving after the upload is finished, which a client that lost the answer to the
    /// last one would send. The store cannot refuse it in terms the client understands, so what
    /// matters is that the request never reaches it: a server error is the one answer the upload
    /// client keeps retrying.
    /// </summary>
    [TestMethod]
    public async Task RepeatingTheLastChunkOfAFinishedUploadIsNotAServerError()
    {
        var logRun = await context.LogRuns.FirstAsync();
        var content = Encoding.UTF8.GetBytes("log data");
        using var client = factory.CreateClient();

        using var created = await client.SendAsync(CreateUpload(SubAdmin, logRun.Id, $"{Guid.NewGuid()}.las", content.Length));
        var uploadPath = created.Headers.Location.ToString();
        startedUploadPaths.Add(uploadPath);

        using var first = new HttpRequestMessage(HttpMethod.Patch, uploadPath);
        first.Headers.Add(TusResumableHeader, TusVersion);
        first.Headers.Add(UploadOffsetHeader, "0");
        first.Headers.Add(TestAuthHandler.SubjectIdHeader, SubAdmin);
        first.Content = new ByteArrayContent(content);
        first.Content.Headers.ContentType = new MediaTypeHeaderValue(OffsetContentType);

        using var finished = await client.SendAsync(first);
        Assert.AreEqual(HttpStatusCode.NoContent, finished.StatusCode);
        storedObjectKeys.Add((await context.LogFiles.AsNoTracking().SingleAsync(f =>
            f.Id == int.Parse(finished.Headers.GetValues(LogFileIdHeader).Single(), CultureInfo.InvariantCulture))).NameUuid);

        using var again = new HttpRequestMessage(HttpMethod.Patch, uploadPath);
        again.Headers.Add(TusResumableHeader, TusVersion);
        again.Headers.Add(UploadOffsetHeader, "0");
        again.Headers.Add(TestAuthHandler.SubjectIdHeader, SubAdmin);
        again.Content = new ByteArrayContent(content);
        again.Content.Headers.ContentType = new MediaTypeHeaderValue(OffsetContentType);

        using var repeated = await client.SendAsync(again);

        Assert.IsTrue(
            (int)repeated.StatusCode < 500,
            $"The repeated chunk was answered with <{(int)repeated.StatusCode}>, which the client retries.");
    }

    /// <summary>
    /// An empty file is a file. It carries no chunk, so the upload is finished by the request that
    /// creates it and nothing ever writes bytes into the cloud storage for it.
    /// </summary>
    [TestMethod]
    public async Task FinishingAnUploadThatCarriesNoBytesRecordsTheFile()
    {
        var logRun = await context.LogRuns.FirstAsync();
        var fileName = $"{Guid.NewGuid()}.las";
        using var client = factory.CreateClient();

        using var created = await client.SendAsync(CreateUpload(SubAdmin, logRun.Id, fileName, uploadLength: 0));
        Assert.AreEqual(HttpStatusCode.Created, created.StatusCode);
        startedUploadPaths.Add(created.Headers.Location.ToString());

        var reported = created.Headers.GetValues(LogFileIdHeader).Single();
        var logFile = await context.LogFiles.AsNoTracking().SingleAsync(f => f.Id == int.Parse(reported, CultureInfo.InvariantCulture));

        Assert.AreEqual(fileName, logFile.Name);
        Assert.IsNotNull(logFile.NameUuid);
        storedObjectKeys.Add(logFile.NameUuid);

        var stored = await s3Client.GetObjectMetadataAsync(bucketName, logFile.NameUuid, CancellationToken.None);
        Assert.AreEqual(0, stored.ContentLength, "The row points at an object that is there and holds nothing.");
    }

    [TestMethod]
    public async Task FinishingAnUploadThatReplacesAFileKeepsOneEntryUnderThatName()
    {
        var logRun = await context.LogRuns.FirstAsync();
        var fileName = $"{Guid.NewGuid()}.las";
        using var client = factory.CreateClient();

        var logFileId = await UploadAsync(client, logRun.Id, fileName, Encoding.UTF8.GetBytes("first"));
        var replacedKey = (await context.LogFiles.AsNoTracking().SingleAsync(f => f.Id == logFileId)).NameUuid;

        var replacement = Encoding.UTF8.GetBytes("second content");
        var replacedId = await UploadAsync(client, logRun.Id, fileName, replacement, logFileId);

        Assert.AreEqual(logFileId, replacedId, "Replacing a file keeps the entry it replaces.");

        var logFile = await context.LogFiles.AsNoTracking().SingleAsync(f => f.Id == logFileId);
        Assert.AreNotEqual(replacedKey, logFile.NameUuid, "The row points at the object that was just uploaded.");
        storedObjectKeys.Add(logFile.NameUuid);

        var stored = await s3Client.GetObjectMetadataAsync(bucketName, logFile.NameUuid, CancellationToken.None);
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

    /// <summary>
    /// An import can write a row before any object exists for it, so the row it points at first is
    /// null. Completing the upload against that row has to store the object and adopt it, not treat
    /// the missing predecessor as something to delete.
    /// </summary>
    [TestMethod]
    public async Task FinishingAnUploadAgainstARecordWithoutAnObjectStoresTheObject()
    {
        var logRun = await context.LogRuns.FirstAsync();
        var fileName = $"{Guid.NewGuid()}.las";
        var content = Encoding.UTF8.GetBytes("log data");
        using var client = factory.CreateClient();

        var logFile = new LogFile { LogRunId = logRun.Id, Name = fileName, NameUuid = null, Public = false };

        // Inserted through a context of its own, and committed immediately, so the row is visible
        // to the server the request goes to rather than sitting in the class context's transaction.
        await using (var setupContext = ContextFactory.CreateContext())
        {
            setupContext.LogFiles.Add(logFile);
            await setupContext.SaveChangesAsync();
        }

        insertedLogFileIds.Add(logFile.Id);

        var uploadedId = await UploadAsync(client, logRun.Id, fileName, content, logFile.Id);

        Assert.AreEqual(logFile.Id, uploadedId, "Completing an import-created record keeps the entry it completes.");

        var stored = await context.LogFiles.AsNoTracking().SingleAsync(f => f.Id == logFile.Id);
        Assert.IsNotNull(stored.NameUuid);
        storedObjectKeys.Add(stored.NameUuid);

        var storedObject = await s3Client.GetObjectMetadataAsync(bucketName, stored.NameUuid, CancellationToken.None);
        Assert.AreEqual(content.Length, storedObject.ContentLength, "The object holds every byte that was sent.");

        Assert.AreEqual(
            1,
            await context.LogFiles.CountAsync(f => f.LogRunId == logRun.Id && f.Name == fileName),
            "No second row was created for the file.");
    }
}
