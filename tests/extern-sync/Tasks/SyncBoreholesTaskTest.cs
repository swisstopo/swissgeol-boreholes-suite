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
        await syncContext.Source.SetBoreholeStatusAsync(1_000_202, WorkflowStatus.InReview, cancellationToken);

        await syncContext.Source.SetBoreholeStatusAsync(1_001_404, WorkflowStatus.Reviewed, cancellationToken);
        await syncContext.Source.SetBoreholeStatusAsync(1_000_022, WorkflowStatus.Reviewed, cancellationToken);
        await syncContext.Source.SetBoreholeStatusAsync(1_000_099, WorkflowStatus.Reviewed, cancellationToken);
        await syncContext.Source.SetBoreholeStatusAsync(1_000_101, WorkflowStatus.Published, cancellationToken);

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
        Assert.AreEqual(8, originalBoreholes.SelectMany(b => b.Completions.Select(c => c.Casings)).Count());
        Assert.AreEqual(8, syncedBoreholes.SelectMany(b => b.Completions.Select(c => c.Casings)).Count());
        Assert.IsTrue(syncedBoreholes.ValidateCasingReferences());

        // Validate files. File details are already asserted by comparing serialized JSON output.
        Assert.AreEqual(2, originalBoreholes.SelectMany(b => b.BoreholeFiles ?? Array.Empty<BoreholeFile>()).Count());
        Assert.AreEqual(2, syncedBoreholes.SelectMany(b => b.BoreholeFiles ?? Array.Empty<BoreholeFile>()).Count());

        // Validate photos. Photo details are already asserted by comparing serialized JSON output.
        Assert.AreEqual(2, originalBoreholes.SelectMany(b => b.Photos ?? Array.Empty<Photo>()).Count());
        Assert.AreEqual(2, syncedBoreholes.SelectMany(b => b.Photos ?? Array.Empty<Photo>()).Count());

        // Validate log files. Log file details are already asserted by comparing serialized JSON output.
        Assert.AreEqual(51, originalBoreholes.SelectMany(b => b.LogRuns.SelectMany(lr => lr.LogFiles ?? Array.Empty<LogFile>())).Count());
        Assert.AreEqual(51, syncedBoreholes.SelectMany(b => b.LogRuns.SelectMany(lr => lr.LogFiles ?? Array.Empty<LogFile>())).Count());

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
