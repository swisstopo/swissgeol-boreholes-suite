using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a role entity in the database.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Role
{
    View = 0,
    Editor = 1,
    Controller = 2,
    Validator = 3,
    Publisher = 4,
}
