namespace BDMS.Models;

/// <summary>
/// Represents the information about a data extraction file.
/// </summary>
public class DataExtractionInfo
{
    public string FileName { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public int Count { get; set; }
}
