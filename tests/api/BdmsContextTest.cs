using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS;

[TestClass]
public class BdmsContextTest
{
    private BdmsContext context;

    [TestInitialize]
    public void TestInitialize() => context = ContextFactory.CreateContext();

    [TestCleanup]
    public void TestCleanup() => context.Dispose();

    [TestMethod]
    public void HasNoPendingModelChanges()
    {
        var hasPendingModelChanges = context.Database.HasPendingModelChanges();
        Assert.IsFalse(hasPendingModelChanges, "There are pending model changes.");
    }

    public void CanFetchUsersFromDatabase()
    {
        const int DefaultWorkgroupId = 1;

        var users = context.Users
            .Include(s => s.WorkgroupRoles)
            .AsQueryable();

        Assert.AreEqual(7, users.Count());

        var admin = users.Single(u => u.SubjectId == "sub_admin");
        Assert.AreEqual("sub_admin", admin.SubjectId);
        Assert.AreEqual(1, admin.Id);
        Assert.AreEqual(true, admin.IsAdmin);
        Assert.AreEqual(false, admin.IsDisabled);
        Assert.AreEqual(1, admin.WorkgroupRoles.Count());
        AssertWorkgroupRole(DefaultWorkgroupId, Role.Publisher, admin);

        var editor = users.Single(u => u.SubjectId == "sub_editor");
        Assert.AreEqual("sub_editor", editor.SubjectId);
        Assert.AreEqual(2, editor.Id);
        Assert.AreEqual(false, editor.IsAdmin);
        Assert.AreEqual(false, editor.IsDisabled);
        Assert.AreEqual(1, editor.WorkgroupRoles.Count());
        AssertWorkgroupRole(DefaultWorkgroupId, Role.Editor, editor);

        var controller = users.Single(u => u.SubjectId == "sub_controller");
        Assert.AreEqual("sub_controller", controller.SubjectId);
        Assert.AreEqual(3, controller.Id);
        Assert.AreEqual(false, controller.IsAdmin);
        Assert.AreEqual(false, controller.IsDisabled);
        Assert.AreEqual(1, controller.WorkgroupRoles.Count());
        AssertWorkgroupRole(DefaultWorkgroupId, Role.Controller, controller);

        var publisher = users.Single(u => u.SubjectId == "sub_publisher");
        Assert.AreEqual("sub_publisher", publisher.SubjectId);
        Assert.AreEqual(5, publisher.Id);
        Assert.AreEqual(false, publisher.IsAdmin);
        Assert.AreEqual(false, publisher.IsDisabled);
        Assert.AreEqual(1, publisher.WorkgroupRoles.Count());
        AssertWorkgroupRole(DefaultWorkgroupId, Role.Publisher, publisher);
    }

    private static void AssertWorkgroupRole(int workgroupId, Role role, User user) =>
        Assert.IsNotNull(user.WorkgroupRoles.SingleOrDefault(w => w.WorkgroupId == workgroupId && w.Role == role));
}
