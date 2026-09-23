using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Text;
using tusdotnet.Models;

namespace BDMS.Uploads;

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
    public static bool TryReadHeader(string headerValue, [NotNullWhen(true)] out TusUploadMetadata? metadata)
    {
        metadata = null;
        return UploadMetadataHeader.TryRead(headerValue, out var values) && TryRead(values, out metadata);
    }

    /// <summary>
    /// Reads the metadata the store kept from the request that created the upload, which is how
    /// the later requests learn what the upload they address is for.
    /// </summary>
    /// <param name="storedMetadata">The metadata as the store holds it.</param>
    /// <param name="metadata">The parsed metadata, when the required keys are present.</param>
    /// <returns><see langword="true"/> if the metadata could be read; otherwise, <see langword="false"/>.</returns>
    public static bool TryReadStored(IDictionary<string, Metadata> storedMetadata, [NotNullWhen(true)] out TusUploadMetadata? metadata)
    {
        metadata = null;
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
    public static bool TryRead(IReadOnlyDictionary<string, string> values, [NotNullWhen(true)] out TusUploadMetadata? metadata)
    {
        metadata = null;

        if (!values.TryGetValue("logRunId", out var logRunIdValue) ||
            !int.TryParse(logRunIdValue, CultureInfo.InvariantCulture, out var logRunId)) return false;
        if (!values.TryGetValue(UploadMetadataHeader.FileNameKey, out var fileName) || string.IsNullOrWhiteSpace(fileName)) return false;
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
