using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace BDMS.Services;

/// <summary>
/// Orchestrates OCR processing of a <see cref="Profile"/> file by calling the
/// swissgeol-ocr-api and updating <see cref="Profile.OcrStatus"/> as the run progresses.
/// </summary>
public class FileOcrService
{
    private static readonly TimeSpan DefaultPollDelay = TimeSpan.FromSeconds(1);
    private static readonly HashSet<OcrStatus> TerminalStatuses =
        new() { OcrStatus.Success, OcrStatus.Error, OcrStatus.WillNotBeProcessed };

    private readonly BdmsContext context;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<FileOcrService> logger;

    public FileOcrService(BdmsContext context, IHttpClientFactory httpClientFactory, ILogger<FileOcrService> logger)
    {
        this.context = context;
        this.httpClientFactory = httpClientFactory;
        this.logger = logger;
    }

    /// <summary>
    /// Runs OCR for the given <see cref="Profile"/> from whatever its current status is to a terminal status.
    /// Safe to call repeatedly: returns immediately if already in a terminal state.
    /// </summary>
    /// <param name="profileId">Id of the profile whose file to OCR.</param>
    /// <param name="pollDelay">Delay between collect polls. Default 1s; tests pass <see cref="TimeSpan.Zero"/>.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    public async Task ProcessAsync(int profileId, TimeSpan? pollDelay = null, CancellationToken cancellationToken = default)
    {
        var profile = await context.Profiles.FirstOrDefaultAsync(p => p.Id == profileId, cancellationToken).ConfigureAwait(false);
        if (profile == null)
        {
            logger.LogWarning("OCR requested for unknown profile id {ProfileId}", profileId);
            return;
        }

        if (TerminalStatuses.Contains(profile.OcrStatus))
        {
            return;
        }

        try
        {
            await UpdateStatusAsync(profile, OcrStatus.Processing, cancellationToken).ConfigureAwait(false);
            await StartAsync(profile, cancellationToken).ConfigureAwait(false);
            await CollectAsync(profile, pollDelay ?? DefaultPollDelay, cancellationToken).ConfigureAwait(false);
            await UpdateStatusAsync(profile, OcrStatus.Success, cancellationToken).ConfigureAwait(false);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "OCR failed for profile {ProfileId} ({NameUuid})", profile.Id, profile.NameUuid);
            await UpdateStatusAsync(profile, OcrStatus.Error, CancellationToken.None).ConfigureAwait(false);
        }
    }

    private async Task StartAsync(Profile profile, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("OcrApi");
        var response = await client.PostAsJsonAsync("/", new { file = profile.NameUuid }, cancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();
    }

    private async Task CollectAsync(Profile profile, TimeSpan pollDelay, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("OcrApi");
        while (true)
        {
            if (pollDelay > TimeSpan.Zero)
            {
                await Task.Delay(pollDelay, cancellationToken).ConfigureAwait(false);
            }

            var response = await client.PostAsJsonAsync("/collect", new { file = profile.NameUuid }, cancellationToken).ConfigureAwait(false);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<CollectResult>(cancellationToken: cancellationToken).ConfigureAwait(false);
            if (result?.HasFinished != true) continue;

            if (!string.IsNullOrEmpty(result.Error))
            {
                throw new InvalidOperationException($"OCR service reported error: {result.Error}");
            }

            return;
        }
    }

    private async Task UpdateStatusAsync(Profile profile, OcrStatus status, CancellationToken cancellationToken)
    {
        profile.OcrStatus = status;
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    private sealed record CollectResult(
        [property: JsonPropertyName("has_finished")] bool HasFinished,
        [property: JsonPropertyName("error")] string? Error);
}
