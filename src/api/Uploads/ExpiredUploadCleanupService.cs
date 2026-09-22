using BDMS.Uploads.S3;

namespace BDMS.Uploads;

/// <summary>
/// Removes the parts of uploads that were started and never finished. Without this they stay in
/// the cloud storage belonging to no object, and a log file is large enough that a few abandoned
/// uploads are worth paying attention to.
/// </summary>
public class ExpiredUploadCleanupService : BackgroundService
{
    private static readonly TimeSpan interval = TimeSpan.FromHours(1);

    private readonly ILogger<ExpiredUploadCleanupService> logger;
    private readonly S3TusStore store;

    /// <summary>
    /// Initializes a new instance of the <see cref="ExpiredUploadCleanupService"/> class.
    /// </summary>
    public ExpiredUploadCleanupService(ILogger<ExpiredUploadCleanupService> logger, S3TusStore store)
    {
        this.logger = logger;
        this.store = store;
    }

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

    private async Task SweepAsync(CancellationToken cancellationToken)
    {
        try
        {
            var removed = await store.RemoveExpiredFilesAsync(cancellationToken).ConfigureAwait(false);
            if (removed > 0)
            {
                logger.LogInformation("Removed {Count} expired uploads.", removed);
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            // A sweep that fails must not take the service down, because the next one is likely
            // to succeed and there is nothing the caller could do about it.
            logger.LogError(ex, "Failed to remove expired uploads.");
        }
    }
}
