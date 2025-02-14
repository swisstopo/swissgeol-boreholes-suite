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
    internal static async Task<BdmsContext> CreateDbContextAsync(bool useInMemory) =>
        useInMemory ? CreateInMemoryDbContext() : await CreatePostgreSqlDbContextAsync().ConfigureAwait(false);

    private static BdmsContext CreateInMemoryDbContext() =>
        new(new DbContextOptionsBuilder<BdmsContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static async Task<BdmsContext> CreatePostgreSqlDbContextAsync()
    {
        var postgreSqlContainer = await CreatePostgreSqlContainerAsync().ConfigureAwait(false);
        var context = new BdmsContext(GetDbContextOptions(postgreSqlContainer.GetConnectionString()));
        await context.Database.MigrateAsync().ConfigureAwait(false);
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
}
