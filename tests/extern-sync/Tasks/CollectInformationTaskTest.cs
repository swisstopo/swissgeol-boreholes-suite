using BDMS.ExternSync.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using static BDMS.ExternSync.TestSyncContextHelpers;

namespace BDMS.ExternSync;

[TestClass]
public class CollectInformationTaskTest
{
    [TestMethod]
    public async Task CollectInformation()
    {
        using var syncContext = await TestSyncContext.BuildAsync();
        using var syncTask = new CollectInformationTask(syncContext, new Mock<ILogger<CollectInformationTask>>().Object, GetDefaultConfiguration());

        await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token);
    }
}
