using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

[Table("borehole_geometry")]
public class BoreholeGeometryElement : IIdentifyable
{
    /// <inheritdoc />
    [JsonIgnore]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Models.Borehole"/> of this <see cref="BoreholeGeometryElement"/>.
    /// </summary>
    [JsonIgnore]
    [Column("borehole_id")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoreholeGeometryElement"/>'s borehole.
    /// </summary>
    [JsonIgnore]
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets the Measured Depth (MD) of the data point in meters.
    /// </summary>
    [IncludeInExport]
    public double MD { get; set; }

    /// <summary>
    /// Gets or sets the X coordinate of the data point in meters.
    /// </summary>
    [IncludeInExport]
    public double X { get; set; }

    /// <summary>
    /// Gets or sets the Y coordinate of the data point in meters.
    /// </summary>
    [IncludeInExport]
    public double Y { get; set; }

    /// <summary>
    /// Gets or sets the Z coordinate of the data point in meters.
    /// </summary>
    [IncludeInExport]
    public double Z { get; set; }

    /// <summary>
    /// Gets or sets the hole azimuth at the data point in degrees.
    /// </summary>
    [IncludeInExport]
    public double? HAZI { get; set; }

    /// <summary>
    /// Gets or sets deviation or inclination at the data point in degrees.
    /// </summary>
    [IncludeInExport]
    public double? DEVI { get; set; }
}
