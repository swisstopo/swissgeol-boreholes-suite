using BDMS.Models;
using Moq;
using static BDMS.ExternSync.TestSyncContextExtensions;

namespace BDMS.ExternSync;

[TestClass]
public class SyncContextExtensionsTest
{
    [TestMethod]
    public async Task SetBorholePublicationStatusAsync()
    {
        using var context = await CreateDbContextAsync(useInMemory: false, seedTestData: true);
        AssertBoreholePublicationStatus(await SetBoreholePublicationStatusAsync(context, Role.Editor), Role.Editor);
        AssertBoreholePublicationStatus(await SetBoreholePublicationStatusAsync(context, Role.Controller), Role.Controller);
        AssertBoreholePublicationStatus(await SetBoreholePublicationStatusAsync(context, Role.Validator), Role.Validator);
        AssertBoreholePublicationStatus(await SetBoreholePublicationStatusAsync(context, Role.Publisher), Role.Publisher);
    }

    [TestMethod]
    public void SetBorholePublicationStatusForInvalid()
    {
        var exception = Assert.ThrowsException<InvalidOperationException>(
            () => Mock.Of<Borehole>().SetBorholePublicationStatus(Mock.Of<User>(), Role.View));

        StringAssert.Contains(exception.Message, "no supported boreholes publication state");
    }

    [TestMethod]
    public async Task GetWithPublicationStatusPublished()
    {
        using var context = await CreateDbContextAsync(useInMemory: false, seedTestData: true);

        // Set the publication status for some boreholes. By default all seeded
        // boreholes have the publication status 'change in progress'.
        var cancellationToken = Mock.Of<CancellationTokenSource>().Token;
        await context.SetBorholePublicationStatusAsync(1000001, 1, Role.Editor, cancellationToken);
        await context.SetBorholePublicationStatusAsync(1000002, 1, Role.Controller, cancellationToken);
        await context.SetBorholePublicationStatusAsync(1000003, 1, Role.Publisher, cancellationToken);
        await context.SetBorholePublicationStatusAsync(1000004, 1, Role.Validator, cancellationToken);
        await context.SetBorholePublicationStatusAsync(1000005, 1, Role.Publisher, cancellationToken);
        await context.SetBorholePublicationStatusAsync(1000006, 1, Role.Publisher, cancellationToken);

        var boreholes = context.Boreholes.GetWithPublicationStatusPublished().ToList();

        Assert.AreEqual(3, boreholes.Count);
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1000003));
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1000005));
        Assert.IsNotNull(boreholes.SingleOrDefault(b => b.Id == 1000006));
    }

    private static async Task<Borehole> SetBoreholePublicationStatusAsync(BdmsContext context, Role status) =>
        await context.SetBorholePublicationStatusAsync(1000010, 1, status, Mock.Of<CancellationTokenSource>().Token);

    private static void AssertBoreholePublicationStatus(Borehole borehole, Role expectedStatus)
    {
        // Please note that there are different patterns regarding the last workflow entry
        // depending on the borehole publication state.
        var expectedWorkflowCount = expectedStatus == Role.Publisher ? (int)expectedStatus : (int)expectedStatus + 1;
        Assert.AreEqual(expectedWorkflowCount, borehole.Workflows.Count);

        var lastWorkflow = borehole.Workflows.OrderByDescending(x => x.Id).First();
        Assert.AreEqual(1, lastWorkflow.User.Id);
        Assert.AreEqual(1000010, lastWorkflow.Borehole.Id);

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
        Assert.AreEqual(1, secondLastWorkflow.User.Id);
        Assert.AreEqual(1000010, secondLastWorkflow.Borehole.Id);

        if (expectedStatus != Role.Publisher)
        {
            Assert.AreEqual(expectedStatus, secondLastWorkflow.Role);
            Assert.AreNotEqual(null, secondLastWorkflow.Started);
            Assert.AreNotEqual(null, secondLastWorkflow.Finished);
        }
    }
}
