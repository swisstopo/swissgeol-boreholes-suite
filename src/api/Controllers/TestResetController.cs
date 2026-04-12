using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace BDMS.Controllers;

/// <summary>
/// Dev-only controller used by the Cypress suite to reset test state in a single HTTP round-trip.
/// Replaces the sequence of delete-each-borehole + reset-all-settings calls the test harness used to make.
/// Returns <see cref="StatusCodes.Status404NotFound"/> in any environment other than Development.
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class TestResetController(
    BdmsContext context,
    IWebHostEnvironment env,
    UserSettingsResetService userSettingsResetService,
    BoreholeFileCloudService boreholeFileCloudService,
    PhotoCloudService photoCloudService,
    LogFileCloudService logFileCloudService,
    ILogger<TestResetController> logger) : ControllerBase
{
    /// <summary>
    /// Removes every borehole (and its dependents) created by the test suite, then resets
    /// admin settings and codelist configuration back to their seeded state.
    /// </summary>
    [HttpPost]
    [SwaggerResponse(StatusCodes.Status200OK, "Test state reset successfully.")]
    [SwaggerResponse(StatusCodes.Status404NotFound, "Not available outside of the Development environment.")]
    public async Task<IActionResult> ResetAsync()
    {
        if (!env.IsDevelopment())
        {
            return NotFound();
        }

        const int maxSeedBoreholeId = BdmsContextConstants.MaxSeedBoreholeId;

        // Pre-collect S3 keys before we drop the referencing rows.
        var boreholeFileKeys = await context.BoreholeFiles
            .Where(bf => bf.BoreholeId > maxSeedBoreholeId && bf.File.NameUuid != null)
            .Select(bf => bf.File.NameUuid!)
            .ToListAsync()
            .ConfigureAwait(false);

        var photoKeys = await context.Photos
            .Where(p => p.BoreholeId > maxSeedBoreholeId)
            .Select(p => p.NameUuid)
            .ToListAsync()
            .ConfigureAwait(false);

        var logFileKeys = await context.LogFiles
            .Where(lf => lf.LogRun != null && lf.LogRun.BoreholeId > maxSeedBoreholeId && lf.NameUuid != null)
            .Select(lf => lf.NameUuid!)
            .ToListAsync()
            .ConfigureAwait(false);

        await using var transaction = await context.Database.BeginTransactionAsync().ConfigureAwait(false);

        // Capture file ids before we delete the join rows so we can clean up orphaned files afterwards.
        var fileIds = await context.BoreholeFiles
            .Where(bf => bf.BoreholeId > maxSeedBoreholeId)
            .Select(bf => bf.FileId)
            .Distinct()
            .ToListAsync()
            .ConfigureAwait(false);

        await context.BoreholeFiles
            .Where(bf => bf.BoreholeId > maxSeedBoreholeId)
            .ExecuteDeleteAsync()
            .ConfigureAwait(false);

        if (fileIds.Count > 0)
        {
            await context.Files
                .Where(f => fileIds.Contains(f.Id) && !context.BoreholeFiles.Any(bf => bf.FileId == f.Id))
                .ExecuteDeleteAsync()
                .ConfigureAwait(false);
        }

        await context.Photos
            .Where(p => p.BoreholeId > maxSeedBoreholeId)
            .ExecuteDeleteAsync()
            .ConfigureAwait(false);

        await context.Documents
            .Where(d => d.BoreholeId > maxSeedBoreholeId)
            .ExecuteDeleteAsync()
            .ConfigureAwait(false);

        await context.BoreholeGeometry
            .Where(g => g.BoreholeId > maxSeedBoreholeId)
            .ExecuteDeleteAsync()
            .ConfigureAwait(false);

        await context.Sections
            .Where(s => s.BoreholeId > maxSeedBoreholeId)
            .ExecuteDeleteAsync()
            .ConfigureAwait(false);

        await context.Observations
            .Where(o => o.BoreholeId > maxSeedBoreholeId)
            .ExecuteDeleteAsync()
            .ConfigureAwait(false);

        await context.Completions
            .Where(c => c.BoreholeId > maxSeedBoreholeId)
            .ExecuteDeleteAsync()
            .ConfigureAwait(false);

        await context.LogRuns
            .Where(lr => lr.BoreholeId > maxSeedBoreholeId)
            .ExecuteDeleteAsync()
            .ConfigureAwait(false);

        // Finally the boreholes themselves. DB-level ON DELETE CASCADE handles
        // borehole_codelist, stratigraphy (with layers + stratigraphy_codelist), and workflow.
        await context.Boreholes
            .Where(b => b.Id > maxSeedBoreholeId)
            .ExecuteDeleteAsync()
            .ConfigureAwait(false);

        // Keep borehole ids deterministic across test runs.
        await context.Database
            .ExecuteSqlRawAsync($"SELECT setval('bdms.borehole_id_bho_seq', {maxSeedBoreholeId})")
            .ConfigureAwait(false);

        userSettingsResetService.Reset();

        await transaction.CommitAsync().ConfigureAwait(false);

        // Best-effort S3 cleanup outside the DB transaction so a cloud outage cannot
        // poison the test state reset itself.
        await TryDeleteObjectsAsync(boreholeFileCloudService, boreholeFileKeys).ConfigureAwait(false);
        await TryDeleteObjectsAsync(photoCloudService, photoKeys).ConfigureAwait(false);
        await TryDeleteObjectsAsync(logFileCloudService, logFileKeys).ConfigureAwait(false);

        return Ok();
    }

    private async Task TryDeleteObjectsAsync(CloudServiceBase service, IReadOnlyCollection<string> keys)
    {
        if (keys.Count == 0)
        {
            return;
        }

        try
        {
            await service.DeleteObjects(keys).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to delete {Count} test object(s) from cloud storage.", keys.Count);
        }
    }
}