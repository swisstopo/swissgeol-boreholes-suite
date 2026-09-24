using Amazon.S3;
using Amazon.S3.Model;
using System.IO.Pipelines;
using tusdotnet.Interfaces;
using tusdotnet.Stores.S3;

namespace BDMS.Uploads.S3;

/// <summary>
/// The tus store an upload writes through.
///
/// The work is done by <see cref="TusS3Store"/>, which writes each arriving chunk into a multipart
/// upload rather than assembling the file, so the request that receives the last chunk finishes an
/// upload whose parts are already stored. What this adds is what the endpoints need and the package
/// does not offer: the key the finished object took, a way to let go of an upload without touching
/// that object, and an object for an upload that carries no bytes.
///
/// One instance serves one bucket, so a feature that stores elsewhere gets its own.
/// </summary>
public class S3TusStore : ITusPipelineStore, ITusCreationStore, ITusReadableStore, ITusTerminationStore, ITusExpirationStore
{
    /// <summary>
    /// How much of the file the client sends in one request. The client is told this value by
    /// <see cref="Controllers.SettingsController"/> rather than carrying a copy of it, because the
    /// part sizes below are chosen around it and only hold while the two agree.
    /// </summary>
    public const int ChunkSize = 6 * 1024 * 1024;

    /// <summary>
    /// How much of the upload the package puts into one part at most.
    ///
    /// This is deliberately larger than <see cref="ChunkSize"/>, so that a request never reaches
    /// it and every request contributes exactly the one part it is cut into at its end.
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
    private readonly ILogger<S3TusStore> logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="S3TusStore"/> class.
    /// </summary>
    public S3TusStore(ILoggerFactory loggerFactory, IAmazonS3 s3Client, TusS3StoreConfiguration configuration)
    {
        this.s3Client = s3Client;
        this.configuration = configuration;
        logger = loggerFactory.CreateLogger<S3TusStore>();

        store = new TusS3Store(loggerFactory.CreateLogger<TusS3Store>(), configuration, s3Client, new TusObjectIdProvider());
    }

    /// <summary>
    /// Gets the bucket this store writes to, so that what a sweep of several of them reports says
    /// which one it is about.
    /// </summary>
    public string BucketName => configuration.BucketName;

    /// <summary>
    /// The settings an upload runs the package with, kept here so that the reasons for them stay
    /// next to the behaviour they protect.
    /// </summary>
    /// <param name="bucketName">The bucket the objects live in.</param>
    /// <returns>The configuration.</returns>
    public static TusS3StoreConfiguration CreateConfiguration(string bucketName) => new()
    {
        BucketName = bucketName,
        FileObjectPrefix = string.Empty,
        PreferredPartSizeInBytes = PartSize,
        MinPartSizeInBytes = MinimumPartSize,
        MaxMultipartParts = MaxParts,
        DisableUnattachedMultipartUploadsRemoval = false,
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
    /// once a row points at the object and the upload it came from no longer matters.
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
    /// Removes an object no row points at, either because the row was never written or because it
    /// was moved to another object, letting the failure that caused it travel on. A cleanup that
    /// fails must not replace that failure: only while it is intact can the caller tell a client
    /// that gave up from an upload that broke. The object is left in the bucket instead, which is
    /// what the log records.
    /// </summary>
    /// <param name="objectKey">The key of the stored object to remove.</param>
    public async Task DeleteOrphanedObjectAsync(string objectKey)
    {
        try
        {
            await s3Client.DeleteObjectAsync(configuration.BucketName, objectKey, CancellationToken.None).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to remove the orphaned object <{ObjectKey}>. It stays in the bucket.", objectKey);
        }
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
