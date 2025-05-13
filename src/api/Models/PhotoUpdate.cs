using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a <see cref="Photo"/>'s updatable properties.
/// </summary>
public class PhotoUpdate
{
    /// <summary>
    /// Gets the <see cref="Photo"/>'s id.
    /// </summary>
    [Required]
    [JsonRequired]
    public int Id { get; set; }

    /// <summary>
    /// Gets the <see cref="Photo"/>'s public state.
    /// </summary>
    [Required]
    [JsonRequired]
    public bool Public { get; set; }
}
