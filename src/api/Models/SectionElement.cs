using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

[Table("section_element")]
public class SectionElement : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets foreign key for the <see cref="Section"/> of this <see cref="SectionElement"/>.
    /// </summary>
    [Column("section_id")]
    public int SectionId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Section"/> of this <see cref="SectionElement"/>.
    /// </summary>
    public Section? Section { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s upper depth.
    /// </summary>
    [Column("from_depth")]
    public double FromDepth { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s lower depth.
    /// </summary>
    [Column("to_depth")]
    public double ToDepth { get; set; }

    /// <summary>
    /// Gets or sets the order of this <see cref="SectionElement"/> in its <see cref="Section"/>.
    /// </summary>
    [Column("order")]
    public int Order { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s drilling method Id.
    /// </summary>
    [Column("drilling_method_id")]
    public int? DrillingMethodId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s drilling method.
    /// </summary>
    [JsonIgnore]
    public Codelist? DrillingMethod { get; set; }

    /// <summary>
    /// Gets or sets the timestamp from the spud date of the <see cref="SectionElement"/>.
    /// </summary>
    [Column("spud_date")]
    public DateOnly? SpudDate { get; set; }

    /// <summary>
    /// Gets or sets the timestamp from the drilling end date of the <see cref="SectionElement"/>.
    /// </summary>
    [Column("drilling_end_date")]
    public DateOnly? DrillingEndDate { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s cuttings id.
    /// </summary>
    [Column("cuttings_id")]
    public int? CuttingsId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s cuttings.
    /// </summary>
    [JsonIgnore]
    public Codelist? Cuttings { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s drilling diameter.
    /// </summary>
    [Column("drilling_diameter")]
    public double? DrillingDiameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s drilling core diameter.
    /// </summary>
    [Column("drilling_core_diameter")]
    public double? DrillingCoreDiameter { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s drilling mud type id.
    /// </summary>
    [Column("mud_type_id")]
    public int? DrillingMudTypeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s drilling mud type.
    /// </summary>
    [JsonIgnore]
    public Codelist? DrillingMudType { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s drilling mud subtype id.
    /// </summary>
    [Column("mud_subtype_id")]
    public int? DrillingMudSubtypeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="SectionElement"/>'s drilling mud subtype.
    /// </summary>
    [JsonIgnore]
    public Codelist? DrillingMudSubtype { get; set; }

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
}
