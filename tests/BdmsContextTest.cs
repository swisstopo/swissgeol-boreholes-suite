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
    public void CanFetchUsersFromDatabase()
    {
        var users = context.Users
            .Include(s => s.WorkgroupRoles).ThenInclude(s => s.Workgroup)
            .AsQueryable();

        Assert.AreEqual(7, users.Count());

        var admin = users.Single(u => u.Name == "admin");
        Assert.AreEqual("admin", admin.Name);
        Assert.AreEqual(1, admin.Id);
        Assert.AreEqual(true, admin.IsAdmin);
        Assert.AreEqual(true, admin.IsViewer);
        Assert.AreEqual(false, admin.IsDisabled);
        Assert.AreEqual(5, admin.WorkgroupRoles.Count());
        AssertWorkgroupRole("Default", Role.View, admin);
        AssertWorkgroupRole("Default", Role.Editor, admin);
        AssertWorkgroupRole("Default", Role.Controller, admin);
        AssertWorkgroupRole("Default", Role.Validator, admin);
        AssertWorkgroupRole("Default", Role.Publisher, admin);

        var editor = users.Single(u => u.Name == "editor");
        Assert.AreEqual("editor", editor.Name);
        Assert.AreEqual(2, editor.Id);
        Assert.AreEqual(false, editor.IsAdmin);
        Assert.AreEqual(true, editor.IsViewer);
        Assert.AreEqual(false, editor.IsDisabled);
        Assert.AreEqual(1, editor.WorkgroupRoles.Count());
        AssertWorkgroupRole("Default", Role.Editor, editor);

        var controller = users.Single(u => u.Name == "controller");
        Assert.AreEqual("controller", controller.Name);
        Assert.AreEqual(3, controller.Id);
        Assert.AreEqual(false, controller.IsAdmin);
        Assert.AreEqual(true, controller.IsViewer);
        Assert.AreEqual(false, controller.IsDisabled);
        Assert.AreEqual(1, controller.WorkgroupRoles.Count());
        AssertWorkgroupRole("Default", Role.Controller, controller);

        var validator = users.Single(u => u.Name == "validator");
        Assert.AreEqual("validator", validator.Name);
        Assert.AreEqual(4, validator.Id);
        Assert.AreEqual(false, validator.IsAdmin);
        Assert.AreEqual(true, validator.IsViewer);
        Assert.AreEqual(false, validator.IsDisabled);
        Assert.AreEqual(1, validator.WorkgroupRoles.Count());
        AssertWorkgroupRole("Default", Role.Validator, validator);

        var publisher = users.Single(u => u.Name == "publisher");
        Assert.AreEqual("publisher", publisher.Name);
        Assert.AreEqual(5, publisher.Id);
        Assert.AreEqual(false, publisher.IsAdmin);
        Assert.AreEqual(true, publisher.IsViewer);
        Assert.AreEqual(false, publisher.IsDisabled);
        Assert.AreEqual(1, publisher.WorkgroupRoles.Count());
        AssertWorkgroupRole("Default", Role.Publisher, publisher);
    }

    private static void AssertWorkgroupRole(string workgroupName, Role role, User user) =>
        Assert.IsNotNull(user.WorkgroupRoles.SingleOrDefault(w => w.Workgroup.Name == workgroupName && w.Role == role));
}
