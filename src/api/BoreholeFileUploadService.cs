using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace BDMS;

/// <summary>
/// Represents a service to upload borehole files to the cloud storage.
/// </summary>
public class BoreholeFileUploadService
{
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly IAmazonS3 s3Client;
    private readonly string bucketName;

    public BoreholeFileUploadService(BdmsContext context, IConfiguration configuration, ILogger<BoreholeFileUploadService> logger, IHttpContextAccessor httpContextAccessor, IAmazonS3 s3Client)
    {
        this.logger = logger;
        this.httpContextAccessor = httpContextAccessor;
        this.context = context;
        this.s3Client = s3Client;
#pragma warning disable CA1308
        bucketName = configuration["S3:BUCKET_NAME"].ToLowerInvariant();
#pragma warning restore CA1308
    }

    /// <summary>
    /// Uploads a file to the cloud storage and links it to the borehole.
    /// </summary>
    /// <param name="file">The file to upload and link to the <see cref="Borehole"/>.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to link the uploaded <paramref name="file"/> to.</param>
    public async Task<BoreholeFile> UploadFileAndLinkToBorehole(IFormFile file, int boreholeId)
    {
        // Generate a hash based on the file content.
        var base64Hash = "";
        using (SHA256 sha256Hash = SHA256.Create())
        {
            using Stream stream = file.OpenReadStream();
            byte[] hashBytes = await sha256Hash.ComputeHashAsync(stream).ConfigureAwait(false);
            base64Hash = Convert.ToBase64String(hashBytes);
        }

        // Check any file with the same hash already exists in the database.
        var fileId = context.Files.FirstOrDefault(f => f.Hash == base64Hash)?.Id;

        // Use transaction to ensure data is only stored to db if the file upload was sucessful. Only create a transaction if there is not already one from the calling method.
        using var transaction = context.Database.CurrentTransaction == null ? await context.Database.BeginTransactionAsync().ConfigureAwait(false) : null;
        try
        {
            var subjectId = httpContextAccessor.HttpContext?.GetUserSubjectId();

            var user = await context.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.SubjectId == subjectId)
                .ConfigureAwait(false);

            if (user == null || subjectId == null) throw new InvalidOperationException($"No user with subject_id <{subjectId}> found.");

            // If file does not exist on storage, upload it and create file in database.
            if (fileId == null)
            {
                var fileExtension = Path.GetExtension(file.FileName);
                var fileNameGuid = $"{Guid.NewGuid()}{fileExtension}";

                var bdmsFile = new Models.File { Name = file.FileName, NameUuid = fileNameGuid, Hash = base64Hash, Type = file.ContentType };

                await context.Files.AddAsync(bdmsFile).ConfigureAwait(false);
                await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!).ConfigureAwait(false);

                fileId = bdmsFile.Id;

                // Upload the file to the cloud storage.
                await UploadObject(file, fileNameGuid).ConfigureAwait(false);
            }

            // If file is already linked to the borehole, throw an exception.
            if (context.BoreholeFiles.Any(bf => bf.BoreholeId == boreholeId && bf.FileId == fileId)) throw new InvalidOperationException($"File <{file.FileName}> is already attached to borehole with Id <{boreholeId}>.");

            // Link file to the borehole.
            var boreholeFile = new BoreholeFile { FileId = (int)fileId, BoreholeId = boreholeId, UserId = user.Id, Attached = DateTime.UtcNow };

            var entityEntry = await context.BoreholeFiles.AddAsync(boreholeFile).ConfigureAwait(false);
            await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!).ConfigureAwait(false);

            if (transaction != null) await transaction.CommitAsync().ConfigureAwait(false);
            return entityEntry.Entity;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Error attaching file <{file.FileName}> to borehole with Id <{boreholeId}>.");
            throw;
        }
    }

    /// <summary>
    /// Uploads a file to the cloud storage.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="objectName">The name of the file in the storage.</param>
    internal async Task UploadObject(IFormFile file, string objectName)
    {
        try
        {
            // Upload file
            var putObjectRequest = new PutObjectRequest { BucketName = bucketName, Key = objectName, InputStream = file.OpenReadStream(), ContentType = file.ContentType };
            await s3Client.PutObjectAsync(putObjectRequest).ConfigureAwait(false);
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, $"Error uploading file <{file.FileName}> to cloud storage.");
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
            var getObjectRequest = new GetObjectRequest { BucketName = bucketName, Key = objectName };
            using GetObjectResponse getObjectResponse = await s3Client.GetObjectAsync(getObjectRequest).ConfigureAwait(false);

            // Read response to byte array
            using var memoryStream = new MemoryStream();
            await getObjectResponse.ResponseStream.CopyToAsync(memoryStream).ConfigureAwait(false);
            return memoryStream.ToArray();
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, $"Error downloading file <{objectName}> from cloud storage.");
            throw;
        }
    }

    public async Task<int> CountDataExtractionObjects(string objectName)
    {
        try
        {
            var baseObjectName = $"dataextraction/{objectName}";
            int totalObjects = 0;

            // Set up the ListObjectsV2 request
            var listObjectsRequest = new ListObjectsV2Request
            {
                BucketName = bucketName,
                Prefix = baseObjectName + "-",
            };

            do
            {
                // Execute the ListObjectsV2 request
                var listObjectsResponse = await s3Client.ListObjectsV2Async(listObjectsRequest).ConfigureAwait(false);

                // Increment the total count by the number of objects in this page
                totalObjects += listObjectsResponse.S3Objects.Count;

                // If there are more pages, update the continuation token
                listObjectsRequest.ContinuationToken = listObjectsResponse.NextContinuationToken;
            }
            while (listObjectsRequest.ContinuationToken != null);

            return totalObjects;
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, $"Error counting files with <{objectName}> in cloud storage.");
            throw;
        }
    }

    public async Task<(string Url, int Width, int Height)> GetDataExtractionImageInfo(string objectName, int index)
    {
        try
        {
            var key = $"dataextraction/{objectName}-{index}.png";
            var expiresAt = DateTime.UtcNow.AddMinutes(15);

            // Generate a pre-signed URL
            var request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = key,
                Expires = expiresAt,
                Verb = HttpVerb.GET,
            };

            var url = await s3Client.GetPreSignedURLAsync(request).ConfigureAwait(false);

            var tempFile = Path.GetRandomFileName();
            try
            {
                using (var s3Stream = await s3Client.GetObjectStreamAsync(bucketName, key, null).ConfigureAwait(false))
                using (var fileStream = new FileStream(tempFile, FileMode.Create))
                {
                    await s3Stream.CopyToAsync(fileStream).ConfigureAwait(false);
                }

                int width = 0;
                int height = 0;

                using (var stream = new FileStream(tempFile, FileMode.Open))
                using (var reader = new BinaryReader(stream))
                {
                    reader.BaseStream.Position = 16;

                    var widthBytes = reader.ReadBytes(4);
                    Array.Reverse(widthBytes);
                    width = BitConverter.ToInt32(widthBytes, 0);

                    var heightBytes = reader.ReadBytes(4);
                    Array.Reverse(heightBytes);
                    height = BitConverter.ToInt32(heightBytes, 0);
                }

                return (url, width, height);
            }
            finally
            {
                System.IO.File.Delete(tempFile);
            }
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, $"Error generating pre-signed URL or retrieving image size for file <{objectName}> in cloud storage.");
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
            var request = new DeleteObjectRequest { BucketName = bucketName, Key = objectName };
            var response = await s3Client.DeleteObjectAsync(request).ConfigureAwait(false);
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, $"Error deleting file <{objectName}> from cloud storage.");
            throw;
        }
    }
}
