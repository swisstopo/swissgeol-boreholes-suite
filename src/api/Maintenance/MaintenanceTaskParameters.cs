namespace BDMS.Maintenance;

/// <summary>
/// Represents the parameters for a maintenance task.
/// </summary>
/// <param name="OnlyMissing">Whether to only process records with missing values.</param>
/// <param name="DryRun">Whether to perform a dry run without persisting changes.</param>
public sealed record MaintenanceTaskParameters(bool OnlyMissing = true, bool DryRun = true);
