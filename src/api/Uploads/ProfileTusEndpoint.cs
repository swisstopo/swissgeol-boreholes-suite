using BDMS.Services;
using BDMS.Uploads.S3;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using tusdotnet.Models;

namespace BDMS.Uploads;

/// <summary>
/// The tus endpoint profiles are uploaded to. The upload names the borehole it belongs to, and
/// optionally the row it fills, which is how an import's attachments find the rows written for them.
/// </summary>
public class ProfileTusEndpoint : TusUploadEndpoint<ProfileUploadMetadata>
{
    private readonly BdmsContext context;
    private readonly IBoreholePermissionService boreholePermissionService;
    private readonly ProfileCloudService profileCloudService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ProfileTusEndpoint"/> class.
    /// </summary>
    public ProfileTusEndpoint(
        BdmsContext context,
        IBoreholePermissionService boreholePermissionService,
        ProfileCloudService profileCloudService,
        [FromKeyedServices(UploadBuckets.Profiles)] S3TusStore store)
    {
        this.context = context;
        this.boreholePermissionService = boreholePermissionService;
        this.profileCloudService = profileCloudService;
        Store = store;
    }

    /// <inheritdoc/>
    public override string EndpointPath => UploadRoutes.Profiles;

    /// <inheritdoc/>
    public override string ResultHeaderName => "Profile-Id";

    /// <inheritdoc/>
    protected override S3TusStore Store { get; }

    /// <inheritdoc/>
    protected override bool TryReadMetadata(IReadOnlyDictionary<string, string> values, [NotNullWhen(true)] out ProfileUploadMetadata? metadata) =>
        ProfileUploadMetadata.TryRead(values, out metadata);

    /// <inheritdoc/>
    /// <remarks>
    /// A borehole nothing holds is refused here, because the permission check answers false for a
    /// borehole it cannot find. That is what keeps a completion from writing a profile against an
    /// id nothing holds, which the database would refuse once the whole file had been sent.
    /// </remarks>
    protected override async Task<bool> AuthorizeAsync(ClaimsPrincipal user, ProfileUploadMetadata metadata, IntentType intent, CancellationToken cancellationToken)
    {
        // A request reaching here carries the claim: the base refuses one that does not before it
        // asks what the upload is for.
        var subjectId = user.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        if (!await boreholePermissionService.CanEditBoreholeAsync(subjectId, metadata.BoreholeId).ConfigureAwait(false)) return false;

        // Discarding an upload rests on the borehole permission alone, unlike everything below:
        // it writes nothing and only frees what the upload holds, so whoever may edit the borehole
        // may abandon an upload against it whether or not the row it was meant to fill is still
        // there. That row being deleted is one of the likeliest reasons to cancel, and refusing the
        // termination would leave the partial upload to expire for exactly that case.
        if (intent == IntentType.DeleteFile) return true;

        // An upload that names no row creates one, so there is nothing yet to look up.
        if (metadata.ProfileId is not int profileId) return true;

        // The row is looked up within the borehole the upload is authorized against, so an upload
        // cannot reach a row belonging to another borehole. Every request is checked, not only the
        // one that creates the upload, so a row deleted while the file is on its way refuses the
        // next chunk rather than the last byte of a file that may be gigabytes long.
        return await context.Profiles
            .AnyAsync(p => p.Id == profileId && p.BoreholeId == metadata.BoreholeId, cancellationToken)
            .ConfigureAwait(false);
    }

    /// <inheritdoc/>
    /// <remarks>
    /// Filling a row named by the upload keeps the name that row already holds and takes its type
    /// from the file that arrived, so a client fills a row with the file it was written for.
    /// </remarks>
    protected override async Task<int> CompleteAsync(HttpContext httpContext, ProfileUploadMetadata metadata, string objectKey, CancellationToken cancellationToken)
    {
        var profile = await profileCloudService
            .LinkUploadedProfileAsync(metadata.FileName, metadata.ContentType, objectKey, metadata.BoreholeId, metadata.ProfileId, cancellationToken)
            .ConfigureAwait(false);

        return profile.Id;
    }
}
