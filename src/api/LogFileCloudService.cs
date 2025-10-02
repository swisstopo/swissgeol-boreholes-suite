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

    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileCloudService"/> class.
    /// </summary>
    public LogFileCloudService(
        ILogger<LogFileCloudService> logger,
        IAmazonS3 s3Client,
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor,
        BdmsContext context)
        : base(logger, s3Client, configuration["S3:LOGFILES_BUCKET_NAME"]!)
    {
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
        var logRun = await context.LogRuns
            .FirstOrDefaultAsync(lr => lr.Id == logRunId)
            .ConfigureAwait(false);

        if (logRun == null)
        {
            throw new InvalidOperationException($"LogRun with ID {logRunId} not found.");
        }

        // Generate a unique name for the file in the cloud storage
        var fileNameUuid = $"{Guid.NewGuid()}_{fileName}";

        // Upload the file to the cloud storage
        await UploadObject(fileStream, fileNameUuid, contentType).ConfigureAwait(false);

        // Create the log file entity and link it to the log run
        var logFile = new LogFile
        {
            LogRunId = logRunId,
            Name = fileName,
            FileType = contentType,
            Public = false,
        };

        context.LogFiles.Add(logFile);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return logFile;
    }
}
