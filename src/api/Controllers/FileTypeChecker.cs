namespace BDMS.Controllers;

/// <summary>
/// Represents a class for checking the type of a file.
/// </summary>
public static class FileTypeChecker
{
    /// <summary>
    /// Checks if the <paramref name="file"/> is a csv file.
    /// </summary>
    /// <param name="file">The file to check the type for.</param>
    /// <returns><c>true</c> if the <paramref name="file"/> is a csv file; <c>false</c> otherwise.</returns>
    public static bool IsCsv(IFormFile file) => HasCorrectFileExtension(file, ".csv");

    /// <summary>
    /// Checks if the <paramref name="file"/> is a JSON file.
    /// </summary>
    /// <param name="file">The file to check the type for.</param>
    /// <returns><c>true</c> if the <paramref name="file"/> is a JSON file; <c>false</c> otherwise.</returns>
    public static bool IsJson(IFormFile file) => HasCorrectFileExtension(file, ".json");

    /// <summary>
    /// Checks if the <paramref name="file"/> is of the expected type.
    /// </summary>
    /// <param name="file">The file to check the type for.</param>
    /// <param name="expectedFileExtension">Expected file extension e.g. '.csv'.</param>
    /// <returns><c>true</c> if the <paramref name="file"/> is of the expected type; <c>false</c> otherwise.</returns>
    internal static bool HasCorrectFileExtension(IFormFile file, string expectedFileExtension)
    {
        var fileExtension = Path.GetExtension(file.FileName);

        if (fileExtension != expectedFileExtension) return false;

        return true;
    }
}
