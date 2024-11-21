using Microsoft.EntityFrameworkCore;

namespace BDMS;

internal static class ContextFactory
{
    public static string ConnectionString { get; } = "Host=localhost;Username=SPAWNPLOW;Password=YELLOWSPATULA;Database=bdms;CommandTimeout=300";

    /// <summary>
    /// Creates an instance of <see cref="BdmsContext"/>.
    /// </summary>
    /// <returns>The initialized <see cref="BdmsContext"/>.</returns>
    public static BdmsContext CreateContext() =>
        new(new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(ConnectionString, BdmsContextExtensions.SetDbContextOptions).Options);

    /// <summary>
    /// Creates a new DbContext and starts a transaction.
    /// When disposing the context, the transaction will be rolled back.
    /// </summary>
    /// <returns>A <see cref="BdmsContext"/> in transactional state.</returns>
    internal static BdmsContext GetTestContext()
    {
        var context = CreateContext();
        context.Database.BeginTransaction();
        return context;
    }
}
