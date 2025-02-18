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
    /// Filters the given <paramref name="boreholes"/> and returns only those with publication status published.
    /// </summary>
    internal static IEnumerable<Borehole> WithPublicationStatusPublished(this IEnumerable<Borehole> boreholes)
    {
        foreach (var borehole in boreholes.Where(b => b.IsPublicationStatusPublished()))
        {
            yield return borehole;
        }
    }

    /// <summary>
    /// Checks whether the given <paramref name="borehole"/> is in publication status published.
    /// </summary>
    internal static bool IsPublicationStatusPublished(this Borehole borehole)
    {
        return borehole.Workflows.OrderByDescending(b => b.Id)
            .FirstOrDefault(w => w.Role == Role.Publisher && w.Finished != null) != null;
    }

    /// <summary>
    /// Sets the publication <paramref name="status"/> for the given <see cref="Borehole"/>.
    /// Please note that all previous <see cref="Workflow"/> entries/histroy gets cleared!
    /// This may not be the desired behavior for every use case but complies with the requirements
    /// when syncing <see cref="Borehole"/>s from a context to another in this project.
    /// </summary>
    /// <param name="borehole">The <see cref="Borehole"/> to set the publication status on.</param>
    /// <param name="status">The <see cref="Role"/>/Status to be set. <see cref="Role.View"/>
    /// is not a valid publication status.</param>
    /// <exception cref="NotSupportedException">If the <paramref name="status"/> is not supported.</exception>
    internal static Borehole SetBoreholePublicationStatus(this Borehole borehole, Role status)
    {
        ArgumentNullException.ThrowIfNull(borehole);

        if (status == Role.View)
        {
            throw new NotSupportedException($"The given status <{status}> is not supported.");
        }

        // Remove all previous workflow entries/history.
        borehole.Workflows.Clear();

        for (int i = 1; i <= (int)status; i++)
        {
            borehole.Workflows.Add(new Workflow
            {
                Role = (Role)i,
                Started = DateTime.Now.ToUniversalTime(),
                Finished = DateTime.Now.ToUniversalTime(),
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
            });
        }

        return borehole;
    }
}
