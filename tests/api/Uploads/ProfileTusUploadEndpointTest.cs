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

namespace BDMS.Uploads;

/// <summary>
/// Drives real requests through the profile tus endpoint, which is the only way to see what the
/// endpoint contributes rather than what the store does: the authorization, the row written once an
/// upload finishes, and the id the client is told to look the profile up by.
/// </summary>
[TestClass]
public class ProfileTusUploadEndpointTest
{
    // The route and the header the client depends on are pinned here rather than read back from
    // the endpoint, which would let the test move along with whatever it is meant to hold still.
    private const string EndpointPath = "/api/v2/profile/upload/tus";
    private const string ProfileIdHeader = "Profile-Id";

    private const string PdfContentType = "application/pdf";
    private const string SubAdmin = "sub_admin";
    private const string TusResumableHeader = "Tus-Resumable";
    private const string TusVersion = "1.0.0";
    private const string UploadOffsetHeader = "Upload-Offset";
    private const string OffsetContentType = "application/offset+octet-stream";

    // How far into the boreholes a test looks for one it may edit. Every seeded workgroup holds
    // far fewer than this, so a database that offers none within them offers none at all.
    private const int BoreholesToOffer = 50;

    private static BdmsWebApplicationFactory factory;

    private readonly List<string> startedUploadPaths = [];
    private readonly List<string> storedObjectKeys = [];
    private readonly List<int> writtenProfileIds = [];

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
        bucketName = appConfiguration["S3:BUCKET_NAME"].ToLowerInvariant();

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

        // Rows written through the server, and rows a test inserted to stand in for an import, are
        // both committed outside the class context's transaction so the server can see them; that
        // means the class context's rollback on dispose never removes them, so they are removed
        // here instead.
        if (writtenProfileIds.Count > 0)
        {
            await using var cleanupContext = ContextFactory.CreateContext();
            cleanupContext.Profiles.RemoveRange(cleanupContext.Profiles.Where(p => writtenProfileIds.Contains(p.Id)));
            await cleanupContext.SaveChangesAsync();
        }

        s3Client.Dispose();
        await context.DisposeAsync();
    }

    private static string Encode(string value) => Convert.ToBase64String(Encoding.UTF8.GetBytes(value));

    private static string Metadata(int boreholeId, string fileName, int? profileId = null)
    {
        var values = new List<string>
        {
            $"boreholeId {Encode(boreholeId.ToString(CultureInfo.InvariantCulture))}",
            $"filename {Encode(fileName)}",
            $"contentType {Encode(PdfContentType)}",
        };

        if (profileId is int id)
        {
            values.Add($"profileId {Encode(id.ToString(CultureInfo.InvariantCulture))}");
        }

        return string.Join(',', values);
    }

    private static Dictionary<string, string> MetadataValues(string boreholeId, string? profileId = null)
    {
        var values = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["boreholeId"] = boreholeId,
            ["filename"] = "report.pdf",
            ["contentType"] = PdfContentType,
        };

        if (profileId is not null) values["profileId"] = profileId;

        return values;
    }

    private static HttpRequestMessage CreateUpload(string? subjectId, int boreholeId, string fileName, long uploadLength = 1_000, int? profileId = null)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, EndpointPath);
        request.Headers.Add(TusResumableHeader, TusVersion);
        request.Headers.Add("Upload-Length", uploadLength.ToString(CultureInfo.InvariantCulture));
        request.Headers.Add("Upload-Metadata", Metadata(boreholeId, fileName, profileId));

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
    private async Task<int> UploadAsync(HttpClient client, int boreholeId, string fileName, byte[] content, int? profileId = null)
    {
        using var created = await client.SendAsync(CreateUpload(SubAdmin, boreholeId, fileName, content.Length, profileId));
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

            response.Headers.TryGetValues(ProfileIdHeader, out var values);
            reported ??= values?.SingleOrDefault();
        }

        Assert.IsNotNull(reported, "The client is never told which profile the server stored.");

        var storedProfileId = int.Parse(reported, CultureInfo.InvariantCulture);
        writtenProfileIds.Add(storedProfileId);
        return storedProfileId;
    }

    /// <summary>
    /// Names a borehole the seeded administrator may edit, so that the test does not have to assume
    /// that the first borehole in the database is one: a reviewed or published borehole is refused
    /// to everyone, and the upload would then fail for a reason none of these tests is about.
    /// </summary>
    private async Task<int> EditableBoreholeIdAsync()
    {
        using var scope = factory.Services.CreateScope();
        var permissions = scope.ServiceProvider.GetRequiredService<IBoreholePermissionService>();

        foreach (var boreholeId in await context.Boreholes.OrderBy(b => b.Id).Select(b => b.Id).Take(BoreholesToOffer).ToListAsync())
        {
            if (await permissions.CanEditBoreholeAsync(SubAdmin, boreholeId)) return boreholeId;
        }

        Assert.Fail("No borehole the seeded administrator may edit, so there is nothing to upload against.");
        return 0;
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
    /// The endpoint answers with the header its own subclass names, rather than one the base
    /// picked. A feature that reported another feature's header would leave its client reading an
    /// id that is not its own.
    /// </summary>
    [TestMethod]
    public void TheProfileEndpointNamesItsOwnPathAndResultHeader()
    {
        using var scope = factory.Services.CreateScope();
        var endpoint = scope.ServiceProvider.GetRequiredService<ProfileTusEndpoint>();

        Assert.AreEqual(EndpointPath, endpoint.EndpointPath);
        Assert.AreEqual(ProfileIdHeader, endpoint.ResultHeaderName);
        Assert.IsInstanceOfType<TusUploadEndpoint<ProfileUploadMetadata>>(endpoint);
    }

    /// <summary>
    /// The endpoint names the role it admits, rather than leaving that to the fallback policy.
    /// The fallback admits administrators alone, which would refuse every user the per-borehole
    /// check is there to admit, and would do so with the status that check answers with itself.
    /// </summary>
    [TestMethod]
    public void TheEndpointAdmitsTheRoleThePerBoreholeCheckIsThereToAdmit()
    {
        // Reading the services starts the application, which is what builds the route table.
        var tusRoutes = factory.Services
            .GetServices<EndpointDataSource>()
            .SelectMany(source => source.Endpoints)
            .OfType<RouteEndpoint>()
            .Where(route => $"/{route.RoutePattern.RawText?.TrimStart('/')}"
                .StartsWith(EndpointPath, StringComparison.OrdinalIgnoreCase))
            .ToList();

        Assert.IsTrue(tusRoutes.Count > 0, "The profile tus endpoint is not in the route table.");

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

    [TestMethod]
    public async Task FinishingAnUploadRecordsTheProfileAndSaysWhatItStored()
    {
        var boreholeId = await EditableBoreholeIdAsync();
        var fileName = $"{Guid.NewGuid()}.pdf";
        var content = Encoding.UTF8.GetBytes("%PDF-1.4 content");
        using var client = factory.CreateClient();

        var profileId = await UploadAsync(client, boreholeId, fileName, content);

        var profile = await context.Profiles.AsNoTracking().SingleAsync(p => p.Id == profileId);
        Assert.AreEqual(fileName, profile.Name);
        Assert.AreEqual(boreholeId, profile.BoreholeId);
        Assert.AreEqual(PdfContentType, profile.Type);
        Assert.IsNotNull(profile.NameUuid);
        storedObjectKeys.Add(profile.NameUuid);

        var stored = await s3Client.GetObjectMetadataAsync(bucketName, profile.NameUuid, CancellationToken.None);
        Assert.AreEqual(content.Length, stored.ContentLength, "The object holds every byte that was sent.");
    }

    /// <summary>
    /// The case the borehole import relies on: the row exists with no object, and the upload fills
    /// it rather than creating a second profile beside it.
    /// </summary>
    [TestMethod]
    public async Task FinishingAnUploadAgainstAnAwaitingProfileFillsIt()
    {
        var boreholeId = await EditableBoreholeIdAsync();
        var fileName = $"{Guid.NewGuid()}.pdf";
        var profile = new Profile
        {
            BoreholeId = boreholeId,
            Name = fileName,
            NameUuid = null,
            Type = PdfContentType,
            OcrStatus = OcrStatus.WillNotBeProcessed,
        };

        // Inserted through a context of its own, and committed immediately, so the row is visible
        // to the server the request goes to rather than sitting in the class context's transaction.
        await using (var setupContext = ContextFactory.CreateContext())
        {
            setupContext.Profiles.Add(profile);
            await setupContext.SaveChangesAsync();
        }

        writtenProfileIds.Add(profile.Id);
        using var client = factory.CreateClient();

        var uploadedId = await UploadAsync(client, boreholeId, fileName, Encoding.UTF8.GetBytes("%PDF-1.4"), profile.Id);

        Assert.AreEqual(profile.Id, uploadedId, "Completing an import-created record keeps the entry it completes.");

        var stored = await context.Profiles.AsNoTracking().SingleAsync(p => p.Id == profile.Id);
        Assert.IsNotNull(stored.NameUuid);
        storedObjectKeys.Add(stored.NameUuid);

        Assert.AreEqual(
            1,
            await context.Profiles.CountAsync(p => p.BoreholeId == boreholeId && p.Name == fileName),
            "No second row was created for the file.");
    }

    /// <summary>
    /// Every request is checked, not only the one that creates the upload, because an upload
    /// outlives the permission it started with by as long as the file takes to send.
    /// </summary>
    [TestMethod]
    public async Task TouchingAnExistingUploadWithoutEditPermissionIsRefused()
    {
        var boreholeId = await EditableBoreholeIdAsync();
        var refusedUser = await RefusedUserAsync(boreholeId);
        using var client = factory.CreateClient();

        using var created = await client.SendAsync(CreateUpload(SubAdmin, boreholeId, $"{Guid.NewGuid()}.pdf"));
        Assert.AreEqual(HttpStatusCode.Created, created.StatusCode);

        var uploadPath = created.Headers.Location.ToString();
        startedUploadPaths.Add(uploadPath);

        using var request = new HttpRequestMessage(HttpMethod.Head, uploadPath);
        request.Headers.Add(TusResumableHeader, TusVersion);
        request.Headers.Add(TestAuthHandler.SubjectIdHeader, refusedUser);

        using var response = await client.SendAsync(request);

        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// A borehole nothing holds is refused before a single byte is sent, and refused even to an
    /// administrator. Completing an upload writes a row against the id the upload names and trusts
    /// that it is one, so an id that reached completion would be answered by the database with a
    /// failure the user can read nothing out of, after the whole file had already been sent.
    /// </summary>
    [TestMethod]
    public async Task CreatingAnUploadForABoreholeThatDoesNotExistIsRefused()
    {
        var unknownBoreholeId = await context.Boreholes.MaxAsync(b => b.Id) + 1;
        using var client = factory.CreateClient();

        using var response = await client.SendAsync(CreateUpload(SubAdmin, unknownBoreholeId, $"{Guid.NewGuid()}.pdf"));

        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.AreEqual(0, await context.Profiles.CountAsync(p => p.BoreholeId == unknownBoreholeId));
    }

    [TestMethod]
    public void TryReadAcceptsTheMetadataTheClientSends()
    {
        Assert.IsTrue(ProfileUploadMetadata.TryRead(MetadataValues("42"), out var metadata));
        Assert.AreEqual(42, metadata.BoreholeId);
        Assert.IsNull(metadata.ProfileId);
        Assert.AreEqual("report.pdf", metadata.FileName);
        Assert.AreEqual(PdfContentType, metadata.ContentType);
    }

    [TestMethod]
    public void TryReadReadsTheRowBeingFilled()
    {
        Assert.IsTrue(ProfileUploadMetadata.TryRead(MetadataValues("42", "7"), out var metadata));
        Assert.AreEqual(7, metadata.ProfileId);
    }

    /// <summary>
    /// Creating the upload accepts this, so completing it has to accept it too rather than failing
    /// once the whole file has already been sent.
    /// </summary>
    [TestMethod]
    public void TryReadTreatsAProfileIdThatIsNotAnIdAsFillingNothing()
    {
        Assert.IsTrue(ProfileUploadMetadata.TryRead(MetadataValues("42", "not-an-id"), out var metadata));
        Assert.IsNull(metadata.ProfileId);
    }

    [TestMethod]
    public void TryReadRejectsMetadataWithoutABorehole()
    {
        var values = MetadataValues("42");
        values.Remove("boreholeId");

        Assert.IsFalse(ProfileUploadMetadata.TryRead(values, out _));
    }

    [TestMethod]
    public void TryReadRejectsMetadataWithoutAFileName()
    {
        var values = MetadataValues("42");
        values.Remove("filename");

        Assert.IsFalse(ProfileUploadMetadata.TryRead(values, out _));
    }
}
