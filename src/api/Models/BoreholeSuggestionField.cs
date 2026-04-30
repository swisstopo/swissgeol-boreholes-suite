using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// The set of borehole text columns that support suggestions.
/// Bound from the query string as camelCase ("originalName", "projectName", "name").
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum BoreholeSuggestionField
{
    OriginalName,
    ProjectName,
    Name,
}
