namespace BDMS.Controllers;

/// <summary>
/// Represents a class for checking the type of a file.
/// </summary>
public static class FileTypeChecker
{
    // The magic number for a pdf file.
    private static readonly byte[] PDF = { 37, 80, 68, 70 };

    /// <summary>
    /// Checks if the <paramref name="file"/> is a csv file.
    /// </summary>
    /// <param name="file">The file to check the type for.</param>
    /// <returns><c>true</c> if the <paramref name="file"/> is a csv file; <c>false</c> otherwise.</returns>
    public static bool IsCsv(IFormFile file) => HasCorrectFileExtension(file, ".csv");

    /// <summary>
    /// Checks if the <paramref name="file"/> is a pdf file.
    /// </summary>
    /// <param name="file">The file to check the type for.</param>
    /// <returns><c>true</c> if the <paramref name="file"/> is a pdf file; <c>false</c> otherwise.</returns>
    public static bool IsPdf(IFormFile file)
    {
        if (HasCorrectFileExtension(file, ".pdf") == false) return false;

        // Check if the file is empty. If it is, it is not a pdf.
        if (file.Length == 0) return false;

        // Check the magic number of the file.
        return HasCorrectMagicNumber(file, PDF);
    }

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

    /// <summary>
    /// Tests whether the <paramref name="file"/> has the correct <em>magic number</em>.
    /// </summary>
    /// <param name="file">The file to check the magic number for.</param>
    /// <param name="magicNumber">The magic number to expected.</param>
    /// <returns><c>true</c> if <paramref name="file"/> starts with the expected byte sequence; <c>false</c> otherwise.</returns>
    internal static bool HasCorrectMagicNumber(IFormFile file, byte[] magicNumber)
    {
        // Check magic number of pdf file.
        using var fileStream = file.OpenReadStream();
        byte[] bytes = new byte[magicNumber.Length];
        fileStream.Read(bytes, 0, magicNumber.Length);
        return bytes.Take(magicNumber.Length).SequenceEqual(magicNumber);
    }
}
