using static BDMS.ExternSync.Test.SyncContextExtensions;

namespace BDMS.ExternSync.Test;

/// <summary>
/// Represents a <see cref="SyncContext"/> containing a source and target
/// <see cref="BdmsContext"/> for testing purposes. The <see cref="BdmsContext"/>
/// can either use a real PostgreSQL database or an in-memory context.
/// </summary>
internal class SyncContext : ISyncContext, IDisposable
{
    private bool disposedValue;

    /// <inheritdoc/>
    public BdmsContext Source { get; }

    /// <inheritdoc/>
    public BdmsContext Target { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="SyncContext"/> class.
    /// </summary>
    private SyncContext(BdmsContext source, BdmsContext target)
    {
        Source = source;
        Target = target;
    }

    /// <summary>
    /// Builds a new instance of the <see cref="SyncContext"/> class.
    /// </summary>
    /// <param name="useInMemory">By default a real PostgreSQL database is used
    /// when source and target database contexts are created. This allows to execute
    /// raw SQL queries but comes with a performance penalty. When set to <c>true</c>
    /// an in-memory database is used instead.</param>
    public static async Task<SyncContext> BuildAsync(bool useInMemory = false)
    {
        var source = CreateDbContextAsync(useInMemory);
        var target = CreateDbContextAsync(useInMemory);
        await Task.WhenAll(source, target).ConfigureAwait(false);
        return new SyncContext(source.Result, target.Result);
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
