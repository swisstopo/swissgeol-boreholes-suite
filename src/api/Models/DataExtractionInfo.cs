namespace BDMS.Models;

/// <summary>
/// Represents the information about a data extraction file.
/// </summary>
public class DataExtractionInfo
{
    /// <summary>
    /// The name of the file.
    /// </summary>
    public string FileName { get; set; }

    /// <summary>
    /// The width of the file.
    /// </summary>
    public int Width { get; set; }

    /// <summary>
    /// The height of the file.
    /// </summary>
    public int Height { get; set; }

    /// <summary>
    /// The number of data extraction images for this file.
    /// </summary>
    public int Count { get; set; }
}
