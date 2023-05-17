using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a field measurement observation in the boring process.
/// </summary>
public class FieldMeasurement : Observation
{
    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurement"/>'s sample type id.
    /// </summary>
    [Column("sample_type")]
    public int SampleTypeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurement"/>'s sample type.
    /// </summary>
    public Codelist? SampleType { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurement"/>'s parameter id.
    /// </summary>
    [Column("parameter")]
    public int ParameterId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurement"/>'s parameter.
    /// </summary>
    public Codelist? Parameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurement"/>'s value.
    /// </summary>
    [Column("value")]
    public double Value { get; set; }
}
