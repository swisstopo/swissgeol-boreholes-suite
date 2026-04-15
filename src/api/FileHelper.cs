namespace BDMS;

public static class FileHelper
{
    /// <summary>
    /// Returns a safe ZIP entry file name that cannot traverse directories.
    /// Strips any path components (both Unix and Windows separators), rejects
    /// '.'/'..' segments, and replaces invalid file-name characters with '_'.
    /// </summary>
    /// <param name="name">The original file name (may include path separators).</param>
    /// <returns>A sanitized base file name safe to use as a ZIP entry.</returns>
    public static string SanitizeZipEntryFileName(string name)
    {
        // Normalize both Unix and Windows separators; keep only the basename.
        var lastSlash = name.LastIndexOfAny(['/', '\\']);
        var baseName = lastSlash >= 0 ? name[(lastSlash + 1)..] : name;

        if (baseName == "." || baseName == ".." || string.IsNullOrWhiteSpace(baseName))
        {
            return "export";
        }

        foreach (var invalid in Path.GetInvalidFileNameChars())
        {
            baseName = baseName.Replace(invalid, '_');
        }

        return baseName;
    }
}
