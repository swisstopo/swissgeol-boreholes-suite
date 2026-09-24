using BDMS.Uploads.S3;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Net;
using System.Security.Claims;
using System.Text;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;
using tusdotnet.Models.Expiration;

namespace BDMS.Uploads;

/// <summary>
/// Builds the tus endpoint configuration for one kind of upload.
///
/// The file arrives as a series of requests, none of which is long enough to reach the duration the
/// infrastructure allows a single request. What is being uploaded is carried in the upload
/// metadata, because a tus request has no route values to bind.
///
/// What a subclass supplies is what differs between features: which store to write through, what
/// the metadata means, who may write it, and what to record once it has arrived. What lives here is
/// what is easy to get wrong and must not be written twice.
/// </summary>
/// <typeparam name="TMetadata">What the upload metadata of this endpoint says the upload is for.</typeparam>
public abstract class TusUploadEndpoint<TMetadata>
    where TMetadata : class
{
    /// <summary>
    /// What a request whose metadata cannot be read is answered with. It names no key, because the
    /// metadata the client sent is what the message would be quoting back at whoever reads the
    /// response.
    /// </summary>
    private const string MalformedMetadataMessage = "The upload metadata is missing or malformed.";

    /// <summary>
    /// How long an upload stays resumable. An upload that is never finished still holds the parts
    /// it was written to, so it expires and the sweeper is free to remove it.
    /// </summary>
    private static readonly TimeSpan uploadLifetime = TimeSpan.FromDays(1);

    /// <summary>Gets the route the chunks are sent to.</summary>
    public abstract string EndpointPath { get; }

    /// <summary>
    /// Gets the response header carrying the id of the row the upload was recorded as, read by the
    /// client because a finished tus upload answers with no body of its own.
    /// </summary>
    public abstract string ResultHeaderName { get; }

    /// <summary>Gets the store this endpoint writes through.</summary>
    protected abstract S3TusStore Store { get; }

    /// <summary>
    /// Builds the configuration for a single tus request.
    /// </summary>
    /// <param name="httpContext">The request the upload arrives on.</param>
    /// <returns>The configuration the tus endpoint answers with.</returns>
    public Task<DefaultTusConfiguration> CreateAsync(HttpContext httpContext)
    {
        return Task.FromResult(new DefaultTusConfiguration
        {
            Store = Store,
            UsePipelinesIfAvailable = true,

            // The int sized property cannot express the ceiling the product allows.
            MaxAllowedUploadSizeInBytesLong = FileSizeLimits.Large,
            Expiration = new AbsoluteExpiration(uploadLifetime),
            Events = new Events
            {
                OnAuthorizeAsync = AuthorizeRequestAsync,
                OnFileCompleteAsync = StoreCompletedUploadAsync,
            },
        });
    }

    /// <summary>
    /// Reads back what an upload was created for, telling an upload that is not there from one that
    /// is but no longer says what it is for. Both leave nothing to authorize against, and only the
    /// first of them is somebody else's to answer.
    /// </summary>
    /// <param name="file">The stored upload, or null when the store holds none under that id.</param>
    /// <param name="cancellationToken">Aborts the read.</param>
    /// <returns>What was found, and what the upload is for once it has been read.</returns>
    internal async Task<(StoredMetadataResult Result, TMetadata? Metadata)> ReadStoredMetadataAsync(ITusFile? file, CancellationToken cancellationToken)
    {
        if (file is null) return (StoredMetadataResult.NoSuchUpload, null);

        var stored = await file.GetMetadataAsync(cancellationToken).ConfigureAwait(false);
        if (stored is null) return (StoredMetadataResult.Unreadable, null);

        var values = stored.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.GetString(Encoding.UTF8),
            StringComparer.Ordinal);

        return TryReadMetadata(values, out var metadata)
            ? (StoredMetadataResult.Read, metadata)
            : (StoredMetadataResult.Unreadable, null);
    }

    /// <summary>
    /// Reads what the client says it is uploading.
    /// </summary>
    /// <param name="values">The decoded upload metadata.</param>
    /// <param name="metadata">What the upload is for, when the required keys are present.</param>
    /// <returns><see langword="true"/> if the metadata could be read; otherwise, <see langword="false"/>.</returns>
    protected abstract bool TryReadMetadata(IReadOnlyDictionary<string, string> values, [NotNullWhen(true)] out TMetadata? metadata);

    /// <summary>
    /// Whether this user may write this upload.
    /// </summary>
    /// <param name="user">The user making the request.</param>
    /// <param name="metadata">What the upload is for.</param>
    /// <param name="intent">What the request is trying to do.</param>
    /// <param name="cancellationToken">Aborts the check.</param>
    /// <returns><see langword="true"/> if the upload may proceed; otherwise, <see langword="false"/>.</returns>
    /// <exception cref="UploadRefusedException">The upload is refused for a reason the user can act on.</exception>
    protected abstract Task<bool> AuthorizeAsync(ClaimsPrincipal user, TMetadata metadata, IntentType intent, CancellationToken cancellationToken);

    /// <summary>
    /// Records the finished upload.
    /// </summary>
    /// <param name="httpContext">The request that completed the upload.</param>
    /// <param name="metadata">What the upload was for.</param>
    /// <param name="objectKey">The key the object is stored under.</param>
    /// <param name="cancellationToken">
    /// Aborts the lookups an implementation makes before it writes. It must not reach the write
    /// itself. The object is whole in the cloud storage by the time this is called and this request
    /// is the last one that will ever be made about it, so a cancelled commit leaves an outcome
    /// nobody can read back: the database may have committed server side while the caller below
    /// sees a failure and removes the object the committed row points at.
    /// </param>
    /// <returns>The id of the row the upload was recorded as.</returns>
    protected abstract Task<int> CompleteAsync(HttpContext httpContext, TMetadata metadata, string objectKey, CancellationToken cancellationToken);

    /// <summary>
    /// Refuses a request that may not touch the upload it addresses.
    ///
    /// Every request is checked, not only the one that creates the upload: an upload arrives over
    /// many requests and outlives the first one by as long as the file takes to send, and by then
    /// the borehole may have been locked or moved to a status that no longer allows editing.
    /// </summary>
    /// <param name="eventContext">The request being authorized.</param>
    private async Task AuthorizeRequestAsync(AuthorizeContext eventContext)
    {
        if (eventContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier) is null)
        {
            eventContext.FailRequest(HttpStatusCode.Unauthorized);
            return;
        }

        // Asking what the endpoint supports addresses no upload, so there is nothing behind it to
        // check a permission against.
        if (eventContext.Intent == IntentType.GetOptions) return;

        var (result, metadata) = eventContext.Intent == IntentType.CreateFile
            ? ReadMetadataFromRequest(eventContext)
            : await ReadMetadataFromStoreAsync(eventContext).ConfigureAwait(false);

        // A request naming an upload the store does not hold is the one case something else
        // answers: tusdotnet replies with the not found that tells the client to start over, which
        // is more use to it than a refusal it treats as final. There is no upload behind it for a
        // permission to be about either way.
        if (result == StoredMetadataResult.NoSuchUpload) return;

        // Everything else that could not be read is refused. Creating an upload is the only request
        // that carries the metadata, so an unreadable one is the client's mistake; a later request
        // reaching here names an upload that is there but no longer says what it is for, and an
        // upload nothing can be said about is one no permission can be checked against.
        if (metadata is null)
        {
            eventContext.FailRequest(HttpStatusCode.BadRequest, MalformedMetadataMessage);
            return;
        }

        if (!await AuthorizeAsync(eventContext.HttpContext.User, metadata, eventContext.Intent, eventContext.CancellationToken).ConfigureAwait(false))
        {
            eventContext.FailRequest(HttpStatusCode.Unauthorized);
        }
    }

    private (StoredMetadataResult Result, TMetadata? Metadata) ReadMetadataFromRequest(AuthorizeContext eventContext) =>
        UploadMetadataHeader.TryRead(eventContext.HttpContext.Request.Headers["Upload-Metadata"].ToString(), out var values) &&
        TryReadMetadata(values, out var metadata)
            ? (StoredMetadataResult.Read, metadata)
            : (StoredMetadataResult.Unreadable, null);

    private async Task<(StoredMetadataResult Result, TMetadata? Metadata)> ReadMetadataFromStoreAsync(AuthorizeContext eventContext)
    {
        var file = await eventContext.GetFileAsync().ConfigureAwait(false);
        return await ReadStoredMetadataAsync(file, eventContext.CancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Records the finished upload and tells the client what it stored.
    ///
    /// The object is already in the cloud storage, written as the chunks arrived, so this writes
    /// one row and nothing here grows with the size of the file.
    /// </summary>
    /// <param name="eventContext">The request that completed the upload.</param>
    private async Task StoreCompletedUploadAsync(FileCompleteContext eventContext)
    {
        var file = await eventContext.GetFileAsync().ConfigureAwait(false);
        var (_, metadata) = await ReadStoredMetadataAsync(file, eventContext.CancellationToken).ConfigureAwait(false);

        // The metadata passed the same reading when the upload was created, so failing here means
        // the stored copy no longer says what it did then.
        if (metadata is null)
        {
            throw new InvalidOperationException(MalformedMetadataMessage);
        }

        var objectKey = Store.GetObjectKey(file.Id);

        int rowId;
        try
        {
            rowId = await CompleteAsync(eventContext.HttpContext, metadata, objectKey, eventContext.CancellationToken).ConfigureAwait(false);
        }
        catch
        {
            // The object is whole in the cloud storage by now, and no row is going to point at it,
            // so nothing would ever refer to it or remove it again. Neither call takes the request
            // token, because one of the ways to arrive here is the client having gone away, and
            // neither may throw: a cleanup that replaced the failure it is cleaning up after would
            // turn a refusal the user can act on into a bare server error.
            await Store.DeleteOrphanedObjectAsync(objectKey).ConfigureAwait(false);
            await Store.ForgetQuietlyAsync(file.Id).ConfigureAwait(false);

            // A refusal the user can act on is the one failure worth describing, and the last
            // chunk has already been answered, so the reason has to travel back in the response to
            // that chunk for the client to be able to show it.
            throw;
        }

        eventContext.HttpContext.Response.Headers.Append(ResultHeaderName, rowId.ToString(CultureInfo.InvariantCulture));

        // The state the store kept for the upload is spent once the row points at the object. The
        // request token is not passed on: the row is committed, tusdotnet catches nothing around
        // this handler, and a cancellation raised here would answer the last chunk of a finished
        // upload with a server error, which is the one answer the client retries.
        await Store.ForgetAsync(file.Id, CancellationToken.None).ConfigureAwait(false);
    }
}
