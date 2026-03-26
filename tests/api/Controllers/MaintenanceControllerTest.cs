using BDMS.Authentication;
using BDMS.Maintenance;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using System.Net;
using System.Net.Http.Json;

namespace BDMS.Controllers;

[TestClass]
public class MaintenanceControllerTest
{
    private static BdmsWebApplicationFactory factory;
    private MaintenanceController controller;
    private MaintenanceTaskService service;

    [ClassInitialize]
    public static void ClassInitialize(TestContext testContext) => factory = new BdmsWebApplicationFactory();

    [ClassCleanup(ClassCleanupBehavior.EndOfClass)]
    public static void ClassCleanup() => factory?.Dispose();

    [TestInitialize]
    public void TestInitialize()
    {
        var loggerMock = new Mock<ILogger<MaintenanceTaskService>>();

        var context = ContextFactory.GetTestContext();

        // Each scope must return its own DbContext (matching real DI behavior)
        // to avoid concurrent access when fire-and-forget tasks overlap with subsequent calls.
        var serviceScopeFactoryMock = new Mock<IServiceScopeFactory>();
        serviceScopeFactoryMock.Setup(f => f.CreateScope()).Returns(() =>
        {
            var scopeContext = ContextFactory.GetTestContext();
            var scopeProvider = new Mock<IServiceProvider>();
            scopeProvider.Setup(sp => sp.GetService(typeof(BdmsContext))).Returns(scopeContext);
            var scope = new Mock<IServiceScope>();
            scope.Setup(s => s.ServiceProvider).Returns(scopeProvider.Object);
            return scope.Object;
        });

        IEnumerable<IMaintenanceTask> tasks = [new LocationMigrationTask(), new CoordinateMigrationTask()];
        service = new MaintenanceTaskService(loggerMock.Object, serviceScopeFactoryMock.Object, tasks);
        controller = new MaintenanceController(context, service);
    }

    [TestMethod]
    public async Task GetStatusReturnsOkWithAllTaskStates()
    {
        controller.ControllerContext = Helpers.GetControllerContextAdmin();
        var result = await controller.GetStatusAsync().ConfigureAwait(false);
        var okResult = ActionResultAssert.IsOkObjectResult<IReadOnlyList<MaintenanceTaskState>>(result.Result);
        Assert.HasCount(2, okResult);
        Assert.IsTrue(okResult.All(r => r.Status == MaintenanceTaskStatus.Idle));
        Assert.IsTrue(okResult.All(r => r.AffectedCount == null));
    }

    [TestMethod]
    public async Task GetLogsReturnsOkWithPaginatedResponse()
    {
        controller.ControllerContext = Helpers.GetControllerContextAdmin();
        var result = await controller.GetLogsAsync().ConfigureAwait(false);
        var okResult = ActionResultAssert.IsOkObjectResult<PaginatedLogResponse>(result.Result);
        Assert.AreEqual(1, okResult.PageNumber);
        Assert.AreEqual(10, okResult.PageSize);
        Assert.IsTrue(okResult.TotalCount >= 0);
        Assert.IsTrue(okResult.LogEntries.Count <= 10);
    }

    [TestMethod]
    public async Task StartTaskReturnsAccepted()
    {
        controller.ControllerContext = Helpers.GetControllerContextAdmin();
        var result = await controller.StartTaskAsync(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters { OnlyMissing = true, DryRun = true }).ConfigureAwait(false);
        ActionResultAssert.IsAccepted(result);
    }

    [TestMethod]
    public async Task StartTaskReturnsConflictWhenAlreadyRunning()
    {
        controller.ControllerContext = Helpers.GetControllerContextAdmin();

        // Start the task once to put it in Running state.
        await controller.StartTaskAsync(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters { OnlyMissing = true, DryRun = true }).ConfigureAwait(false);

        // Attempt to start it again while it's still running.
        var result = await controller.StartTaskAsync(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters { OnlyMissing = true, DryRun = true }).ConfigureAwait(false);
        ActionResultAssert.IsConflict(result);
    }

    /// <summary>
    /// Authorization integration tests — verified through the real middleware pipeline.
    /// Non-admin users receive 403 Forbidden from <c>FallbackPolicy = PolicyNames.Admin</c> in <c>Program.cs</c>.
    /// </summary>
    [TestMethod]
    public async Task GetStatusReturnsForbiddenForNonAdmin()
    {
        using var client = CreateNonAdminClient();
        var response = await client.GetAsync("/api/v2/maintenance/status").ConfigureAwait(false);
        Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [TestMethod]
    public async Task GetLogsReturnsForbiddenForNonAdmin()
    {
        using var client = CreateNonAdminClient();
        var response = await client.GetAsync("/api/v2/maintenance/logs").ConfigureAwait(false);
        Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [TestMethod]
    public async Task StartTaskReturnsForbiddenForNonAdmin()
    {
        using var client = CreateNonAdminClient();
        var response = await client.PostAsJsonAsync(
            "/api/v2/maintenance/LocationMigration",
            new MaintenanceTaskParameters()).ConfigureAwait(false);
        Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [TestMethod]
    public async Task StartTaskReturnsBadRequestForInvalidTaskType()
    {
        using var client = CreateAdminClient();
        var response = await client.PostAsJsonAsync(
            "/api/v2/maintenance/InvalidTaskType",
            new MaintenanceTaskParameters()).ConfigureAwait(false);
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static HttpClient CreateAdminClient()
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.SubjectIdHeader, "sub_admin");
        client.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, PolicyNames.Admin);
        return client;
    }

    private static HttpClient CreateNonAdminClient()
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.SubjectIdHeader, "sub_editor");
        client.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, PolicyNames.Viewer);
        return client;
    }
}
