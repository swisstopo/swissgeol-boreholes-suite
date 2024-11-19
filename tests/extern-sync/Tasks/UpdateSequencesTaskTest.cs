using BDMS.ExternSync.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Npgsql;

namespace BDMS.ExternSync.Test;

[TestClass]
public class UpdateSequencesTaskTest
{
    [TestMethod]
    public async Task UpdateSequences()
    {
        using var syncContext = await SyncContext.BuildAsync().ConfigureAwait(false);
        using var syncTask = new UpdateSequencesTask(syncContext, new Mock<ILogger<UpdateSequencesTask>>().Object);

        var targetDbConnection = await syncContext.Target.GetDbConnectionAsync().ConfigureAwait(false);
        using var selectCommand = new NpgsqlCommand($"SELECT last_value FROM bdms.users_id_usr_seq;", targetDbConnection);

        Assert.AreEqual((long)8, await selectCommand.ExecuteScalarAsync());

        await syncTask.ExecuteAndValidateAsync(Mock.Of<CancellationTokenSource>().Token);

        Assert.AreEqual((long)20000, await selectCommand.ExecuteScalarAsync());
    }
}
