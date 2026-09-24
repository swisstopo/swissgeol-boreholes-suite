using BDMS.Uploads.S3;
using Microsoft.Extensions.DependencyInjection;
using System.Globalization;
using System.Net;
using System.Text;

namespace BDMS.Uploads;

/// <summary>
/// What the shared endpoint core does with a request that names an upload rather than carrying the
/// metadata, which is every request after the one that created it.
///
/// Reading what such an upload is for can come up empty two ways, and they are not the same. An
/// upload that is not there is the protocol's to answer, and refusing it instead would reach the
/// client as final rather than as an invitation to start over. An upload that is there but no
/// longer says what it is for is nobody else's to answer: it passes the existence check the
/// protocol makes, so nothing after this point would stop it, and letting it through means a chunk,
/// a read, or a discard reaching an upload with no permission checked against it at all.
///
/// The uploads here are written straight into the store rather than created through the endpoint,
/// because the endpoint refuses metadata it cannot read and so can never produce the second case.
/// The two features happen to store in buckets of their own, so no id reaches a store holding
/// another feature's upload today. Nothing in this core says it has to stay that way.
/// </summary>
[TestClass]
public class TusUploadAuthorizationTest
{
    private const string EndpointPath = "/api/v2/profile/upload/tus";
    private const string PdfContentType = "application/pdf";
    private const string SubAdmin = "sub_admin";
    private const string TusResumableHeader = "Tus-Resumable";
    private const string TusVersion = "1.0.0";

    private static BdmsWebApplicationFactory factory;

    private readonly List<string> createdFileIds = [];

    private S3TusStore store;

    [ClassInitialize]
    public static void ClassInitialize(TestContext testContext) => factory = new BdmsWebApplicationFactory();

    [ClassCleanup(ClassCleanupBehavior.EndOfClass)]
    public static void ClassCleanup() => factory?.Dispose();

    [TestInitialize]
    public void TestInitialize()
    {
        // The very store the profile endpoint writes through, so that an upload written here is one
        // a request to that endpoint finds.
        store = factory.Services.GetRequiredKeyedService<S3TusStore>(UploadBuckets.Profiles);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        foreach (var fileId in createdFileIds)
        {
            await store.DeleteFileAsync(fileId, CancellationToken.None);
        }
    }

    /// <summary>
    /// A request naming an upload the store does not hold is left to the protocol, which answers
    /// the not found that tells the client to start over.
    /// </summary>
    [TestMethod]
    public async Task AnUploadTheStoreDoesNotHoldIsLeftToTheProtocol()
    {
        var fileId = await CreateStoredUploadAsync(Metadata("1"));

        // Removed again, so that the request below names an upload that was real and is not there
        // any more, which is what a client resuming a transfer that expired does.
        await store.DeleteFileAsync(fileId, CancellationToken.None);
        createdFileIds.Remove(fileId);

        using var client = factory.CreateClient();
        using var response = await SendHeadAsync(client, fileId);

        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode, await response.Content.ReadAsStringAsync());
    }

    /// <summary>
    /// An upload that is there but no longer says what it is for is refused, rather than reaching
    /// the protocol with no permission checked against it.
    /// </summary>
    [TestMethod]
    public async Task AnUploadWhoseMetadataCannotBeReadIsRefused()
    {
        // Named, and nothing else: what it is for cannot be read out of this, so there is no
        // borehole a permission could be about.
        var fileId = await CreateStoredUploadAsync($"filename {Encode("report.pdf")}");

        using var client = factory.CreateClient();
        using var response = await SendHeadAsync(client, fileId);

        Assert.AreEqual(
            HttpStatusCode.BadRequest,
            response.StatusCode,
            $"An upload nothing can be said about was answered with <{(int)response.StatusCode}> instead of being refused.");
    }

    /// <summary>
    /// The ordinary case, which is what says the refusal above is about metadata that cannot be
    /// read rather than about every upload written straight into the store.
    /// </summary>
    [TestMethod]
    public async Task AnUploadThatSaysWhatItIsForIsAnsweredByThePermissionBehindIt()
    {
        // A borehole nobody holds, so the permission behind the upload is what refuses it, and the
        // refusal is the one the permission gives rather than the one unreadable metadata gives.
        var fileId = await CreateStoredUploadAsync(Metadata(int.MaxValue.ToString(CultureInfo.InvariantCulture)));

        using var client = factory.CreateClient();
        using var response = await SendHeadAsync(client, fileId);

        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode, await response.Content.ReadAsStringAsync());
    }

    private static string Encode(string value) => Convert.ToBase64String(Encoding.UTF8.GetBytes(value));

    /// <summary>The metadata a profile upload carries, as the raw header the store keeps.</summary>
    private static string Metadata(string boreholeId) =>
        $"boreholeId {Encode(boreholeId)},filename {Encode("report.pdf")},contentType {Encode(PdfContentType)}";

    /// <summary>
    /// Asks the endpoint about an upload, which is the cheapest request that names one and so shows
    /// what the core decided without anything being sent.
    /// </summary>
    /// <param name="client">The client to ask with.</param>
    /// <param name="fileId">The upload to ask about.</param>
    /// <returns>The response.</returns>
    private static async Task<HttpResponseMessage> SendHeadAsync(HttpClient client, string fileId)
    {
        using var request = new HttpRequestMessage(HttpMethod.Head, $"{EndpointPath}/{fileId}");
        request.Headers.Add(TusResumableHeader, TusVersion);
        request.Headers.Add(TestAuthHandler.SubjectIdHeader, SubAdmin);

        return await client.SendAsync(request);
    }

    /// <summary>
    /// Writes an upload into the store the way the endpoint does, without going through the
    /// endpoint, so that its metadata can be anything the store itself would accept.
    /// </summary>
    /// <param name="metadata">The raw metadata header the upload is created with.</param>
    /// <returns>The id the upload was stored under.</returns>
    private async Task<string> CreateStoredUploadAsync(string metadata)
    {
        var fileId = await store.CreateFileAsync(1_000, metadata, CancellationToken.None);
        createdFileIds.Add(fileId);
        return fileId;
    }
}
