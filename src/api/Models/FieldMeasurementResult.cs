using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a field measurement result.
/// </summary>
[Table("fieldmeasurement_result")]
public class FieldMeasurementResult : IIdentifyable, IChangeTracking
{
    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurementResult"/>'s id.
    /// </summary>
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurementResult"/>'s sample type id.
    /// </summary>
    [IncludeInExport]
    [Column("sample_type")]
    public int SampleTypeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurementResult"/>'s sample type.
    /// </summary>
    public Codelist? SampleType { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurementResult"/>'s parameter id.
    /// </summary>
    [IncludeInExport]
    [Column("parameter")]
    public int ParameterId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurementResult"/>'s parameter.
    /// </summary>
    public Codelist? Parameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurementResult"/>'s value.
    /// </summary>
    [IncludeInExport]
    [Column("value")]
    public double Value { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurementResult"/>'s field measurement id.
    /// </summary>
    [Column("fieldmeasurement_id")]
    public int FieldMeasurementId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="FieldMeasurementResult"/>'s field measurement.
    /// </summary>
    public FieldMeasurement? FieldMeasurement { get; set; }

    /// <inheritdoc />
    [Column("creator")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <inheritdoc />
    [Column("creation")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
    [Column("updater")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <inheritdoc />
    [Column("update")]
    public DateTime? Updated { get; set; }
}
