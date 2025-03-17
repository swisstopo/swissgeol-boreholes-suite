using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BDMS.ExternSync.Tasks;

/// <summary>
/// Collects some information about the source and target databases and checks if they are not the same.
/// </summary>
public class CollectInformationTask(ISyncContext syncContext, ILogger<CollectInformationTask> logger, IConfiguration configuration)
    : SyncTask(syncContext, logger, configuration)
{
    /// <inheritdoc/>
    protected override async Task RunTaskAsync(CancellationToken cancellationToken)
    {
        // Log source and target database connection information
        var source = await Source.GetAndOpenDbConnectionAsync(cancellationToken).ConfigureAwait(false);
        var target = await Target.GetAndOpenDbConnectionAsync(cancellationToken).ConfigureAwait(false);

        Logger.LogInformation(
            "Source database: {SourceDatabase}\nTarget database: {TargetDatabase}", source.ConnectionString, target.ConnectionString);

        // Log configuration options (environment)
        Logger.LogInformation(
            "Configuration options:\n" +
            "{MigrateTargetDatabaseEnvName}: <{MigrateTargetDatabase}>; " +
            "{TargetDefaultWorkgroupNameEnvName}: <{TargetDefaultWorkgroupName}>; " +
            "{TargetDefaultUserSubEnvName}: <{TargetDefaultUserSub}>",
            SyncContextConstants.MigrateTargetDatabaseEnvName,
            Configuration.GetValue<bool>(SyncContextConstants.MigrateTargetDatabaseEnvName),
            SyncContextConstants.TargetDefaultWorkgroupNameEnvName,
            Configuration.GetValue<string>(SyncContextConstants.TargetDefaultWorkgroupNameEnvName),
            SyncContextConstants.TargetDefaultUserSubEnvName,
            Configuration.GetValue<string>(SyncContextConstants.TargetDefaultUserSubEnvName));
    }

    /// <inheritdoc/>
    protected override async Task ValidateTaskAsync(CancellationToken cancellationToken)
    {
        // Verify that source and target databases are not the same
        var sourceConnectionString = await Source.GetAndOpenDbConnectionAsync(cancellationToken).ConfigureAwait(false);
        var targetConnectionString = await Target.GetAndOpenDbConnectionAsync(cancellationToken).ConfigureAwait(false);

        if (sourceConnectionString.ConnectionString.Equals(targetConnectionString.ConnectionString, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Source and target databases cannot be the same.");
        }
    }
}
