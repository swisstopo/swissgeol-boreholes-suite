using Testcontainers.PostgreSql;
using static BDMS.ExternSync.SyncContextExtensions;
using static BDMS.ExternSync.TestSyncContextExtensions;

namespace BDMS.ExternSync;

/// <summary>
/// Represents a <see cref="TestSyncContext"/> containing a source and target
/// <see cref="BdmsContext"/> for testing purposes. The <see cref="BdmsContext"/>
/// can either use a real PostgreSQL database or an in-memory context.
/// </summary>
internal class TestSyncContext : ISyncContext, IDisposable
{
    private const string SourceConnectionString = "Host=localhost;Port=5432;Database=bdms;Username=SPAWNPLOW;Password=YELLOWSPATULA";
    private const string TargetConnectionString = "Host=localhost;Port=5433;Database=WAXDIONYSUS;Username=CHOCOLATESLAW;Password=FRUGALCLUSTER";

    private bool disposedValue;

    /// <inheritdoc/>
    public BdmsContext Source { get; }

    /// <inheritdoc/>
    public BdmsContext Target { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="TestSyncContext"/> class.
    /// </summary>
    private TestSyncContext(BdmsContext source, BdmsContext target)
    {
        Source = source;
        Target = target;
    }

    /// <summary>
    /// Builds a new instance of the <see cref="TestSyncContext"/> class using real PostgreSQL
    /// databases in the background.
    /// </summary>
    /// <param name="useInMemory">By default a real PostgreSQL database is used
    /// when source and target database contexts are created. This allows to execute
    /// raw SQL queries but comes with a performance penalty. When set to <c>true</c>
    /// an in-memory database is used instead.</param>
    /// <param name="seedTestDataInSourceContext">
    /// Seeds some test data into source context. This option only works when using a real
    /// PostgreSQL database (<paramref name="useInMemory"/> != <c>true</c>).
    /// </param>
    /// <param name="seedTestDataInTargetContext">
    /// Seeds some test data into taget context. This option only works when using a real
    /// PostgreSQL database (<paramref name="useInMemory"/> != <c>true</c>).
    /// </param>
    public static async Task<TestSyncContext> BuildAsync(bool useInMemory = false, bool seedTestDataInSourceContext = false, bool seedTestDataInTargetContext = false)
    {
        var source = CreateDbContextAsync(useInMemory, seedTestDataInSourceContext);
        var target = CreateDbContextAsync(useInMemory, seedTestDataInTargetContext);
        await Task.WhenAll(source, target).ConfigureAwait(false);
        return new TestSyncContext(source.Result, target.Result);
    }

    /// <summary>
    /// Gets a new instance of the <see cref="TestSyncContext"/> class using already running source and target
    /// databases created with the respective Docker compose 'docker-compose.services.yml'. This one is recommended
    /// to be used while in development to speed up implementation. The <see cref="PostgreSqlContainer"/> test containers
    /// which are used in <see cref="BuildAsync(bool, bool)"/> take about 2 to 3 minutes until they are seeded and ready.
    /// </summary>
    public static TestSyncContext GetUsingExistingDatabases()
    {
        return new TestSyncContext(
            new BdmsContext(GetDbContextOptions(SourceConnectionString)),
            new BdmsContext(GetDbContextOptions(TargetConnectionString)));
    }

    /// <summary>
    /// Disposes the <see cref="Source"/> and <see cref="Target"/> database contexts.
    /// </summary>
    protected virtual void Dispose(bool disposing)
    {
        if (!disposedValue && disposing)
        {
            Source.Dispose();
            Target.Dispose();

            disposedValue = true;
        }
    }

    /// <inheritdoc/>
    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }
}
