namespace BDMS;

public static class FileHelper
{
    /// <summary>
    /// Returns a safe ZIP entry file name that cannot traverse directories.
    /// Uses <see cref="Path.GetFileName(string?)"/> to strip path components and rejects '.'/'..' segments.
    /// </summary>
    /// <param name="name">The original file name (may include path separators).</param>
    /// <param name="fallback">A fallback file name to use if the sanitized name is invalid (e.g., empty or reserved).</param>
    /// <returns>A sanitized base file name safe to use as a ZIP entry.</returns>
    public static string SanitizeZipEntryFileName(string name, string fallback)
    {
        var baseName = Path.GetFileName(name);

        if (baseName == "." || baseName == ".." || string.IsNullOrWhiteSpace(baseName))
        {
            return fallback;
        }

        return baseName;
    }
}
