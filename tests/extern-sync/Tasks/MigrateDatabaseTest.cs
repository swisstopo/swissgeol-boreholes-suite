using BDMS.ExternSync.Tasks;
using Microsoft.Extensions.Logging;
using Moq;

namespace BDMS.ExternSync.Test;

[TestClass]
public class MigrateDatabaseTest
{
    [TestMethod]
    public async Task MigrateDatabase()
    {
        using var syncContext = await SyncContext.BuildAsync().ConfigureAwait(false);
        using var syncTask = new MigrateDatabase(syncContext, new Mock<ILogger<MigrateDatabase>>().Object);

        await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token);
    }
}
