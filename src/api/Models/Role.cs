using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a role entity in the database. Also used in <see cref="Workflow"/>s
/// to set the <see cref="Borehole"/>s publication status.
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
    /// Validator permissions/ In Validation.
    /// </summary>
    Validator = 3,

    /// <summary>
    /// Publisher permissions/ Published.
    /// </summary>
    Publisher = 4,
}
