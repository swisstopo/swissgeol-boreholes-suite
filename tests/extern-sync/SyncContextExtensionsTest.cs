using BDMS.Models;
using Moq;
using static BDMS.ExternSync.TestSyncContextExtensions;

namespace BDMS.ExternSync;

[TestClass]
public class SyncContextExtensionsTest
{
    private static BdmsContext context;

    [ClassInitialize]
    public static async Task ClassInitialize(TestContext testContext)
        => context = await CreateDbContextAsync(useInMemory: false, seedTestData: true);

    [TestInitialize]
    public void TestInitialize()
        => context.Database.BeginTransaction();

    [TestCleanup]
    public void TestCleanup()
    {
        // Rollback the transaction and clear the ChangeTracker to keep the database clean
        // for each test. This is important because the context is shared between tests and
        // creating a new context for each test would be too slow (because of the seeding).
        context.Database.RollbackTransaction();
        context.ChangeTracker.Clear();
    }

    [TestMethod]
    public async Task GetBoreholesWithStatusReviewedOrPublished()
    {
        // Set the workflow status for some boreholes. By default all seeded boreholes
        // have the default workflow status 'draft'.
        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;
        await context.SetBoreholeStatusAsync(1_000_001, WorkflowStatus.Draft, cancellationToken);
        await context.SetBoreholeStatusAsync(1_000_020, WorkflowStatus.InReview, cancellationToken);

        await context.SetBoreholeStatusAsync(1_000_444, WorkflowStatus.Reviewed, cancellationToken);
        await context.SetBoreholeStatusAsync(1_000_300, WorkflowStatus.Reviewed, cancellationToken);
        await context.SetBoreholeStatusAsync(1_001_555, WorkflowStatus.Reviewed, cancellationToken);
        await context.SetBoreholeStatusAsync(1_000_666, WorkflowStatus.Published, cancellationToken);

        var boreholes = context.Boreholes.WithStatusReviewedOrPublished().ToList();

        Assert.AreEqual(4, boreholes.Count);
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_000_444));
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_000_300));
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_001_555));
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_000_666));
    }
}
