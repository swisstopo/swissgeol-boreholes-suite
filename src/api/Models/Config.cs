using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a config entity in the database.
/// </summary>
[Table("config")]
public partial class Config
{
    /// <summary>
    /// Gets or sets the <see cref="Config"/>'s name.
    /// </summary>
    [Key]
    [Column("name_cfg")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Config"/>'s value.
    /// </summary>
    [Column("value_cfg")]
    public string? Value { get; set; }
}
