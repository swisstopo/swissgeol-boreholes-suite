using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a groundwater level measurement observation in the boring process.
/// </summary>
public class GroundwaterLevelMeasurement : Observation
{
    /// <summary>
    /// Gets or sets the <see cref="GroundwaterLevelMeasurement"/>'s kind.
    /// </summary>
    [IncludeInExport]
    [Column("kind")]
    public int KindId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="GroundwaterLevelMeasurement"/>'s kind.
    /// </summary>
    public Codelist? Kind { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="GroundwaterLevelMeasurement"/>'s level in m.
    /// </summary>
    [IncludeInExport]
    [Column("level_m")]
    public double? LevelM { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="GroundwaterLevelMeasurement"/>'s level in m a.s.l.
    /// </summary>
    [IncludeInExport]
    [Column("level_masl")]
    public double? LevelMasl { get; set; }
}
