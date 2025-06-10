using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a <see cref="Document"/>'s updatable properties.
/// </summary>
public class DocumentUpdate
{
    /// <summary>
    /// Gets or sets the <see cref="Document"/>'s id.
    /// </summary>
    [Required]
    [JsonRequired]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Document"/>'s url.
    /// </summary>
    [Required]
    [JsonRequired]
    public Uri Url { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Document"/>'s description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Document"/> is publicly visible.
    /// </summary>
    [Required]
    [JsonRequired]
    public bool Public { get; set; }
}
