namespace BDMS.Controllers;

public static class FileTypeChecker
{
    private static readonly byte[] PDF = { 37, 80, 68, 70 };

    /// <summary>
    /// Checks if the file is of the expected type. If applicable, the file is checked for the file's magic number.
    /// </summary>
    /// <param name="file"></param>
    /// <param name="expectedFileExtension">Expected file extension e.g. '.csv'.</param>
    /// <returns></returns>
    public static bool IsCorrectFileType(IFormFile file, string expectedFileExtension)
    {
        var fileExtension = Path.GetExtension(file.FileName);

        if (fileExtension != expectedFileExtension) return false;

        if (expectedFileExtension == ".pdf")
        {
            // Check if the file is empty. If it is, it is not a pdf.
            if (file.Length == 0) return false;

            using var fileStream = file.OpenReadStream();
            byte[] bytes = new byte[4];
            fileStream.Read(bytes, 0, 4);
            return IsPdf(bytes);
        }

        return true;
    }

    /// <summary>
    /// Tests whether a byte array represents a PDF file.
    /// The byte array is considered anything that starts with the <c>%PDF</c> <em>magic number</em>.
    /// </summary>
    /// <param name="buffer">The array of unsigned bytes to test.</param>
    /// <returns><c>true</c> if <paramref name="buffer"/> represent a PDF; <c>false</c> otherwise.</returns>
    public static bool IsPdf(byte[] buffer) => buffer.Take(PDF.Length).SequenceEqual(PDF);
}
