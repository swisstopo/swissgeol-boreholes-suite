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
    public async Task SetBoreholePublicationStatusAsync()
    {
        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;
        var borehole = context.Boreholes.Single(b => b.Id == 1_000_010);
        var user = context.Users.Single(u => u.Id == 1);

        async Task<Borehole> SetBoreholePublicationStatusAsync(Role status) =>
            await context.SetBoreholePublicationStatusAsync(borehole.Id, user.Id, status, cancellationToken);

        AssertBoreholePublicationStatus(await SetBoreholePublicationStatusAsync(Role.Editor), Role.Editor, user);
        AssertBoreholePublicationStatus(await SetBoreholePublicationStatusAsync(Role.Controller), Role.Controller, user);
        AssertBoreholePublicationStatus(await SetBoreholePublicationStatusAsync(Role.Validator), Role.Validator, user);
        AssertBoreholePublicationStatus(await SetBoreholePublicationStatusAsync(Role.Publisher), Role.Publisher, user);
    }

    [TestMethod]
    public void SetBoreholePublicationStatusForInvalid()
    {
        var exception = Assert.ThrowsException<NotSupportedException>(
            () => Mock.Of<Borehole>().SetBoreholePublicationStatus(Role.View));

        Assert.AreEqual("The given status <View> is not supported.", exception.Message);
    }

    [TestMethod]
    public void SetBoreholePublicationStatusForNull()
    {
        var exception = Assert.ThrowsException<ArgumentNullException>(
            () => (default(Borehole)!).SetBoreholePublicationStatus(Role.Publisher));

        Assert.AreEqual("Value cannot be null. (Parameter 'borehole')", exception.Message);
    }

    [TestMethod]
    public async Task GetWithPublicationStatusPublished()
    {
        // Set the publication status for some boreholes. By default all seeded boreholes have the publication status 'change in progress'.
        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;
        await context.SetBoreholePublicationStatusAsync(1_000_001, 1, Role.Editor, cancellationToken);
        await context.SetBoreholePublicationStatusAsync(1_000_020, 1, Role.Controller, cancellationToken);
        await context.SetBoreholePublicationStatusAsync(1_000_444, 1, Role.Validator, cancellationToken);

        await context.SetBoreholePublicationStatusAsync(1_000_300, 1, Role.Publisher, cancellationToken);
        await context.SetBoreholePublicationStatusAsync(1_001_555, 1, Role.Publisher, cancellationToken);
        await context.SetBoreholePublicationStatusAsync(1_000_666, 1, Role.Publisher, cancellationToken);

        var boreholes = context.Boreholes.WithPublicationStatusPublished().ToList();

        Assert.AreEqual(3, boreholes.Count);
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_000_300));
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_001_555));
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1_000_666));
    }

    [TestMethod]
    public void IsPublicationStatusPublished()
    {
        var boreholePublished = new Borehole
        {
            Workflows =
            {
                new Workflow { Id = 1, Role = Role.Editor, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 2, Role = Role.Controller, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 3, Role = Role.Validator, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 4, Role = Role.Publisher, Started = default(DateTime), Finished = default(DateTime) },
            },
        };

        var boreholePublishedAndReset = new Borehole
        {
            Workflows =
            {
                new Workflow { Id = 1, Role = Role.Editor, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 2, Role = Role.Controller, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 3, Role = Role.Validator, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 4, Role = Role.Publisher, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 5, Role = Role.Editor, Started = default(DateTime), Finished = null },
            },
        };

        var boreholeNotYetPublished = new Borehole
        {
            Workflows =
            {
                new Workflow { Id = 1, Role = Role.Editor, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 2, Role = Role.Controller, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 3, Role = Role.Validator, Started = default(DateTime), Finished = default(DateTime) },
                new Workflow { Id = 4, Role = Role.Publisher, Started = default(DateTime), Finished = null },
            },
        };

        Assert.IsTrue(boreholePublished.IsPublicationStatusPublished());

        Assert.IsFalse(boreholePublishedAndReset.IsPublicationStatusPublished());
        Assert.IsFalse(boreholeNotYetPublished.IsPublicationStatusPublished());
    }

    [TestMethod]
    public void RemoveDuplicates()
    {
        var boreholeOriginal = new Borehole { TotalDepth = 1, LocationX = 15.14, LocationY = 15.14, LocationXLV03 = 15.14, LocationYLV03 = 15.14 };
        var boreholeDuplicate = new Borehole { TotalDepth = 1, LocationX = 15.14, LocationY = 15.14, LocationXLV03 = 15.14, LocationYLV03 = 15.14 };
        var boreholeDifferent = new Borehole { TotalDepth = 2, LocationX = 20.21, LocationY = 20.21, LocationXLV03 = 20.21, LocationYLV03 = 20.21 };

        var deduplicated = new[] { boreholeDuplicate, boreholeDifferent }.RemoveDuplicates([boreholeOriginal]).ToList();
        var expected = new[] { boreholeDifferent };

        CollectionAssert.AreEquivalent(expected, deduplicated);
    }

    [TestMethod]
    public void RemoveDuplicatesForIdentical()
    {
        var boreholeOriginal = new Borehole { TotalDepth = 1, LocationX = 15.14, LocationY = 15.14, LocationXLV03 = 15.14, LocationYLV03 = 15.14 };
        var boreholeDuplicate = new Borehole { TotalDepth = 1, LocationX = 15.14, LocationY = 15.14, LocationXLV03 = 15.14, LocationYLV03 = 15.14 };

        var deduplicated = new[] { boreholeDuplicate }.RemoveDuplicates([boreholeOriginal]).ToList();

        CollectionAssert.AreEquivalent(Enumerable.Empty<Borehole>().ToList(), deduplicated);
    }

    [TestMethod]
    public void RemoveDuplicatesForEmpty() =>
        CollectionAssert.AreEquivalent(Enumerable.Empty<Borehole>().ToList(), Enumerable.Empty<Borehole>().RemoveDuplicates([]).ToList());

    private static void AssertBoreholePublicationStatus(Borehole borehole, Role expectedStatus, User expectedUser)
    {
        // Please note that there are different patterns regarding the last workflow entry depending on
        // the boreholes publication state.
        var expectedWorkflowCount = expectedStatus == Role.Publisher ? (int)expectedStatus : (int)expectedStatus + 1;
        Assert.AreEqual(expectedWorkflowCount, borehole.Workflows.Count);

        var lastWorkflow = borehole.Workflows.OrderByDescending(x => x.Id).First();
        Assert.AreEqual(expectedUser.Id, lastWorkflow.User.Id);
        Assert.AreEqual(expectedUser.Id, lastWorkflow.UserId);
        Assert.AreEqual(borehole.Id, lastWorkflow.Borehole.Id);

        if (expectedStatus != Role.Publisher)
        {
            Assert.AreEqual((Role)(int)expectedStatus + 1, lastWorkflow.Role);
            Assert.AreEqual(null, lastWorkflow.Started);
            Assert.AreEqual(null, lastWorkflow.Finished);
        }
        else
        {
            Assert.AreEqual(expectedStatus, lastWorkflow.Role);
            Assert.AreNotEqual(null, lastWorkflow.Started);
            Assert.AreNotEqual(null, lastWorkflow.Finished);
        }

        var secondLastWorkflow = borehole.Workflows.OrderByDescending(x => x.Id).ElementAt(1);
        Assert.AreEqual(expectedUser.Id, secondLastWorkflow.User.Id);
        Assert.AreEqual(expectedUser.Id, secondLastWorkflow.UserId);
        Assert.AreEqual(borehole.Id, secondLastWorkflow.Borehole.Id);

        if (expectedStatus != Role.Publisher)
        {
            Assert.AreEqual(expectedStatus, secondLastWorkflow.Role);
            Assert.AreNotEqual(null, secondLastWorkflow.Started);
            Assert.AreNotEqual(null, secondLastWorkflow.Finished);
        }
    }
}
