using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;

namespace BDMS;

/// <summary>
/// Represents a service to manage <see cref="Profile"/> in the cloud storage.
/// </summary>
public class ProfileCloudService : CloudServiceBase
{
    private readonly BdmsContext context;
    private readonly IHttpContextAccessor httpContextAccessor;

    public ProfileCloudService(BdmsContext context, IConfiguration configuration, ILogger<ProfileCloudService> logger, IHttpContextAccessor httpContextAccessor, IAmazonS3 s3Client)
        : base(logger, s3Client, configuration["S3:BUCKET_NAME"]!)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.context = context;
    }

    /// <summary>
    /// Uploads a file to cloud storage and creates a <see cref="Profile"/> pointing at it.
    /// </summary>
    /// <param name="fileStream">The file stream for the file to upload.</param>
    /// <param name="fileName">The name of the file to upload.</param>
    /// <param name="description">The description of the profile.</param>
    /// <param name="isPublic">Whether the profile is publicly visible.</param>
    /// <param name="contentType">The content type of the file.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to attach the profile to.</param>
    public async Task<Profile> UploadProfileAsync(Stream fileStream, string fileName, string? description, bool isPublic, string contentType, int boreholeId)
    {
        // Use transaction to ensure data is only stored to db if the file upload was successful. Only create a transaction if there is not already one from the calling method.
        using var transaction = context.Database.CurrentTransaction == null ? await context.Database.BeginTransactionAsync().ConfigureAwait(false) : null;
        try
        {
            var fileExtension = Path.GetExtension(fileName);
            var nameUuid = $"{Guid.NewGuid()}{fileExtension}";

            // Replace whitespaces in file names, as they are interpreted differently across different systems.
            fileName = fileName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);

            // S3 first: if upload fails we have no DB row pointing at a missing object.
            await UploadObject(fileStream, nameUuid, contentType).ConfigureAwait(false);

            var profile = new Profile
            {
                BoreholeId = boreholeId,
                Name = fileName,
                NameUuid = nameUuid,
                Type = contentType,
                Description = description,
                Public = isPublic,
            };

            await context.Profiles.AddAsync(profile).ConfigureAwait(false);
            await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!).ConfigureAwait(false);

            if (transaction != null) await transaction.CommitAsync().ConfigureAwait(false);
            return profile;
        }
        catch (Exception ex)
        {
            throw new IOException($"Error uploading profile '{fileName}' for borehole with Id '{boreholeId}'.", ex);
        }
    }

    /// <summary>
    /// Gets the number of data extraction images for a pdf.
    /// </summary>
    /// <param name="objectName">The uuid of the pdf.</param>
    /// <returns>The number of images.</returns>
    public async Task<int> CountDataExtractionObjects(string objectName)
    {
        try
        {
            var baseObjectName = $"dataextraction/{objectName}";
            int totalObjects = 0;

            var listObjectsRequest = new ListObjectsV2Request
            {
                BucketName = BucketName,
                Prefix = baseObjectName + "-",
            };

            do
            {
                var listObjectsResponse = await S3Client.ListObjectsV2Async(listObjectsRequest).ConfigureAwait(false);
                totalObjects += listObjectsResponse.S3Objects.Count;
                listObjectsRequest.ContinuationToken = listObjectsResponse.NextContinuationToken;
            }
            while (listObjectsRequest.ContinuationToken != null);

            return totalObjects;
        }
        catch (AmazonS3Exception ex)
        {
            throw new IOException("Error counting files in data extraction folder in cloud storage.", ex);
        }
    }

    /// <summary>
    /// Gets the info of a data extraction image .
    /// </summary>
    /// <param name="objectName">The uuid of the parent pdf.</param>
    /// <param name="index">The page number in the pdf.</param>
    /// <returns>The name, width (px) and height (px) of the file.</returns>
    public async Task<(string FileName, int Width, int Height)> GetDataExtractionImageInfo(string objectName, int index)
    {
        try
        {
            var fileName = $"{objectName}-{index}.png";
            var key = $"dataextraction/{fileName}";

            var tempFile = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            try
            {
                using (var s3Stream = await S3Client.GetObjectStreamAsync(BucketName, key, null).ConfigureAwait(false))
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

                return (fileName, width, height);
            }
            finally
            {
                System.IO.File.Delete(tempFile);
            }
        }
        catch (AmazonS3Exception ex)
        {
            throw new IOException("Error retrieving image information from data extraction folder in cloud storage.", ex);
        }
    }
}
