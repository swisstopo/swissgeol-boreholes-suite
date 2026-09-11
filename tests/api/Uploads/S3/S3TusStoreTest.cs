using Amazon.S3;
using Microsoft.Extensions.Configuration;
using System.Text;
using tusdotnet.Models;

namespace BDMS.Uploads.S3;

[TestClass]
public class S3TusStoreTest
{
    private readonly List<string> createdFileIds = [];
    private readonly List<string> completedObjectKeys = [];

    private AmazonS3Client s3Client;
    private S3UploadStateStore stateStore;
    private S3TusStore store;
    private string bucketName;

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

        bucketName = configuration["S3:LOGFILES_BUCKET_NAME"].ToLowerInvariant();
        stateStore = new S3UploadStateStore(s3Client, bucketName);
        store = new S3TusStore(s3Client, stateStore, bucketName);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        foreach (var fileId in createdFileIds)
        {
            await store.DeleteFileAsync(fileId, CancellationToken.None);
        }

        foreach (var key in completedObjectKeys)
        {
            await s3Client.DeleteObjectAsync(bucketName, key, CancellationToken.None);
        }

        s3Client.Dispose();
    }

    /// <summary>The metadata header tus sends, as a comma separated list of "key base64value" pairs.</summary>
    private static string Metadata(string fileName) =>
        $"logRunId {Encode("42")},filename {Encode(fileName)},contentType {Encode("text/plain")}";

    private static string Encode(string value) => Convert.ToBase64String(Encoding.UTF8.GetBytes(value));

    private static Stream Bytes(long count) => new MemoryStream(new byte[count]);

    /// <summary>
    /// Hands over everything it holds and then goes away, the way the body of a request does when
    /// the client disconnects once the bytes it sent have already been taken.
    /// </summary>
    private sealed class VanishingStream : Stream
    {
        private readonly MemoryStream content;
        private readonly CancellationTokenSource cancellation;

        public VanishingStream(byte[] content, CancellationTokenSource cancellation)
        {
            this.content = new MemoryStream(content);
            this.cancellation = cancellation;
        }

        public override bool CanRead => true;

        public override bool CanSeek => false;

        public override bool CanWrite => false;

        public override long Length => throw new NotSupportedException();

        public override long Position
        {
            get => throw new NotSupportedException();
            set => throw new NotSupportedException();
        }

        public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default)
        {
            var read = content.Read(buffer.Span);
            if (read == 0)
            {
                cancellation.Cancel();
            }

            return ValueTask.FromResult(read);
        }

        public override void Flush()
        {
        }

        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                content.Dispose();
            }

            base.Dispose(disposing);
        }
    }

    private async Task<string> CreateAsync(long uploadLength, string fileName = "gamma.las")
    {
        var fileId = await store.CreateFileAsync(uploadLength, Metadata(fileName), CancellationToken.None);
        createdFileIds.Add(fileId);
        return fileId;
    }

    private async Task<string> RememberCompletedObjectAsync(string fileId)
    {
        var state = await stateStore.ReadAsync(fileId, CancellationToken.None);
        Assert.IsNotNull(state);
        completedObjectKeys.Add(state.ObjectKey);
        return state.ObjectKey;
    }

    [TestMethod]
    public async Task CreateFileAsyncStartsAnUploadThatExists()
    {
        var fileId = await CreateAsync(1_000);

        Assert.IsTrue(await store.FileExistAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task FileExistAsyncDeniesAnUploadThatWasNeverCreated()
    {
        Assert.IsFalse(await store.FileExistAsync(Guid.NewGuid().ToString(), CancellationToken.None));
    }

    [TestMethod]
    public async Task GetUploadLengthAsyncReturnsWhatTheClientDeclared()
    {
        var fileId = await CreateAsync(1_234);

        Assert.AreEqual(1_234, await store.GetUploadLengthAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task GetUploadMetadataAsyncReturnsTheHeaderItWasCreatedWith()
    {
        var fileId = await CreateAsync(1_000, "delta.las");

        var metadata = await store.GetUploadMetadataAsync(fileId, CancellationToken.None);

        Assert.AreEqual(Metadata("delta.las"), metadata);
    }

    [TestMethod]
    public async Task GetUploadOffsetAsyncStartsAtNothing()
    {
        var fileId = await CreateAsync(1_000);

        Assert.AreEqual(0, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task CreateFileAsyncNamesTheObjectAfterTheFileExtension()
    {
        var fileId = await CreateAsync(1_000, "gamma.las");

        var state = await stateStore.ReadAsync(fileId, CancellationToken.None);

        Assert.IsNotNull(state);
        StringAssert.EndsWith(state.ObjectKey, ".las");
        Assert.AreNotEqual("gamma.las", state.ObjectKey, "The key is a generated name, not the name the user chose.");
    }

    [TestMethod]
    public async Task AppendDataAsyncStoresAWholePartAndAdvancesTheOffset()
    {
        var fileId = await CreateAsync(S3TusStore.PartSize * 2);

        var written = await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize), CancellationToken.None);

        Assert.AreEqual(S3TusStore.PartSize, written);
        Assert.AreEqual(S3TusStore.PartSize, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncHoldsBackBytesThatDoNotFillAPart()
    {
        var fileId = await CreateAsync(S3TusStore.PartSize * 2);

        var written = await store.AppendDataAsync(fileId, Bytes(1_000), CancellationToken.None);

        // The bytes are kept rather than stored as a part, because a part below the part size is
        // refused when the upload is finished. The offset still counts them: tus compares the
        // offset the client resumes from against the one the store reports, and the client was
        // told these bytes arrived, so reporting less would refuse the request carrying the rest.
        Assert.AreEqual(1_000, written);
        Assert.AreEqual(1_000, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncCombinesHeldBackBytesWithTheNextRequest()
    {
        var fileId = await CreateAsync(S3TusStore.PartSize * 2);
        await store.AppendDataAsync(fileId, Bytes(1_000), CancellationToken.None);

        var written = await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize - 1_000), CancellationToken.None);

        Assert.AreEqual(S3TusStore.PartSize - 1_000, written);
        Assert.AreEqual(S3TusStore.PartSize, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncReportsAnOffsetTheClientCanResumeFrom()
    {
        var fileId = await CreateAsync(S3TusStore.PartSize * 3);

        // Three requests, the first two of them cut short, so the offset the store reports has to
        // match the bytes it has taken after every one of them.
        long resumed = 0;
        resumed += await store.AppendDataAsync(fileId, Bytes(1_000), CancellationToken.None);
        Assert.AreEqual(resumed, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));

        resumed += await store.AppendDataAsync(fileId, Bytes(2_000), CancellationToken.None);
        Assert.AreEqual(resumed, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));

        resumed += await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize), CancellationToken.None);
        Assert.AreEqual(resumed, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncFinishesTheObjectOnTheLastPart()
    {
        var uploadLength = S3TusStore.PartSize + 500;
        var fileId = await CreateAsync(uploadLength);
        await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize), CancellationToken.None);

        // The last part is allowed to be smaller than the rest, so this completes the upload.
        var written = await store.AppendDataAsync(fileId, Bytes(500), CancellationToken.None);

        Assert.AreEqual(500, written);

        var objectKey = await RememberCompletedObjectAsync(fileId);
        var metadata = await s3Client.GetObjectMetadataAsync(bucketName, objectKey, CancellationToken.None);
        Assert.AreEqual(uploadLength, metadata.ContentLength, "The finished object holds every byte that was sent.");
    }

    [TestMethod]
    public async Task AppendDataAsyncFinishesTheObjectAfterARequestThatWasCutShort()
    {
        var uploadLength = S3TusStore.PartSize * 2;
        var fileId = await CreateAsync(uploadLength);

        // The first request was cut off part way, so its bytes cannot become a part of their own
        // and have to travel with the next one.
        await store.AppendDataAsync(fileId, Bytes(1_000), CancellationToken.None);
        await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize - 1_000), CancellationToken.None);
        await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize), CancellationToken.None);

        var objectKey = await RememberCompletedObjectAsync(fileId);
        var metadata = await s3Client.GetObjectMetadataAsync(bucketName, objectKey, CancellationToken.None);
        Assert.AreEqual(uploadLength, metadata.ContentLength, "The finished object holds every byte that was sent.");
    }

    [TestMethod]
    public async Task AppendDataAsyncKeepsTheOffsetTruthfulWhenTheClientLeavesAfterAPartLands()
    {
        var fileId = await CreateAsync(S3TusStore.PartSize * 3);
        await store.AppendDataAsync(fileId, Bytes(1_000), CancellationToken.None);

        using var cancellation = new CancellationTokenSource();
        using var stream = new VanishingStream(new byte[S3TusStore.PartSize - 1_000], cancellation);

        await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            await store.AppendDataAsync(fileId, stream, cancellation.Token));

        // The bytes held back went into the part this request stored, so counting them a second
        // time would put the offset past what the storage holds, and the request that resumes
        // would start too far along and number its part from a total that never existed.
        Assert.AreEqual(S3TusStore.PartSize, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncKeepsWhatItHeldWhenTheClientLeavesBeforeAPartLands()
    {
        var fileId = await CreateAsync(S3TusStore.PartSize * 3);
        await store.AppendDataAsync(fileId, Bytes(1_000), CancellationToken.None);

        using var cancellation = new CancellationTokenSource();
        using var stream = new VanishingStream(new byte[500], cancellation);

        await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            await store.AppendDataAsync(fileId, stream, cancellation.Token));

        // Nothing consumed the bytes held back, so they still stand and the client resumes from
        // where it was told to rather than from the start of the part.
        Assert.AreEqual(1_000, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncStoresMoreThanOnePartFromOneRequest()
    {
        var fileId = await CreateAsync(S3TusStore.PartSize * 3);

        var written = await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize * 2), CancellationToken.None);

        Assert.AreEqual(S3TusStore.PartSize * 2, written);
        Assert.AreEqual(S3TusStore.PartSize * 2, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task GetUploadOffsetAsyncReportsAFinishedUploadAtItsFullLength()
    {
        var uploadLength = S3TusStore.PartSize + 500;
        var fileId = await CreateAsync(uploadLength);
        await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize), CancellationToken.None);
        await store.AppendDataAsync(fileId, Bytes(500), CancellationToken.None);
        await RememberCompletedObjectAsync(fileId);

        // The multipart upload is spent once the object exists, so an offset read from the parts
        // alone would say the upload holds nothing and send the client back to the start.
        Assert.AreEqual(uploadLength, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncRefusesAnUploadThatIsAlreadyFinished()
    {
        var uploadLength = S3TusStore.PartSize + 500;
        var fileId = await CreateAsync(uploadLength);
        await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize), CancellationToken.None);
        await store.AppendDataAsync(fileId, Bytes(500), CancellationToken.None);
        await RememberCompletedObjectAsync(fileId);

        // A request repeating the last chunk must not reach the storage naming a multipart upload
        // that has already been turned into an object.
        await Assert.ThrowsExactlyAsync<TusStoreException>(async () =>
            await store.AppendDataAsync(fileId, Bytes(500), CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncRefusesMoreDataThanTheClientDeclared()
    {
        var fileId = await CreateAsync(1_000);

        await Assert.ThrowsExactlyAsync<TusStoreException>(async () =>
            await store.AppendDataAsync(fileId, Bytes(2_000), CancellationToken.None));
    }

    [TestMethod]
    public async Task CreateFileAsyncStoresTheObjectOfAnUploadThatCarriesNoBytes()
    {
        // An upload declared as empty is complete when it is created, so no chunk ever arrives to
        // carry it and the object has to be there already.
        var fileId = await CreateAsync(0, "empty.las");

        var objectKey = await RememberCompletedObjectAsync(fileId);
        var metadata = await s3Client.GetObjectMetadataAsync(bucketName, objectKey, CancellationToken.None);

        Assert.AreEqual(0, metadata.ContentLength);
        Assert.AreEqual(0, await store.GetUploadOffsetAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task AppendDataAsyncRefusesAnUploadThatCarriesNoBytes()
    {
        var fileId = await CreateAsync(0, "empty.las");
        await RememberCompletedObjectAsync(fileId);

        await Assert.ThrowsExactlyAsync<TusStoreException>(async () =>
            await store.AppendDataAsync(fileId, Bytes(10), CancellationToken.None));
    }

    [TestMethod]
    public async Task GetFileAsyncReadsBackWhatTheUploadIsFor()
    {
        var fileId = await CreateAsync(1_000, "epsilon.las");

        var file = await store.GetFileAsync(fileId, CancellationToken.None);

        Assert.IsNotNull(file);
        Assert.AreEqual(fileId, file.Id);

        var metadata = await file.GetMetadataAsync(CancellationToken.None);
        Assert.AreEqual("42", metadata["logRunId"].GetString(Encoding.UTF8));
        Assert.AreEqual("epsilon.las", metadata["filename"].GetString(Encoding.UTF8));
    }

    [TestMethod]
    public async Task GetFileAsyncReturnsNothingForAnUploadThatDoesNotExist()
    {
        Assert.IsNull(await store.GetFileAsync(Guid.NewGuid().ToString(), CancellationToken.None));
    }

    [TestMethod]
    public async Task GetContentAsyncRefusesBecauseNothingReadsAnUploadBack()
    {
        var fileId = await CreateAsync(1_000);
        var file = await store.GetFileAsync(fileId, CancellationToken.None);

        Assert.IsNotNull(file);
        await Assert.ThrowsExactlyAsync<NotSupportedException>(async () => await file.GetContentAsync(CancellationToken.None));
    }

    [TestMethod]
    public async Task DeleteFileAsyncLeavesNothingBehind()
    {
        var fileId = await CreateAsync(S3TusStore.PartSize * 2);
        await store.AppendDataAsync(fileId, Bytes(S3TusStore.PartSize), CancellationToken.None);

        await store.DeleteFileAsync(fileId, CancellationToken.None);

        Assert.IsFalse(await store.FileExistAsync(fileId, CancellationToken.None));
        Assert.IsNull(await stateStore.ReadAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task DeleteFileAsyncRemovesTheBytesHeldBack()
    {
        var fileId = await CreateAsync(S3TusStore.PartSize * 2);
        await store.AppendDataAsync(fileId, Bytes(1_000), CancellationToken.None);

        await store.DeleteFileAsync(fileId, CancellationToken.None);

        Assert.AreEqual(0, await stateStore.GetRemainderLengthAsync(fileId, CancellationToken.None));
    }

    [TestMethod]
    public async Task GetExpirationAsyncReturnsWhatWasSet()
    {
        var fileId = await CreateAsync(1_000);
        var expires = DateTimeOffset.UtcNow.AddHours(3);

        await store.SetExpirationAsync(fileId, expires, CancellationToken.None);

        var read = await store.GetExpirationAsync(fileId, CancellationToken.None);
        Assert.IsNotNull(read);
        Assert.AreEqual(expires.ToUnixTimeSeconds(), read.Value.ToUnixTimeSeconds());
    }

    [TestMethod]
    public async Task GetExpiredFilesAsyncFindsAnUploadWhoseTimeHasPassed()
    {
        var fileId = await CreateAsync(1_000);
        await store.SetExpirationAsync(fileId, DateTimeOffset.UtcNow.AddSeconds(-1), CancellationToken.None);

        var expired = await store.GetExpiredFilesAsync(CancellationToken.None);

        Assert.IsTrue(expired.Contains(fileId));
    }

    [TestMethod]
    public async Task GetExpiredFilesAsyncLeavesAnUploadWithTimeLeft()
    {
        var fileId = await CreateAsync(1_000);
        await store.SetExpirationAsync(fileId, DateTimeOffset.UtcNow.AddHours(1), CancellationToken.None);

        var expired = await store.GetExpiredFilesAsync(CancellationToken.None);

        Assert.IsFalse(expired.Contains(fileId));
    }

    [TestMethod]
    public async Task RemoveExpiredFilesAsyncRemovesThem()
    {
        var fileId = await CreateAsync(1_000);
        await store.SetExpirationAsync(fileId, DateTimeOffset.UtcNow.AddSeconds(-1), CancellationToken.None);

        var removed = await store.RemoveExpiredFilesAsync(CancellationToken.None);

        Assert.IsTrue(removed >= 1);
        Assert.IsFalse(await store.FileExistAsync(fileId, CancellationToken.None));
    }
}
