using BDMS.ExternSync.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using static BDMS.ExternSync.TestSyncContextHelpers;

namespace BDMS.ExternSync;

[TestClass]
public class CheckDatabaseStateTaskTest
{
    private TestSyncContext syncContext;

    [TestInitialize]
    public async Task Initialize() => syncContext = await TestSyncContext.BuildAsync();

    [TestCleanup]
    public void Cleanup() => syncContext.Dispose();

    [TestMethod]
    public async Task CheckDbSchemaVersionSucceedsForSameSchemaVersion()
    {
        // Get two database context with the same schema version
        using var syncTask = new CheckDatabaseStateTask(syncContext, new Mock<ILogger<CheckDatabaseStateTask>>().Object, GetDefaultConfiguration());

        await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token);
    }

    [TestMethod]
    public async Task CheckDbSchemaVersionFailsForDifferentSchemaVersion()
    {
        // Create a dummy migration and apply it to the target database
        var insertStatement = $"INSERT INTO bdms.\"__EFMigrationsHistory\"(\"MigrationId\", \"ProductVersion\") " +
            $"VALUES ('20990131060000_ENTOURAGEPOINT', '1.2.3');";

        await syncContext.Target.Database.ExecuteSqlRawAsync(insertStatement);
        using var syncTask = new CheckDatabaseStateTask(syncContext, new Mock<ILogger<CheckDatabaseStateTask>>().Object, GetDefaultConfiguration());

        var exception = await Assert.ThrowsExactlyAsync<InvalidOperationException>(
            async () => await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token));

        StringAssert.Contains(exception.Message, "Source and target databases have different schema versions.");
    }
}
