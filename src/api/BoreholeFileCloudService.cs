using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;

namespace BDMS;

/// <summary>
/// Represents a service to manage borehole files in the cloud storage.
/// </summary>
public class BoreholeFileCloudService : CloudServiceBase
{
    private readonly BdmsContext context;
    private readonly IHttpContextAccessor httpContextAccessor;

    public BoreholeFileCloudService(BdmsContext context, IConfiguration configuration, ILogger<BoreholeFileCloudService> logger, IHttpContextAccessor httpContextAccessor, IAmazonS3 s3Client)
        : base(logger, s3Client, configuration["S3:BUCKET_NAME"]!)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.context = context;
    }

    /// <summary>
    /// Uploads a file to the cloud storage and links it to the borehole.
    /// </summary>
    /// <param name="fileStream">The file stream for the file to upload and link to the <see cref="Borehole"/>.</param>
    /// <param name="fileName">The name of the file to upload.</param>
    /// <param name="fileDescription">The description of the file to upload.</param>
    /// <param name="filePublicStatus">The public status of the file to upload.</param>
    /// <param name="contentType">The content type of the file.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to link the uploaded file to.</param>
    public async Task<BoreholeFile> UploadFileAndLinkToBoreholeAsync(Stream fileStream, string fileName, string? fileDescription, bool filePublicStatus, string contentType, int boreholeId)
    {
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

            // Register the new file in the boreholes database.
            var fileExtension = Path.GetExtension(fileName);
            var fileNameGuid = $"{Guid.NewGuid()}{fileExtension}";

            // Replace white spaces in file names, as they are interpreted differently across different systems.
            fileName = fileName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);

            var file = new Models.File { Name = fileName, NameUuid = fileNameGuid, Type = contentType };

            await context.Files.AddAsync(file).ConfigureAwait(false);
            await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!).ConfigureAwait(false);

            var fileId = file.Id;

            // Upload the file to the cloud storage.
            await UploadObject(fileStream, fileNameGuid, contentType).ConfigureAwait(false);

            // If file is already linked to the borehole, throw an exception.
            if (await context.BoreholeFiles.AnyAsync(bf => bf.BoreholeId == boreholeId && bf.FileId == fileId).ConfigureAwait(false))
                throw new InvalidOperationException($"File <{fileName}> is already attached to borehole with Id <{boreholeId}>.");

            // Link file to the borehole.
            var newBoreholeFile = new BoreholeFile { FileId = fileId, BoreholeId = boreholeId, Description = fileDescription, Public = filePublicStatus, UserId = user.Id, Attached = DateTime.UtcNow };

            var entityEntry = await context.BoreholeFiles.AddAsync(newBoreholeFile).ConfigureAwait(false);
            await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!).ConfigureAwait(false);

            if (transaction != null) await transaction.CommitAsync().ConfigureAwait(false);
            return entityEntry.Entity;
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error attaching file <{FileName}> to borehole with Id <{BoreholeId}>.", fileName, boreholeId);
            throw;
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
            Logger.LogError(ex, "Error counting files in data extraction folder in cloud storage.");
            throw;
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
            Logger.LogError(ex, "Error retrieving image information from data extraction folder in cloud storage.");
            throw;
        }
    }
}
