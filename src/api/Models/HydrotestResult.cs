using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a hydrotest result.
/// </summary>
[Table("hydrotest_result")]
public class HydrotestResult : IChangeTracking, IIdentifyable
{
    /// <summary>
    /// Gets or sets the <see cref="HydrotestResult"/>'s id.
    /// </summary>
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="HydrotestResult"/>'s parameter id.
    /// </summary>
    [IncludeInExport]
    [Column("parameter")]
    public int ParameterId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="HydrotestResult"/>'s parameter.
    /// </summary>
    public Codelist? Parameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="HydrotestResult"/>'s value.
    /// </summary>
    [IncludeInExport]
    [Column("value")]
    public double? Value { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="HydrotestResult"/>'s max value.
    /// </summary>
    [IncludeInExport]
    [Column("max_value")]
    public double? MaxValue { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="HydrotestResult"/>'s min value.
    /// </summary>
    [IncludeInExport]
    [Column("min_value")]
    public double? MinValue { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="HydrotestResult"/>'s hydrotest id.
    /// </summary>
    [Column("hydrotest_id")]
    public int HydrotestId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="HydrotestResult"/>'s hydrotest.
    /// </summary>
    public Hydrotest? Hydrotest { get; set; }

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
