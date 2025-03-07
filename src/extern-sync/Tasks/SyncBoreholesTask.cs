using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BDMS.ExternSync.Tasks;

/// <summary>
/// Sync <see cref="Borehole"/>s with a publication status 'published' from source to destination.
/// </summary>
public class SyncBoreholesTask(ISyncContext syncContext, ILogger<SyncBoreholesTask> logger, IConfiguration configuration)
    : SyncTask(syncContext, logger, configuration)
{
    /// <inheritdoc/>
    protected override async Task RunTaskAsync(CancellationToken cancellationToken)
    {
        // Get published boreholes from the source database.
        var publishedBoreholes = Source.Boreholes
            .AsNoTrackingWithIdentityResolution()
            .GetAllWithIncludes()
            .WithPublicationStatusPublished()
            .ToList();

        // Remove boreholes already available at the target database by comparing the depth and
        // coordinates of each borehole if they are within a pre-defined radius.
        var boreholesAtDestination = Target.Boreholes.AsNoTracking();
        publishedBoreholes = publishedBoreholes.RemoveDuplicates(boreholesAtDestination).ToList();

        // Skip this sync task if there are no published boreholes available.
        if (publishedBoreholes.Count == 0)
        {
            Logger.LogInformation(
                "No (new) boreholes in publication status 'published' found on source database. Skipping task...");
            return;
        }

        // Get the default workgroup to assign synced borholes with no matching workgroup to.
        var targetDefaultWorkgroupName = Configuration.GetValue<string>(SyncContextConstants.TargetDefaultWorkgroupNameEnvName)
            ?? throw new InvalidOperationException($"Environment variable <{SyncContextConstants.TargetDefaultWorkgroupNameEnvName}> was not set.");

        var targetDefaultWorkgroup = await Target.Workgroups.AsNoTracking()
            .SingleOrDefaultAsync(w => w.Name == targetDefaultWorkgroupName, cancellationToken).ConfigureAwait(false)
            ?? throw new InvalidOperationException(
                $"No suitable default workgroup was found at target database." +
                $"Was looking for a workgroup named <{targetDefaultWorkgroupName}>.");

        // Get the default user to assign the synced boreholes to.
        var targetDefaultUserSub = Configuration.GetValue<string>(SyncContextConstants.TargetDefaultUserSubEnvName)
            ?? throw new InvalidOperationException($"Environment variable <{SyncContextConstants.TargetDefaultUserSubEnvName}> was not set.");

        var targetDefaultUser = await Target.Users.AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == targetDefaultUserSub, cancellationToken).ConfigureAwait(false)
            ?? throw new InvalidOperationException(
                $"No suitable default user was found at target database." +
                $"Was looking for a user with sub id <{targetDefaultUserSub}>.");

        // Process published and non duplicated boreholes.
        foreach (var publishedBorehole in publishedBoreholes)
        {
            // Search for a matching workgroup name
            var matchingWorkgroup = await Target.Workgroups.AsNoTracking()
                .SingleOrDefaultAsync(w => w.Name == publishedBorehole.Workgroup.Name, cancellationToken).ConfigureAwait(false);
            var targetWorkgroup = matchingWorkgroup ?? targetDefaultWorkgroup;

            // Set workgroup
            publishedBorehole.Workgroup = null;
            publishedBorehole.WorkgroupId = targetWorkgroup.Id;

            // Set publication status
            publishedBorehole.SetBorholePublicationStatus(Role.Publisher);
            publishedBorehole.Workflows.UpdateAttachedUser(targetDefaultUser);

            // Ensure unlocked borehole
            publishedBorehole.LockedBy = null;
            publishedBorehole.LockedById = null;

            // Existing file references must be preserved. Source and target environment
            // share the same object storage for borehole attachments.
            publishedBorehole.BoreholeFiles?.UpdateAttachedUser(targetDefaultUser);
            if (publishedBorehole.BoreholeFiles != null)
            {
                foreach (var file in publishedBorehole.BoreholeFiles.Select(boreholeFile => boreholeFile.File))
                {
                    // Because BoreholeFile does not implement IIdentifyable and therefore cannot be traversed
                    // recursivly with reflection the File must be marked as new explicitly.
                    file.MarkAsNew();
                    file.UpdateChangeTracking(targetDefaultUser);
                }
            }
        }

        // Clear unused navigation properties and backreferences.
        publishedBoreholes = publishedBoreholes.ClearNavigationProperties().ToList();

        // Mark boreholes and all its dependencies as new.
        publishedBoreholes.MarkAsNew();

        // Update change tracking information. This must be done before the item is added to the context.
        publishedBoreholes.UpdateChangeTracking(targetDefaultUser);

        // Add items to context and save changes.
        await Target.Boreholes.AddRangeAsync(publishedBoreholes, cancellationToken).ConfigureAwait(false);
        await Target.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    /// <inheritdoc/>
    protected override async Task ValidateTaskAsync(CancellationToken cancellationToken)
    {
        await Task.FromResult(true).ConfigureAwait(false);
    }
}
