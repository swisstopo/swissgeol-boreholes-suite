using Amazon.S3;
using Microsoft.Extensions.Configuration;

namespace BDMS.Uploads.S3;

[TestClass]
public class S3UploadStateStoreTest
{
    private AmazonS3Client s3Client;
    private S3UploadStateStore store;
    private string fileId;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        s3Client = new AmazonS3Client(
            configuration["S3:ACCESS_KEY"],
            configuration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = configuration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = configuration["S3:SECURE"] == "0",
            });

        store = new S3UploadStateStore(s3Client, configuration["S3:LOGFILES_BUCKET_NAME"]!.ToLowerInvariant());
        fileId = Guid.NewGuid().ToString();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await store.DeleteAsync(fileId, CancellationToken.None);
        s3Client.Dispose();
    }

    [TestMethod]
    public async Task ReadAsyncReturnsWhatWasWritten()
    {
        var written = new S3UploadState(
            "de305d54-75b4-431b-adb2-eb6b9e546014.las",
            "some-upload-id",
            5_000,
            new Dictionary<string, string>(StringComparer.Ordinal) { ["logRunId"] = "42", ["filename"] = "gamma.las" },
            DateTimeOffset.UtcNow.AddDays(1));

        await store.WriteAsync(fileId, written, CancellationToken.None);
        var read = await store.ReadAsync(fileId, CancellationToken.None);

        Assert.IsNotNull(read);
        Assert.AreEqual(written.ObjectKey, read.ObjectKey);
        Assert.AreEqual(written.UploadId, read.UploadId);
        Assert.AreEqual(written.UploadLength, read.UploadLength);
        Assert.AreEqual("42", read.Metadata["logRunId"]);
        Assert.AreEqual("gamma.las", read.Metadata["filename"]);
    }

    [TestMethod]
    public async Task ReadAsyncReturnsNothingForAnUploadThatDoesNotExist()
    {
        Assert.IsNull(await store.ReadAsync(Guid.NewGuid().ToString(), CancellationToken.None));
    }

    [TestMethod]
    public async Task DeleteAsyncRemovesTheState()
    {
        var state = new S3UploadState("key.las", "some-upload-id", null, [], null);
        await store.WriteAsync(fileId, state, CancellationToken.None);

        await store.DeleteAsync(fileId, CancellationToken.None);

        Assert.IsNull(await store.ReadAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task DeleteAsyncAcceptsAnUploadThatDoesNotExist()
    {
        await store.DeleteAsync(Guid.NewGuid().ToString(), CancellationToken.None);
    }

    [TestMethod]
    public void StateKeyKeepsStateApartFromUploadedObjects()
    {
        StringAssert.StartsWith(S3UploadStateStore.StateKey("abc"), "tus-uploads/");
    }

    [TestMethod]
    public async Task ReadRemainderAsyncReturnsWhatWasHeldBack()
    {
        await store.WriteRemainderAsync(fileId, [1, 2, 3, 4], CancellationToken.None);

        CollectionAssert.AreEqual(new byte[] { 1, 2, 3, 4 }, await store.ReadRemainderAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task ReadRemainderAsyncReturnsNothingWhenNoneWasHeldBack()
    {
        Assert.AreEqual(0, (await store.ReadRemainderAsync(fileId, CancellationToken.None)).Length);
    }

    [TestMethod]
    public async Task GetRemainderLengthAsyncCountsWhatWasHeldBack()
    {
        await store.WriteRemainderAsync(fileId, new byte[1_000], CancellationToken.None);

        Assert.AreEqual(1_000, await store.GetRemainderLengthAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task GetRemainderLengthAsyncCountsNothingWhenNoneWasHeldBack()
    {
        Assert.AreEqual(0, await store.GetRemainderLengthAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task DeleteAsyncRemovesTheBytesHeldBackAsWell()
    {
        await store.WriteAsync(fileId, new S3UploadState("key.las", "some-upload-id", null, [], null), CancellationToken.None);
        await store.WriteRemainderAsync(fileId, new byte[10], CancellationToken.None);

        await store.DeleteAsync(fileId, CancellationToken.None);

        Assert.AreEqual(0, await store.GetRemainderLengthAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task ListAsyncFindsAnUploadThatWasWritten()
    {
        await store.WriteAsync(fileId, new S3UploadState("key.las", "some-upload-id", null, [], null), CancellationToken.None);

        var fileIds = await store.ListAsync(CancellationToken.None);

        Assert.IsTrue(fileIds.Contains(fileId));
    }
}
