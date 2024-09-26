using System.Text.Json.Serialization;

namespace BDMS.Models;

public class DataExtractionInfo
{
    public string fileName { get; set; }
    public int width { get; set; }
    public int height { get; set; }
    public int count { get; set; }
}
