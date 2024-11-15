using Microsoft.Extensions.Logging;

namespace BDMS.ExternSync;

/// <summary>
/// Represents a sync task containing source and target database contexts
/// that can be executed and validated.
/// </summary>
/// <param name="syncContext">The sync context.</param>
/// <param name="logger">The logger for this instance.</param>
public abstract class SyncTask(ISyncContext syncContext, ILogger<SyncTask> logger)
    : IDisposable, ISyncTask
{
    private bool disposedValue;

    /// <summary>
    /// The source database context.
    /// </summary>
    protected BdmsContext Source { get; } = syncContext.Source;

    /// <summary>
    /// The target database context.
    /// </summary>
    protected BdmsContext Target { get; } = syncContext.Target;

    /// <summary>
    /// The logger for the <see cref="SyncTask"/>.
    /// </summary>
    protected ILogger<SyncTask> Logger { get; } = logger;

    /// <inheritdoc/>
    public async Task ExecuteAndValidateAsync(CancellationToken cancellationToken)
    {
        await RunTaskAsync(cancellationToken).ConfigureAwait(false);
        await ValidateTaskAsync(cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Runs the <see cref="SyncTask"/>.
    /// </summary>
    protected abstract Task RunTaskAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Validates the result after the <see cref="SyncTask"/> has been executed.
    /// </summary>
    protected abstract Task ValidateTaskAsync(CancellationToken cancellationToken);

    /// <inheritdoc/>
    protected virtual void Dispose(bool disposing)
    {
        if (!disposedValue && disposing)
        {
            Source.Dispose();
            Target.Dispose();

            disposedValue=true;
        }
    }

    /// <inheritdoc/>
    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }
}
