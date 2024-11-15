using BDMS.ExternSync.Tasks;
using Microsoft.Extensions.Logging;
using Moq;

namespace BDMS.ExternSync.Test;

[TestClass]
public class CollectInformationTest
{
    [TestMethod]
    public async Task CollectInformation()
    {
        using var syncContext = await SyncContext.BuildAsync().ConfigureAwait(false);
        using var syncTask = new CollectInformation(syncContext, new Mock<ILogger<CollectInformation>>().Object);

        await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token);
    }
}
