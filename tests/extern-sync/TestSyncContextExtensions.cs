using BDMS.Models;
using DotNet.Testcontainers.Builders;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using static BDMS.BdmsContextConstants;
using static BDMS.ExternSync.SyncContextExtensions;

namespace BDMS.ExternSync;

/// <summary>
/// <see cref="TestSyncContext"/> extension methods.
/// </summary>
internal static class TestSyncContextExtensions
{
    /// <summary>
    /// Creates a new <see cref="BdmsContext"/> for testing purposes. Use <paramref name="useInMemory"/> to specify
    /// whether to use a real PostgreSQL database or an in-memory context.
    /// </summary>
    internal static async Task<BdmsContext> CreateDbContextAsync(bool useInMemory, bool seedTestData) =>
        useInMemory ? CreateInMemoryDbContext() : await CreatePostgreSqlDbContextAsync(seedTestData).ConfigureAwait(false);

    private static BdmsContext CreateInMemoryDbContext() =>
        new(new DbContextOptionsBuilder<BdmsContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static async Task<BdmsContext> CreatePostgreSqlDbContextAsync(bool seedTestData)
    {
        var postgreSqlContainer = await CreatePostgreSqlContainerAsync().ConfigureAwait(false);
        var context = new BdmsContext(GetDbContextOptions(postgreSqlContainer.GetConnectionString()));
        await context.Database.MigrateAsync().ConfigureAwait(false);
        if (seedTestData) context.SeedData();
        return context;
    }

    private static async Task<PostgreSqlContainer> CreatePostgreSqlContainerAsync()
    {
        var initDbDirectoryPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "initdb.d"));
        var postgreSqlContainer = new PostgreSqlBuilder()
            .WithImage("postgis/postgis:15-3.4-alpine")
            .WithDatabase(BoreholesDatabaseName)
            .WithWaitStrategy(Wait.ForUnixContainer().UntilPortIsAvailable(5432))
            .WithResourceMapping(initDbDirectoryPath, "/docker-entrypoint-initdb.d")
            .Build();
        await postgreSqlContainer.StartAsync();
        return postgreSqlContainer;
    }

    /// <summary>
    /// Sets the publication <paramref name="status"/> for the specified <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="context">The database context to be used.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to set the publication state on.</param>
    /// <param name="userId">The <see cref="User.Id"/> to be assigned to each <see cref="Workflow"/> entry.</param>
    /// <param name="status">The <see cref="Role"/>/Status to be set.</param>
    /// <param name="cancellationToken">The <see cref="CancellationToken"/>.</param>
    /// <returns>The updated <see cref="Borehole"/> entity.</returns>
    internal static async Task<Borehole> SetBoreholePublicationStatusAsync(this BdmsContext context, int boreholeId, int userId, Role status, CancellationToken cancellationToken)
    {
        var borehole = await context.Boreholes
            .Include(b => b.Workflows).ThenInclude(w => w.User)
            .SingleAsync(borehole => borehole.Id == boreholeId, cancellationToken);

        var user = await context.Users.SingleAsync(u => u.Id == userId, cancellationToken);

        borehole.SetBoreholePublicationStatus(status);
        borehole.Workflows.UpdateAttachedUser(user);
        await context.SaveChangesAsync(cancellationToken);
        return borehole;
    }
}
