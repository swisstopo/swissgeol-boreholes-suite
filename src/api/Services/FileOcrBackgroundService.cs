using System.Diagnostics;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Services;

/// <summary>
/// On startup, drives any <see cref="Profile"/> rows with non-terminal <see cref="OcrStatus"/>
/// through OCR via <see cref="FileOcrService"/>. Handles profiles left mid-flight by a previous
/// process (e.g. status <see cref="OcrStatus.Processing"/> after a crash).
/// </summary>
public class FileOcrBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory scopeFactory;
    private readonly ILogger<FileOcrBackgroundService> logger;

    public FileOcrBackgroundService(IServiceScopeFactory scopeFactory, ILogger<FileOcrBackgroundService> logger)
    {
        this.scopeFactory = scopeFactory;
        this.logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            List<int> pendingIds;
            using (var scope = scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<BdmsContext>();
                pendingIds = await context.Profiles
                    .Where(p => p.OcrStatus == OcrStatus.Created || p.OcrStatus == OcrStatus.Processing)
                    .Select(p => p.Id)
                    .ToListAsync(stoppingToken)
                    .ConfigureAwait(false);
            }

            if (pendingIds.Count == 0)
            {
                logger.LogInformation("OCR catch-up: no pending profiles.");
                return;
            }

            var totalStopwatch = Stopwatch.StartNew();
            var succeeded = 0;
            var failed = 0;

            logger.LogInformation("OCR catch-up: starting processing of {Count} pending profile(s).", pendingIds.Count);

            for (var i = 0; i < pendingIds.Count; i++)
            {
                if (stoppingToken.IsCancellationRequested) break;

                var id = pendingIds[i];
                var itemStopwatch = Stopwatch.StartNew();

                try
                {
                    using var perItemScope = scopeFactory.CreateScope();
                    var perItemService = perItemScope.ServiceProvider.GetRequiredService<FileOcrService>();
                    await perItemService.ProcessAsync(id, cancellationToken: stoppingToken).ConfigureAwait(false);

                    itemStopwatch.Stop();
                    succeeded++;
                    logger.LogInformation(
                        "OCR catch-up: profile {ProfileId} completed in {Elapsed}. Progress: {Processed}/{Total} ({SuccessCount} succeeded, {FailCount} failed).",
                        id,
                        itemStopwatch.Elapsed,
                        i + 1,
                        pendingIds.Count,
                        succeeded,
                        failed);
                }
                catch (OperationCanceledException)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    itemStopwatch.Stop();
                    failed++;
                    logger.LogError(
                        ex,
                        "OCR catch-up: profile {ProfileId} failed after {Elapsed}. Progress: {Processed}/{Total} ({SuccessCount} succeeded, {FailCount} failed).",
                        id,
                        itemStopwatch.Elapsed,
                        i + 1,
                        pendingIds.Count,
                        succeeded,
                        failed);
                }
            }

            totalStopwatch.Stop();
            logger.LogInformation(
                "OCR catch-up: finished. {SuccessCount} succeeded, {FailCount} failed out of {Total} profiles in {Elapsed}.",
                succeeded,
                failed,
                pendingIds.Count,
                totalStopwatch.Elapsed);
        }
        catch (OperationCanceledException)
        {
            // Normal on shutdown.
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "OCR catch-up failed.");
        }
    }
}
