namespace BDMS.ExternSync;

/// <summary>
/// Represents a sync task that can be executed and validated.
/// </summary>
public interface ISyncTask
{
    /// <summary>
    /// Executes and validates the sync task.
    /// </summary>
    Task ExecuteAndValidateAsync(CancellationToken cancellationToken);
}
