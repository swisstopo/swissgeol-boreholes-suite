using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BDMS.ExternSync.Tasks;

/// <summary>
/// Syncs <see cref="Borehole"/>s with workflow status 'reviewed' or 'published' from a source to a destination context.
/// </summary>
public class SyncBoreholesTask(ISyncContext syncContext, ILogger<SyncBoreholesTask> logger, IConfiguration configuration)
    : SyncTask(syncContext, logger, configuration)
{
    /// <inheritdoc/>
    protected override async Task RunTaskAsync(CancellationToken cancellationToken)
    {
        // Get the default workgroup to assign synced boreholes with no matching workgroup to.
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

        // Get published boreholes from the source database.
        var publishedBoreholes = Source.BoreholesWithIncludes
            .AsNoTrackingWithIdentityResolution()
            .WithStatusReviewedOrPublished()
            .ToList();

        // Skip this sync task if there are no published boreholes available.
        if (publishedBoreholes.Count == 0)
        {
            Logger.LogInformation(
                "No (new) boreholes with workflow status 'reviewed' or 'published' found on source database. Skipping task...");
            return;
        }

        Logger.LogInformation(
            "Target default workgroup: <{DefaultWorkgroupName}>\n" +
            "Target default user: <{DefaultUserName} ({DefaultUserSub})>",
            targetDefaultWorkgroup.Name,
            targetDefaultUser.Name,
            targetDefaultUser.SubjectId);

        // Load all existing target boreholes and profile file identifiers once. Deduplication must be
        // global, not per-workgroup: a borehole's location and a profile's name_uuid are unique across the
        // whole target database (name_uuid has a global unique constraint). Scoping the check to a single
        // workgroup re-inserts an already synced borehole whenever the workgroup it is routed to now differs
        // from the one holding its existing copy (e.g. after the default workgroup changed), which then
        // violates the global name_uuid constraint.
        var boreholesAtDestination = await Target.Boreholes.AsNoTracking()
            .ToListAsync(cancellationToken).ConfigureAwait(false);
        var existingProfileNameUuids = (await Target.Profiles.AsNoTracking()
            .Select(p => p.NameUuid)
            .ToListAsync(cancellationToken).ConfigureAwait(false))
            .ToHashSet(StringComparer.Ordinal);

        // Process published boreholes.
        // Operate on a copy of the list, so that we can remove items from it if needed.
        foreach (var publishedBorehole in publishedBoreholes.ToList())
        {
            // Skip boreholes that were already synced, detected either by matching location (depth and
            // coordinates within a pre-defined tolerance) or by a profile whose name_uuid already exists at
            // the target. The name_uuid check is a definitive backstop that guards the global unique
            // constraint even when the location heuristic misses (e.g. a depth edited after the first sync).
            var alreadySynced = publishedBorehole.IsWithinPredefinedTolerance(boreholesAtDestination)
                || (publishedBorehole.Profiles?.Any(p => existingProfileNameUuids.Contains(p.NameUuid)) ?? false);
            if (alreadySynced)
            {
                publishedBoreholes.Remove(publishedBorehole);
                Logger.LogInformation("Borehole <{BoreholeName}> already exists at target database. Skipping...", publishedBorehole.Name);
                continue;
            }

            // Assign the borehole to the workgroup matching its source workgroup name, or the default workgroup.
            var matchingWorkgroup = await Target.Workgroups.AsNoTracking().SingleOrDefaultAsync(w => w.Name == publishedBorehole.Workgroup.Name, cancellationToken).ConfigureAwait(false);
            var targetWorkgroup = matchingWorkgroup ?? targetDefaultWorkgroup;

            // Set workgroup
            publishedBorehole.Workgroup = null;
            publishedBorehole.WorkgroupId = targetWorkgroup.Id;

            // Remove all previous workflow changes (= history).
            publishedBorehole.Workflow.Changes.Clear();

            // Clear the user assigned to the workflow and its changes.
            publishedBorehole.Workflow.Assignee = null;
            publishedBorehole.Workflow.AssigneeId = null;

            // Ensure unlocked borehole
            publishedBorehole.LockedBy = null;
            publishedBorehole.LockedById = null;

            Logger.LogInformation("Syncing borehole <{BoreholeName}> ...", publishedBorehole.Name);
        }

        // Clear unused navigation properties and backreferences.
        publishedBoreholes = [.. publishedBoreholes.ClearNavigationProperties()];

        // Mark boreholes and all their dependencies as new.
        publishedBoreholes.MarkAsNew();

        // Update change tracking information. This must be done before the entities are added to the context.
        publishedBoreholes.UpdateChangeTracking(targetDefaultUser);

        // Add items to context and save changes.
        await Target.Boreholes.AddRangeAsync(publishedBoreholes, cancellationToken).ConfigureAwait(false);
        await Target.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        Logger.LogInformation("Successfully synced <{SyncedBoreholeCount}> boreholes.", publishedBoreholes.Count);
    }

    /// <inheritdoc/>
    protected override async Task ValidateTaskAsync(CancellationToken cancellationToken)
    {
        await Task.FromResult(true).ConfigureAwait(false);
    }
}
