using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a role entity in the database.
/// </summary>
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
    /// <remarks>
    /// Role values are stored as ids in the database and must not be renumbered.
    /// </remarks>
    Publisher = 3,
}
