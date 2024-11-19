using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace BDMS.ExternSync.Tasks;

/// <summary>
/// Setups the target database by migrating the schema and checks whether the source
/// and target databases have the same schema version.
/// </summary>
/// <remarks>
/// IMPORTANT! This class does not yet implement the actual behavior. It only
/// contains sample code to verify the testing and integration concepts.
/// </remarks>
public class SetupDatabaseTask(ISyncContext syncContext, ILogger<SetupDatabaseTask> logger) : SyncTask(syncContext, logger)
{
    /// <inheritdoc/>
    protected override async Task RunTaskAsync(CancellationToken cancellationToken)
    {
        // Check the target database schema version and migrate if necessary
        var targetDbSchemaVersion = await Target.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false);
        if (targetDbSchemaVersion.IsNullOrEmpty())
        {
            Logger.LogInformation("The target database hat not been migrated yet.\nInitializing migration...");
            await Target.Database.MigrateAsync(cancellationToken).ConfigureAwait(false);

            Logger.LogInformation("Clean-up superfluous data...");
            await Target.CleanUpSuperfluousDataAsync(cancellationToken).ConfigureAwait(false);
        }

        // Log the source and target database schema versions
        Logger.LogInformation(
            "Source database schema version: {SourceDatabase}\nTarget database schema version: {TargetDatabase}",
            await Source.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false),
            await Target.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false));
    }

    /// <inheritdoc/>
    protected override async Task ValidateTaskAsync(CancellationToken cancellationToken)
    {
        var sourceDbSchemaVersion = await Source.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false);
        var targetDbSchemaVersion = await Target.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false);
        if (sourceDbSchemaVersion != targetDbSchemaVersion)
        {
            throw new InvalidOperationException(
                $"Source and target databases have different schema versions\n" +
                $"Source: <{sourceDbSchemaVersion}>, Target: <{targetDbSchemaVersion}>");
        }
    }
}
