using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a <see cref="LogFile"/>'s updatable properties.
/// </summary>
public class LogFileUpdate
{
    /// <summary>
    /// Gets the <see cref="LogFile"/>'s id.
    /// </summary>
    [Required]
    [JsonRequired]
    public int Id { get; set; }

    /// <summary>
    /// Gets the <see cref="LogFile"/>'s public state.
    /// </summary>
    [Required]
    [JsonRequired]
    public bool Public { get; set; }

    /// <summary>
    /// Gets the <see cref="LogFile"/>'s pass number.
    /// </summary>
    [Required]
    [JsonRequired]
    public int? Pass { get; set; }

    /// <summary>
    /// Gets the <see cref="LogFile"/>'s delivery date.
    /// </summary>
    [Required]
    [JsonRequired]
    public DateOnly? DeliveryDate { get; set; }

    /// <summary>
    /// Gets the <see cref="LogFile"/>'s pass type codelist ID.
    /// </summary>
    [Required]
    [JsonRequired]
    public int? PassTypeId { get; set; }

    /// <summary>
    /// Gets the <see cref="LogFile"/>'s data package codelist ID.
    /// </summary>
    [Required]
    [JsonRequired]
    public int? DataPackageId { get; set; }

    /// <summary>
    /// Gets the <see cref="LogFile"/>'s depth type codelist ID.
    /// </summary>
    [Required]
    [JsonRequired]
    public int? DepthTypeId { get; set; }
}
