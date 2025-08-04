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
    public async Task GetWithPublicationStatusPublished()
    {
        // Set the publication status for some boreholes. By default all seeded boreholes have the publication status 'change in progress'.
        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;
        await context.SetBoreholeStatusAsync(1_000_001, 1, WorkflowStatus.Draft, cancellationToken);
        await context.SetBoreholeStatusAsync(1_000_020, 1, WorkflowStatus.InReview, cancellationToken);
        await context.SetBoreholeStatusAsync(1_000_444, 1, WorkflowStatus.Reviewed, cancellationToken);

        await context.SetBoreholeStatusAsync(1_000_300, 1, WorkflowStatus.Published, cancellationToken);
        await context.SetBoreholeStatusAsync(1_001_555, 1, WorkflowStatus.Published, cancellationToken);
        await context.SetBoreholeStatusAsync(1_000_666, 1, WorkflowStatus.Published, cancellationToken);

        var boreholes = context.Boreholes.WithStatusPublished().ToList();

        Assert.AreEqual(3, boreholes.Count);
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_000_300));
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_001_555));
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_000_666));
    }
}
