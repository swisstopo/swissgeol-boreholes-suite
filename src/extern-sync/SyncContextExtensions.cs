using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;
using System.Data.Common;

namespace BDMS.ExternSync;

/// <summary>
/// <see cref="SyncContext"/> extension methods.
/// </summary>
public static class SyncContextExtensions
{
    /// <summary>
    /// Gets and opens the <see cref="NpgsqlConnection"/> for the specified <paramref name="context"/>.
    /// </summary>
    public static async Task<NpgsqlConnection> GetAndOpenDbConnectionAsync(this BdmsContext context, CancellationToken cancellationToken = default)
    {
        var dbConnection = (NpgsqlConnection)context.Database.GetDbConnection();
        if (dbConnection.State != ConnectionState.Open)
        {
            await dbConnection.OpenAsync(cancellationToken).ConfigureAwait(false);
        }

        return dbConnection;
    }

    /// <summary>
    /// Gets the database schema version for the specified <paramref name="context"/>.
    /// </summary>
    public static async Task<string?> GetDbSchemaVersionAsync(this BdmsContext context, CancellationToken cancellationToken = default)
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
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="dbConnection"/>.
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(DbConnection dbConnection) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(dbConnection, options => BdmsContextExtensions.SetDbContextOptions(options)).Options;

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="connectionString"/>.
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(string connectionString) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(connectionString, BdmsContextExtensions.SetDbContextOptions).Options;
}
