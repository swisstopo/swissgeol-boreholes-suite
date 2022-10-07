using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents an event entity in the database.
/// </summary>
[Table("events")]
public class BoringEvent
{
    /// <summary>
    /// Gets or sets the <see cref="BoringEvent"/> id.
    /// </summary>
    [Column("id_evs")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the id of the <see cref="User"/> who created the <see cref="BoringEvent"/>.
    /// </summary>
    [Column("id_usr_fk")]
    public int UserId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> who created the <see cref="BoringEvent"/>.
    /// </summary>
    public User User { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoringEvent"/> topic.
    /// </summary>
    [Column("topic_evs")]
    public string Topic { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoringEvent"/> created date.
    /// </summary>
    [Column("created_evs")]
    public DateTime? Created { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoringEvent"/> topic.
    /// </summary>
    [Column("payload_evs", TypeName = "jsonb")]
    public string? Payload { get; set; }
}
