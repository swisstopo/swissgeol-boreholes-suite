using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents a workflow entity in the database.
/// </summary>
[Table("workflow")]
public class Workflow : IIdentifyable, IUserAttached<User, int>
{
    /// <inheritdoc />
    [Column("id_wkf")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/> id for the workflow.
    /// </summary>
    [Column("id_usr_fk")]
    public int UserId { get; set; }

    /// <summary>
    /// Gets or sets the  <see cref="Borehole"/> id for the workflow.
    /// </summary>
    [Column("id_bho_fk")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the timestamp from the moment the workflow started.
    /// </summary>
    [Column("started_wkf")]
    public DateTime? Started { get; set; }

    /// <summary>
    /// Gets or sets the timestamp from the moment the workflow finished.
    /// </summary>
    [Column("finished_wkf")]
    public DateTime? Finished { get; set; }

    /// <summary>
    /// Gets or sets the notes.
    /// </summary>
    [Column("notes_wkf")]
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="User"/>.
    /// </summary>
    public User User { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>.
    /// </summary>
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Role"/>.
    /// </summary>
    [Column("id_rol_fk", TypeName = "integer")]
    public Role? Role { get; set; }
}
