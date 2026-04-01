using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a tri-state boolean filter value for nullable boolean fields.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NullableBooleanFilterValue
{
    /// <summary>
    /// Filter for boreholes where the field is <c>false</c>.
    /// </summary>
    False = 0,

    /// <summary>
    /// Filter for boreholes where the field is <c>true</c>.
    /// </summary>
    True = 1,

    /// <summary>
    /// Filter for boreholes where the field is <c>NULL</c> in the database.
    /// </summary>
    Null = 2,
}
