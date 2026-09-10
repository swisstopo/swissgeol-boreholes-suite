using BDMS.Models;
using BDMS.Services;
using BDMS.Uploads.S3;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Net;
using System.Security.Claims;
using System.Text;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;
using tusdotnet.Models.Expiration;

namespace BDMS.Uploads;

/// <summary>
/// Builds the tus endpoint configuration for log file uploads.
///
/// The file arrives as a series of requests, none of which is long enough to reach the
/// duration the infrastructure allows a single request. What the client is uploading is
/// carried in the upload metadata, because a tus request has no route values to bind.
/// </summary>
public class TusUploadConfiguration
{
    /// <summary>The route the chunks are sent to.</summary>
    public const string EndpointPath = "/api/v2/log/upload/tus";

    /// <summary>
    /// The response header carrying the id of the stored log file, read by the client because a
    /// finished tus upload answers with no body of its own.
    /// </summary>
    public const string LogFileIdHeader = "Log-File-Id";

    /// <summary>The largest file the endpoint accepts, matching the upload controller.</summary>
    private const long MaxFileSize = 5_000_000_000;

    /// <summary>
    /// How long an upload stays resumable. An upload that is never finished still holds the parts
    /// it was written to, so it expires and the sweeper is free to remove it.
    /// </summary>
    private static readonly TimeSpan uploadLifetime = TimeSpan.FromDays(1);

    private readonly BdmsContext context;
    private readonly IBoreholePermissionService boreholePermissionService;
    private readonly LogFileCloudService logFileCloudService;
    private readonly S3TusStore store;

    /// <summary>
    /// Initializes a new instance of the <see cref="TusUploadConfiguration"/> class.
    /// </summary>
    public TusUploadConfiguration(
        BdmsContext context,
        IBoreholePermissionService boreholePermissionService,
        LogFileCloudService logFileCloudService,
        S3TusStore store)
    {
        this.context = context;
        this.boreholePermissionService = boreholePermissionService;
        this.logFileCloudService = logFileCloudService;
        this.store = store;
    }

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

    /// <summary>
    /// Builds the configuration for a single tus request.
    /// </summary>
    /// <param name="httpContext">The request the upload arrives on.</param>
    /// <returns>The configuration the tus endpoint answers with.</returns>
    public Task<DefaultTusConfiguration> CreateAsync(HttpContext httpContext)
    {
        return Task.FromResult(new DefaultTusConfiguration
        {
            Store = store,

            // The int sized property cannot express the ceiling the product allows.
            MaxAllowedUploadSizeInBytesLong = MaxFileSize,
            Expiration = new AbsoluteExpiration(uploadLifetime),
            Events = new Events
            {
                OnAuthorizeAsync = AuthorizeAsync,
                OnFileCompleteAsync = StoreCompletedUploadAsync,
            },
        });
    }

    /// <summary>
    /// Refuses a request that may not touch the upload it addresses.
    ///
    /// Every request is checked, not only the one that creates the upload: an upload arrives over
    /// many requests and outlives the first one by as long as the file takes to send, and by then
    /// the borehole may have been locked or moved to a status that no longer allows editing.
    /// </summary>
    /// <param name="eventContext">The request being authorized.</param>
    private async Task AuthorizeAsync(AuthorizeContext eventContext)
    {
        if (eventContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier) is null)
        {
            eventContext.FailRequest(HttpStatusCode.Unauthorized);
            return;
        }

        // Asking what the endpoint supports addresses no upload, so there is no log run behind it
        // to check a permission against.
        if (eventContext.Intent == IntentType.GetOptions) return;

        var metadata = eventContext.Intent == IntentType.CreateFile
            ? ReadMetadataFromRequest(eventContext)
            : await ReadMetadataFromStoreAsync(eventContext).ConfigureAwait(false);

        if (metadata is null)
        {
            // Creating an upload is the only request that carries the metadata, so unreadable
            // metadata is the client's mistake. A later request names an upload instead, and one
            // the store cannot resolve is left to tusdotnet, which answers the not found that
            // tells the client to start over rather than a refusal it treats as final.
            if (eventContext.Intent == IntentType.CreateFile)
            {
                eventContext.FailRequest(HttpStatusCode.BadRequest, "The upload metadata is missing or malformed.");
            }

            return;
        }

        if (!await CanUploadAsync(eventContext.HttpContext.User, metadata.LogRunId, eventContext.CancellationToken).ConfigureAwait(false))
        {
            eventContext.FailRequest(HttpStatusCode.Unauthorized);
            return;
        }

        // Refusing a taken name here rather than at the end means the user is told before sending
        // the file instead of after. Storing it checks again, because this check holds no lock.
        //
        // Refused by raising rather than by failing the request, because a tus error carries its
        // reason as plain text and the client shows a reason only from the problem response the
        // error middleware builds.
        if (eventContext.Intent == IntentType.CreateFile &&
            metadata.LogFileId is null &&
            await logFileCloudService.IsNameTakenAsync(metadata.LogRunId, metadata.FileName, eventContext.CancellationToken).ConfigureAwait(false))
        {
            throw new LogFileUploadException($"A file named '{metadata.FileName}' already exists in this log run.");
        }
    }

    private static TusUploadMetadata? ReadMetadataFromRequest(AuthorizeContext eventContext) =>
        TusUploadMetadata.TryReadHeader(eventContext.HttpContext.Request.Headers["Upload-Metadata"].ToString(), out var metadata)
            ? metadata
            : null;

    private static async Task<TusUploadMetadata?> ReadMetadataFromStoreAsync(AuthorizeContext eventContext)
    {
        var file = await eventContext.GetFileAsync().ConfigureAwait(false);
        if (file is null) return null;

        var stored = await file.GetMetadataAsync(eventContext.CancellationToken).ConfigureAwait(false);
        return TusUploadMetadata.TryReadStored(stored, out var metadata) ? metadata : null;
    }

    /// <summary>
    /// Records the finished upload and tells the client what it stored.
    ///
    /// The object is already in the cloud storage, written as the chunks arrived, so this writes
    /// one row and nothing here grows with the size of the file.
    /// </summary>
    /// <param name="eventContext">The request that completed the upload.</param>
    /// <exception cref="LogFileUploadException">The upload cannot be recorded as its metadata describes it.</exception>
    private async Task StoreCompletedUploadAsync(FileCompleteContext eventContext)
    {
        var file = await eventContext.GetFileAsync().ConfigureAwait(false);
        var stored = await file.GetMetadataAsync(eventContext.CancellationToken).ConfigureAwait(false);

        // The metadata passed the same reading when the upload was created, so failing here means
        // the stored copy no longer says what it did then.
        if (!TusUploadMetadata.TryReadStored(stored, out var metadata))
        {
            throw new LogFileUploadException("The upload metadata is missing or malformed.");
        }

        var objectKey = await store.GetObjectKeyAsync(file.Id, eventContext.CancellationToken).ConfigureAwait(false)
            ?? throw new LogFileUploadException("The upload is no longer known to the store.");

        LogFile logFile;
        try
        {
            logFile = metadata.LogFileId is int logFileId
                ? await ReplaceAsync(eventContext, metadata, logFileId, objectKey).ConfigureAwait(false)
                : await logFileCloudService
                    .LinkUploadedLogFileAsync(metadata.FileName, metadata.ContentType, objectKey, metadata.LogRunId, eventContext.CancellationToken)
                    .ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            // The object is whole in the cloud storage by now, and no row is going to point at it,
            // so nothing would ever refer to it or remove it again. Neither call takes the request
            // token, because one of the ways to arrive here is the client having gone away.
            await logFileCloudService.DeleteOrphanedObject(objectKey).ConfigureAwait(false);
            await store.ForgetAsync(file.Id, CancellationToken.None).ConfigureAwait(false);

            // The last chunk has already been accepted, so a reason the user can act on has to
            // travel back in the response to that chunk for the client to be able to show it.
            if (ex is InvalidOperationException)
            {
                throw new LogFileUploadException(ex.Message, ex);
            }

            // Anything else is not something the user can change, and its message is not theirs
            // to read, so it stays the failure it was and is answered as one.
            throw;
        }

        eventContext.HttpContext.Response.Headers.Append(LogFileIdHeader, logFile.Id.ToString(CultureInfo.InvariantCulture));

        // The state the store kept for the upload is spent once the row points at the object.
        await store.ForgetAsync(file.Id, eventContext.CancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Points an existing log file at the object that was just uploaded, and removes the object it
    /// pointed at before.
    /// </summary>
    /// <param name="eventContext">The request that completed the upload.</param>
    /// <param name="metadata">What the client said it was uploading.</param>
    /// <param name="logFileId">The <see cref="LogFile.Id"/> being replaced.</param>
    /// <param name="objectKey">The key the new object is stored under.</param>
    /// <returns>The log file.</returns>
    private async Task<LogFile> ReplaceAsync(FileCompleteContext eventContext, TusUploadMetadata metadata, int logFileId, string objectKey)
    {
        // The upload was authorized against the log run it names, so the file being replaced is
        // looked up within that run rather than by its id alone.
        var existing = await logFileCloudService
            .GetLogFileAsync(logFileId, metadata.LogRunId, eventContext.CancellationToken)
            .ConfigureAwait(false);

        var replaced = existing.NameUuid;
        existing.NameUuid = objectKey;
        await context.UpdateChangeInformationAndSaveChangesAsync(eventContext.HttpContext, eventContext.CancellationToken).ConfigureAwait(false);

        if (replaced is not null)
        {
            // Nothing points at the old object once the row moved, and the name it had is never
            // handed out again, so it would stay in the bucket for good. Removing it must not fail
            // the upload: the row already points at the new object, and a caller that took this for
            // a failed write would remove that one instead.
            await logFileCloudService.DeleteOrphanedObject(replaced).ConfigureAwait(false);
        }

        return existing;
    }
}

/// <summary>
/// What the client says it is uploading, carried in the tus upload metadata because a tus
/// request has no route or query values to bind.
/// </summary>
public record TusUploadMetadata(int LogRunId, int? LogFileId, string FileName, string ContentType)
{
    /// <summary>
    /// Reads the metadata from the header value tus sends, a comma separated list of
    /// "key base64value" pairs. This is the only request that carries it.
    /// </summary>
    /// <param name="headerValue">The raw Upload-Metadata header.</param>
    /// <param name="metadata">The parsed metadata, when the required keys are present.</param>
    /// <returns><see langword="true"/> if the metadata could be read; otherwise, <see langword="false"/>.</returns>
    public static bool TryReadHeader(string headerValue, out TusUploadMetadata metadata)
    {
        metadata = null!;
        if (string.IsNullOrWhiteSpace(headerValue)) return false;

        var values = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var pair in headerValue.Split(',', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = pair.Trim().Split(' ', 2);
            if (parts.Length != 2) continue;

            try
            {
                values[parts[0]] = Encoding.UTF8.GetString(Convert.FromBase64String(parts[1]));
            }
            catch (FormatException)
            {
                return false;
            }
        }

        return TryRead(values, out metadata);
    }

    /// <summary>
    /// Reads the metadata the store kept from the request that created the upload, which is how
    /// the later requests learn what the upload they address is for.
    /// </summary>
    /// <param name="storedMetadata">The metadata as the store holds it.</param>
    /// <param name="metadata">The parsed metadata, when the required keys are present.</param>
    /// <returns><see langword="true"/> if the metadata could be read; otherwise, <see langword="false"/>.</returns>
    public static bool TryReadStored(IDictionary<string, Metadata> storedMetadata, out TusUploadMetadata metadata)
    {
        metadata = null!;
        if (storedMetadata is null) return false;

        var values = storedMetadata.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.GetString(Encoding.UTF8),
            StringComparer.Ordinal);

        return TryRead(values, out metadata);
    }

    /// <summary>
    /// Reads the decoded metadata values. Both ways of obtaining them end here, so an upload that
    /// was accepted when it was created cannot fail a stricter reading once it is complete.
    /// </summary>
    /// <param name="values">The decoded metadata values.</param>
    /// <param name="metadata">The parsed metadata, when the required keys are present.</param>
    /// <returns><see langword="true"/> if the metadata could be read; otherwise, <see langword="false"/>.</returns>
    private static bool TryRead(Dictionary<string, string> values, out TusUploadMetadata metadata)
    {
        metadata = null!;

        if (!values.TryGetValue("logRunId", out var logRunIdValue) ||
            !int.TryParse(logRunIdValue, CultureInfo.InvariantCulture, out var logRunId)) return false;
        if (!values.TryGetValue("filename", out var fileName) || string.IsNullOrWhiteSpace(fileName)) return false;
        if (!values.TryGetValue("contentType", out var contentType) || string.IsNullOrWhiteSpace(contentType)) return false;

        // A file being replaced is named by an id, so a value that is not one is a request to
        // replace nothing rather than a request to replace some other file.
        int? logFileId = values.TryGetValue("logFileId", out var logFileIdValue) &&
            int.TryParse(logFileIdValue, CultureInfo.InvariantCulture, out var parsedLogFileId)
            ? parsedLogFileId
            : null;

        metadata = new TusUploadMetadata(logRunId, logFileId, fileName, contentType);
        return true;
    }
}
