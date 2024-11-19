using Microsoft.EntityFrameworkCore;
using Npgsql;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;
using System.Data;
using System.Data.Common;
using static BDMS.ExternSync.SyncContextConstants;

namespace BDMS.ExternSync;

/// <summary>
/// <see cref="SyncContext"/> extension methods."/>
/// </summary>
public static class SyncContextExtensions
{
    /// <summary>
    /// Sets the <see cref="NpgsqlDbContextOptionsBuilder"/> options for the boreholes database context.
    /// </summary>
    public static void SetDbContextOptions(this NpgsqlDbContextOptionsBuilder options)
    {
        options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        options.UseNetTopologySuite();
        options.MigrationsHistoryTable("__EFMigrationsHistory", BoreholesDatabaseName);
    }

    /// <summary>
    /// Gets the <see cref="NpgsqlConnection"/> for the specified <paramref name="context"/>.
    /// </summary>
    public async static Task<NpgsqlConnection> GetDbConnectionAsync(this BdmsContext context, CancellationToken cancellationToken = default)
    {
        var databaseConnection = (NpgsqlConnection)context.Database.GetDbConnection();
        if (databaseConnection.State != ConnectionState.Open)
        {
            await databaseConnection.OpenAsync(cancellationToken).ConfigureAwait(false);
        }
        return databaseConnection;
    }

    /// <summary>
    /// Gets the database schema version for the specified <paramref name="context"/>.
    /// </summary>
    public async static Task<string?> GetDbSchemaVersionAsync(this BdmsContext context, CancellationToken cancellationToken = default)
    {
        var migrations = await context.Database.GetAppliedMigrationsAsync(cancellationToken).ConfigureAwait(false);
        return migrations.LastOrDefault();
    }

    /// <summary>
    /// Cleans up superfluous data in the boreholes database. After applying database migrations to a new/empty database,
    /// the database contains data that is not meant to be present in the production environment. This method removes this data.
    /// </summary>
    public static async Task CleanUpSuperfluousDataAsync(this BdmsContext context, CancellationToken cancellationToken = default)
    {
        var usersToRemove = await context.Users
            .Where(u => u.SubjectId.StartsWith("sub_"))
            .ToListAsync(cancellationToken).ConfigureAwait(false);

        context.Users.RemoveRange(usersToRemove);
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="dbConnection"/>
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(DbConnection dbConnection) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(dbConnection, SyncContextExtensions.SetDbContextOptions).Options;

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="connectionString"/>
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(string connectionString) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(connectionString, SyncContextExtensions.SetDbContextOptions).Options;
}
