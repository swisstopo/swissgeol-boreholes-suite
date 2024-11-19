using BDMS.ExternSync.Tasks;
using Microsoft.Extensions.Logging;
using Moq;

namespace BDMS.ExternSync.Test;

[TestClass]
public class MigrateDatabaseTaskTest
{
    [TestMethod]
    public async Task MigrateDatabase()
    {
        using var syncContext = await SyncContext.BuildAsync().ConfigureAwait(false);
        using var syncTask = new SetupDatabaseTask(syncContext, new Mock<ILogger<SetupDatabaseTask>>().Object);

        await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token);
    }
}
