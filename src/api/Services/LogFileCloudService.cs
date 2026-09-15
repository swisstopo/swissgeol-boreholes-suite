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
    /// Reads a log file of a log run.
    /// </summary>
    /// <param name="logFileId">The log file to read.</param>
    /// <param name="logRunId">The <see cref="LogRun.Id"/> the log file has to belong to.</param>
    /// <param name="cancellationToken">Aborts the read.</param>
    /// <returns>The log file.</returns>
    /// <exception cref="InvalidOperationException">The log run holds no log file with that id.</exception>
    public async Task<LogFile> GetLogFileAsync(int logFileId, int logRunId, CancellationToken cancellationToken = default)
    {
        return await context.LogFiles
            .FirstOrDefaultAsync(lf => lf.Id == logFileId && lf.LogRunId == logRunId, cancellationToken)
            .ConfigureAwait(false)
            ?? throw new InvalidOperationException($"LogFile with ID {logFileId} not found for LogRun {logRunId}.");
    }

    /// <summary>
    /// Whether the log run already holds a file under the given name. White space is replaced the
    /// same way the stored name is, so the answer matches what storing it would find.
    /// </summary>
    /// <param name="logRunId">The <see cref="LogRun.Id"/> to look in.</param>
    /// <param name="fileName">The name to look for.</param>
    /// <param name="cancellationToken">Aborts the check.</param>
    /// <returns><see langword="true"/> if the name is taken; otherwise, <see langword="false"/>.</returns>
    public async Task<bool> IsNameTakenAsync(int logRunId, string fileName, CancellationToken cancellationToken = default)
    {
        var storedName = fileName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);

        return await context.LogFiles
            .AnyAsync(lf => lf.LogRunId == logRunId && lf.Name == storedName, cancellationToken)
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Links an object that is already in the cloud storage to a log run.
    ///
    /// Used by the chunked upload, which writes the object as the chunks arrive and so has nothing
    /// left to transfer by the time the row is written.
    /// </summary>
    /// <param name="fileName">The name of the file as the user knows it.</param>
    /// <param name="contentType">The content type the object was stored with.</param>
    /// <param name="objectName">The key the object is stored under.</param>
    /// <param name="logRunId">The <see cref="LogRun.Id"/> to link the file to.</param>
    /// <param name="cancellationToken">Aborts the write.</param>
    /// <returns>The created <see cref="LogFile"/> entity.</returns>
    /// <exception cref="InvalidOperationException">The log run does not exist, or already holds that name.</exception>
    public async Task<LogFile> LinkUploadedLogFileAsync(string fileName, string contentType, string objectName, int logRunId, CancellationToken cancellationToken = default)
    {
        var logRunExists = await context.LogRuns
            .AnyAsync(lr => lr.Id == logRunId, cancellationToken)
            .ConfigureAwait(false);

        if (!logRunExists)
        {
            throw new InvalidOperationException($"LogRun with ID {logRunId} not found.");
        }

        // Replace white spaces in file names, as they are interpreted differently across different systems.
        var storedName = fileName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);

        if (await IsNameTakenAsync(logRunId, storedName, cancellationToken).ConfigureAwait(false))
        {
            throw new InvalidOperationException($"A file named '{storedName}' already exists in this log run.");
        }

        var logFile = new LogFile
        {
            LogRunId = logRunId,
            Name = storedName,
            NameUuid = objectName,
            Public = false,
        };

        var entityEntry = await context.LogFiles.AddAsync(logFile, cancellationToken).ConfigureAwait(false);
        await context.UpdateChangeInformationAndSaveChangesAsync(httpContextAccessor.HttpContext!, cancellationToken).ConfigureAwait(false);

        return entityEntry.Entity;
    }

    /// <summary>
    /// Removes an object no log file row points at, either because the row was never written or
    /// because it was moved to another object, letting the failure that caused it travel on. A
    /// cleanup that fails must not replace that failure: only while it is intact can the caller
    /// tell a client that gave up from an upload that broke. The object is left in the bucket
    /// instead, which is what the log records.
    /// </summary>
    /// <param name="objectName">The name of the stored object to remove.</param>
    internal async Task DeleteOrphanedObject(string objectName)
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
