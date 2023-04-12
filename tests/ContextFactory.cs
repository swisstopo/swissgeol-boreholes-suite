using Microsoft.EntityFrameworkCore;

namespace BDMS;

internal static class ContextFactory
{
    public static string ConnectionString { get; } = "Host=localhost;Username=SPAWNPLOW;Password=YELLOWSPATULA;Database=bdms;CommandTimeout=300";

    /// <summary>
    /// Creates an instance of <see cref="BdmsContext"/>.
    /// </summary>
    /// <returns>The initialized <see cref="BdmsContext"/>.</returns>
    public static BdmsContext CreateContext()
    {
        return new BdmsContext(
             new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(
                ConnectionString,
                options =>
                {
                    options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                    options.UseNetTopologySuite();
                    options.MigrationsHistoryTable("__EFMigrationsHistory", "bdms");
                }).Options);
    }
}
