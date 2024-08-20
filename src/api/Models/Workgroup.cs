using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a workgroup entity in the database.
/// </summary>
[Table("workgroups")]
public class Workgroup : IIdentifyable
{
    /// <inheritdoc />
    [Key]
    [Column("id_wgp")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the workgroup.
    /// </summary>
    [Column("name_wgp")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Workgroup"/> created date.
    /// </summary>
    [Column("created_wgp")]
    public DateTime? CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Workgroup"/> disabled date.
    /// </summary>
    [Column("disabled_wgp")]
    public DateTime? DisabledAt { get; set; }

    /// <summary>
    /// Gets the value whether the <see cref="Workgroup"/> is disabled or not.
    /// </summary>
    public bool IsDisabled => DisabledAt.HasValue;

    /// <summary>
    /// Gets or sets the Settings for the <see cref="Workgroup"/>.
    /// </summary>
    [Column("settings_wgp", TypeName = "json")]
    public string? Settings { get; set; }

    /// <summary>
    /// Gets the boreholes for the workgroup.
    /// </summary>
    [JsonIgnore]
    public ICollection<Borehole>? Boreholes { get; set; }

    /// <summary>
    /// Number of boreholes in the workgroup.
    /// </summary>
    public int BoreholeCount => Boreholes?.Count ?? 0;

    /// <inheritdoc/>
    public override string ToString() => Name;
}
