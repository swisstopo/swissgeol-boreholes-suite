using Amazon.S3;
using Amazon.S3.Model;
using System.Net;
using System.Text.Json;

namespace BDMS.Uploads.S3;

/// <summary>
/// Reads and writes the <see cref="S3UploadState"/> of an upload in progress, as a small object in
/// the same bucket the upload is going to. Keeping it there rather than on the host means an
/// upload survives the host and needs no database row for something that may never finish.
/// </summary>
public class S3UploadStateStore
{
    /// <summary>
    /// The prefix state objects live under, so that a listing of finished files does not have to
    /// step over them.
    /// </summary>
    private const string StatePrefix = "tus-uploads/";

    private readonly IAmazonS3 s3Client;
    private readonly string bucketName;

    /// <summary>
    /// Initializes a new instance of the <see cref="S3UploadStateStore"/> class.
    /// </summary>
    public S3UploadStateStore(IAmazonS3 s3Client, string bucketName)
    {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    /// <summary>
    /// The key the state of an upload is stored under.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <returns>The object key.</returns>
    public static string StateKey(string fileId) => $"{StatePrefix}{fileId}.json";

    /// <summary>
    /// Stores the state of an upload, replacing what was there.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="state">The state to store.</param>
    /// <param name="cancellationToken">Aborts the write.</param>
    public async Task WriteAsync(string fileId, S3UploadState state, CancellationToken cancellationToken)
    {
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = StateKey(fileId),
            ContentBody = JsonSerializer.Serialize(state),
            ContentType = "application/json",
        };

        await s3Client.PutObjectAsync(request, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Reads the state of an upload.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the read.</param>
    /// <returns>The state, or <see langword="null"/> if there is no such upload.</returns>
    public async Task<S3UploadState?> ReadAsync(string fileId, CancellationToken cancellationToken)
    {
        try
        {
            using var response = await s3Client
                .GetObjectAsync(bucketName, StateKey(fileId), cancellationToken)
                .ConfigureAwait(false);

            return await JsonSerializer
                .DeserializeAsync<S3UploadState>(response.ResponseStream, cancellationToken: cancellationToken)
                .ConfigureAwait(false);
        }
        catch (NoSuchKeyException)
        {
            return null;
        }
    }

    /// <summary>
    /// Removes the state of an upload, along with any bytes held back for it. An upload that is
    /// not there is already in the wanted state.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the delete.</param>
    public async Task DeleteAsync(string fileId, CancellationToken cancellationToken)
    {
        await DeleteRemainderAsync(fileId, cancellationToken).ConfigureAwait(false);
        await s3Client
            .DeleteObjectAsync(bucketName, StateKey(fileId), cancellationToken)
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Stores the bytes of an upload that did not fill a part, so the next request can finish it.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="remainder">The bytes held back.</param>
    /// <param name="cancellationToken">Aborts the write.</param>
    public async Task WriteRemainderAsync(string fileId, byte[] remainder, CancellationToken cancellationToken)
    {
        using var content = new MemoryStream(remainder);
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = RemainderKey(fileId),
            InputStream = content,
            ContentType = "application/octet-stream",
        };

        await s3Client.PutObjectAsync(request, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Reads the bytes held back from an upload.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the read.</param>
    /// <returns>The bytes, empty when none were held back.</returns>
    public async Task<byte[]> ReadRemainderAsync(string fileId, CancellationToken cancellationToken)
    {
        try
        {
            using var response = await s3Client
                .GetObjectAsync(bucketName, RemainderKey(fileId), cancellationToken)
                .ConfigureAwait(false);

            using var buffer = new MemoryStream();
            await response.ResponseStream.CopyToAsync(buffer, cancellationToken).ConfigureAwait(false);
            return buffer.ToArray();
        }
        catch (NoSuchKeyException)
        {
            return [];
        }
    }

    /// <summary>
    /// How many bytes are held back from an upload, without fetching them.
    ///
    /// The offset the client is told includes these bytes, so every request that checks the offset
    /// needs the count while only the request continuing the part needs the bytes themselves.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the read.</param>
    /// <returns>The number of bytes held back, zero when none were.</returns>
    public async Task<long> GetRemainderLengthAsync(string fileId, CancellationToken cancellationToken)
    {
        try
        {
            var response = await s3Client
                .GetObjectMetadataAsync(bucketName, RemainderKey(fileId), cancellationToken)
                .ConfigureAwait(false);

            return response.ContentLength;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            // A metadata request carries no error body, so a missing key arrives as a bare 404
            // rather than as the named exception the other reads catch.
            return 0;
        }
    }

    /// <summary>
    /// Removes the bytes held back from an upload.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the delete.</param>
    public async Task DeleteRemainderAsync(string fileId, CancellationToken cancellationToken)
    {
        await s3Client
            .DeleteObjectAsync(bucketName, RemainderKey(fileId), cancellationToken)
            .ConfigureAwait(false);
    }

    /// <summary>
    /// The ids of every upload the store holds state for.
    /// </summary>
    /// <param name="cancellationToken">Aborts the listing.</param>
    /// <returns>The upload ids.</returns>
    public async Task<IReadOnlyList<string>> ListAsync(CancellationToken cancellationToken)
    {
        var fileIds = new List<string>();
        var request = new ListObjectsV2Request { BucketName = bucketName, Prefix = StatePrefix };

        ListObjectsV2Response response;
        do
        {
            response = await s3Client.ListObjectsV2Async(request, cancellationToken).ConfigureAwait(false);
            fileIds.AddRange((response.S3Objects ?? [])
                .Where(o => o.Key.EndsWith(".json", StringComparison.Ordinal))
                .Select(o => Path.GetFileNameWithoutExtension(o.Key)));

            request.ContinuationToken = response.NextContinuationToken;
        }
        while (response.IsTruncated == true);

        return fileIds;
    }

    /// <summary>
    /// The key the bytes held back from an upload are stored under.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <returns>The object key.</returns>
    private static string RemainderKey(string fileId) => $"{StatePrefix}{fileId}.part";
}
