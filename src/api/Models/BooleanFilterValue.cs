using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a boolean filter value for non-nullable boolean fields.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum BooleanFilterValue
{
    /// <summary>
    /// Filter for boreholes where the field is <c>false</c>.
    /// </summary>
    False = 0,

    /// <summary>
    /// Filter for boreholes where the field is <c>true</c>.
    /// </summary>
    True = 1,
}
