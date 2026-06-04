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

            logger.LogInformation("OCR catch-up: {Count} pending profile(s).", pendingIds.Count);
            foreach (var id in pendingIds)
            {
                if (stoppingToken.IsCancellationRequested) break;

                using var perItemScope = scopeFactory.CreateScope();
                var perItemService = perItemScope.ServiceProvider.GetRequiredService<FileOcrService>();
                await perItemService.ProcessAsync(id, cancellationToken: stoppingToken).ConfigureAwait(false);
            }
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
