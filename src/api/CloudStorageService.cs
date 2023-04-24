using BDMS.Models;
using Minio;
using Minio.Exceptions;
using System.Security.Cryptography;

namespace BDMS;

/// <summary>
/// Represent a cloud storage service for interacting with AWS S3.
/// </summary>
public class CloudStorageService
{
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly string bucketName;
    private readonly string endPoint;
    private readonly string accessKey;
    private readonly string secretKey;

    public CloudStorageService(BdmsContext context, IConfiguration configuration, ILogger<CloudStorageService> logger)
    {
        this.logger = logger;
        this.context = context;
        this.bucketName = bucketName ?? configuration.GetConnectionString("S3_BUCKET_NAME");
        endPoint = configuration.GetConnectionString("S3_ENDPOINT");
        accessKey = configuration.GetConnectionString("S3_ACCESS_KEY");
        secretKey = configuration.GetConnectionString("S3_SECRET_KEY");
    }

    /// <summary>
    /// Uploads a file to the cloud storage and links it to the borehole.
    /// </summary>
    /// <param name="file">The file to upload and link to the <see cref="Borehole"/>.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to link the uploaded <paramref name="file"/> to.</param>
    public async Task UploadFileToStorageAndLinkToBorehole(IFormFile file, int boreholeId)
    {
        // Generate a hash based on the file content.
        var base64Hash = "";
        using (SHA256 sha256Hash = SHA256.Create())
        {
            using Stream stream = file.OpenReadStream();
            byte[] hashBytes = sha256Hash.ComputeHash(stream);
            base64Hash = Convert.ToBase64String(hashBytes);
        }

        // Check any file with the same hash already exists in the database.
        var fileId = context.Files.FirstOrDefault(f => f.Hash == base64Hash)?.Id;

        // Create a transaction to ensure the file is only linked to the borehole if it is successfully uploaded.
        using var transaction = context.Database.BeginTransaction();
        try
        {
            // If the file already exists, link it to the borehole.
            if (fileId == null)
            {
                var fileExtension = Path.GetExtension(file.FileName);
                var fileNameGuid = $"{Guid.NewGuid()}{fileExtension}";

                var bdmsFile = new Models.File
                {
                    Name = file.FileName,
                    NameUuid = fileNameGuid,
                    Hash = base64Hash,
                    Type = file.ContentType,
                };

                await context.Files.AddAsync(bdmsFile).ConfigureAwait(false);
                await context.SaveChangesAsync().ConfigureAwait(false);

                fileId = bdmsFile.Id;

                // Upload the file to the cloud storage.
                try
                {
                    await UploadObject(file, fileNameGuid).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    logger.Log(LogLevel.Error, ex, "Error during upload of object to storage.");
                    throw;
                }
            }

            if (!context.BoreholeFiles.Any(bf => bf.BoreholeId == boreholeId && bf.FileId == fileId))
            {
                // Create new BoreholeFile
                var boreHoleFile = new BoreholeFile
                {
                    FileId = (int)fileId,
                    BoreholeId = boreholeId,
                };
                await context.BoreholeFiles.AddAsync(boreHoleFile).ConfigureAwait(false);
                await context.SaveChangesAsync().ConfigureAwait(false);
            }

            await transaction.CommitAsync().ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Error, ex, "Error during saving the database.");
            throw;
        }
    }

    /// <summary>
    /// Uploads a file to a S3 storage.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="objectName">The name of the file in the storage.</param>
    public async Task UploadObject(IFormFile file, string objectName)
    {
        using var initClient = new MinioClient();
        using MinioClient minioClient = initClient
             .WithEndpoint(endPoint)
             .WithCredentials(accessKey, secretKey)
             .WithSSL(false)
             .Build();
        try
        {
            // Get the content type and create a stream from the uploaded file.
            string contentType = file.ContentType;

            using var stream = file.OpenReadStream();

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(file.Length)
                .WithContentType(contentType);

            // Upload the stream to the bucket.
            await minioClient.PutObjectAsync(putObjectArgs).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Error, ex, "Error during upload of object to storage.");
            throw;
        }
    }

    /// <summary>
    /// Gets a file from an S3 storage.
    /// </summary>
    /// <param name="objectName">The name of the file in the bucket.</param>
    /// <returns>The file as a byte array.</returns>
    public async Task<byte[]> GetObject(string objectName)
    {
        using var initClient = new MinioClient();
        using MinioClient minioClient = initClient
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
            .WithCallbackStream(stream => stream.CopyTo(downloadStream));

            await minioClient.GetObjectAsync(getObjectArgs).ConfigureAwait(false);

            return downloadStream.ToArray();
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Error, ex, "Error during download of object from storage.");
            if (ex.Message.Contains("Not found", StringComparison.InvariantCultureIgnoreCase))
            {
                throw new ObjectNotFoundException(objectName, "Object not found on storage.");
            }

            throw;
        }
    }

    /// <summary>
    /// Deletes a file from an S3 storage.
    /// </summary>
    /// <param name="objectName">The name of the file in the bucket to delete.</param>
    /// <returns><c>true</c> if the deletion was successful.</returns>
    public async Task DeleteObject(string objectName)
    {
        using var initClient = new MinioClient();
        using MinioClient minioClient = initClient
             .WithEndpoint(endPoint)
             .WithCredentials(accessKey, secretKey)
             .WithSSL(false)
             .Build();
        try
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName);

            await minioClient.RemoveObjectAsync(removeObjectArgs).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Error, ex, "Error during deletion of object from storage.");
            if (ex.Message.Contains("Not found", StringComparison.InvariantCultureIgnoreCase))
            {
                throw new ObjectNotFoundException(objectName, "Object not found on storage.");
            }

            throw;
        }
    }
}
