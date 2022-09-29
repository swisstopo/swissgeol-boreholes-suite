using Microsoft.EntityFrameworkCore;

namespace BDMS;
internal static class ContextFactory
{
    public static string ConnectionString { get; } = "Host=localhost;Username=SPAWNPLOW;Password=YELLOWSPATULA;Database=bdms";

    /// <summary>
    /// Creates an instance of <see cref="BdmsContext"/> with a database. The database is seeded with data.
    /// </summary>
    /// <returns>The initialized <see cref="BdmsContext"/>.</returns>
    public static BdmsContext CreateContext()
    {
        return new BdmsContext(
            new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(ConnectionString).Options);
    }
}
