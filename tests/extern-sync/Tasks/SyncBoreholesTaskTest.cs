using BDMS.ExternSync.Tasks;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using static BDMS.ExternSync.TestSyncContextHelpers;

namespace BDMS.ExternSync;

[TestClass]
public class SyncBoreholesTaskTest
{
    [TestMethod]
    public async Task SyncBoreholes()
    {
        using var syncContext = await TestSyncContext.BuildAsync(seedTestDataInSourceContext: true);
        using var syncTask = new SyncBoreholesTask(syncContext, new Mock<ILogger<SyncBoreholesTask>>().Object, GetDefaultConfiguration());

        // Set the workflow status for some boreholes. By default all seeded boreholes
        // have the default workflow status 'draft'.
        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;
        await syncContext.Source.SetBoreholeStatusAsync(1_000_001, WorkflowStatus.Draft, cancellationToken);
        await syncContext.Source.SetBoreholeStatusAsync(1_000_020, WorkflowStatus.InReview, cancellationToken);

        await syncContext.Source.SetBoreholeStatusAsync(1_000_044, WorkflowStatus.Reviewed, cancellationToken);
        await syncContext.Source.SetBoreholeStatusAsync(1_000_022, WorkflowStatus.Reviewed, cancellationToken);
        await syncContext.Source.SetBoreholeStatusAsync(1_000_099, WorkflowStatus.Reviewed, cancellationToken);
        await syncContext.Source.SetBoreholeStatusAsync(1_000_010, WorkflowStatus.Published, cancellationToken);

        await syncContext.Source.FixCasingReferencesAsync(cancellationToken);

        await syncTask.ExecuteAndValidateAsync(cancellationToken);

        // Get boreholes with workflow status 'reviewed' or 'published' from both sources.
        var (originalBoreholes, syncedBoreholes) = GetPublishedBoreholes(syncContext.Source, syncContext.Target);

        Assert.AreEqual(4, originalBoreholes.Count());
        Assert.AreEqual(4, syncedBoreholes.Count());

        // Serialize synced objects from both sources and compare all the data.
        foreach (var syncedBorehole in syncedBoreholes)
        {
            var originalBorehole = originalBoreholes.Single(b => b.Name == syncedBorehole.Name);
            var original = originalBorehole.SortBoreholeContent().SerializeToJson();
            var synced = syncedBorehole.SortBoreholeContent().SerializeToJson();
            Assert.AreEqual(original, synced);
        }

        // Validate casings. Casing details are already asserted by comparing serialized JSON output.
        // Counts are derived from the source set so the test stays correct as the seed distribution changes.
        var sourceCasingCount = originalBoreholes.SelectMany(b => b.Completions.Select(c => c.Casings)).Count();
        Assert.IsTrue(sourceCasingCount > 0);
        Assert.AreEqual(sourceCasingCount, syncedBoreholes.SelectMany(b => b.Completions.Select(c => c.Casings)).Count());
        Assert.IsTrue(syncedBoreholes.ValidateCasingReferences());

        // Validate profiles. Profile details are already asserted by comparing serialized JSON output.
        var sourceProfileCount = originalBoreholes.SelectMany(b => b.Profiles ?? Array.Empty<Profile>()).Count();
        Assert.IsTrue(sourceProfileCount > 0);
        Assert.AreEqual(sourceProfileCount, syncedBoreholes.SelectMany(b => b.Profiles ?? Array.Empty<Profile>()).Count());

        // Validate photos. Photo details are already asserted by comparing serialized JSON output.
        var sourcePhotoCount = originalBoreholes.SelectMany(b => b.Photos ?? Array.Empty<Photo>()).Count();
        Assert.AreEqual(sourcePhotoCount, syncedBoreholes.SelectMany(b => b.Photos ?? Array.Empty<Photo>()).Count());

        // Validate log files. Log file details are already asserted by comparing serialized JSON output.
        var sourceLogFileCount = originalBoreholes.SelectMany(b => b.LogRuns.SelectMany(lr => lr.LogFiles ?? Array.Empty<LogFile>())).Count();
        Assert.IsTrue(sourceLogFileCount > 0);
        Assert.AreEqual(sourceLogFileCount, syncedBoreholes.SelectMany(b => b.LogRuns.SelectMany(lr => lr.LogFiles ?? Array.Empty<LogFile>())).Count());

        // Validate workgroup
        foreach (var syncedBorehole in syncedBoreholes)
        {
            var originalBorehole = originalBoreholes.Single(b => b.Name == syncedBorehole.Name);
            Assert.AreEqual(originalBorehole.Workgroup.Name, syncedBorehole.Workgroup.Name);
        }
    }

    [TestMethod]
    public async Task SyncBoreholesShouldSkipDuplicates()
    {
        // By seeding the target context with the same boreholes as in the source context, we can check if the sync task
        // correctly skips the duplicates. The seeded boreholes in the target context have the workflow status 'Published'.
        using var syncContext = await TestSyncContext.BuildAsync(seedTestDataInSourceContext: true, seedTestDataInTargetContext: true);
        using var syncTask = new SyncBoreholesTask(syncContext, new Mock<ILogger<SyncBoreholesTask>>().Object, GetDefaultConfiguration());

        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;
        await syncContext.Source.SetBoreholeStatusAsync(1_000_022, WorkflowStatus.Published, cancellationToken);
        await syncContext.Source.SetBoreholeStatusAsync(1_000_099, WorkflowStatus.Published, cancellationToken);

        await syncContext.Source.FixCasingReferencesAsync(cancellationToken);

        await syncTask.ExecuteAndValidateAsync(cancellationToken);

        // Get boreholes with workflow status 'reviewed' or 'published' from both sources.
        var (publishedSourceBoreholes, publishedTargetBoreholes) = GetPublishedBoreholes(syncContext.Source, syncContext.Target);

        // Expect an no boreholes to be synced to the target context, because they are already present in the target context.
        Assert.AreEqual(2, publishedSourceBoreholes.Count());
        Assert.AreEqual(0, publishedTargetBoreholes.Count());
    }

    [TestMethod]
    public async Task SyncBoreholesShouldSkipDuplicatesInAnyWorkgroup()
    {
        // Regression test: an already synced borehole must be skipped even when its copy at the target lives
        // in a different workgroup than the one the sync routes it to. The duplicate check used to be scoped
        // to a single workgroup, so a workgroup mismatch (e.g. after the default workgroup changed) caused a
        // re-insert that violated the global profile name_uuid unique constraint.
        using var syncContext = await TestSyncContext.BuildAsync(seedTestDataInSourceContext: true, seedTestDataInTargetContext: true);
        using var syncTask = new SyncBoreholesTask(syncContext, new Mock<ILogger<SyncBoreholesTask>>().Object, GetDefaultConfiguration());

        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;
        await syncContext.Source.SetBoreholeStatusAsync(1_000_022, WorkflowStatus.Published, cancellationToken);
        await syncContext.Source.SetBoreholeStatusAsync(1_000_099, WorkflowStatus.Published, cancellationToken);

        // Remove attachments from the published source boreholes so the duplicate detection can only rely on
        // matching coordinates, not on the name_uuid backstop. This isolates the global (workgroup-agnostic)
        // location check as the reason the boreholes are skipped.
        foreach (var boreholeId in new[] { 1_000_022, 1_000_099 })
        {
            var borehole = await syncContext.Source.Boreholes.Include(b => b.Profiles).SingleAsync(b => b.Id == boreholeId, cancellationToken);
            borehole.Profiles.Clear();
            await syncContext.Source.SaveChangesAsync(cancellationToken);
        }

        await syncContext.Source.FixCasingReferencesAsync(cancellationToken);

        // Move every borehole at the target into a workgroup that does not exist in the source, so the sync
        // never routes a source borehole to the workgroup that holds its already synced copy.
        var archivedWorkgroup = new Workgroup { Name = "Archived" };
        await syncContext.Target.Workgroups.AddAsync(archivedWorkgroup, cancellationToken);
        await syncContext.Target.SaveChangesAsync(cancellationToken);
        await syncContext.Target.Boreholes.ForEachAsync(b => b.WorkgroupId = archivedWorkgroup.Id, cancellationToken);
        await syncContext.Target.SaveChangesAsync(cancellationToken);

        var targetBoreholeCountBefore = await syncContext.Target.Boreholes.CountAsync(cancellationToken);

        await syncTask.ExecuteAndValidateAsync(cancellationToken);

        // Both published boreholes already exist at the target, so nothing must be synced and no duplicates created.
        var (publishedSourceBoreholes, _) = GetPublishedBoreholes(syncContext.Source, syncContext.Target);
        Assert.AreEqual(2, publishedSourceBoreholes.Count());
        Assert.AreEqual(targetBoreholeCountBefore, await syncContext.Target.Boreholes.CountAsync(cancellationToken));
    }

    [TestMethod]
    public async Task SyncBoreholesShouldSkipWhenProfileNameUuidAlreadyExists()
    {
        // Durability backstop: a borehole must be skipped when one of its profiles carries a name_uuid that
        // already exists at the target, even if its location no longer matches (e.g. its depth or coordinates
        // were edited at the source after the initial sync). name_uuid is globally unique, so re-inserting
        // would violate the profile name_uuid constraint.
        using var syncContext = await TestSyncContext.BuildAsync(seedTestDataInSourceContext: true, seedTestDataInTargetContext: true);
        using var syncTask = new SyncBoreholesTask(syncContext, new Mock<ILogger<SyncBoreholesTask>>().Object, GetDefaultConfiguration());

        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;

        // Pick a source borehole that has profiles and publish it.
        var sourceBorehole = await syncContext.Source.Boreholes
            .Include(b => b.Profiles).Include(b => b.Workflow)
            .FirstAsync(b => b.Profiles.Any(), cancellationToken);
        sourceBorehole.SetBoreholeWorkflowStatus(WorkflowStatus.Published);

        // Move it to a location that matches no borehole at the target, so only the name_uuid backstop (not
        // the coordinate/depth heuristic) can detect that it was already synced.
        sourceBorehole.LocationX = 1;
        sourceBorehole.LocationY = 1;
        sourceBorehole.LocationXLV03 = 1;
        sourceBorehole.LocationYLV03 = 1;

        // Simulate a prior sync: profile name_uuids are seeded randomly per database, so give one of the
        // source profiles a name_uuid that already exists at the target (as it would after a real sync copied
        // the borehole over). This is what the global unique constraint would reject on a re-insert.
        var syncedNameUuid = (await syncContext.Target.Profiles.Select(p => p.NameUuid).FirstAsync(cancellationToken));
        sourceBorehole.Profiles.First().NameUuid = syncedNameUuid;
        await syncContext.Source.SaveChangesAsync(cancellationToken);

        var targetBoreholeCountBefore = await syncContext.Target.Boreholes.CountAsync(cancellationToken);

        await syncTask.ExecuteAndValidateAsync(cancellationToken);

        // The borehole must be skipped: re-inserting it would violate the global profile name_uuid constraint.
        Assert.AreEqual(targetBoreholeCountBefore, await syncContext.Target.Boreholes.CountAsync(cancellationToken));
    }

    [TestMethod]
    public async Task SyncBoreholesShouldSyncWhenNeitherLocationNorProfileNameUuidMatches()
    {
        // Negative counterpart: a borehole that is genuinely new (its location matches nothing at the target
        // and none of its profile name_uuids exist there yet) must still be synced. Guards against the global
        // deduplication becoming too broad and silently dropping legitimate boreholes.
        using var syncContext = await TestSyncContext.BuildAsync(seedTestDataInSourceContext: true, seedTestDataInTargetContext: true);
        using var syncTask = new SyncBoreholesTask(syncContext, new Mock<ILogger<SyncBoreholesTask>>().Object, GetDefaultConfiguration());

        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;

        // Publish a source borehole that has profiles, then make it look brand new to the target: move it to a
        // location that matches no target borehole and give every profile a name_uuid that does not exist yet.
        var sourceBorehole = await syncContext.Source.Boreholes
            .Include(b => b.Profiles).Include(b => b.Workflow)
            .FirstAsync(b => b.Profiles.Any(), cancellationToken);
        sourceBorehole.SetBoreholeWorkflowStatus(WorkflowStatus.Published);
        sourceBorehole.LocationX = 1;
        sourceBorehole.LocationY = 1;
        sourceBorehole.LocationXLV03 = 1;
        sourceBorehole.LocationYLV03 = 1;
        foreach (var profile in sourceBorehole.Profiles)
        {
            profile.NameUuid = $"sync-negative-{profile.Id}";
        }

        await syncContext.Source.SaveChangesAsync(cancellationToken);

        var targetBoreholeCountBefore = await syncContext.Target.Boreholes.CountAsync(cancellationToken);

        await syncTask.ExecuteAndValidateAsync(cancellationToken);

        // The borehole is not a duplicate, so exactly one borehole must be added at the target.
        Assert.AreEqual(targetBoreholeCountBefore + 1, await syncContext.Target.Boreholes.CountAsync(cancellationToken));
        Assert.IsTrue(await syncContext.Target.Boreholes.AnyAsync(b => b.Name == sourceBorehole.Name, cancellationToken));
    }

    [TestMethod]
    public async Task SyncBoreholesForEmpty()
    {
        using var syncContext = await TestSyncContext.BuildAsync(seedTestDataInSourceContext: false);
        using var syncTask = new SyncBoreholesTask(syncContext, Mock.Of<ILogger<SyncBoreholesTask>>(), GetDefaultConfiguration());

        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;
        await syncTask.ExecuteAndValidateAsync(cancellationToken);

        // Get boreholes with workflow status 'reviewed' or 'published' from both sources.
        var (publishedSourceBoreholes, publishedTargetBoreholes) = GetPublishedBoreholes(syncContext.Source, syncContext.Target);

        // Expect an empty result set on both sources.
        Assert.AreEqual(0, publishedSourceBoreholes.Count());
        Assert.AreEqual(0, publishedTargetBoreholes.Count());
    }

    [TestMethod]
    public async Task SyncBoreholesForUndefinedDefaultWorkgroup()
    {
        using var syncContext = await TestSyncContext.BuildAsync(useInMemory: true);
        var noTargetWorkgroupConfiguration = CreateConfiguration(null, "Default", false);
        using var syncTask = new SyncBoreholesTask(syncContext, Mock.Of<ILogger<SyncBoreholesTask>>(), noTargetWorkgroupConfiguration);

        // Add a fake published borehole to the source context
        var publishedBorehole = new Borehole { Workflow = new Workflow { Status = WorkflowStatus.Published } };
        await syncContext.Source.Boreholes.AddAsync(publishedBorehole);
        await syncContext.Source.SaveChangesAsync();

        var exception = await Assert.ThrowsExactlyAsync<InvalidOperationException>(
            async () => await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token));

        StringAssert.Contains(exception.Message, "Environment variable <TARGET_DEFAULT_WORKGROUP_NAME> was not set.");
    }

    [TestMethod]
    public async Task SyncBoreholesForMissingDefaultWorkgroupInTargetDatabase()
    {
        using var syncContext = await TestSyncContext.BuildAsync(useInMemory: true);
        using var syncTask = new SyncBoreholesTask(syncContext, Mock.Of<ILogger<SyncBoreholesTask>>(), GetDefaultConfiguration());

        // Add a fake published borehole to the source context
        var publishedBorehole = new Borehole { Workflow = new Workflow { Status = WorkflowStatus.Published } };
        await syncContext.Source.Boreholes.AddAsync(publishedBorehole);
        await syncContext.Source.SaveChangesAsync();

        var exception = await Assert.ThrowsExactlyAsync<InvalidOperationException>(
            async () => await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token));

        StringAssert.Contains(exception.Message, "No suitable default workgroup was found at target database.");
        StringAssert.Contains(exception.Message, "Was looking for a workgroup named <Default>.");
    }

    [TestMethod]
    public async Task SyncBoreholesForUndefinedDefaultUser()
    {
        using var syncContext = await TestSyncContext.BuildAsync(useInMemory: true);
        var noTargetUserConfiguration = CreateConfiguration("SHARPHUNT", null, false);
        using var syncTask = new SyncBoreholesTask(syncContext, Mock.Of<ILogger<SyncBoreholesTask>>(), noTargetUserConfiguration);

        // Add a fake published borehole to the source context
        var publishedBorehole = new Borehole { Workflow = new Workflow { Status = WorkflowStatus.Published } };
        await syncContext.Source.Boreholes.AddAsync(publishedBorehole);
        await syncContext.Source.SaveChangesAsync();

        // Add a fake default workgroup to the target context
        var defaultWorkgroup = new Workgroup { Name = "SHARPHUNT" };
        await syncContext.Target.Workgroups.AddAsync(defaultWorkgroup);
        await syncContext.Target.SaveChangesAsync();

        var exception = await Assert.ThrowsExactlyAsync<InvalidOperationException>(
            async () => await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token));

        StringAssert.Contains(exception.Message, "Environment variable <TARGET_DEFAULT_USER_SUB> was not set.");
    }

    [TestMethod]
    public async Task SyncBoreholesForMissingDefaultUserInTargetDatabase()
    {
        using var syncContext = await TestSyncContext.BuildAsync(useInMemory: true);
        using var syncTask = new SyncBoreholesTask(syncContext, Mock.Of<ILogger<SyncBoreholesTask>>(), GetDefaultConfiguration());

        // Add a fake published borehole to the source context
        var publishedBorehole = new Borehole { Workflow = new Workflow { Status = WorkflowStatus.Published } };
        await syncContext.Source.Boreholes.AddAsync(publishedBorehole);
        await syncContext.Source.SaveChangesAsync();

        // Add a fake default workgroup to the target context
        var defaultWorkgroup = new Workgroup { Name = "Default" };
        await syncContext.Target.Workgroups.AddAsync(defaultWorkgroup);
        await syncContext.Target.SaveChangesAsync();

        var exception = await Assert.ThrowsExactlyAsync<InvalidOperationException>(
            async () => await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token));

        StringAssert.Contains(exception.Message, "No suitable default user was found at target database.");
        StringAssert.Contains(exception.Message, "Was looking for a user with sub id <sub_admin>.");
    }

    private static (IEnumerable<Borehole> SourceBoreholes, IEnumerable<Borehole> TargetBoreholes) GetPublishedBoreholes(
        BdmsContext sourceContext, BdmsContext targetContext)
    {
        return (
            sourceContext.BoreholesWithIncludes.AsNoTracking().WithStatusReviewedOrPublished(),
            targetContext.BoreholesWithIncludes.AsNoTracking().WithStatusReviewedOrPublished());
    }
}
