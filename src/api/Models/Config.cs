using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a config entity in the database.
/// </summary>
[Table("config")]
public class Config
{
    /// <summary>
    /// Gets or sets the <see cref="Config"/>'s name.
    /// </summary>
    [Key]
    [Column("name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Config"/>'s value.
    /// </summary>
    [Column("value")]
    public string? Value { get; set; }
}
