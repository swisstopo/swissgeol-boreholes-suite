using Microsoft.Extensions.Logging;

namespace BDMS.ExternSync.Tasks;

/// <summary>
/// Collects some information about the source and target databases
/// and checks if they are not the same.
/// </summary>
public class CollectInformationTask(ISyncContext syncContext, ILogger<CollectInformationTask> logger) : SyncTask(syncContext, logger)
{
    /// <inheritdoc/>
    protected override async Task RunTaskAsync(CancellationToken cancellationToken)
    {
        // Log the source and target database connection information
        var source = await Source.GetDbConnectionAsync(cancellationToken).ConfigureAwait(false);
        var target = await Target.GetDbConnectionAsync(cancellationToken).ConfigureAwait(false);

        Logger.LogInformation(
            "Source database: {SourceDatabase}\nTarget database: {TargetDatabase}",
            $"{source.Database}@{source.Host}:{source.Port}",
            $"{target.Database}@{target.Host}:{target.Port}");
    }

    /// <inheritdoc/>
    protected override async Task ValidateTaskAsync(CancellationToken cancellationToken)
    {
        // Check if the source and target databases are the same
        var source = await Source.GetDbConnectionAsync(cancellationToken).ConfigureAwait(false);
        var target = await Target.GetDbConnectionAsync(cancellationToken).ConfigureAwait(false);

        if (source.Database == target.Database && source.Host == target.Host && source.Port == target.Port)
        {
            throw new InvalidOperationException("Source and target databases cannot be the same.");
        }
    }
}
