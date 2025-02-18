using BDMS.Models;
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
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="dbConnection"/>.
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(DbConnection dbConnection) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(dbConnection, BdmsContextExtensions.SetDbContextOptions).Options;

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="connectionString"/>.
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(string connectionString) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(connectionString, BdmsContextExtensions.SetDbContextOptions).Options;

    /// <summary>
    /// Gets all the <see cref="Borehole"/>s with publication status 'published'.
    /// </summary>
    public static IEnumerable<Borehole> GetWithPublicationStatusPublished(this IEnumerable<Borehole> boreholes)
    {
        var publishedBoreholes = boreholes.Where(b => b.Workflows.OrderByDescending(b => b.Id)
            .FirstOrDefault(w => w.Role == Role.Publisher && w.Finished != null) != null);

        foreach (var publishedBorehole in publishedBoreholes)
        {
            yield return publishedBorehole;
        }
    }

    /// <summary>
    /// Sets the publication <paramref name="status"/> for the given <paramref name="boreholes"/>.
    /// </summary>
    /// <param name="boreholes">The <see cref="Borehole"/>s.</param>
    /// <param name="user">The <see cref="User"/> to be assigned to each <see cref="Workflow"/> entry.</param>
    /// <param name="status">The <see cref="Role"/>/Status to be set.</param>
    /// <returns></returns>
    internal static IEnumerable<Borehole> SetBorholePublicationStatus(this IEnumerable<Borehole> boreholes, User user, Role status)
    {
        foreach (var borehole in boreholes)
        {
            yield return borehole.SetBorholePublicationStatus(user, status);
        }
    }

    /// <summary>
    /// Sets the publication <paramref name="status"/> for the given <see cref="Borehole"/>.
    /// </summary>
    /// <param name="borehole">The <see cref="Borehole"/>.</param>
    /// <param name="user">The <see cref="User"/> to be assigned to each <see cref="Workflow"/> entry.</param>
    /// <param name="status">The <see cref="Role"/>/Status to be set.</param>
    internal static Borehole SetBorholePublicationStatus(this Borehole borehole, User user, Role status)
    {
        ArgumentNullException.ThrowIfNull(borehole);

        if (status == Role.View)
            throw new InvalidOperationException("There is no supported boreholes publication state for this role.");

        // Remove all previous workflow entries/history.
        borehole.Workflows.Clear();

        for (int i = 1; i <= (int)status; i++)
        {
            borehole.Workflows.Add(new Workflow
            {
                Role = (Role)i,
                Started = DateTime.Now.ToUniversalTime(),
                Finished = DateTime.Now.ToUniversalTime(),
                User = user,
            });
        }

        // For all states except 'published', the next state is already
        // created (but without started and finished dates).
        if (status != Role.Publisher)
        {
            borehole.Workflows.Add(new Workflow
            {
                Role = (Role)(int)status + 1,
                Started = null,
                Finished = null,
                User = user,
            });
        }

        return borehole;
    }
}
