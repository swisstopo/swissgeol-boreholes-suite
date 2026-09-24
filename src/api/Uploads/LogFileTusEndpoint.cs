using BDMS.Models;
using BDMS.Services;
using BDMS.Uploads.S3;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using tusdotnet.Models;

namespace BDMS.Uploads;

/// <summary>
/// The tus endpoint log files are uploaded to. The upload names the log run it belongs to, and
/// optionally the log file it replaces.
/// </summary>
public class LogFileTusEndpoint : TusUploadEndpoint<TusUploadMetadata>
{
    private readonly BdmsContext context;
    private readonly IBoreholePermissionService boreholePermissionService;
    private readonly LogFileCloudService logFileCloudService;

    /// <summary>
    /// Initializes a new instance of the <see cref="LogFileTusEndpoint"/> class.
    /// </summary>
    public LogFileTusEndpoint(
        BdmsContext context,
        IBoreholePermissionService boreholePermissionService,
        LogFileCloudService logFileCloudService,
        [FromKeyedServices(UploadBuckets.LogFiles)] S3TusStore store)
    {
        this.context = context;
        this.boreholePermissionService = boreholePermissionService;
        this.logFileCloudService = logFileCloudService;
        Store = store;
    }

    /// <inheritdoc/>
    public override string EndpointPath => UploadRoutes.LogFiles;

    /// <inheritdoc/>
    public override string ResultHeaderName => "Log-File-Id";

    /// <inheritdoc/>
    protected override S3TusStore Store { get; }

    /// <summary>
    /// Whether the user may attach a file to the given log run.
    /// </summary>
    /// <param name="user">The user making the request.</param>
    /// <param name="logRunId">The log run the file is meant for.</param>
    /// <param name="cancellationToken">Aborts the check.</param>
    /// <returns><see langword="true"/> if the upload may proceed; otherwise, <see langword="false"/>.</returns>
    public async Task<bool> CanUploadAsync(ClaimsPrincipal user, int logRunId, CancellationToken cancellationToken = default)
    {
        var subjectId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (subjectId is null) return false;

        var logRun = await context.LogRuns
            .FirstOrDefaultAsync(lr => lr.Id == logRunId, cancellationToken)
            .ConfigureAwait(false);

        if (logRun is null) return false;

        return await boreholePermissionService
            .CanEditBoreholeAsync(subjectId, logRun.BoreholeId)
            .ConfigureAwait(false);
    }

    /// <inheritdoc/>
    protected override bool TryReadMetadata(IReadOnlyDictionary<string, string> values, [NotNullWhen(true)] out TusUploadMetadata? metadata) =>
        TusUploadMetadata.TryRead(values, out metadata);

    /// <inheritdoc/>
    protected override async Task<bool> AuthorizeAsync(ClaimsPrincipal user, TusUploadMetadata metadata, IntentType intent, CancellationToken cancellationToken)
    {
        if (!await CanUploadAsync(user, metadata.LogRunId, cancellationToken).ConfigureAwait(false)) return false;

        // Refusing a taken name here rather than at the end means the user is told before sending
        // the file instead of after. Storing it checks again, because this check holds no lock.
        if (intent == IntentType.CreateFile &&
            metadata.LogFileId is null &&
            await logFileCloudService.IsNameTakenAsync(metadata.LogRunId, metadata.FileName, cancellationToken).ConfigureAwait(false))
        {
            throw LogFileNameTakenException.For(metadata.FileName);
        }

        return true;
    }

    /// <inheritdoc/>
    /// <exception cref="LogFileNameTakenException">
    /// The log run holds a file under that name. The check when the upload was created holds no
    /// lock, so a name taken while the file was on its way is refused here instead.
    /// </exception>
    protected override async Task<int> CompleteAsync(HttpContext httpContext, TusUploadMetadata metadata, string objectKey, CancellationToken cancellationToken)
    {
        var logFile = metadata.LogFileId is int logFileId
            ? await ReplaceAsync(httpContext, metadata, logFileId, objectKey, cancellationToken).ConfigureAwait(false)
            : await logFileCloudService
                .LinkUploadedLogFileAsync(metadata.FileName, metadata.ContentType, objectKey, metadata.LogRunId, cancellationToken)
                .ConfigureAwait(false);

        return logFile.Id;
    }

    /// <summary>
    /// Points an existing log file at the object that was just uploaded, and removes the object it
    /// pointed at before.
    /// </summary>
    /// <param name="httpContext">The request that completed the upload.</param>
    /// <param name="metadata">What the client said it was uploading.</param>
    /// <param name="logFileId">The <see cref="LogFile.Id"/> being replaced.</param>
    /// <param name="objectKey">The key the new object is stored under.</param>
    /// <param name="cancellationToken">Aborts the write.</param>
    /// <returns>The log file.</returns>
    private async Task<LogFile> ReplaceAsync(HttpContext httpContext, TusUploadMetadata metadata, int logFileId, string objectKey, CancellationToken cancellationToken)
    {
        // The upload was authorized against the log run it names, so the file being replaced is
        // looked up within that run rather than by its id alone.
        var existing = await logFileCloudService
            .GetLogFileAsync(logFileId, metadata.LogRunId, cancellationToken)
            .ConfigureAwait(false);

        var replaced = existing.NameUuid;
        existing.NameUuid = objectKey;
        await context.UpdateChangeInformationAndSaveChangesAsync(httpContext, cancellationToken).ConfigureAwait(false);

        if (replaced is not null)
        {
            // Nothing points at the old object once the row moved, and the name it had is never
            // handed out again, so it would stay in the bucket for good.
            await Store.DeleteOrphanedObjectAsync(replaced).ConfigureAwait(false);
        }

        return existing;
    }
}
