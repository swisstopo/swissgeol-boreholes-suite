using Amazon.S3;
using Amazon.S3.Model;
using System.IO.Pipelines;
using tusdotnet.Interfaces;
using tusdotnet.Stores.S3;

namespace BDMS.Uploads.S3;

/// <summary>
/// The tus store the log file upload writes through.
///
/// The work is done by <see cref="TusS3Store"/>, which writes each arriving chunk into a multipart
/// upload rather than assembling the file, so the request that receives the last chunk finishes an
/// upload whose parts are already stored. What this adds is what the endpoint needs and the package
/// does not offer: the key the finished object took, a way to let go of an upload without touching
/// that object, and an object for an upload that carries no bytes.
/// </summary>
public class LogFileTusStore : ITusStore, ITusPipelineStore, ITusCreationStore, ITusReadableStore, ITusTerminationStore, ITusExpirationStore
{
    /// <summary>
    /// How much of the file the client sends in one request, which has to agree with the chunk
    /// size in <c>resumableUpload.ts</c>. The cloud storage refuses a part below 5 MiB unless it is
    /// the last one, and the package cuts a part at the end of every request, so a request carrying
    /// less than that would leave an undersized part in the middle of the upload and the finished
    /// object would be refused.
    /// </summary>
    public const int ChunkSize = 6 * 1024 * 1024;

    /// <summary>
    /// How much of the upload the package puts into one part at most.
    ///
    /// This is deliberately larger than <see cref="ChunkSize"/>, so that a request never reaches
    /// it and every request contributes exactly the one part it is cut into at its end. A request
    /// that does reach it is cut there and then again at its end, and the second cut lands on a
    /// part of no bytes at all, which the cloud storage refuses to make an object out of.
    /// </summary>
    public const int PartSize = 2 * ChunkSize;

    /// <summary>
    /// The smallest part the cloud storage accepts. The package falls back to <see cref="PartSize"/>
    /// rather than going below it.
    /// </summary>
    private const int MinimumPartSize = 5 * 1024 * 1024;

    /// <summary>
    /// How many parts one upload may have. Every request makes one part, so the 5 GB the product
    /// allows arrives in some 850 of them. The package defaults to 1000, which leaves no room at
    /// all, and grows the part past <see cref="PartSize"/> once an upload would not fit. This is
    /// what the cloud storage itself allows.
    /// </summary>
    private const int MaxParts = 10_000;

    private readonly TusS3Store store;
    private readonly IAmazonS3 s3Client;
    private readonly TusS3StoreConfiguration configuration;

    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileTusStore"/> class.
    /// </summary>
    public LogFileTusStore(ILogger<TusS3Store> logger, IAmazonS3 s3Client, TusS3StoreConfiguration configuration)
    {
        this.s3Client = s3Client;
        this.configuration = configuration;

        store = new TusS3Store(logger, configuration, s3Client, new LogFileTusIdProvider());
    }

    /// <summary>
    /// The settings the log file upload runs the package with, kept here so that the reasons for
    /// them stay next to the behaviour they protect.
    /// </summary>
    /// <param name="bucketName">The bucket the log files live in.</param>
    /// <returns>The configuration.</returns>
    public static TusS3StoreConfiguration CreateConfiguration(string bucketName) => new()
    {
        BucketName = bucketName,

        // The finished object is what a log file row points at, and every other log file object in
        // the bucket is stored under a bare name, so the upload adds no prefix of its own to it.
        FileObjectPrefix = string.Empty,

        PreferredPartSizeInBytes = PartSize,
        MinPartSizeInBytes = MinimumPartSize,
        MaxMultipartParts = MaxParts,

        // The bucket also receives log files through the upload that sends the whole file at once,
        // which uses a multipart upload of its own for a large one. The package cannot tell that
        // upload apart from one nobody is going to finish, and would abort it mid-transfer.
        DisableUnattachedMultipartUploadsRemoval = true,
    };

    /// <inheritdoc/>
    public Task<long> AppendDataAsync(string fileId, Stream stream, CancellationToken cancellationToken) =>
        store.AppendDataAsync(fileId, stream, cancellationToken);

    /// <inheritdoc/>
    public Task<long> AppendDataAsync(string fileId, PipeReader pipeReader, CancellationToken cancellationToken) =>
        store.AppendDataAsync(fileId, pipeReader, cancellationToken);

    /// <inheritdoc/>
    public Task<bool> FileExistAsync(string fileId, CancellationToken cancellationToken) =>
        store.FileExistAsync(fileId, cancellationToken);

    /// <inheritdoc/>
    public Task<long?> GetUploadLengthAsync(string fileId, CancellationToken cancellationToken) =>
        store.GetUploadLengthAsync(fileId, cancellationToken);

    /// <inheritdoc/>
    public Task<long> GetUploadOffsetAsync(string fileId, CancellationToken cancellationToken) =>
        store.GetUploadOffsetAsync(fileId, cancellationToken);

    /// <inheritdoc/>
    public async Task<string?> GetUploadMetadataAsync(string fileId, CancellationToken cancellationToken) =>
        await store.GetUploadMetadataAsync(fileId, cancellationToken).ConfigureAwait(false);

    /// <inheritdoc/>
    public Task<ITusFile?> GetFileAsync(string fileId, CancellationToken cancellationToken) =>
        store.GetFileAsync(fileId, cancellationToken);

    /// <inheritdoc/>
    public Task SetExpirationAsync(string fileId, DateTimeOffset expires, CancellationToken cancellationToken) =>
        store.SetExpirationAsync(fileId, expires, cancellationToken);

    /// <inheritdoc/>
    public Task<DateTimeOffset?> GetExpirationAsync(string fileId, CancellationToken cancellationToken) =>
        store.GetExpirationAsync(fileId, cancellationToken);

    /// <inheritdoc/>
    public Task<IEnumerable<string>> GetExpiredFilesAsync(CancellationToken cancellationToken) =>
        store.GetExpiredFilesAsync(cancellationToken);

    /// <inheritdoc/>
    public async Task<int> RemoveExpiredFilesAsync(CancellationToken cancellationToken)
    {
        // The sweep of the package removes each upload through its own removal, which leaves the
        // parts behind, so the uploads are walked here instead.
        var expired = await GetExpiredFilesAsync(cancellationToken).ConfigureAwait(false);

        var removed = 0;
        foreach (var fileId in expired)
        {
            await DeleteFileAsync(fileId, cancellationToken).ConfigureAwait(false);
            removed++;
        }

        return removed;
    }

    /// <inheritdoc/>
    public async Task<string> CreateFileAsync(long uploadLength, string metadata, CancellationToken cancellationToken)
    {
        var fileId = await store.CreateFileAsync(uploadLength, metadata, cancellationToken).ConfigureAwait(false);

        // The package writes the object out of the parts the chunks produced, and an upload that
        // carries no bytes sends no chunk, so it would be recorded against an object that never
        // appears. The multipart upload it opened for it has nothing left to hold.
        if (uploadLength == 0)
        {
            await AbortMultipartUploadAsync(fileId, cancellationToken).ConfigureAwait(false);
            await StoreEmptyObjectAsync(fileId, cancellationToken).ConfigureAwait(false);
        }

        return fileId;
    }

    /// <inheritdoc/>
    public async Task DeleteFileAsync(string fileId, CancellationToken cancellationToken)
    {
        // The package aborts the multipart upload only when the first part it recorded carries an
        // etag with a dash in it, which the etag of a part never does, so the parts it wrote would
        // stay in the storage belonging to no object.
        await AbortMultipartUploadAsync(fileId, cancellationToken).ConfigureAwait(false);
        await store.DeleteFileAsync(fileId, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// The key the finished object of an upload is stored under.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <returns>The key.</returns>
    public string GetObjectKey(string fileId) => configuration.FileObjectPrefix + fileId;

    /// <summary>
    /// Drops what the store keeps about an upload without touching the object it produced. Used
    /// once the object belongs to a log file and the upload it came from no longer matters.
    ///
    /// The sweep for expired uploads passes over a finished one, so without this the record of it
    /// would stay in the bucket for good.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the removal.</param>
    public async Task ForgetAsync(string fileId, CancellationToken cancellationToken)
    {
        await s3Client
            .DeleteObjectAsync(configuration.BucketName, configuration.UploadInfoObjectPrefix + fileId, cancellationToken)
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Releases the parts the cloud storage holds for an upload. They belong to no object, so
    /// nothing but the upload refers to them and they would be billed until a lifecycle rule
    /// caught them.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the release.</param>
    private async Task AbortMultipartUploadAsync(string fileId, CancellationToken cancellationToken)
    {
        var objectKey = GetObjectKey(fileId);

        // The key is handed out once and names one upload, so the first page holds whatever there
        // is to find under it.
        var listed = await s3Client.ListMultipartUploadsAsync(
            new ListMultipartUploadsRequest { BucketName = configuration.BucketName, Prefix = objectKey },
            cancellationToken).ConfigureAwait(false);

        foreach (var multipartUpload in listed.MultipartUploads ?? [])
        {
            if (!string.Equals(multipartUpload.Key, objectKey, StringComparison.Ordinal)) continue;

            try
            {
                await s3Client
                    .AbortMultipartUploadAsync(configuration.BucketName, objectKey, multipartUpload.UploadId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (NoSuchUploadException)
            {
                // The upload finished or was already aborted, which is the state this wants it in.
            }
        }
    }

    /// <summary>
    /// Stores the object of an upload that carries no bytes.
    /// </summary>
    /// <param name="fileId">The id of the upload.</param>
    /// <param name="cancellationToken">Aborts the write.</param>
    private async Task StoreEmptyObjectAsync(string fileId, CancellationToken cancellationToken)
    {
        using var content = new MemoryStream([]);
        await s3Client.PutObjectAsync(
            new PutObjectRequest
            {
                BucketName = configuration.BucketName,
                Key = GetObjectKey(fileId),
                InputStream = content,
            },
            cancellationToken).ConfigureAwait(false);
    }
}
