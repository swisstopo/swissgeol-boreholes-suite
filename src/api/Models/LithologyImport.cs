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
}
