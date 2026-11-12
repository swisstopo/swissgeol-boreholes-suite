using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a borehole from the csv import.
/// </summary>
public class BoreholeImport : Borehole
{
    /// <summary>
    /// Gets or sets the <see cref="BoreholeImport"/>'s X-location using LV95 or LV03 coordinates.
    /// </summary>
#pragma warning disable CA1707 // Identifiers should not contain underscores
    public double? Location_x { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoreholeImport"/>'s Y-location using LV95 or LV03 coordinates.
    /// </summary>
    public double? Location_y { get; set; }
#pragma warning restore CA1707 // Identifiers should not contain underscores

    /// <summary>
    /// Gets or sets the <see cref="BoreholeImport"/>'s attachments.
    /// Represents a list of files to attach to the <see cref="Borehole"/> in form of a comma separated string.
    /// e.g. "borehole_1.pdf,borehole_2.pdf".
    /// </summary>
    public string Attachments { get; set; }

    /// <summary>
    /// Gets or sets the raw CSV cell of <see cref="Borehole.SourceTypeCodelistIds"/>: comma separated codelist ids,
    /// e.g. "100001,100003". Kept as text so a token that is not a number fails validation per row
    /// instead of aborting the whole file. Not part of the JSON import.
    /// </summary>
    [JsonIgnore]
    public string? SourceTypeIds { get; set; }
}
