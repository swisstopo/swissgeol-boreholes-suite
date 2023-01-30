using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    public DateTime? Created { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Workgroup"/> disabled date.
    /// </summary>
    [Column("disabled_wgp")]
    public DateTime? Disabled { get; set; }

    /// <summary>
    /// Gets or sets the Settings for the <see cref="Workgroup"/>.
    /// </summary>
    [Column("settings_wgp", TypeName = "json")]
    public string? Settings { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Workgroup"/> is supplier.
    /// </summary>
    [Column("supplier_wgp")]
    public bool? IsSupplier { get; set; }

    /// <summary>
    /// Gets the boreholes for the workgroup.
    /// </summary>
    public ICollection<Borehole> Boreholes { get; set; }

    /// <inheritdoc/>
    public override string ToString() => Name;
}
