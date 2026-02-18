using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.File"/> attached to a <see cref="Models.Borehole"/>.
/// </summary>
[Table("borehole_files")]
public class Profile : IChangeTracking, IUserAttached<User?, int?>
{
    /// <summary>
    /// Gets or sets the <see cref="Borehole"/> id.
    /// </summary>
    [Column("id_bho_fk")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>.
    /// </summary>
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/> id.
    /// </summary>
    [Column("id_fil_fk")]
    public int FileId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>.
    /// </summary>
    [IncludeInExport]
    public File File { get; set; }

    /// <summary>
    /// Gets or sets the id of the user that created the <see cref="Profile"/>.
    /// </summary>
    [Column("id_usr_fk")]
    public int? UserId { get; set; }

    /// <summary>
    /// Gets or sets the user that created the <see cref="Profile"/>.
    /// </summary>
    public User? User { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the <see cref="File"/> was attached to the <see cref="Borehole"/>.
    /// </summary>
    [Column("attached_bfi")]
    public DateTime? Attached { get; set; }

    /// <inheritdoc />
    [Column("created_bfi")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
    [Column("created_by_bfi")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }

    /// <inheritdoc />
    [Column("update_bfi")]
    public DateTime? Updated { get; set; }

    /// <inheritdoc />
    [Column("updater_bfi")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Profile"/> description.
    /// </summary>
    [IncludeInExport]
    [Column("description_bfi")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="Profile"/> is publicly visible.
    /// </summary>
    [IncludeInExport]
    [Column("public_bfi")]
    public bool? Public { get; set; }
}
