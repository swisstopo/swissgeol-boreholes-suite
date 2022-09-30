using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a workgroup entity in the database.
/// </summary>
[Table("workgroups")]
public class Workgroup
{
    /// <summary>
    /// Gets or sets the workgroup id.
    /// </summary>
    [Key]
    [Column("id_wgp")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the workgroup.
    /// </summary>
    [Column("name_wgp")]
    public string Name { get; set; }

    /// <inheritdoc/>
    public override string ToString() => Name;
}
