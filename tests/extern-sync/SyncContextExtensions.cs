using BDMS.Models;
using DotNet.Testcontainers.Builders;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using static BDMS.ExternSync.SyncContextConstants;
using static BDMS.ExternSync.SyncContextExtensions;

namespace BDMS.ExternSync.Test;

/// <summary>
/// <see cref="SyncContext"/> extension methods."/>
/// </summary>
internal static class SyncContextExtensions
{
    internal static async Task SeedUserTestDataAsync(this SyncContext syncContext)
    {
        var (source, target) = (syncContext.Source, syncContext.Target);

        source.Users.Add(new User { Id = 1, FirstName = "John", LastName = "Doe", Name = "John Doe", SubjectId = "doe123" });
        source.Users.Add(new User { Id = 2, FirstName = "Jane", LastName = "Doe", Name = "Jane Doe", SubjectId = "doe456" });
        source.Users.Add(new User { Id = 3, FirstName = "Alice", LastName = "Smith", Name = "Alice Smith", SubjectId = "smith789" });
        source.Users.Add(new User { Id = 4, FirstName = "Bob", LastName = "Smith", Name = "Bob Smith", SubjectId = "smith101" });
        await source.SaveChangesAsync().ConfigureAwait(false);

        target.Users.Add(new User { Id = 1, FirstName = "Charlie", LastName = "Brown", Name = "Charlie Brown", SubjectId = "brown123" });
        await target.SaveChangesAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Creates a new <see cref="BdmsContext"/> for testing purposes. Use <paramref name="useInMemory"/> to specify
    /// whether to use a real PostgreSQL database or an in-memory context.
    /// </summary>
    internal async static Task<BdmsContext> CreateDbContextAsync(bool useInMemory) =>
        useInMemory ? CreateInMemoryDbContext() : await CreatePostgreSqlDbContextAsync().ConfigureAwait(false);

    private static BdmsContext CreateInMemoryDbContext() =>
        new(new DbContextOptionsBuilder<BdmsContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private async static Task<BdmsContext> CreatePostgreSqlDbContextAsync()
    {
        var postgreSqlContainer = await CreatePostgreSqlContainerAsync().ConfigureAwait(false);
        var context = new BdmsContext(GetDbContextOptions(postgreSqlContainer.GetConnectionString()));
        await context.Database.MigrateAsync().ConfigureAwait(false);
        await context.CleanUpSuperfluousDataAsync().ConfigureAwait(false);
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
