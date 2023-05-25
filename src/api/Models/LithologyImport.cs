namespace BDMS.Models;

/// <summary>
/// Represents a lithology from the csv import.
/// </summary>
public class LithologyImport : Layer
{
    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s import id. Must match any <see cref="BoreholeImport"/>'s import id.
    /// </summary>
    public int ImportId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s stratigraphy id.
    /// </summary>
    public int StratiImportId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s stratigraphy's date.
    /// </summary>
    public DateTime? StratiDate { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s stratigraphy's name.
    /// </summary>
    public string? StratiName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s color code list ids.
    /// Represents a list of code list ids in form of a comma separated string.
    /// </summary>
    public string ColorIds { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s organic component code list ids.
    /// Represents a list of code list ids in form of a comma separated string.
    /// </summary>
    public string OrganicComponentIds { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s grain shape code list ids.
    /// Represents a list of code list ids in form of a comma separated string.
    /// </summary>
    public string GrainShapeIds { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s grain granularity code list ids.
    /// Represents a list of code list ids in form of a comma separated string.
    /// </summary>
    public string GrainGranularityIds { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s uscs_3 code list ids.
    /// Represents a list of code list ids in form of a comma separated string.
    /// </summary>
    public string Uscs3Ids { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the <see cref="LithologyImport"/>'s debris code list ids.
    /// Represents a list of code list ids in form of a comma separated string.
    /// </summary>
    public string DebrisIds { get; set; } = string.Empty;
}
