using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace BDMS.Uploads;

/// <summary>
/// What the client says it is uploading, carried in the tus upload metadata because a tus request
/// has no route or query values to bind.
/// </summary>
/// <param name="BoreholeId">The borehole the file belongs to.</param>
/// <param name="ProfileId">The row to fill, or null to create one.</param>
/// <param name="FileName">The name the user gave the file.</param>
/// <param name="ContentType">The content type of the file.</param>
public record ProfileUploadMetadata(int BoreholeId, int? ProfileId, string FileName, string ContentType)
{
    /// <summary>
    /// Reads the decoded metadata values. The request that creates the upload and every request
    /// after it end here, so an upload that was accepted when it was created cannot fail a
    /// stricter reading once it is complete.
    /// </summary>
    /// <param name="values">The decoded metadata values.</param>
    /// <param name="metadata">The parsed metadata, when the required keys are present.</param>
    /// <returns><see langword="true"/> if the metadata could be read; otherwise, <see langword="false"/>.</returns>
    public static bool TryRead(IReadOnlyDictionary<string, string> values, [NotNullWhen(true)] out ProfileUploadMetadata? metadata)
    {
        metadata = null;

        if (!values.TryGetValue("boreholeId", out var boreholeIdValue) ||
            !int.TryParse(boreholeIdValue, CultureInfo.InvariantCulture, out var boreholeId)) return false;
        if (!values.TryGetValue(UploadMetadataHeader.FileNameKey, out var fileName) || string.IsNullOrWhiteSpace(fileName)) return false;
        if (!values.TryGetValue("contentType", out var contentType) || string.IsNullOrWhiteSpace(contentType)) return false;

        // A row being filled is named by an id, so a value that is not one is a request to fill
        // nothing rather than a request to fill some other row.
        int? profileId = values.TryGetValue("profileId", out var profileIdValue) &&
            int.TryParse(profileIdValue, CultureInfo.InvariantCulture, out var parsedProfileId)
            ? parsedProfileId
            : null;

        metadata = new ProfileUploadMetadata(boreholeId, profileId, fileName, contentType);
        return true;
    }
}
