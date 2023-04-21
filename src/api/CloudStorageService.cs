using Minio;
using Minio.Exceptions;

namespace BDMS;

/// <summary>
/// Represent a cloud storage service for interacting with AWS S3.
/// </summary>
public class CloudStorageService
{
    private readonly string bucketName;
    private readonly string endPoint;
    private readonly string accessKey;
    private readonly string secretKey;

    public CloudStorageService(IConfiguration configuration)
    {
        this.bucketName = bucketName ?? configuration.GetConnectionString("S3_BUCKET_NAME");
        endPoint = configuration.GetConnectionString("S3_ENDPOINT");
        accessKey = configuration.GetConnectionString("S3_ACCESS_KEY");
        secretKey = configuration.GetConnectionString("S3_SECRET_KEY");
    }

    /// <summary>
    /// Uploads a file to a S3 storage.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="objectName">The name of the file in the storage.</param>
    /// <returns><c>true</c> if the upload was successful.</returns>
    public async Task<bool> UploadObject(IFormFile file, string objectName)
    {
        using MinioClient minioClient = new MinioClient()
            .WithEndpoint(endPoint)
            .WithCredentials(accessKey, secretKey)
            .WithSSL(false)
            .Build();
        try
        {
            // Get the content type and create a stream from the uploaded file.
            string contentType = file.ContentType;

            using Stream stream = file.OpenReadStream();

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(file.Length)
                .WithContentType(contentType);

            // Upload the stream to the bucket.
            await minioClient.PutObjectAsync(putObjectArgs).ConfigureAwait(false);

            // Check whether the object exists using statObject().
            // If the object is not found, statObject() throws an exception,
            // else it means that the object exists.
            // Execution is successful.
            StatObjectArgs statObjectArgs = new StatObjectArgs()
                                                .WithBucket(bucketName)
                                                .WithObject(objectName);

            await minioClient.StatObjectAsync(statObjectArgs).ConfigureAwait(false);
        }
        catch
        {
            minioClient.Dispose();
            throw new MinioException("Error during upload of object to storage.");
        }

        minioClient.Dispose();
        return true;
    }

    /// <summary>
    /// Gets a file from an S3 storage.
    /// </summary>
    /// <param name="objectName">The name of the file in the bucket.</param>
    /// <returns>The file as a byte array.</returns>
    public async Task<byte[]> GetObject(string objectName)
    {
        using MinioClient minioClient = new MinioClient()
             .WithEndpoint(endPoint)
             .WithCredentials(accessKey, secretKey)
             .WithSSL(false)
             .Build();

        try
        {
            var downloadStream = new MemoryStream();

            var getObjectArgs = new GetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithCallbackStream((stream) =>
            {
                stream.CopyTo(downloadStream);
            });

            await minioClient.GetObjectAsync(getObjectArgs).ConfigureAwait(false);

            return downloadStream.ToArray();
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("Not found", StringComparison.InvariantCultureIgnoreCase))
            {
                throw new ObjectNotFoundException(objectName, "Object not found on storage.");
            }

            throw new MinioException("Error during download of object from storage.");
        }
    }
}
