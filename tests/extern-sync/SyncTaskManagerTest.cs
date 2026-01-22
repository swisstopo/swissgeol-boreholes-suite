using Microsoft.Extensions.Logging;
using Moq;

namespace BDMS.ExternSync;

[TestClass]
public class SyncTaskManagerTest
{
    private List<Mock<ISyncTask>> syncTasks;

    [TestInitialize]
    public void Initialize()
    {
        syncTasks =
        [
            new Mock<ISyncTask>(MockBehavior.Strict),
            new Mock<ISyncTask>(MockBehavior.Strict),
            new Mock<ISyncTask>(MockBehavior.Strict)
        ];
    }

    [TestCleanup]
    public void Cleanup() => syncTasks.ForEach(t => t.VerifyAll());

    [TestMethod]
    public async Task ExecutesTasksInSequence()
    {
        var mockSequence = new MockSequence();
        syncTasks[0].InSequence(mockSequence).Setup(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        syncTasks[1].InSequence(mockSequence).Setup(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        syncTasks[2].InSequence(mockSequence).Setup(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        var syncTaskManager = new SyncTaskManager(syncTasks.Select(t => t.Object).ToList(), Mock.Of<ILogger<SyncTaskManager>>());
        await syncTaskManager.ExecuteTasksAsync(Mock.Of<CancellationTokenSource>().Token);

        syncTasks[0].Verify(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>()), Times.Once);
        syncTasks[1].Verify(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>()), Times.Once);
        syncTasks[2].Verify(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task StopsExecutingOnFailure()
    {
        var mockSequence = new MockSequence();
        syncTasks[0].InSequence(mockSequence).Setup(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        syncTasks[1].InSequence(mockSequence).Setup(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("BLACKTOLL SQUEAKY."));
        syncTasks[2].InSequence(mockSequence).Setup(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        var syncTaskManager = new SyncTaskManager(syncTasks.Select(t => t.Object).ToList(), Mock.Of<ILogger<SyncTaskManager>>());

        var exception = await Assert.ThrowsExactlyAsync<InvalidOperationException>(() =>
            syncTaskManager.ExecuteTasksAsync(Mock.Of<CancellationTokenSource>().Token));

        Assert.AreEqual("BLACKTOLL SQUEAKY.", exception.Message);

        syncTasks[0].Verify(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>()), Times.Once);
        syncTasks[1].Verify(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>()), Times.Once);
        syncTasks[2].Verify(t => t.ExecuteAndValidateAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
