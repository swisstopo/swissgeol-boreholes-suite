using Amazon.S3;
using Amazon.S3.Model;
using System.Globalization;
using System.Text;
using tusdotnet.Interfaces;
using tusdotnet.Models;

namespace BDMS.Uploads.S3;

/// <summary>
/// A tus store that writes each arriving chunk into a multipart upload in the cloud storage.
///
/// The point of this store is what it does not do: it never assembles the file. The request that
/// receives the last chunk finishes a multipart upload whose parts are already stored, which takes
/// about as long for a large file as for a small one, so the duration the infrastructure allows a
/// single request stops depending on the size of the upload.
///
/// Every request reads how far an upload has got from the cloud storage rather than from a counter,
/// so a request that failed halfway leaves nothing to disagree with. That reading and the write
/// that follows it are not one operation, which is safe only while requests for one upload reach
/// one process: tusdotnet locks an upload for the length of a request, and its lock lives in
/// memory. The deployment runs a single replica, and running more than one would need a lock the
/// replicas share.
/// </summary>
public class S3TusStore : ITusStore, ITusCreationStore, ITusReadableStore, ITusTerminationStore, ITusExpirationStore
{
    /// <summary>
    /// How much of the upload goes into one part. The storage refuses a part below 5 MiB unless it
    /// is the last, so this is a floor rather than a preference, and the chunk size of the client
    /// matches it so that one chunk becomes one part.
    /// </summary>
    public const long PartSize = 5 * 1024 * 1024;

    private readonly IAmazonS3 s3Client;
    private readonly S3UploadStateStore stateStore;
    private readonly string bucketName;

    /// <summary>
    /// Initializes a new instance of the <see cref="S3TusStore"/> class.
    /// </summary>
    public S3TusStore(IAmazonS3 s3Client, S3UploadStateStore stateStore, string bucketName)
    {
        this.s3Client = s3Client;
        this.stateStore = stateStore;
        this.bucketName = bucketName;
    }

    /// <inheritdoc/>
    public async Task<string> CreateFileAsync(long uploadLength, string metadata, CancellationToken cancellationToken)
    {
        var values = ReadMetadata(metadata);

        // A multipart upload names its destination when it starts, so the key is settled here
        // rather than when the upload finishes.
        var extension = values.TryGetValue("filename", out var fileName) ? Path.GetExtension(fileName) : string.Empty;
        var objectKey = $"{Guid.NewGuid()}{extension}";
        var contentType = values.TryGetValue("contentType", out var declared) ? declared : "application/octet-stream";

        // An upload declared as empty is complete the moment it is created, so no chunk ever arrives
        // to carry it and a multipart upload cannot be finished without a part. Writing the object
        // straight away keeps an empty file the same thing it has always been rather than a row
        // pointing at nothing.
        string? uploadId = null;
        if (uploadLength == 0)
        {
            await StoreEmptyObjectAsync(objectKey, contentType, cancellationToken).ConfigureAwait(false);
        }
        else
        {
            uploadId = await StartMultipartUploadAsync(objectKey, contentType, cancellationToken).ConfigureAwait(false);
        }

        var fileId = Guid.NewGuid().ToString();

        await stateStore.WriteAsync(
            fileId,
            new S3UploadState(objectKey, uploadId, uploadLength, values, null),
            cancellationToken).ConfigureAwait(false);

        return fileId;
    }

    /// <inheritdoc/>
    public async Task<string?> GetUploadMetadataAsync(string fileId, CancellationToken cancellationToken)
    {
        var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false);
        if (state is null) return null;

        return string.Join(
            ',',
            state.Metadata.Select(entry => $"{entry.Key} {Convert.ToBase64String(Encoding.UTF8.GetBytes(entry.Value))}"));
    }

    /// <inheritdoc/>
    public async Task<bool> FileExistAsync(string fileId, CancellationToken cancellationToken) =>
        await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false) is not null;

    /// <inheritdoc/>
    public async Task<long?> GetUploadLengthAsync(string fileId, CancellationToken cancellationToken)
    {
        var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false);
        return state?.UploadLength;
    }

    /// <inheritdoc/>
    public async Task<long> GetUploadOffsetAsync(string fileId, CancellationToken cancellationToken)
    {
        var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false);
        if (state is null) return 0;

        // Bytes held back are as safely kept as bytes in a part, and the client was told they
        // arrived, so the offset has to count both. Reporting only the parts would refuse the very
        // request that carries the rest of a part.
        var stored = await GetPartsLengthAsync(state, cancellationToken).ConfigureAwait(false);
        var held = await stateStore.GetRemainderLengthAsync(fileId, cancellationToken).ConfigureAwait(false);

        return stored + held;
    }

    /// <inheritdoc/>
    public async Task<long> AppendDataAsync(string fileId, Stream stream, CancellationToken cancellationToken)
    {
        var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false)
            ?? throw new TusStoreException($"Upload {fileId} does not exist.");

        if (state.UploadId is null)
        {
            throw new TusStoreException($"Upload {fileId} is already stored and takes no more data.");
        }

        // Counting only the parts, because the part number follows from this and a part number has
        // to land on a multiple of the part size.
        var storedOffset = await GetPartsLengthAsync(state, cancellationToken).ConfigureAwait(false);
        var held = await stateStore.ReadRemainderAsync(fileId, cancellationToken).ConfigureAwait(false);

        var buffer = new byte[PartSize];
        held.CopyTo(buffer, 0);
        var filled = held.Length;
        var isHeldStillStored = held.Length > 0;
        long received = 0;

        // Stores what the buffer holds as the next part, letting go of the bytes held back before
        // the part that swallows them exists. A request that stops in between then leaves those
        // bytes counted once rather than twice, which is what the offset has to stay true to.
        async Task StoreFilledPartAsync()
        {
            if (isHeldStillStored)
            {
                await stateStore.DeleteRemainderAsync(fileId, cancellationToken).ConfigureAwait(false);
                isHeldStillStored = false;
            }

            await UploadPartAsync(state, storedOffset, buffer, filled, cancellationToken).ConfigureAwait(false);
            storedOffset += filled;
            filled = 0;
        }

        while (true)
        {
            var read = await stream
                .ReadAsync(buffer.AsMemory(filled, buffer.Length - filled), cancellationToken)
                .ConfigureAwait(false);

            if (read == 0) break;

            filled += read;
            received += read;

            // The store is asked to refuse a request carrying more than the client declared, which
            // it can only notice while the bytes are still passing through.
            if (state.UploadLength is long declared && storedOffset + filled > declared)
            {
                throw new TusStoreException($"Upload {fileId} carries more data than the {declared} bytes it declared.");
            }

            if (filled < PartSize) continue;

            await StoreFilledPartAsync().ConfigureAwait(false);
        }

        // A length the client never declared compares equal to nothing, so an upload that defers it
        // never takes this for its last part.
        if (filled > 0 && storedOffset + filled == state.UploadLength)
        {
            // Only the last part of an upload may be smaller than the rest, and this is it.
            await StoreFilledPartAsync().ConfigureAwait(false);
        }

        if (storedOffset == state.UploadLength)
        {
            // Every byte is in the storage already, so turning the parts into the object is a
            // commit rather than a transfer. It runs whether or not the client is still listening,
            // because the alternative is parts that are all present and an object that never
            // appears, which no later request would put right.
            await CompleteAsync(state, fileId, CancellationToken.None).ConfigureAwait(false);
            return received;
        }

        // A request the client abandoned has nobody left to answer and no token the storage would
        // accept a write under. What reached the storage is a whole number of parts, which is what
        // the next request reads as the offset, so the bytes still in hand are let go of here
        // rather than written under a token that can only refuse them.
        cancellationToken.ThrowIfCancellationRequested();

        if (filled > 0)
        {
            await stateStore.WriteRemainderAsync(fileId, buffer[..filled], cancellationToken).ConfigureAwait(false);
        }
        else if (isHeldStillStored)
        {
            await stateStore.DeleteRemainderAsync(fileId, cancellationToken).ConfigureAwait(false);
        }

        // Every byte read is a byte kept, whether it went into a part or is waiting for the next
        // request, so the client is never asked to send the same bytes twice.
        return received;
    }

    /// <inheritdoc/>
    public async Task<ITusFile?> GetFileAsync(string fileId, CancellationToken cancellationToken)
    {
        var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false);
        return state is null ? null : new S3TusFile(fileId, state.Metadata);
    }

    /// <inheritdoc/>
    public async Task DeleteFileAsync(string fileId, CancellationToken cancellationToken)
    {
        var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false);
        if (state is null) return;

        if (state.UploadId is not null)
        {
            try
            {
                // Aborting releases the parts the storage is holding. They belong to no object, so
                // nothing but this refers to them and they would be billed until a lifecycle rule
                // caught them.
                await s3Client
                    .AbortMultipartUploadAsync(bucketName, state.ObjectKey, state.UploadId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (NoSuchUploadException)
            {
                // The upload finished or was already aborted, which is the state this wants it in.
            }
        }

        // A finished object is left alone. It may already belong to a log file, and losing a file
        // a row points at is worse than leaving one nothing points at.
        await stateStore.DeleteAsync(fileId, cancellationToken).ConfigureAwait(false);
    }

    /// <inheritdoc/>
    public async Task SetExpirationAsync(string fileId, DateTimeOffset expires, CancellationToken cancellationToken)
    {
        var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false);
        if (state is null) return;

        await stateStore
            .WriteAsync(fileId, state with { Expires = expires }, cancellationToken)
            .ConfigureAwait(false);
    }

    /// <inheritdoc/>
    public async Task<DateTimeOffset?> GetExpirationAsync(string fileId, CancellationToken cancellationToken)
    {
        var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false);
        return state?.Expires;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<string>> GetExpiredFilesAsync(CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var expired = new List<string>();

        foreach (var fileId in await stateStore.ListAsync(cancellationToken).ConfigureAwait(false))
        {
            var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false);
            if (state?.Expires is not null && state.Expires < now)
            {
                expired.Add(fileId);
            }
        }

        return expired;
    }

    /// <inheritdoc/>
    public async Task<int> RemoveExpiredFilesAsync(CancellationToken cancellationToken)
    {
        var expired = await GetExpiredFilesAsync(cancellationToken).ConfigureAwait(false);

        var removed = 0;
        foreach (var fileId in expired)
        {
            await DeleteFileAsync(fileId, cancellationToken).ConfigureAwait(false);
            removed++;
        }

        return removed;
    }

    /// <summary>
    /// The key the finished object of an upload is stored under.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the read.</param>
    /// <returns>The key, or <see langword="null"/> if the upload is not known.</returns>
    public async Task<string?> GetObjectKeyAsync(string fileId, CancellationToken cancellationToken)
    {
        var state = await stateStore.ReadAsync(fileId, cancellationToken).ConfigureAwait(false);
        return state?.ObjectKey;
    }

    /// <summary>
    /// Drops the state of an upload without touching the object it produced. Used once the object
    /// belongs to a log file and the upload it came from no longer matters.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the removal.</param>
    public async Task ForgetAsync(string fileId, CancellationToken cancellationToken)
    {
        await stateStore.DeleteAsync(fileId, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Reads the metadata header tus sends, a comma separated list of "key base64value" pairs.
    /// </summary>
    /// <param name="metadata">The raw Upload-Metadata header, which may be empty.</param>
    /// <returns>The decoded values.</returns>
    private static Dictionary<string, string> ReadMetadata(string metadata)
    {
        var values = new Dictionary<string, string>(StringComparer.Ordinal);
        if (string.IsNullOrWhiteSpace(metadata)) return values;

        foreach (var pair in metadata.Split(',', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = pair.Trim().Split(' ', 2);
            if (parts.Length != 2) continue;

            try
            {
                values[parts[0]] = Encoding.UTF8.GetString(Convert.FromBase64String(parts[1]));
            }
            catch (FormatException)
            {
                // tusdotnet has already validated the header, so a value that will not decode is
                // not something this store can report to anyone. It is left out.
                continue;
            }
        }

        return values;
    }

    /// <summary>
    /// Starts a multipart upload against the key the finished object takes.
    /// </summary>
    /// <param name="objectKey">The key the finished object takes.</param>
    /// <param name="contentType">The content type the object is stored with.</param>
    /// <param name="cancellationToken">Aborts the start.</param>
    /// <returns>The id of the multipart upload.</returns>
    private async Task<string> StartMultipartUploadAsync(string objectKey, string contentType, CancellationToken cancellationToken)
    {
        var initiated = await s3Client.InitiateMultipartUploadAsync(
            new InitiateMultipartUploadRequest
            {
                BucketName = bucketName,
                Key = objectKey,
                ContentType = contentType,
            },
            cancellationToken).ConfigureAwait(false);

        return initiated.UploadId;
    }

    /// <summary>
    /// Stores the object of an upload that carries no bytes.
    /// </summary>
    /// <param name="objectKey">The key the object takes.</param>
    /// <param name="contentType">The content type the object is stored with.</param>
    /// <param name="cancellationToken">Aborts the write.</param>
    private async Task StoreEmptyObjectAsync(string objectKey, string contentType, CancellationToken cancellationToken)
    {
        using var content = new MemoryStream([]);
        await s3Client.PutObjectAsync(
            new PutObjectRequest
            {
                BucketName = bucketName,
                Key = objectKey,
                InputStream = content,
                ContentType = contentType,
            },
            cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// How much of an upload the storage holds as parts, which is always a whole number of parts
    /// because bytes that do not fill one are held outside it.
    ///
    /// An upload with no multipart upload behind it is one whose object is already whole, so it
    /// holds everything that was declared for it.
    /// </summary>
    /// <param name="state">The upload to measure.</param>
    /// <param name="cancellationToken">Aborts the read.</param>
    /// <returns>The number of bytes the storage holds.</returns>
    private async Task<long> GetPartsLengthAsync(S3UploadState state, CancellationToken cancellationToken)
    {
        if (state.UploadId is null) return state.UploadLength ?? 0;

        var parts = await ListPartsAsync(state, cancellationToken).ConfigureAwait(false);
        return parts.Sum(part => part.Size ?? 0);
    }

    /// <summary>
    /// Reads the parts the storage holds for an upload, in part number order.
    /// </summary>
    /// <param name="state">The upload to read.</param>
    /// <param name="cancellationToken">Aborts the read.</param>
    /// <returns>The parts, empty when the upload has none.</returns>
    private async Task<IReadOnlyList<PartDetail>> ListPartsAsync(S3UploadState state, CancellationToken cancellationToken)
    {
        var parts = new List<PartDetail>();
        var request = new ListPartsRequest { BucketName = bucketName, Key = state.ObjectKey, UploadId = state.UploadId };

        try
        {
            ListPartsResponse response;
            do
            {
                response = await s3Client.ListPartsAsync(request, cancellationToken).ConfigureAwait(false);
                parts.AddRange(response.Parts ?? []);
                request.PartNumberMarker = response.NextPartNumberMarker?.ToString(CultureInfo.InvariantCulture);
            }
            while (response.IsTruncated == true);
        }
        catch (NoSuchUploadException)
        {
            // The multipart upload is gone, either finished or aborted, so it holds no parts.
            return parts;
        }

        return parts.OrderBy(part => part.PartNumber).ToList();
    }

    /// <summary>
    /// Uploads one part of an upload. The part number follows from the offset, so a request that
    /// runs a second time writes the same part rather than an extra one.
    /// </summary>
    /// <param name="state">The upload the part belongs to.</param>
    /// <param name="offset">How much of the upload precedes this part.</param>
    /// <param name="buffer">The buffer holding the part.</param>
    /// <param name="length">How much of the buffer the part occupies.</param>
    /// <param name="cancellationToken">Aborts the upload of the part.</param>
    private async Task UploadPartAsync(S3UploadState state, long offset, byte[] buffer, int length, CancellationToken cancellationToken)
    {
        using var content = new MemoryStream(buffer, 0, length, writable: false);
        await s3Client.UploadPartAsync(
            new UploadPartRequest
            {
                BucketName = bucketName,
                Key = state.ObjectKey,
                UploadId = state.UploadId,
                PartNumber = (int)(offset / PartSize) + 1,
                PartSize = length,
                InputStream = content,
            },
            cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Turns the parts the storage holds into the finished object. This is the whole of the work
    /// the last request has to do, because the bytes are already where they belong.
    ///
    /// The upload is recorded as finished as soon as the object exists, so that a request arriving
    /// afterwards reads a state that says so rather than one naming a multipart upload the storage
    /// has already consumed.
    /// </summary>
    /// <param name="state">The upload to finish.</param>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts finishing the upload.</param>
    private async Task CompleteAsync(S3UploadState state, string fileId, CancellationToken cancellationToken)
    {
        var parts = await ListPartsAsync(state, cancellationToken).ConfigureAwait(false);

        await s3Client.CompleteMultipartUploadAsync(
            new CompleteMultipartUploadRequest
            {
                BucketName = bucketName,
                Key = state.ObjectKey,
                UploadId = state.UploadId,
                PartETags = parts.Select(ToPartETag).ToList(),
            },
            cancellationToken).ConfigureAwait(false);

        await stateStore
            .WriteAsync(fileId, state with { UploadId = null }, cancellationToken)
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Names a part in the way finishing an upload refers to it.
    /// </summary>
    /// <param name="part">The part as the storage listed it.</param>
    /// <returns>The part number and its tag.</returns>
    /// <exception cref="InvalidOperationException">The listed part carries no number.</exception>
    private static PartETag ToPartETag(PartDetail part) =>
        part.PartNumber is int number
            ? new PartETag(number, part.ETag)
            : throw new InvalidOperationException("A part the storage listed carries no part number.");
}
