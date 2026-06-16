using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace BDMS.Services;

/// <summary>
/// On startup, drives any <see cref="Profile"/> rows with non-terminal <see cref="OcrStatus"/>
/// through OCR via <see cref="FileOcrService"/>. Handles profiles left mid-flight by a previous
/// process (e.g. status <see cref="OcrStatus.Processing"/> after a crash).
/// </summary>
public class FileOcrBackgroundService : BackgroundService
{
    internal const int DefaultMaxDegreeOfParallelism = 4;
    internal static readonly TimeSpan PollDelay = TimeSpan.FromSeconds(30);

    private readonly IServiceScopeFactory scopeFactory;
    private readonly IConfiguration configuration;
    private readonly ILogger<FileOcrBackgroundService> logger;

    public FileOcrBackgroundService(IServiceScopeFactory scopeFactory, IConfiguration configuration, ILogger<FileOcrBackgroundService> logger)
    {
        this.scopeFactory = scopeFactory;
        this.configuration = configuration;
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

            var maxParallelism = configuration.GetValue("Ocr:MaxDegreeOfParallelism", DefaultMaxDegreeOfParallelism);
            var totalStopwatch = Stopwatch.StartNew();
            var succeeded = 0;
            var failed = 0;
            var processed = 0;

            logger.LogInformation(
                "OCR catch-up: starting processing of {Count} pending profile(s) with max parallelism {MaxParallelism}.",
                pendingIds.Count,
                maxParallelism);

            await Parallel.ForEachAsync(
                pendingIds,
                new ParallelOptions { MaxDegreeOfParallelism = maxParallelism, CancellationToken = stoppingToken },
                async (id, ct) =>
                {
                    var itemStopwatch = Stopwatch.StartNew();

                    try
                    {
                        using var perItemScope = scopeFactory.CreateScope();
                        var perItemService = perItemScope.ServiceProvider.GetRequiredService<FileOcrService>();
                        await perItemService.ProcessAsync(id, pollDelay: PollDelay, cancellationToken: ct).ConfigureAwait(false);

                        itemStopwatch.Stop();
                        var currentSucceeded = Interlocked.Increment(ref succeeded);
                        var currentProcessed = Interlocked.Increment(ref processed);
                        logger.LogInformation(
                            "OCR catch-up: profile {ProfileId} completed in {Elapsed}. Progress: {Processed}/{Total} ({SuccessCount} succeeded, {FailCount} failed).",
                            id,
                            itemStopwatch.Elapsed,
                            currentProcessed,
                            pendingIds.Count,
                            currentSucceeded,
                            Volatile.Read(ref failed));
                    }
                    catch (OperationCanceledException)
                    {
                        throw;
                    }
                    catch (Exception ex)
                    {
                        itemStopwatch.Stop();
                        var currentFailed = Interlocked.Increment(ref failed);
                        var currentProcessed = Interlocked.Increment(ref processed);
                        logger.LogError(
                            ex,
                            "OCR catch-up: profile {ProfileId} failed after {Elapsed}. Progress: {Processed}/{Total} ({SuccessCount} succeeded, {FailCount} failed).",
                            id,
                            itemStopwatch.Elapsed,
                            currentProcessed,
                            pendingIds.Count,
                            Volatile.Read(ref succeeded),
                            currentFailed);
                    }
                }).ConfigureAwait(false);

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
