namespace BDMS.Models;

/// <summary>
/// Represents the information about a data extraction file.
/// </summary>
/// <param name="FileName"> The name of the image.</param>
/// <param name="Width"> The width of the image in pixels.</param>
/// <param name="Height"> The height of the image in pixels.</param>
/// <param name="Count"> The number of data extraction images for this file.</param>
public record DataExtractionInfo(string FileName, int Width, int Height, int Count);
