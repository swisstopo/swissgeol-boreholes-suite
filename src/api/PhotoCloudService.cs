using Amazon.S3;
using BDMS.Models;
using System.Text.RegularExpressions;

namespace BDMS;

public class PhotoCloudService : CloudServiceBase
{
    private static readonly Regex fileNameDepthRegex = new(@"_(\d+\.\d+)-(\d+\.\d+)_", RegexOptions.NonBacktracking);
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly BdmsContext context;

    public PhotoCloudService(ILogger<PhotoCloudService> logger, IAmazonS3 s3Client, IConfiguration configuration, IHttpContextAccessor httpContextAccessor, BdmsContext context)
        : base(logger, s3Client, configuration["S3:PHOTOS_BUCKET_NAME"]!)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.context = context;
    }

    /// <summary>
    /// Uploads a photo to the cloud storage and links it to the borehole.
    /// </summary>
    /// <param name="fileStream">The file stream for the file to upload and link to the <see cref="Borehole"/>.</param>
    /// <param name="fileName">The name of the file to upload.</param>
    /// <param name="contentType">The content type of the file.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to link the uploaded file to.</param>
    /// <param name="fromDepth">The start depth of the photo.</param>
    /// <param name="toDepth">The end depth of the photo.</param>
    /// <returns>The created <see cref="Photo"/> entity.</returns>
    public async Task<Photo> UploadPhotoAndLinkToBoreholeAsync(Stream fileStream, string fileName, string contentType, int boreholeId, double fromDepth, double toDepth)
    {
        try
        {
            // Register the new file in the boreholes database.
            var fileExtension = Path.GetExtension(fileName);
            var fileNameGuid = $"{Guid.NewGuid()}{fileExtension}";

            // Replace white spaces in file names, as they are interpreted differently across different systems.
            fileName = fileName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);

            await UploadObject(fileStream, fileNameGuid, contentType).ConfigureAwait(false);

            var photo = new Photo
            {
                BoreholeId = boreholeId,
                Name = fileName,
                NameUuid = fileNameGuid,
                FileType = contentType,
                FromDepth = fromDepth,
                ToDepth = toDepth,
            };

            var entityEntry = await context.Photos.AddAsync(photo).ConfigureAwait(false);
            await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!).ConfigureAwait(false);

            return entityEntry.Entity;
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error attaching photo <{FileName}> to borehole with Id <{BoreholeId}>.", fileName, boreholeId);
            throw;
        }
    }

    public (double FromDepth, double ToDepth)? ExtractDepthFromFileName(string fileName)
    {
        var match = fileNameDepthRegex.Match(fileName);
        if (match.Success && double.TryParse(match.Groups[1].ValueSpan, out var fromDepth) && double.TryParse(match.Groups[2].ValueSpan, out var toDepth))
        {
            return (fromDepth, toDepth);
        }

        return null;
    }
}
