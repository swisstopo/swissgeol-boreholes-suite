using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using System.IO.Pipelines;
using System.Net;
using System.Text;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Stores.S3;

namespace BDMS.Uploads.S3;

/// <summary>
/// Drives the store against the cloud storage, because what is being checked is what the package
/// leaves in the bucket rather than what it was asked to do. Every test that reaches beyond the
/// package is paired with the package on its own, so a difference is shown rather than asserted.
/// </summary>
[TestClass]
public class S3TusStoreTest
{
    private const string TestFileName = "gamma.las";

    private readonly List<string> createdFileIds = [];

    private AmazonS3Client s3Client;
    private TusS3StoreConfiguration configuration;
    private S3TusStore store;
    private string bucketName;

    [TestInitialize]
    public void TestInitialize()
    {
        var appConfiguration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        s3Client = new AmazonS3Client(
            appConfiguration["S3:ACCESS_KEY"],
            appConfiguration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = appConfiguration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = appConfiguration["S3:SECURE"] == "0",
            });

        bucketName = appConfiguration["S3:LOGFILES_BUCKET_NAME"].ToLowerInvariant();
        configuration = S3TusStore.CreateConfiguration(bucketName);
        store = new S3TusStore(NullLoggerFactory.Instance, s3Client, configuration);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        foreach (var fileId in createdFileIds)
        {
            await store.DeleteFileAsync(fileId, CancellationToken.None);
            await s3Client.DeleteObjectAsync(bucketName, store.GetObjectKey(fileId), CancellationToken.None);
        }

        s3Client.Dispose();
    }

    /// <summary>The metadata header tus sends, as a comma separated list of "key base64value" pairs.</summary>
    private static string Metadata(string fileName) =>
        $"logRunId {Encode("42")},filename {Encode(fileName)},contentType {Encode("text/plain")}";

    private static string Encode(string value) => Convert.ToBase64String(Encoding.UTF8.GetBytes(value));

    /// <summary>
    /// Sends one chunk the way the endpoint does: through the reader of the request, over a body
    /// that cannot be seeked and does not say how long it is.
    /// </summary>
    private static Task<long> AppendAsync(ITusPipelineStore store, string fileId, byte[] content) =>
        store.AppendDataAsync(fileId, PipeReader.Create(Body(content)), CancellationToken.None);

    private static Task<long> AppendAsync(ITusPipelineStore store, string fileId, int count) =>
        AppendAsync(store, fileId, new byte[count]);

    private static Stream Body(byte[] content) => new RequestBodyStream(content);

    private sealed class RequestBodyStream : Stream
    {
        private readonly MemoryStream content;

        public RequestBodyStream(byte[] content) => this.content = new MemoryStream(content);

        public override bool CanRead => true;

        public override bool CanSeek => false;

        public override bool CanWrite => false;

        public override long Length => throw new NotSupportedException();

        public override long Position
        {
            get => throw new NotSupportedException();
            set => throw new NotSupportedException();
        }

        public override int Read(byte[] buffer, int offset, int count) => content.Read(buffer, offset, count);

        public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default) =>
            ValueTask.FromResult(content.Read(buffer.Span));

        public override void Flush()
        {
        }

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        protected override void Dispose(bool disposing)
        {
            if (disposing) content.Dispose();
            base.Dispose(disposing);
        }
    }

    private async Task<string> CreateAsync(long uploadLength, string fileName = TestFileName)
    {
        var fileId = await store.CreateFileAsync(uploadLength, Metadata(fileName), CancellationToken.None);
        createdFileIds.Add(fileId);
        return fileId;
    }

    private async Task<GetObjectMetadataResponse?> ReadObjectMetadataAsync(string fileId)
    {
        try
        {
            return await s3Client.GetObjectMetadataAsync(bucketName, store.GetObjectKey(fileId), CancellationToken.None);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    private async Task<int> CountMultipartUploadsAsync(string fileId)
    {
        var objectKey = store.GetObjectKey(fileId);
        var listed = await s3Client.ListMultipartUploadsAsync(
            new ListMultipartUploadsRequest { BucketName = bucketName, Prefix = objectKey },
            CancellationToken.None);

        return (listed.MultipartUploads ?? []).Count(upload => string.Equals(upload.Key, objectKey, StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task CreateFileAsyncNamesTheObjectAfterTheFileExtension()
    {
        var fileId = await CreateAsync(1_000);
        var objectKey = store.GetObjectKey(fileId);

        StringAssert.EndsWith(objectKey, ".las", "The key carries the extension of the file the user picked.");
        Assert.IsTrue(
            Guid.TryParseExact(objectKey[..^".las".Length].TrimEnd('.'), "D", out _),
            $"<{objectKey}> is not a name of the shape the other log file objects have.");
    }

    [TestMethod]
    public async Task CreateFileAsyncLeavesOutAnExtensionThatCannotTravelInAKey()
    {
        var fileId = await CreateAsync(1_000, "gamma.a/../b");

        Assert.IsTrue(
            Guid.TryParseExact(store.GetObjectKey(fileId), "D", out _),
            $"<{store.GetObjectKey(fileId)}> keeps something the file name carried.");
    }

    [TestMethod]
    public void ValidateIdRefusesANameTheProviderNeverHandedOut()
    {
        var provider = new TusObjectIdProvider();

        Assert.IsFalse(provider.ValidateId("../../secret").Result);
        Assert.IsFalse(provider.ValidateId("not-a-guid.las").Result);
        Assert.IsFalse(provider.ValidateId($"{Guid.NewGuid()}.la s").Result);
        Assert.IsTrue(provider.ValidateId($"{Guid.NewGuid()}.las").Result);
        Assert.IsTrue(provider.ValidateId(Guid.NewGuid().ToString()).Result);
    }

    [TestMethod]
    public async Task CreateFileAsyncStoresTheObjectOfAnUploadThatCarriesNoBytes()
    {
        var fileId = await CreateAsync(0);

        var stored = await ReadObjectMetadataAsync(fileId);
        Assert.IsNotNull(stored, "An upload that carries no bytes still produces an object.");
        Assert.AreEqual(0, stored.ContentLength);
        Assert.AreEqual(0, await CountMultipartUploadsAsync(fileId), "It holds no multipart upload nobody is going to finish.");
    }

    /// <summary>
    /// The package on its own, to show that the object above is the one this store adds rather
    /// than one the package would have written anyway.
    /// </summary>
    [TestMethod]
    public async Task ThePackageStoresNoObjectForAnUploadThatCarriesNoBytes()
    {
        var packageStore = new TusS3Store(
            new Mock<ILogger<TusS3Store>>().Object,
            configuration,
            s3Client,
            new TusObjectIdProvider());

        var fileId = await packageStore.CreateFileAsync(0, Metadata(TestFileName), CancellationToken.None);
        createdFileIds.Add(fileId);

        Assert.IsNull(await ReadObjectMetadataAsync(fileId), "The package wrote an object for an upload that carries no bytes.");
    }

    /// <summary>
    /// Why <see cref="TusUploadEndpoint"/> names the reader rather than taking the default:
    /// the way the package reads a chunk as a stream asks the body of the request how long it is,
    /// which a body being received cannot answer.
    /// </summary>
    [TestMethod]
    public async Task ThePackageCannotReadAChunkAsAStream()
    {
        var fileId = await CreateAsync(S3TusStore.ChunkSize);

        await Assert.ThrowsExactlyAsync<NotSupportedException>(async () =>
            await store.AppendDataAsync(fileId, Body(new byte[S3TusStore.ChunkSize]), CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncCarriesTheOffsetFromOneRequestToTheNext()
    {
        var uploadLength = (2 * S3TusStore.ChunkSize) + 100;
        var fileId = await CreateAsync(uploadLength);

        Assert.AreEqual(0, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));

        await AppendAsync(store, fileId, S3TusStore.ChunkSize);
        Assert.AreEqual(
            S3TusStore.ChunkSize,
            await store.GetUploadOffsetAsync(fileId, CancellationToken.None),
            "The chunk the client was told arrived is the chunk it does not send again.");

        await AppendAsync(store, fileId, S3TusStore.ChunkSize);
        await AppendAsync(store, fileId, 100);

        var stored = await ReadObjectMetadataAsync(fileId);
        Assert.IsNotNull(stored, "The last chunk turns the parts into the object.");
        Assert.AreEqual(uploadLength, stored.ContentLength, "The object holds every byte that was sent.");
    }

    [TestMethod]
    public async Task ForgetAsyncLeavesTheFinishedObjectAlone()
    {
        var content = Encoding.UTF8.GetBytes("log data");
        var fileId = await CreateAsync(content.Length);
        await AppendAsync(store, fileId, content);

        await store.ForgetAsync(fileId, CancellationToken.None);

        var stored = await ReadObjectMetadataAsync(fileId);
        Assert.IsNotNull(stored, "The object a log file row points at survives the upload being let go of.");
        Assert.AreEqual(content.Length, stored.ContentLength);
        Assert.IsFalse(await store.FileExistAsync(fileId, CancellationToken.None), "Nothing is left of the upload itself.");
    }

    /// <summary>
    /// What <see cref="S3TusStore.ForgetAsync"/> exists to avoid: the way the package lets go
    /// of an upload takes the finished object with it, and by then a log file row points at it.
    /// </summary>
    [TestMethod]
    public async Task DeleteFileAsyncRemovesTheFinishedObjectAsWell()
    {
        var content = Encoding.UTF8.GetBytes("log data");
        var fileId = await CreateAsync(content.Length);
        await AppendAsync(store, fileId, content);
        Assert.IsNotNull(await ReadObjectMetadataAsync(fileId));

        await store.DeleteFileAsync(fileId, CancellationToken.None);

        Assert.IsNull(await ReadObjectMetadataAsync(fileId));
    }

    [TestMethod]
    public async Task DeleteFileAsyncReleasesThePartsOfAnUnfinishedUpload()
    {
        var fileId = await CreateAsync(3 * S3TusStore.ChunkSize);
        await AppendAsync(store, fileId, S3TusStore.ChunkSize);
        Assert.AreEqual(1, await CountMultipartUploadsAsync(fileId), "The upload is under way.");

        await store.DeleteFileAsync(fileId, CancellationToken.None);

        Assert.AreEqual(0, await CountMultipartUploadsAsync(fileId), "The parts belong to no object and are released.");
    }

    /// <summary>
    /// The package on its own, to show that the release above is the one this store adds.
    /// </summary>
    [TestMethod]
    public async Task ThePackageLeavesThePartsOfAnUnfinishedUploadBehind()
    {
        var packageStore = new TusS3Store(
            new Mock<ILogger<TusS3Store>>().Object,
            configuration,
            s3Client,
            new TusObjectIdProvider());

        var fileId = await packageStore.CreateFileAsync(3 * S3TusStore.ChunkSize, Metadata(TestFileName), CancellationToken.None);
        createdFileIds.Add(fileId);
        await AppendAsync(packageStore, fileId, S3TusStore.ChunkSize);

        await packageStore.DeleteFileAsync(fileId, CancellationToken.None);

        Assert.AreEqual(1, await CountMultipartUploadsAsync(fileId), "The package released the parts after all.");
    }

    [TestMethod]
    public async Task RemoveExpiredFilesAsyncRemovesAnUploadWhoseTimeHasPassed()
    {
        var fileId = await CreateAsync(3 * S3TusStore.ChunkSize);
        await AppendAsync(store, fileId, S3TusStore.ChunkSize);
        await store.SetExpirationAsync(fileId, DateTimeOffset.UtcNow.AddMinutes(-1), CancellationToken.None);

        CollectionAssert.Contains(
            (await store.GetExpiredFilesAsync(CancellationToken.None)).ToList(),
            fileId,
            "An upload whose time has passed is not found.");

        await store.RemoveExpiredFilesAsync(CancellationToken.None);

        Assert.IsFalse(await store.FileExistAsync(fileId, CancellationToken.None));
        Assert.AreEqual(0, await CountMultipartUploadsAsync(fileId), "A swept upload leaves no parts behind.");
    }

    [TestMethod]
    public async Task RemoveExpiredFilesAsyncLeavesAnUploadWithTimeLeft()
    {
        var fileId = await CreateAsync(3 * S3TusStore.ChunkSize);
        await store.SetExpirationAsync(fileId, DateTimeOffset.UtcNow.AddHours(1), CancellationToken.None);

        await store.RemoveExpiredFilesAsync(CancellationToken.None);

        Assert.IsTrue(await store.FileExistAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task GetUploadMetadataAsyncReturnsTheHeaderItWasCreatedWith()
    {
        var fileId = await CreateAsync(1_000);

        Assert.AreEqual(Metadata(TestFileName), await store.GetUploadMetadataAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task GetFileAsyncReadsBackWhatTheUploadIsFor()
    {
        var fileId = await CreateAsync(1_000);

        var file = await store.GetFileAsync(fileId, CancellationToken.None);

        Assert.IsNotNull(file);
        Assert.AreEqual(fileId, file.Id);
        Assert.IsTrue(TusUploadMetadata.TryReadStored(await file.GetMetadataAsync(CancellationToken.None), out var metadata));
        Assert.AreEqual(42, metadata.LogRunId);
        Assert.AreEqual(TestFileName, metadata.FileName);
    }

    [TestMethod]
    public async Task FileExistAsyncDeniesAnUploadThatWasNeverCreated()
    {
        Assert.IsFalse(await store.FileExistAsync(Guid.NewGuid().ToString(), CancellationToken.None));
    }

    [TestMethod]
    public async Task CreateFileAsyncStartsAnUploadThatExists()
    {
        var fileId = await CreateAsync(1_000);

        Assert.IsTrue(await store.FileExistAsync(fileId, CancellationToken.None));
        Assert.AreEqual(0, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task GetUploadLengthAsyncReturnsWhatTheClientDeclared()
    {
        var fileId = await CreateAsync(1_234);

        Assert.AreEqual(1_234, await store.GetUploadLengthAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task GetFileAsyncReturnsNothingForAnUploadThatDoesNotExist()
    {
        Assert.IsNull(await store.GetFileAsync(Guid.NewGuid().ToString(), CancellationToken.None));
    }

    [TestMethod]
    public async Task GetExpirationAsyncReturnsWhatWasSet()
    {
        var fileId = await CreateAsync(1_000);
        var expires = DateTimeOffset.UtcNow.AddHours(1);

        await store.SetExpirationAsync(fileId, expires, CancellationToken.None);

        var read = await store.GetExpirationAsync(fileId, CancellationToken.None);
        Assert.IsNotNull(read);
        Assert.AreEqual(expires.ToUnixTimeSeconds(), read.Value.ToUnixTimeSeconds());
    }

    [TestMethod]
    public async Task GetUploadOffsetAsyncReportsAFinishedUploadAtItsFullLength()
    {
        var uploadLength = S3TusStore.ChunkSize + 500;
        var fileId = await CreateAsync(uploadLength);
        await AppendAsync(store, fileId, S3TusStore.ChunkSize);
        await AppendAsync(store, fileId, 500);

        // The multipart upload is spent once the object exists, so an offset that no longer said
        // so would send the client back to the start.
        Assert.AreEqual(uploadLength, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncRefusesMoreDataThanTheClientDeclared()
    {
        var fileId = await CreateAsync(1_000);

        await Assert.ThrowsExactlyAsync<TusStoreException>(async () =>
            await AppendAsync(store, fileId, 2_000));
    }

    /// <summary>
    /// A chunk for an upload that has already been turned into an object reaches the cloud storage
    /// naming a multipart upload it has consumed, and fails there. The store we wrote before caught
    /// that and refused the chunk itself, which is the failure tusdotnet turns into an answer the
    /// client can act on rather than one it keeps retrying.
    ///
    /// This never reaches a client, because the upload is let go of as soon as it is recorded and
    /// a request naming one the store no longer knows is answered before the store is asked. That
    /// is what <c>RepeatingTheLastChunkOfAFinishedUploadIsNotAServerError</c> shows.
    /// </summary>
    [TestMethod]
    public async Task AppendDataAsyncFailsForAnUploadThatIsAlreadyFinished()
    {
        var fileId = await CreateAsync(S3TusStore.ChunkSize + 500);
        await AppendAsync(store, fileId, S3TusStore.ChunkSize);
        await AppendAsync(store, fileId, 500);

        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(async () =>
            await AppendAsync(store, fileId, 500));
    }

    /// <summary>
    /// The same as above for an upload that was complete when it was created, whose multipart
    /// upload this store releases because no chunk is ever going to fill it.
    /// </summary>
    [TestMethod]
    public async Task AppendDataAsyncFailsForAnUploadThatCarriesNoBytes()
    {
        var fileId = await CreateAsync(0);

        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(async () =>
            await AppendAsync(store, fileId, 10));
    }

    [TestMethod]
    public async Task DeleteOrphanedObjectKeepsTheOriginalFailureWhenTheCleanupFails()
    {
        // The cleanup runs while another failure is travelling on, so a cleanup that fails as well
        // must not replace it: only while that failure is intact can the caller tell a client that
        // gave up from an upload that broke.
        var s3ClientMock = new Mock<IAmazonS3>(MockBehavior.Strict);
        s3ClientMock.Setup(x => x.Config).Returns(new AmazonS3Config());
        s3ClientMock
            .Setup(x => x.DeleteObjectAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new AmazonS3Exception("the cleanup fails as well"));

        var storeWithFailingCleanup = new S3TusStore(NullLoggerFactory.Instance, s3ClientMock.Object, configuration);

        await storeWithFailingCleanup.DeleteOrphanedObjectAsync($"{Guid.NewGuid()}.las");

        s3ClientMock.Verify(
            x => x.DeleteObjectAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
