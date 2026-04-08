using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Defines the order direction for ordering borehole results.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OrderDirection
{
    Asc,
    Desc,
}
