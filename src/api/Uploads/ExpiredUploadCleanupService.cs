using BDMS.Uploads.S3;

namespace BDMS.Uploads;

/// <summary>
/// Removes the parts of uploads that were started and never finished, in every bucket an upload
/// can be written to. Without this they stay in the cloud storage belonging to no object, and the
/// files these uploads carry are large enough that a few abandoned ones are worth paying attention
/// to.
/// </summary>
public class ExpiredUploadCleanupService : BackgroundService
{
    private static readonly TimeSpan interval = TimeSpan.FromHours(1);

    private readonly ILogger<ExpiredUploadCleanupService> logger;
    private readonly IReadOnlyList<S3TusStore> stores;

    /// <summary>
    /// Initializes a new instance of the <see cref="ExpiredUploadCleanupService"/> class.
    /// </summary>
    /// <param name="logger">Records what a sweep removed and what it could not.</param>
    /// <param name="stores">The stores to sweep, one per bucket.</param>
    public ExpiredUploadCleanupService(ILogger<ExpiredUploadCleanupService> logger, IReadOnlyList<S3TusStore> stores)
    {
        this.logger = logger;
        this.stores = stores;
    }

    /// <summary>
    /// Gets how many stores the sweep covers, so that a store nobody sweeps is visible to a test.
    /// Nothing else would show it: an unswept bucket fails no request and answers nothing wrongly,
    /// it only keeps what was abandoned in it.
    /// </summary>
    public int StoreCount => stores.Count;

    /// <inheritdoc/>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(interval);

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken).ConfigureAwait(false))
            {
                await SweepAsync(stoppingToken).ConfigureAwait(false);
            }
        }
        catch (OperationCanceledException)
        {
            // The host is shutting down, which is not a failure of the sweep.
        }
    }

    /// <summary>
    /// Sweeps every store once.
    /// </summary>
    /// <param name="cancellationToken">Stops the sweep when the host shuts down.</param>
    internal async Task SweepAsync(CancellationToken cancellationToken)
    {
        foreach (var store in stores)
        {
            await SweepStoreAsync(store, cancellationToken).ConfigureAwait(false);
        }
    }

    private async Task SweepStoreAsync(S3TusStore store, CancellationToken cancellationToken)
    {
        try
        {
            var removed = await store.RemoveExpiredFilesAsync(cancellationToken).ConfigureAwait(false);
            if (removed > 0)
            {
                logger.LogInformation("Removed {Count} expired uploads from <{BucketName}>.", removed, store.BucketName);
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Only the host shutting down stops the sweep. A storage client that gives up on a
            // request throws the same exception, and taken for a shutdown it would end the sweep
            // for as long as the application runs, so it is handled as the failure below.
            throw;
        }
        catch (Exception ex)
        {
            // A sweep that fails must not take the service down, because the next one is likely
            // to succeed and there is nothing the caller could do about it. The stores that follow
            // are still swept, because one failing bucket says nothing about the others.
            logger.LogError(ex, "Failed to remove expired uploads from <{BucketName}>.", store.BucketName);
        }
    }
}
