using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace BDMS.Uploads;

/// <summary>
/// What the client says it is uploading, carried in the tus upload metadata because a tus
/// request has no route or query values to bind.
/// </summary>
public record TusUploadMetadata(int LogRunId, int? LogFileId, string FileName, string ContentType)
{
    /// <summary>
    /// Reads the decoded metadata values. The request that creates the upload and every request
    /// after it end here, so an upload that was accepted when it was created cannot fail a
    /// stricter reading once it is complete.
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

        // Naming no file is a request to add one, which is what an ordinary upload does. Naming one
        // that is not an id is neither: reading it as naming no file would add a file the client
        // meant to replace, leaving the run holding both. Both ends read this, so it is refused
        // before any bytes are sent.
        int? logFileId = null;
        if (values.TryGetValue("logFileId", out var logFileIdValue))
        {
            if (!int.TryParse(logFileIdValue, CultureInfo.InvariantCulture, out var parsedLogFileId)) return false;
            logFileId = parsedLogFileId;
        }

        metadata = new TusUploadMetadata(logRunId, logFileId, fileName, contentType);
        return true;
    }
}
