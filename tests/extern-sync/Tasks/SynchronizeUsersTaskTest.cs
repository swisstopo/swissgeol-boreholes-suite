using BDMS.ExternSync.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace BDMS.ExternSync;

[TestClass]
public class SynchronizeUsersTaskTest
{
    [TestMethod]
    public async Task SynchronizeUsers()
    {
        using var syncContext = await TestSyncContext.BuildAsync(useInMemory: true).ConfigureAwait(false);
        using var syncTask = new SynchronizeUsersTask(syncContext, Mock.Of<ILogger<SynchronizeUsersTask>>());

        await syncContext.SeedUserTestDataAsync().ConfigureAwait(false);
        var (source, target) = (syncContext.Source, syncContext.Target);

        Assert.AreNotEqual(source.Users.CountAsync().Result, target.Users.CountAsync().Result);
        Assert.AreEqual(4, await source.Users.CountAsync());
        Assert.AreEqual(1, await target.Users.CountAsync());

        await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token);

        Assert.AreEqual(source.Users.CountAsync().Result, target.Users.CountAsync().Result);
        Assert.AreEqual(4, await source.Users.CountAsync());
        Assert.AreEqual(4, await target.Users.CountAsync());
    }
}
