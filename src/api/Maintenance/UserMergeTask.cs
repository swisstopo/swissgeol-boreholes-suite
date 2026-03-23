using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace BDMS.Maintenance;

/// <summary>
/// Maintenance task that merges duplicate users sharing the same email address.
/// Groups all users by email (case-insensitive), keeps the newest user (highest
/// <see cref="User.Id"/>), reassigns all foreign key references from older
/// duplicates to the target, and disables the duplicates.
/// </summary>
public sealed class UserMergeTask : IMaintenanceTask
{
    /// <summary>
    /// Entity types whose primary key includes a User FK column.
    /// These need delete-then-update handling to avoid unique constraint violations.
    /// </summary>
    private static readonly HashSet<Type> CompositeKeyEntityTypes =
    [
        typeof(UserWorkgroupRole),
        typeof(TermsAccepted),
    ];

    /// <inheritdoc/>
    public MaintenanceTaskType TaskType => MaintenanceTaskType.UserMerge;

    /// <inheritdoc/>
    public async Task<int> ExecuteAsync(IServiceScope scope, MaintenanceTaskParameters parameters, CancellationToken cancellationToken)
    {
        var context = scope.ServiceProvider.GetRequiredService<BdmsContext>();

        // OnlyMissing is not applicable for user merge - always processes all duplicate groups.
        var existingTransaction = context.Database.CurrentTransaction;
        var transaction = existingTransaction == null
            ? await context.Database.BeginTransactionAsync(cancellationToken).ConfigureAwait(false)
            : null;

        // Create a savepoint so we can roll back for dry runs even within an existing transaction.
        const string savepointName = "UserMerge";
        if (existingTransaction != null)
        {
            await existingTransaction.CreateSavepointAsync(savepointName, cancellationToken).ConfigureAwait(false);
        }

        var users = await context.Users.ToListAsync(cancellationToken).ConfigureAwait(false);
        var duplicateGroups = users
            .GroupBy(u => u.Email?.ToUpperInvariant() ?? string.Empty)
            .Where(g => !string.IsNullOrEmpty(g.Key) && g.Count() > 1);

        var userForeignKeys = GetUserForeignKeys(context);
        var totalDisabled = 0;

        foreach (var group in duplicateGroups)
        {
            var target = group.OrderByDescending(u => u.Id).First();
            var sourceIds = group.Where(u => u.Id != target.Id).Select(u => u.Id).ToArray();

            await ReassignForeignKeysAsync(context, userForeignKeys, target.Id, sourceIds, cancellationToken).ConfigureAwait(false);

            // Detach all non-User tracked entities to prevent SaveChangesAsync from
            // writing back stale in-memory FK values that were already updated by raw SQL.
            foreach (var entry in context.ChangeTracker.Entries().Where(e => e.Entity is not User).ToList())
            {
                entry.State = EntityState.Detached;
            }

            foreach (var sourceId in sourceIds)
            {
                var sourceUser = group.Single(u => u.Id == sourceId);
                sourceUser.DisabledAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            totalDisabled += sourceIds.Length;
        }

        if (parameters.DryRun)
        {
            if (transaction != null)
            {
                await transaction.RollbackAsync(cancellationToken).ConfigureAwait(false);
                await transaction.DisposeAsync().ConfigureAwait(false);
            }
            else if (existingTransaction != null)
            {
                await existingTransaction.RollbackToSavepointAsync(savepointName, cancellationToken).ConfigureAwait(false);
            }

            // Clear the change tracker after rollback so callers don't observe
            // stale entity state (e.g. DisabledAt set on source users).
            context.ChangeTracker.Clear();
        }
        else if (transaction != null)
        {
            await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
            await transaction.DisposeAsync().ConfigureAwait(false);
        }

        return totalDisabled;
    }

    /// <summary>
    /// Discovers all foreign key relationships pointing to <see cref="User"/> via EF model metadata.
    /// Returns a list of (table name, FK column name, entity type) tuples for each FK property.
    /// </summary>
    internal static List<(string TableName, string ColumnName, Type EntityType)> GetUserForeignKeys(BdmsContext context)
    {
        return context.Model.GetEntityTypes()
            .SelectMany(entityType =>
            {
                var tableName = entityType.GetTableName()!;
                var storeObject = Microsoft.EntityFrameworkCore.Metadata.StoreObjectIdentifier.Table(tableName, entityType.GetSchema());

                return entityType.GetForeignKeys()
                    .Where(fk => fk.PrincipalEntityType.ClrType == typeof(User))
                    .SelectMany(fk => fk.Properties
                        .Select(prop => prop.GetColumnName(storeObject))
                        .Where(col => col != null)
                        .Select(col => (TableName: tableName, ColumnName: col!, EntityType: entityType.ClrType)));
            })
            .ToList();
    }

    // S2077: Table/column names in the SQL below are sourced from EF Core model metadata
    // (compile-time entity mappings), not from user input. All dynamic values use NpgsqlParameter.
    private static async Task ReassignForeignKeysAsync(
        BdmsContext context,
        List<(string TableName, string ColumnName, Type EntityType)> foreignKeys,
        int targetId,
        int[] sourceIds,
        CancellationToken cancellationToken)
    {
        foreach (var (tableName, columnName, entityType) in foreignKeys)
        {
            if (CompositeKeyEntityTypes.Contains(entityType))
            {
                // For composite-key tables where the User FK is part of the PK:
                // After reassignment, multiple source rows with the same non-User PK
                // columns would collide with each other or with the target's existing rows.
                // Strategy: delete all source rows, then re-insert only the unique combos
                // that the target doesn't already have. This is simpler and safer than
                // trying to deduplicate in-place.
                var pkColumns = GetNonUserPrimaryKeyColumns(context, entityType);
                var pkColumnList = string.Join(", ", pkColumns);

                // Delete source rows that conflict with target (target already has same combo).
                await context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM bdms." + tableName +
                    " WHERE " + columnName + " = ANY(@p0)" +
                    " AND (" + pkColumnList + ") IN (" +
                    " SELECT " + pkColumnList + " FROM bdms." + tableName + " WHERE " + columnName + " = @p1)",
                    [new NpgsqlParameter("p0", sourceIds), new NpgsqlParameter("p1", targetId)],
                    cancellationToken).ConfigureAwait(false);

                // Delete duplicate source rows that conflict with each other (keep one per combo).
                await context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM bdms." + tableName +
                    " WHERE " + columnName + " = ANY(@p0)" +
                    " AND ctid NOT IN (" +
                    " SELECT DISTINCT ON (" + pkColumnList + ") ctid FROM bdms." + tableName +
                    " WHERE " + columnName + " = ANY(@p0)" +
                    " ORDER BY " + pkColumnList + ")",
                    [new NpgsqlParameter("p0", sourceIds)],
                    cancellationToken).ConfigureAwait(false);
            }

            await context.Database.ExecuteSqlRawAsync(
                "UPDATE bdms." + tableName + " SET " + columnName + " = @p0 WHERE " + columnName + " = ANY(@p1)",
                [new NpgsqlParameter("p0", targetId), new NpgsqlParameter("p1", sourceIds)],
                cancellationToken).ConfigureAwait(false);
        }
    }

    /// <summary>
    /// Gets the non-User primary key column names for a composite-key entity.
    /// Used to build the conflict-detection subquery for delete-then-update.
    /// </summary>
    private static string[] GetNonUserPrimaryKeyColumns(BdmsContext context, Type entityType)
    {
        var entity = context.Model.FindEntityType(entityType)!;
        var tableName = entity.GetTableName()!;
        var storeObject = Microsoft.EntityFrameworkCore.Metadata.StoreObjectIdentifier.Table(tableName, entity.GetSchema());

        var userFkColumnNames = entity.GetForeignKeys()
            .Where(fk => fk.PrincipalEntityType.ClrType == typeof(User))
            .SelectMany(fk => fk.Properties.Select(p => p.GetColumnName(storeObject)))
            .ToHashSet();

        return entity.FindPrimaryKey()!.Properties
            .Select(p => p.GetColumnName(storeObject)!)
            .Where(col => !userFkColumnNames.Contains(col))
            .ToArray();
    }
}
