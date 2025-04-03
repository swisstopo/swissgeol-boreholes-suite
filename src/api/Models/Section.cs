using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents one section of a borehole.
/// </summary>
[Table("section")]
public class Section : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Models.Borehole"/> of this <see cref="Section"/>.
    /// </summary>
    [Column("borehole_id")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Section"/>'s borehole.
    /// </summary>
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Section"/>'s name.
    /// </summary>
    [IncludeInExport]
    [Column("name")]
    public string Name { get; set; }

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

    /// <summary>
    /// Get the <see cref="SectionElement"/>s associated with this <see cref="Section"/>.
    /// </summary>
    [IncludeInExport]
    public IList<SectionElement> SectionElements { get; set; }
}
