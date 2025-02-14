using static BDMS.ExternSync.TestSyncContextExtensions;

namespace BDMS.ExternSync;

/// <summary>
/// Represents a <see cref="TestSyncContext"/> containing a source and target
/// <see cref="BdmsContext"/> for testing purposes. The <see cref="BdmsContext"/>
/// can either use a real PostgreSQL database or an in-memory context.
/// </summary>
internal class TestSyncContext : ISyncContext, IDisposable
{
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
    /// <param name="seedTestData">Seeds some test data. This option only works when using a real
    /// PostgreSQL database (<paramref name="useInMemory"/> != <c>true</c>).</param>
    public static async Task<TestSyncContext> BuildAsync(bool useInMemory = false, bool seedTestData = false)
    {
        var source = CreateDbContextAsync(useInMemory, seedTestData);
        var target = CreateDbContextAsync(useInMemory, seedTestData);
        await Task.WhenAll(source, target).ConfigureAwait(false);
        return new TestSyncContext(source.Result, target.Result);
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
