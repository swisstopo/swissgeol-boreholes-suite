using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Services;

/// <summary>
/// Represents a service to manage <see cref="Profile"/> in the cloud storage.
/// </summary>
public class ProfileCloudService : CloudServiceBase
{
    private readonly BdmsContext context;
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly IServiceScopeFactory scopeFactory;
    private readonly IHostApplicationLifetime applicationLifetime;

    public ProfileCloudService(BdmsContext context, IConfiguration configuration, ILogger<ProfileCloudService> logger, IHttpContextAccessor httpContextAccessor, IAmazonS3 s3Client, IServiceScopeFactory scopeFactory, IHostApplicationLifetime applicationLifetime)
        : base(logger, s3Client, configuration["S3:BUCKET_NAME"]!)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.context = context;
        this.scopeFactory = scopeFactory;
        this.applicationLifetime = applicationLifetime;
    }

    private static bool IsOcrEligible(string contentType)
        => string.Equals(contentType, "application/pdf", StringComparison.OrdinalIgnoreCase);

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
        // The write path deliberately opts out of cancellation: the file is already in S3 by the time we
        // commit, so aborting would orphan the object, and a cancelled commit leaves the outcome unknown.
        using var transaction = context.Database.CurrentTransaction == null ? await context.Database.BeginTransactionAsync(CancellationToken.None).ConfigureAwait(false) : null;
        try
        {
            var fileExtension = Path.GetExtension(fileName);
            var nameUuid = $"{Guid.NewGuid()}{fileExtension}";

            // Replace whitespaces in file names, as they are interpreted differently across different systems.
            fileName = fileName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);

            // S3 first: if upload fails we have no DB row pointing at a missing object.
            await UploadObject(fileStream, nameUuid, contentType).ConfigureAwait(false);

            var isOcrEligible = IsOcrEligible(contentType);
            var profile = new Profile
            {
                BoreholeId = boreholeId,
                Name = fileName,
                NameUuid = nameUuid,
                Type = contentType,
                Description = description,
                Public = isPublic,
                OcrStatus = isOcrEligible ? OcrStatus.Created : OcrStatus.WillNotBeProcessed,
            };

            await context.Profiles.AddAsync(profile, CancellationToken.None).ConfigureAwait(false);
            await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!).ConfigureAwait(false);

            if (transaction != null) await transaction.CommitAsync(CancellationToken.None).ConfigureAwait(false);

            StartOcrIfEligible(profile.Id, profile.OcrStatus);

            return profile;
        }
        catch (Exception ex)
        {
            throw new IOException($"Error uploading profile '{fileName}' for borehole with Id '{boreholeId}'.", ex);
        }
    }

    /// <summary>
    /// Points a profile at an object a resumable upload has already stored, creating the row when
    /// the upload names none.
    ///
    /// The object is whole in the cloud storage before this is called, so nothing here uploads and
    /// nothing here grows with the size of the file. This is the only place a profile becomes
    /// eligible for OCR, because that is the moment it has a file to read.
    /// </summary>
    /// <param name="fileName">The name the user gave the file.</param>
    /// <param name="contentType">The content type of the file.</param>
    /// <param name="objectKey">The key the object is stored under.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> the profile belongs to.</param>
    /// <param name="profileId">The row to fill, or null to create one.</param>
    /// <param name="cancellationToken">Aborts the write.</param>
    /// <returns>The profile.</returns>
    /// <exception cref="InvalidOperationException">The borehole holds no profile with that id.</exception>
    public async Task<Profile> LinkUploadedProfileAsync(
        string fileName,
        string contentType,
        string objectKey,
        int boreholeId,
        int? profileId,
        CancellationToken cancellationToken = default)
    {
        // Replace white spaces in file names, as they are interpreted differently across different systems.
        var storedName = fileName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);
        var ocrStatus = IsOcrEligible(contentType) ? OcrStatus.Created : OcrStatus.WillNotBeProcessed;

        Profile profile;
        string? replaced = null;

        if (profileId is int id)
        {
            // Looked up within the borehole the upload was authorized against, rather than by its
            // id alone, so an authorized upload cannot fill a row belonging to another borehole.
            profile = await context.Profiles
                .FirstOrDefaultAsync(p => p.Id == id && p.BoreholeId == boreholeId, cancellationToken)
                .ConfigureAwait(false)
                ?? throw new InvalidOperationException($"Profile with ID {id} not found for borehole {boreholeId}.");

            replaced = profile.NameUuid;
            profile.NameUuid = objectKey;
            profile.Type = contentType;
            profile.OcrStatus = ocrStatus;
        }
        else
        {
            profile = new Profile
            {
                BoreholeId = boreholeId,
                Name = storedName,
                NameUuid = objectKey,
                Type = contentType,
                Public = false,
                OcrStatus = ocrStatus,
            };

            await context.Profiles.AddAsync(profile, cancellationToken).ConfigureAwait(false);
        }

        await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!, cancellationToken).ConfigureAwait(false);

        if (replaced is not null && !string.Equals(replaced, objectKey, StringComparison.Ordinal))
        {
            // Nothing points at the old object once the row moved, and the name it had is never
            // handed out again, so it would stay in the bucket for good. A completion that runs a
            // second time names the key the row already holds, which is the one object that has to
            // stay: removing it would leave the row naming nothing.
            await DeleteOrphanedObject(replaced).ConfigureAwait(false);
        }

        StartOcrIfEligible(profile.Id, ocrStatus);
        return profile;
    }

    /// <summary>
    /// Starts OCR for a profile whose status says it has a file worth reading, without waiting for
    /// the run. A profile reaches <see cref="OcrStatus.Created"/> only once an object is linked to
    /// it, so a run started from here always has a file to name.
    /// </summary>
    /// <param name="profileId">The <see cref="Profile.Id"/> to process.</param>
    /// <param name="status">The status the profile was written with.</param>
    private void StartOcrIfEligible(int profileId, OcrStatus status)
    {
        if (status != OcrStatus.Created) return;

        // Fire-and-forget OCR for eligible files. A separate scope keeps the long-running OCR
        // work decoupled from this request's DI scope (which is disposed when the response returns).
        var stoppingToken = applicationLifetime.ApplicationStopping;
        _ = Task.Run(
            async () =>
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var fileOcrService = scope.ServiceProvider.GetRequiredService<FileOcrService>();
                    await fileOcrService.ProcessAsync(profileId, cancellationToken: stoppingToken).ConfigureAwait(false);
                }
                catch (OperationCanceledException)
                {
                    // Application is shutting down; the background service will retry on next startup.
                }
                catch (Exception ex)
                {
                    Logger.LogError(ex, "Background OCR for profile {ProfileId} failed to start.", profileId);
                }
            },
            stoppingToken);
    }

    /// <summary>
    /// Gets the number of data extraction images for a pdf.
    /// </summary>
    /// <param name="objectName">The uuid of the pdf.</param>
    /// <param name="cancellationToken">Aborts the lookup once the client is gone.</param>
    /// <returns>The number of images.</returns>
    public async Task<int> CountDataExtractionObjects(string objectName, CancellationToken cancellationToken = default)
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
                var listObjectsResponse = await S3Client.ListObjectsV2Async(listObjectsRequest, cancellationToken).ConfigureAwait(false);

                totalObjects += listObjectsResponse.S3Objects?.Count ?? 0;
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
    /// <param name="cancellationToken">Aborts the download once the client is gone.</param>
    /// <returns>The name, width (px) and height (px) of the file.</returns>
    public async Task<(string FileName, int Width, int Height)> GetDataExtractionImageInfo(string objectName, int index, CancellationToken cancellationToken = default)
    {
        try
        {
            var fileName = $"{objectName}-{index}.png";
            var key = $"dataextraction/{fileName}";

            var tempFile = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            try
            {
                using (var s3Stream = await S3Client.GetObjectStreamAsync(BucketName, key, null, cancellationToken).ConfigureAwait(false))
                using (var fileStream = new FileStream(tempFile, FileMode.Create))
                {
                    await s3Stream.CopyToAsync(fileStream, cancellationToken).ConfigureAwait(false);
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
