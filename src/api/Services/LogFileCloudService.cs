using Amazon.S3;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Services;

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
    /// Uploads a file to the cloud storage using the provided objectName as the S3 key.
    /// </summary>
    public Task UploadFileForExistingLogFileAsync(Stream fileStream, string contentType, string objectName, CancellationToken cancellationToken = default)
    {
        return UploadObject(fileStream, objectName, contentType, cancellationToken);
    }

    /// <summary>
    /// Uploads a log file to the cloud storage and links it to the log run.
    /// </summary>
    /// <param name="fileStream">The file stream for the file to upload and link to the <see cref="LogRun"/>.</param>
    /// <param name="fileName">The name of the file to upload.</param>
    /// <param name="contentType">The content type of the file.</param>
    /// <param name="logRunId">The <see cref="LogRun.Id"/> to link the uploaded file to.</param>
    /// <param name="cancellationToken">Aborts the upload once the client is gone.</param>
    /// <returns>The created <see cref="LogFile"/> entity.</returns>
    public async Task<LogFile> UploadLogFileAndLinkToLogRunAsync(Stream fileStream, string fileName, string contentType, int logRunId, CancellationToken cancellationToken = default)
    {
        try
        {
            var logRun = await context.LogRuns
                .FirstOrDefaultAsync(lr => lr.Id == logRunId, cancellationToken)
                .ConfigureAwait(false);

            if (logRun == null)
            {
                throw new InvalidOperationException($"LogRun with ID {logRunId} not found.");
            }

            var fileExtension = Path.GetExtension(fileName);
            var fileNameGuid = $"{Guid.NewGuid()}{fileExtension}";

            // Replace white spaces in file names, as they are interpreted differently across different systems.
            fileName = fileName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);

            var nameExists = await context.LogFiles
                .AnyAsync(lf => lf.LogRunId == logRunId && lf.Name == fileName, cancellationToken)
                .ConfigureAwait(false);
            if (nameExists)
            {
                throw new InvalidOperationException($"A file named '{fileName}' already exists in this log run.");
            }

            await UploadObject(fileStream, fileNameGuid, contentType, cancellationToken).ConfigureAwait(false);

            try
            {
                var logFile = new LogFile
                {
                    LogRunId = logRunId,
                    Name = fileName,
                    NameUuid = fileNameGuid,
                    Public = false,
                };

                var entityEntry = await context.LogFiles.AddAsync(logFile, cancellationToken).ConfigureAwait(false);
                await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!, cancellationToken).ConfigureAwait(false);

                return entityEntry.Entity;
            }
            catch
            {
                // Nothing refers to the stored object once its row is not written, and the name it
                // was given is never handed out again, so it would stay in the bucket for good.
                // The cleanup runs without the token because the caller may already have cancelled.
                await DeleteOrphanedObject(fileNameGuid).ConfigureAwait(false);
                throw;
            }
        }
        catch (OperationCanceledException)
        {
            // The client gave up while the file was still being stored. There is nobody left to
            // answer, so this is not reported as a failed upload.
            throw;
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error attaching logFile <{FileName}> to logRun with Id <{LogRunId}>.", fileName, logRunId);
            throw;
        }
    }

    /// <summary>
    /// Removes an object whose log file row was never written, letting the failure that caused it
    /// travel on. A cleanup that fails must not replace that failure: only while it is intact can
    /// the caller tell a client that gave up from an upload that broke. The object is left in the
    /// bucket instead, which is what the log records.
    /// </summary>
    /// <param name="objectName">The name of the stored object to remove.</param>
    private async Task DeleteOrphanedObject(string objectName)
    {
        try
        {
            await DeleteObject(objectName).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Failed to remove the object <{ObjectName}> stored for a log file row that was never written. It stays in the bucket.", objectName);
        }
    }
}
