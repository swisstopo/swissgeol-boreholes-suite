using BDMS.Services;
using BDMS.Uploads.S3;
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
    private readonly IBoreholePermissionService boreholePermissionService;
    private readonly ProfileCloudService profileCloudService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ProfileTusEndpoint"/> class.
    /// </summary>
    public ProfileTusEndpoint(
        IBoreholePermissionService boreholePermissionService,
        ProfileCloudService profileCloudService,
        [FromKeyedServices(UploadBuckets.Profiles)] S3TusStore store)
    {
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
        var subjectId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (subjectId is null) return false;

        return await boreholePermissionService
            .CanEditBoreholeAsync(subjectId, metadata.BoreholeId)
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
