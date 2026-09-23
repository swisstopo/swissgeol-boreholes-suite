using System.Globalization;
using tusdotnet.Interfaces;

namespace BDMS.Uploads.S3;

/// <summary>
/// Names an upload. The name doubles as the key the finished object is stored under, so it takes
/// the shape every other object in the buckets already has: a guid carrying the extension of the
/// file the user picked.
///
/// The name also travels in the URL of every request after the first one and reaches the cloud
/// storage as a key, so <see cref="ValidateId"/> admits nothing but that shape.
///
/// One provider names the uploads of every feature, because what a name is made of is the same
/// wherever the object ends up and is read back the same way.
/// </summary>
public class TusObjectIdProvider : ITusFileIdProvider
{
    /// <inheritdoc/>
    public Task<string> CreateId(string metadata) =>
        Task.FromResult($"{Guid.NewGuid().ToString("D", CultureInfo.InvariantCulture)}{ReadExtension(metadata)}");

    /// <inheritdoc/>
    public Task<bool> ValidateId(string fileId) => Task.FromResult(IsWellFormed(fileId));

    /// <summary>
    /// The extension to give the upload, as a dotted suffix, taken from the name the client sent.
    /// </summary>
    /// <param name="metadata">The raw Upload-Metadata header of the request creating the upload.</param>
    /// <returns>The extension, or an empty string when the name carries none worth keeping.</returns>
    private static string ReadExtension(string metadata)
    {
        // The name is taken out of the decoded header rather than out of what a feature makes of
        // it. An upload whose metadata this could not read would be stored under a name carrying no
        // extension, and the extension is what tells the download what it is handing back.
        if (!UploadMetadataHeader.TryRead(metadata, out var values) ||
            !values.TryGetValue(UploadMetadataHeader.FileNameKey, out var fileName)) return string.Empty;

        var extension = Path.GetExtension(fileName).TrimStart('.');

        return IsExtensionSafe(extension) ? $".{extension}" : string.Empty;
    }

    /// <summary>
    /// Whether an extension may be carried into a URL and a key unchanged.
    /// </summary>
    /// <param name="extension">The extension, without its leading dot.</param>
    /// <returns><see langword="true"/> if the extension is safe to keep; otherwise, <see langword="false"/>.</returns>
    private static bool IsExtensionSafe(string extension) =>
        extension.Length > 0 && extension.All(char.IsAsciiLetterOrDigit);

    /// <summary>
    /// Whether a name is one this provider could have handed out.
    /// </summary>
    /// <param name="fileId">The name to check.</param>
    /// <returns><see langword="true"/> if the name is well formed; otherwise, <see langword="false"/>.</returns>
    private static bool IsWellFormed(string fileId)
    {
        if (string.IsNullOrEmpty(fileId)) return false;

        var separator = fileId.IndexOf('.', StringComparison.Ordinal);
        if (separator < 0) return Guid.TryParseExact(fileId, "D", out _);

        return Guid.TryParseExact(fileId[..separator], "D", out _) &&
            IsExtensionSafe(fileId[(separator + 1)..]);
    }
}
