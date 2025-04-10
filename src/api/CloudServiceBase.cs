using Amazon.S3;
using Amazon.S3.Model;

namespace BDMS;

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
    /// Gets a file from the cloud storage.
    /// </summary>
    /// <param name="objectName">The name of the file in the bucket.</param>
    public async Task<byte[]> GetObject(string objectName)
    {
        try
        {
            // Get object from storage
            var getObjectRequest = new GetObjectRequest { BucketName = BucketName, Key = objectName };
            using GetObjectResponse getObjectResponse = await S3Client.GetObjectAsync(getObjectRequest).ConfigureAwait(false);

            // Read response to byte array
            using var memoryStream = new MemoryStream();
            await getObjectResponse.ResponseStream.CopyToAsync(memoryStream).ConfigureAwait(false);
            return memoryStream.ToArray();
        }
        catch (AmazonS3Exception ex)
        {
            Logger.LogError(ex, "Error downloading file from cloud storage.");
            throw;
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
