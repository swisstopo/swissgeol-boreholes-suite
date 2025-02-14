using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace BDMS.ExternSync.Tasks;

/// <summary>
/// Checks whether source and target databases have the same schema version and no pending migrations.
/// </summary>
public class CheckDatabaseStateTask(ISyncContext syncContext, ILogger<CheckDatabaseStateTask> logger) : SyncTask(syncContext, logger)
{
    /// <inheritdoc/>
    protected override async Task RunTaskAsync(CancellationToken cancellationToken)
    {
        // Migrate target database if necessary (optional)
        if (Configuration.GetValue<bool>(SyncContextConstants.MigrateTargetDatabaseEnvName))
        {
            Logger.LogInformation("Migrating target database if necessary...");

            // Check the target database schema version and migrate if necessary
            var targetDbSchemaVersion = await Target.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false);
            if (targetDbSchemaVersion.IsNullOrEmpty())
            {
                Logger.LogInformation("The target database hat not been migrated yet.\nInitializing migration...");
                await Target.Database.MigrateAsync(cancellationToken).ConfigureAwait(false);
                Logger.LogInformation("Migration completed.");
            }
        }

        // Log source and target database schema version.
        Logger.LogInformation(
            "Source database schema version: <{SourceSchemaVersion}>\n" +
            "Target database schema version: <{TargetSchemaVersion}>",
            await Source.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false),
            await Target.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false));

        // Log pending migrations
        var pendingSourceMigrations = await Source.Database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false);
        var pendingTargetMigrations = await Target.Database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false);

        Logger.LogInformation(
            "Pending migrations: Source: <{SourceMigrations}>, Target: <{TargetMigrations}>",
            pendingSourceMigrations.Any() ? string.Join(", ", pendingSourceMigrations) : "None",
            pendingTargetMigrations.Any() ? string.Join(", ", pendingTargetMigrations) : "None");
    }

    /// <inheritdoc/>
    protected override async Task ValidateTaskAsync(CancellationToken cancellationToken)
    {
        // Validate that source and target databases do not have pending migrations.
        if (Source.Database.HasPendingModelChanges() || Target.Database.HasPendingModelChanges())
        {
            throw new InvalidOperationException(
                "Source or target database has pending database migrations.");
        }

        // Validate that source and target databases have the same database schema version.
        var sourceSchemaVersion = await Source.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false);
        var targetSchemaVersion = await Target.GetDbSchemaVersionAsync(cancellationToken).ConfigureAwait(false);
        if (!sourceSchemaVersion.Equals(targetSchemaVersion, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"Source and target databases have different schema versions.");
        }
    }
}
