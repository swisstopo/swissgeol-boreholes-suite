using System.Diagnostics.CodeAnalysis;
using System.Text;

namespace BDMS.Uploads;

/// <summary>
/// The upload metadata as tus sends it, a comma separated list of "key base64value" pairs.
///
/// Decoding it says nothing about what the keys mean, which is what lets the endpoint decode a
/// header whose keys only the feature behind it can interpret.
/// </summary>
public static class UploadMetadataHeader
{
    /// <summary>
    /// Decodes the header value tus sends.
    /// </summary>
    /// <param name="headerValue">The raw Upload-Metadata header.</param>
    /// <param name="values">The decoded values, when the header is well formed.</param>
    /// <returns><see langword="true"/> if the header could be decoded; otherwise, <see langword="false"/>.</returns>
    public static bool TryRead(string headerValue, [NotNullWhen(true)] out Dictionary<string, string>? values)
    {
        values = null;
        if (string.IsNullOrWhiteSpace(headerValue)) return false;

        var decoded = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var pair in headerValue.Split(',', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = pair.Trim().Split(' ', 2);
            if (parts.Length != 2) continue;

            try
            {
                decoded[parts[0]] = Encoding.UTF8.GetString(Convert.FromBase64String(parts[1]));
            }
            catch (FormatException)
            {
                return false;
            }
        }

        values = decoded;
        return true;
    }
}
