﻿using System.ComponentModel.DataAnnotations.Schema;
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
    /// Gets or sets the X coordinate of the data point.
    /// </summary>
    public double X { get; set; }

    /// <summary>
    /// Gets or sets the Y coordinate of the data point.
    /// </summary>
    public double Y { get; set; }

    /// <summary>
    /// Gets or sets the Z coordinate of the data point.
    /// </summary>
    public double Z { get; set; }
}
