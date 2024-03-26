using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS.Controllers;

[TestClass]
public class UserControllerTest
{
    private BdmsContext context;

    [TestInitialize]
    public void TestInitialize() => context = ContextFactory.GetTestContext();

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAll()
    {
        var users = await new UserController(context).GetAll().ConfigureAwait(false);
        Assert.AreEqual(8, users.Count());

        foreach (var user in users)
        {
            Assert.AreEqual(user.SubjectId == "sub_deletableUser" || user.SubjectId == "sub_viewer", user.Deletable);
        }
    }
}
