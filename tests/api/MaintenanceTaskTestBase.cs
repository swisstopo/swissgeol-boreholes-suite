using BDMS.Maintenance;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;

namespace BDMS;

/// <summary>
/// Abstract base class for maintenance task tests.
/// Provides shared setup for <see cref="MaintenanceTaskService"/> with a mock DI scope.
/// Subclasses control which services and tasks are registered via abstract methods.
/// </summary>
public abstract class MaintenanceTaskTestBase
{
    private Mock<ILogger<MaintenanceTaskService>> LoggerMock { get; set; }

    /// <summary>
    /// Gets the test database context.
    /// </summary>
    protected BdmsContext Context { get; private set; }

    /// <summary>
    /// Gets the database ID of the seeded admin user (<c>sub_admin</c>).
    /// </summary>
    protected int AdminUserId { get; private set; }

    /// <summary>
    /// Gets the mock HTTP client factory for simulating external API calls.
    /// </summary>
    protected Mock<IHttpClientFactory> HttpClientFactoryMock { get; private set; }

    /// <summary>
    /// Gets the maintenance task service under test.
    /// </summary>
    protected MaintenanceTaskService Service { get; private set; }

    /// <summary>
    /// Registers task-specific services (e.g. <see cref="LocationService"/>, <see cref="CoordinateService"/>)
    /// on the mock service provider. Called during <see cref="TestInitialize"/> so each subclass
    /// only wires up what its tasks actually need.
    /// </summary>
    protected virtual void ConfigureServices(Mock<IServiceProvider> serviceProviderMock)
    {
    }

    /// <summary>
    /// Returns the <see cref="IMaintenanceTask"/> implementations to register with the service.
    /// </summary>
    protected abstract IEnumerable<IMaintenanceTask> CreateMaintenanceTasks();

    [TestInitialize]
    public async Task TestInitialize()
    {
        Context = ContextFactory.GetTestContext();
        AdminUserId = Context.Users.Single(u => u.SubjectId == "sub_admin").Id;

        // Clear pre-existing logs
        Context.MaintenanceTaskLogs.RemoveRange(Context.MaintenanceTaskLogs);
        await Context.SaveChangesAsync();

        HttpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        LoggerMock = new Mock<ILogger<MaintenanceTaskService>>();

        // Wire up a fake DI scope so MaintenanceTaskService can resolve its dependencies at runtime.
        var serviceProviderMock = new Mock<IServiceProvider>();
        serviceProviderMock.Setup(sp => sp.GetService(typeof(BdmsContext))).Returns(Context);
        ConfigureServices(serviceProviderMock);

        var serviceScopeMock = new Mock<IServiceScope>();
        serviceScopeMock.Setup(s => s.ServiceProvider).Returns(serviceProviderMock.Object);

        var serviceScopeFactoryMock = new Mock<IServiceScopeFactory>();
        serviceScopeFactoryMock.Setup(f => f.CreateScope()).Returns(serviceScopeMock.Object);

        Service = new MaintenanceTaskService(LoggerMock.Object, serviceScopeFactoryMock.Object, CreateMaintenanceTasks());
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await Context.DisposeAsync();

        // Ensure all expected HTTP calls were actually made.
        HttpClientFactoryMock.Verify();
    }
}
