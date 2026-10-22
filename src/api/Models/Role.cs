using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a role entity in the database.
/// </summary>
/// <remarks>
/// Role values are stored as ids in the database and must match the ids in <c>bdms.roles</c>.
/// Changing a value requires a migration that moves the existing rows.
/// </remarks>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Role
{
    /// <summary>
    /// View permissions.
    /// </summary>
    View = 0,

    /// <summary>
    /// Editor permissions/ Change In Progress.
    /// </summary>
    Editor = 1,

    /// <summary>
    /// Controller permissions/ In Review.
    /// </summary>
    Controller = 2,

    /// <summary>
    /// Publisher permissions/ Published.
    /// </summary>
    Publisher = 3,
}
