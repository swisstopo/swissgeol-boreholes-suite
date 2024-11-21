using BDMS.ExternSync.Tasks;
using Microsoft.Extensions.Logging;
using Moq;

namespace BDMS.ExternSync;

[TestClass]
public class CollectInformationTaskTest
{
    [TestMethod]
    public async Task CollectInformation()
    {
        using var syncContext = await TestSyncContext.BuildAsync().ConfigureAwait(false);
        using var syncTask = new CollectInformationTask(syncContext, new Mock<ILogger<CollectInformationTask>>().Object);

        await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token);
    }
}
