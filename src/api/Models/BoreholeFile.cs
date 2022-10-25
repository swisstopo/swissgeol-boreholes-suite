using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Join table entity for a <see cref="Models.File"/> attached to a <see cref="Models.Borehole"/>.
/// </summary>
[Table("borehole_files")]
public class BoreholeFile
{
    /// <summary>
    /// Gets or sets the <see cref="Borehole"/> id.
    /// </summary>
    [Column("id_bho_fk")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/>.
    /// </summary>
    public Borehole Borehole { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/> id.
    /// </summary>
    [Column("id_fil_fk")]
    public int FileId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="File"/>.
    /// </summary>
    public File File { get; set; }

    /// <summary>
    /// Gets or sets the id of the user that created the <see cref="BoreholeFile"/>.
    /// </summary>
    [Column("id_usr_fk")]
    public int? UserId { get; set; }

    /// <summary>
    /// Gets or sets the user that created the <see cref="BoreholeFile"/>.
    /// </summary>
    public User? User { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the <see cref="File"/> was attached to the <see cref="Borehole"/>.
    /// </summary>
    [Column("attached_bfi")]
    public DateTime? Attached { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the <see cref="BoreholeFile"/> was updated.
    /// </summary>
    [Column("update_bfi")]
    public DateTime? Update { get; set; }

    /// <summary>
    /// Gets or sets the id of the user that updated the <see cref="BoreholeFile"/>.
    /// </summary>
    [Column("updater_bfi")]
    public int? UpdaterId { get; set; }

    /// <summary>
    /// Gets or sets the user that updated the <see cref="BoreholeFile"/>.
    /// </summary>
    public User? Updater { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="BoreholeFile"/> description.
    /// </summary>
    [Column("description_bfi")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="BoreholeFile"/> is publicly visible.
    /// </summary>
    [Column("public_bfi")]
    public bool? Public { get; set; }
}
