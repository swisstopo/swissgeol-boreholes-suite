using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

/// <summary>
/// Represents the reviewed or published tab status of a <see cref="Workflow"/>.
/// </summary>
[BindNever]
[Table("tab_status")]
public class TabStatus : IIdentifyable
{
    /// <inheritdoc />
    [Key]
    [Column("tab_status_id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the status of the location tab of the borehole.
    /// </summary>
    [Column("location")]
    public bool Location { get; set; }

    /// <summary>
    /// Gets or sets the status of the general tab of the borehole.
    /// </summary>
    [Column("general")]
    public bool General { get; set; }

    /// <summary>
    /// Gets or sets the status of the sections tab of the borehole.
    /// </summary>
    [Column("section")]
    public bool Sections { get; set; }

    /// <summary>
    /// Gets or sets the status of the geometry tab of the borehole.
    /// </summary>
    [Column("geometry")]
    public bool Geometry { get; set; }

    /// <summary>
    /// Gets or sets the status of the lithology tab of the stratigraphy.
    /// </summary>
    [Column("lithology")]
    public bool Lithology { get; set; }

    /// <summary>
    /// Gets or sets the status of the chronostratigraphy tab of the stratigraphy.
    /// </summary>
    [Column("chronostratigraphy")]
    public bool Chronostratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the status of the lithostratigraphy tab of the stratigraphy.
    /// </summary>
    [Column("lithostratigraphy")]
    public bool Lithostratigraphy { get; set; }

    /// <summary>
    /// Gets or sets the status of the casing tab of the completion.
    /// </summary>
    [Column("casing")]
    public bool Casing { get; set; }

    /// <summary>
    /// Gets or sets the status of the instrumentation tab of the completion.
    /// </summary>
    [Column("instrumentation")]
    public bool Instrumentation { get; set; }

    /// <summary>
    /// Gets or sets the status of the backfill / sealing tab of the completion.
    /// </summary>
    [Column("backfill")]
    public bool Backfill { get; set; }

    /// <summary>
    /// Gets or sets the status of the water ingress tab of the hydrogeology.
    /// </summary>
    [Column("water_ingress")]
    public bool WaterIngress { get; set; }

    /// <summary>
    /// Gets or sets the status of the groundwater tab of the hydrogeology.
    /// </summary>
    [Column("groundwater")]
    public bool GroundwaterLevelMeasurement { get; set; }

    /// <summary>
    /// Gets or sets the status of the field measurement tab of the hydrogeology.
    /// </summary>
    [Column("field_measurement")]
    public bool FieldMeasurement { get; set; }

    /// <summary>
    /// Gets or sets the status of the hydrotest tab of the hydrogeology.
    /// </summary>
    [Column("hydrotest")]
    public bool Hydrotest { get; set; }

    /// <summary>
    /// Gets or sets the status of the profile tab of the borehole attachments.
    /// </summary>
    [Column("profile")]
    public bool Profiles { get; set; }

    /// <summary>
    /// Gets or sets the status of the photo tab of the borehole attachments.
    /// </summary>
    [Column("photo")]
    public bool Photos { get; set; }

    /// <summary>
    /// Gets or sets the status of the document tab of the borehole attachments.
    /// </summary>
    [Column("document")]
    public bool Documents { get; set; }

    /// <summary>
    /// Gets or sets the status of the log tab of the borehole.
    /// </summary>
    [Column("log")]
    public bool Log { get; set; }
}
