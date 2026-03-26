using BDMS.Maintenance;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;

namespace BDMS;

[TestClass]
public class MaintenanceTaskServiceTest : MaintenanceTaskTestBase
{
    /// <inheritdoc/>
    protected override void ConfigureServices(Mock<IServiceProvider> serviceProviderMock)
    {
        // Infrastructure tests use LocationMigration as their vehicle, so only LocationService is needed.
        var loggerMock = new Mock<ILogger<LocationService>>();
        var locationService = new LocationService(loggerMock.Object, HttpClientFactoryMock.Object);
        serviceProviderMock.Setup(sp => sp.GetService(typeof(LocationService))).Returns(locationService);
    }

    /// <inheritdoc/>
    protected override IEnumerable<IMaintenanceTask> CreateMaintenanceTasks()
        => [new LocationMigrationTask(), new CoordinateMigrationTask()];

    [TestMethod]
    public async Task GetStatusReturnsAllTaskStates()
    {
        var status = await Service.GetTaskStatesAsync().ConfigureAwait(false);
        Assert.HasCount(2, status);
        Assert.IsTrue(status.Any(s => s.Type == MaintenanceTaskType.LocationMigration && s.Status == MaintenanceTaskStatus.Idle));
        Assert.IsTrue(status.Any(s => s.Type == MaintenanceTaskType.CoordinateMigration && s.Status == MaintenanceTaskStatus.Idle));
    }

    [TestMethod]
    public async Task StartTaskSetsRunningThenCompleted()
    {
        SetupSuccessfulHttpMock();

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters(), AdminUserId));
        Assert.IsTrue(Service.IsTaskRunning(MaintenanceTaskType.LocationMigration));

        var runningState = (await Service.GetTaskStatesAsync().ConfigureAwait(false)).Single(s => s.Type == MaintenanceTaskType.LocationMigration);
        Assert.IsNotNull(runningState.StartedAt);

        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);

        var completedState = (await Service.GetTaskStatesAsync().ConfigureAwait(false)).Single(s => s.Type == MaintenanceTaskType.LocationMigration);
        Assert.AreEqual(MaintenanceTaskStatus.Completed, completedState.Status);
        Assert.IsNotNull(completedState.AffectedCount);
        Assert.IsNull(completedState.Message);
        Assert.IsNotNull(completedState.CompletedAt);
    }

    [TestMethod]
    public async Task StartTaskSetsFailedOnError()
    {
        HttpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(() =>
        {
            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new HttpRequestException("Simulated failure"));
            return new HttpClient(handler.Object);
        });

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters(), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);

        var status = await Service.GetTaskStatesAsync().ConfigureAwait(false);
        var taskState = status.Single(s => s.Type == MaintenanceTaskType.LocationMigration);
        Assert.AreEqual(MaintenanceTaskStatus.Failed, taskState.Status);
        Assert.IsNull(taskState.AffectedCount);
        Assert.IsNotNull(taskState.Message);
        Assert.Contains("Simulated failure", taskState.Message);
    }

    [TestMethod]
    public async Task PersistsLogEntryOnCompletion()
    {
        SetupSuccessfulHttpMock();

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters(), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);

        var logEntry = Context.MaintenanceTaskLogs
            .Single(l => l.TaskType == MaintenanceTaskType.LocationMigration);
        Assert.AreEqual(MaintenanceTaskStatus.Completed, logEntry.Status);
        Assert.IsNotNull(logEntry.AffectedCount);
        Assert.IsNull(logEntry.Message);
        Assert.IsNotNull(logEntry.Parameters);
        Assert.IsTrue(logEntry.IsDryRun);
        Assert.IsTrue(logEntry.OnlyMissing);
    }

    [TestMethod]
    public async Task PersistsLogEntryOnFailure()
    {
        HttpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(() =>
        {
            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new HttpRequestException("Simulated failure"));
            return new HttpClient(handler.Object);
        });

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters(), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);

        var logEntry = Context.MaintenanceTaskLogs
            .Single(l => l.TaskType == MaintenanceTaskType.LocationMigration);
        Assert.AreEqual(MaintenanceTaskStatus.Failed, logEntry.Status);
        Assert.IsNull(logEntry.AffectedCount);
        Assert.IsNotNull(logEntry.Message);
        Assert.Contains("Simulated failure", logEntry.Message);
    }

    [TestMethod]
    public async Task PersistsStartedByOnCompletion()
    {
        SetupSuccessfulHttpMock();

        var adminUser = Context.Users.Single(u => u.Id == AdminUserId);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters(), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);

        var logEntry = Context.MaintenanceTaskLogs
            .Single(l => l.TaskType == MaintenanceTaskType.LocationMigration);
        Assert.AreEqual(AdminUserId, logEntry.StartedById);

        var result = await Service.GetPaginatedLogEntriesAsync(1, 10, true).ConfigureAwait(false);
        var entry = result.LogEntries.Single(e => e.TaskType == MaintenanceTaskType.LocationMigration);
        Assert.AreEqual($"{adminUser.FirstName} {adminUser.LastName}", entry.StartedByName);
    }

    [TestMethod]
    public async Task GetPaginatedLogEntriesReturnsPaginatedResults()
    {
        SetupSuccessfulHttpMock();

        // Run location migration three times.
        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters(), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);
        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters { OnlyMissing = true, DryRun = false }, AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);
        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters { OnlyMissing = true, DryRun = true }, AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);

        // First page with size 2 should return 2 entries.
        var page1 = await Service.GetPaginatedLogEntriesAsync(1, 2, true).ConfigureAwait(false);
        Assert.AreEqual(3, page1.TotalCount);
        Assert.AreEqual(1, page1.PageNumber);
        Assert.AreEqual(2, page1.PageSize);
        Assert.HasCount(2, page1.LogEntries);

        // Second page should return 1 entry.
        var page2 = await Service.GetPaginatedLogEntriesAsync(2, 2, true).ConfigureAwait(false);
        Assert.AreEqual(3, page2.TotalCount);
        Assert.HasCount(1, page2.LogEntries);

        // Most recent entry (first on page 1) should be the third run (dryRun=true, onlyMissing=true).
        var latest = page1.LogEntries.First();
        Assert.IsTrue(latest.IsDryRun);
        Assert.IsTrue(latest.OnlyMissing);
    }

    [TestMethod]
    public async Task GetPaginatedLogEntriesFiltersDryRunEntries()
    {
        SetupSuccessfulHttpMock();

        // Run with dryRun=true, then dryRun=false.
        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters { DryRun = true }, AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);
        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters { DryRun = false }, AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);

        // With includeDryRun=true, both entries should be returned.
        var allEntries = await Service.GetPaginatedLogEntriesAsync(1, 10, true).ConfigureAwait(false);
        Assert.AreEqual(2, allEntries.TotalCount);

        // With includeDryRun=false, only the non-dry-run entry should be returned.
        var filtered = await Service.GetPaginatedLogEntriesAsync(1, 10, false).ConfigureAwait(false);
        Assert.AreEqual(1, filtered.TotalCount);
        Assert.HasCount(1, filtered.LogEntries);
        Assert.IsFalse(filtered.LogEntries.Single().IsDryRun);
    }

    /// <summary>
    /// Sets up a minimal successful HTTP mock so that a task can complete.
    /// Used by infrastructure tests that need any task to run to completion.
    /// </summary>
    private void SetupSuccessfulHttpMock()
    {
        var jsonResponse = () => JsonContent.Create(new
        {
            results = new[]
            {
                new { layerBodId = "ch.swisstopo.swissboundaries3d-land-flaeche.fill", attributes = new { bez = "STELLARFALCON", name = string.Empty, gemname = string.Empty } },
                new { layerBodId = "ch.swisstopo.swissboundaries3d-kanton-flaeche.fill", attributes = new { bez = string.Empty, name = "IRONORACLE", gemname = string.Empty } },
                new { layerBodId = "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill", attributes = new { bez = string.Empty, name = string.Empty, gemname = "QUANTUMSTEED" } },
            },
        });

        HttpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(() =>
        {
            var httpMessageHandler = new Mock<HttpMessageHandler>();
            httpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(m => Regex.IsMatch(m.RequestUri!.AbsoluteUri, "\\d{1,}\\.?\\d*,\\d{1,}\\.?\\d*.*&sr=\\d{4,}$")),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK) { Content = jsonResponse() })
                .Verifiable();
            return new HttpClient(httpMessageHandler.Object);
        }).Verifiable();
    }
}
