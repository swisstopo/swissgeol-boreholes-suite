namespace BDMS;

public static class FileHelper
{
    /// <summary>
    /// Returns a safe ZIP entry file name that cannot traverse directories.
    /// Uses <see cref="Path.GetFileName(string?)"/> to strip path components and rejects '.'/'..' segments.
    /// </summary>
    /// <param name="name">The original file name (may include path separators).</param>
    /// <param name="fallback">A fallback file name to use if the sanitized name is missing or invalid (e.g., empty or reserved).</param>
    /// <returns>A sanitized base file name safe to use as a ZIP entry.</returns>
    public static string SanitizeZipEntryFileName(string? name, string fallback)
    {
        var baseName = Path.GetFileName(name);

        if (baseName == "." || baseName == ".." || string.IsNullOrWhiteSpace(baseName))
        {
            return fallback;
        }

        return baseName;
    }

    /// <summary>
    /// The name an attachment takes as a ZIP entry: the key the object is stored under, then the
    /// name the user gave the file. The key makes the entry unique within the archive while the
    /// original name stays readable, and the name is sanitized so a separator embedded in it
    /// cannot make the entry escape the archive.
    ///
    /// An export writes the entry and an import looks for it again, so both name it here rather
    /// than spelling the same template twice: two spellings would send an import after an entry
    /// no export ever wrote.
    /// </summary>
    /// <param name="objectKey">The key the object is stored under.</param>
    /// <param name="name">The original file name (may include path separators).</param>
    /// <returns>The ZIP entry name.</returns>
    public static string BuildAttachmentZipEntryName(string objectKey, string? name) =>
        $"{objectKey}_{SanitizeZipEntryFileName(name, "export")}";
}
