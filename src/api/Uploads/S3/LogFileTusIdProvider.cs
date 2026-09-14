using System.Globalization;
using tusdotnet.Interfaces;

namespace BDMS.Uploads.S3;

/// <summary>
/// Names an upload. The name doubles as the key the finished object is stored under, so it takes
/// the shape every other log file object in the bucket already has: a guid carrying the extension
/// of the file the user picked.
///
/// The name also travels in the URL of every request after the first one and reaches the cloud
/// storage as a key, so <see cref="ValidateId"/> admits nothing but that shape.
/// </summary>
public class LogFileTusIdProvider : ITusFileIdProvider
{
    /// <summary>
    /// The longest extension that is considered safe to keep.
    /// </summary>
    private const int MaxExtensionLength = 10;

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
        if (!TusUploadMetadata.TryReadHeader(metadata, out var values)) return string.Empty;

        var extension = Path.GetExtension(values.FileName).TrimStart('.');

        return IsExtensionSafe(extension) ? $".{extension}" : string.Empty;
    }

    /// <summary>
    /// Whether an extension may be carried into a URL and a key unchanged.
    /// </summary>
    /// <param name="extension">The extension, without its leading dot.</param>
    /// <returns><see langword="true"/> if the extension is safe to keep; otherwise, <see langword="false"/>.</returns>
    private static bool IsExtensionSafe(string extension) =>
        extension.Length is > 0 and <= MaxExtensionLength && extension.All(char.IsAsciiLetterOrDigit);

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
