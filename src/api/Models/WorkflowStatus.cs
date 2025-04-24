using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents the status of a <see cref="WorkflowV2"/>.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum WorkflowStatus
{
    /// <summary>
    /// The borehole can be edited.
    /// </summary>
    Draft,

    /// <summary>
    /// The borehole has been submitted for review and is read-only.
    /// </summary>
    InReview,

    /// <summary>
    /// The borehole has been reviewed.
    /// </summary>
    Reviewed,

    /// <summary>
    /// The borehole has been reviewed and published.
    /// </summary>
    Published,
}
