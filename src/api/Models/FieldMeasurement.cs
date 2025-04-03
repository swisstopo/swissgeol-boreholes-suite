using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a field measurement observation in the boring process.
/// </summary>
public class FieldMeasurement : Observation
{
    /// <summary>
    /// Gets the <see cref="FieldMeasurementResult"/>s associated with the <see cref="FieldMeasurement"/>.
    /// </summary>
    [IncludeInExport]
    public ICollection<FieldMeasurementResult>? FieldMeasurementResults { get; set; }
}
