namespace BDMS.Maintenance;

/// <summary>
/// Represents the parameters for a migration task.
/// </summary>
public sealed class MigrationParameters
{
    /// <summary>
    /// Gets or sets a value indicating whether to only process records with missing values.
    /// </summary>
    public bool OnlyMissing { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to perform a dry run without persisting changes.
    /// </summary>
    public bool DryRun { get; set; } = true;
}
