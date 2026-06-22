using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a single custom map overlay stored in a <see cref="User"/>'s settings
/// (under <c>map.explorer</c>). The property names mirror the shape persisted by the
/// client, so existing settings continue to round-trip unchanged.
/// </summary>
public record MapLayer
{
    /// <summary>
    /// Gets the layer type, either <c>WMS</c> or <c>WMTS</c>.
    /// </summary>
    [JsonPropertyName("type")]
    public string? Type { get; init; }

    /// <summary>
    /// Gets the layer identifier.
    /// </summary>
    [JsonPropertyName("Identifier")]
    public string? Identifier { get; init; }

    /// <summary>
    /// Gets the layer title.
    /// </summary>
    [JsonPropertyName("Title")]
    public string? Title { get; init; }

    /// <summary>
    /// Gets the layer abstract.
    /// </summary>
    [JsonPropertyName("Abstract")]
    public string? Abstract { get; init; }

    /// <summary>
    /// Gets the service URL of the layer.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Opaque value persisted by the client and round-tripped verbatim; may be a templated or relative URL.")]
    [JsonPropertyName("url")]
    public string? Url { get; init; }

    /// <summary>
    /// Gets a value indicating whether the layer is visible.
    /// </summary>
    [JsonPropertyName("visibility")]
    public bool Visibility { get; init; }

    /// <summary>
    /// Gets the layer transparency, as a percentage from <c>0</c> to <c>100</c>.
    /// </summary>
    [JsonPropertyName("transparency")]
    public double Transparency { get; init; }

    /// <summary>
    /// Gets the layer position used for ordering and z-index.
    /// </summary>
    [JsonPropertyName("position")]
    public int Position { get; init; }

    /// <summary>
    /// Gets a value indicating whether the layer is queryable.
    /// </summary>
    [JsonPropertyName("queryable")]
    public bool Queryable { get; init; }

    /// <summary>
    /// Gets the opaque WMTS source configuration produced by the client. Stored and
    /// returned verbatim; <c>null</c> for WMS layers.
    /// </summary>
    [JsonPropertyName("conf")]
    public JsonElement? Conf { get; init; }
}
