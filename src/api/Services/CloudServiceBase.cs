using Amazon.S3;
using Amazon.S3.Model;
using System.Net;

namespace BDMS.Services;

/// <summary>
/// Base service to interact with cloud storage.
/// </summary>
public abstract class CloudServiceBase
{
    protected ILogger Logger { get; private set; }

    protected IAmazonS3 S3Client { get; private set; }

    protected string BucketName { get; private set; }

    protected CloudServiceBase(ILogger<CloudServiceBase> logger, IAmazonS3 s3Client, string bucketName)
    {
        Logger = logger;
        S3Client = s3Client;
#pragma warning disable CA1308 // Normalize strings to uppercase
        BucketName = bucketName.ToLowerInvariant();
#pragma warning restore CA1308 // Normalize strings to uppercase
    }

    /// <summary>
    /// Uploads a file to the cloud storage.
    /// </summary>
    /// <param name="fileStream">The file stream to upload.</param>
    /// <param name="objectName">The name of the file in the storage.</param>
    /// <param name="contentType">The content type of the file.</param>
    internal async Task UploadObject(Stream fileStream, string objectName, string contentType)
    {
        try
        {
            var putObjectRequest = new PutObjectRequest
            {
                BucketName = BucketName,
                Key = objectName,
                InputStream = fileStream,
                ContentType = contentType,
            };
            await S3Client.PutObjectAsync(putObjectRequest).ConfigureAwait(false);
        }
        catch (AmazonS3Exception ex)
        {
            Logger.LogError(ex, "Error uploading file to cloud storage.");
            throw;
        }
    }

    /// <summary>
    /// Reads a file from the cloud storage into memory. Use this only when the whole payload is
    /// genuinely required at once, such as for a library that cannot work on a stream; otherwise
    /// use <see cref="GetObjectStream"/>, which does not buffer.
    /// </summary>
    /// <param name="objectName">The name of the file in the bucket.</param>
    /// <param name="maxBytes">
    /// The largest object the caller is willing to hold in memory. The size is taken from the
    /// response header, so an object above the limit is rejected before its content is read.
    /// </param>
    /// <param name="cancellationToken">Aborts the download.</param>
    /// <exception cref="InvalidOperationException">The object is larger than <paramref name="maxBytes"/>.</exception>
    public async Task<byte[]> GetObjectBytes(string objectName, long maxBytes, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get object from storage
            var getObjectRequest = new GetObjectRequest { BucketName = BucketName, Key = objectName };
            using GetObjectResponse getObjectResponse = await S3Client.GetObjectAsync(getObjectRequest, cancellationToken).ConfigureAwait(false);

            if (getObjectResponse.ContentLength > maxBytes)
            {
                throw new InvalidOperationException($"Object <{objectName}> is {getObjectResponse.ContentLength} bytes and exceeds the maximum of {maxBytes} bytes that may be read into memory.");
            }

            // Read response to byte array
            using var memoryStream = new MemoryStream();
            await getObjectResponse.ResponseStream.CopyToAsync(memoryStream, cancellationToken).ConfigureAwait(false);
            return memoryStream.ToArray();
        }
        catch (AmazonS3Exception ex)
        {
            Logger.LogError(ex, "Error downloading file from cloud storage.");
            throw;
        }
    }

    /// <summary>
    /// Opens a read stream for a file in the cloud storage. The caller owns the returned stream
    /// and must dispose it. Prefer this over <see cref="GetObjectBytes"/> unless the whole payload
    /// is genuinely required in memory, because this does not buffer the object.
    /// </summary>
    /// <remarks>
    /// Failures are not logged here, unlike in the buffering methods of this class. Only the
    /// initial request happens inside this method; the content is transferred while the caller
    /// reads the stream, so the caller is the only place that sees the whole failure surface and
    /// knows which file it was reading.
    /// </remarks>
    /// <param name="objectName">The name of the file in the bucket.</param>
    /// <param name="cancellationToken">Aborts the request for the object.</param>
    /// <returns>A stream over the file content.</returns>
    public async Task<Stream> GetObjectStream(string objectName, CancellationToken cancellationToken = default)
    {
        return await S3Client.GetObjectStreamAsync(BucketName, objectName, null, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Checks whether a file exists in the cloud storage without transferring its content.
    /// Used to validate a set of objects before a response body has been started, while a
    /// meaningful error response is still possible.
    /// </summary>
    /// <param name="objectName">The name of the file in the bucket.</param>
    /// <param name="cancellationToken">Aborts the probe.</param>
    /// <returns><c>true</c> if the file exists, <c>false</c> if it does not.</returns>
    public async Task<bool> ObjectExists(string objectName, CancellationToken cancellationToken = default)
    {
        try
        {
            await S3Client.GetObjectMetadataAsync(BucketName, objectName, cancellationToken).ConfigureAwait(false);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    /// <summary>
    /// Deletes a file from the cloud storage.
    /// </summary>
    /// <param name="objectName">The name of the file in the bucket to delete.</param>
    public async Task DeleteObject(string objectName)
    {
        try
        {
            var request = new DeleteObjectRequest { BucketName = BucketName, Key = objectName };
            var response = await S3Client.DeleteObjectAsync(request).ConfigureAwait(false);
        }
        catch (AmazonS3Exception ex)
        {
            Logger.LogError(ex, "Error deleting file from cloud storage.");
            throw;
        }
    }

    /// <summary>
    /// Deletes files from the cloud storage.
    /// </summary>
    /// <param name="objectNames">The names of the files in the bucket to delete.</param>
    public async Task DeleteObjects(IEnumerable<string> objectNames)
    {
        try
        {
            var request = new DeleteObjectsRequest { BucketName = BucketName, Objects = objectNames.Select(name => new KeyVersion { Key = name }).ToList() };
            var response = await S3Client.DeleteObjectsAsync(request).ConfigureAwait(false);
        }
        catch (AmazonS3Exception ex)
        {
            Logger.LogError(ex, "Error deleting files from cloud storage.");
            throw;
        }
    }
}
