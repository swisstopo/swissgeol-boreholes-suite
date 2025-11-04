using Amazon.S3;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace BDMS;

/// <summary>
/// Service to manage log files in the cloud storage.
/// </summary>
public class LogFileCloudService : CloudServiceBase
{
    private readonly BdmsContext context;
    private readonly IHttpContextAccessor httpContextAccessor;

    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileCloudService"/> class.
    /// </summary>
    public LogFileCloudService(ILogger<LogFileCloudService> logger, IAmazonS3 s3Client, IConfiguration configuration, IHttpContextAccessor httpContextAccessor, BdmsContext context)
        : base(logger, s3Client, configuration["S3:LOGFILES_BUCKET_NAME"]!)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.context = context;
    }

    /// <summary>
    /// Uploads a log file to the cloud storage and links it to the log run.
    /// </summary>
    /// <param name="fileStream">The file stream for the file to upload and link to the <see cref="LogRun"/>.</param>
    /// <param name="fileName">The name of the file to upload.</param>
    /// <param name="contentType">The content type of the file.</param>
    /// <param name="logRunId">The <see cref="LogRun.Id"/> to link the uploaded file to.</param>
    /// <returns>The created <see cref="LogFile"/> entity.</returns>
    public async Task<LogFile> UploadLogFileAndLinkToLogRunAsync(Stream fileStream, string fileName, string contentType, int logRunId)
    {
        try
        {
            var logRun = await context.LogRuns
                .FirstOrDefaultAsync(lr => lr.Id == logRunId)
                .ConfigureAwait(false);

            if (logRun == null)
            {
                throw new InvalidOperationException($"LogRun with ID {logRunId} not found.");
            }

            var fileExtension = Path.GetExtension(fileName);
            var fileNameGuid = $"{Guid.NewGuid()}{fileExtension}";

            // Replace white spaces in file names, as they are interpreted differently across different systems.
            fileName = fileName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);

            await UploadObject(fileStream, fileNameGuid, contentType).ConfigureAwait(false);

            var logFile = new LogFile
            {
                LogRunId = logRunId,
                Name = fileName,
                NameUuid = fileNameGuid,
                Public = false,
            };

            var entityEntry = await context.LogFiles.AddAsync(logFile).ConfigureAwait(false);
            await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!).ConfigureAwait(false);

            return entityEntry.Entity;
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error attaching logFile <{FileName}> to logRun with Id <{LogRunId}>.", fileName, logRunId);
            throw;
        }
    }
}
