﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class UserControllerTest
{
    private BdmsContext context;
    private UserController userController;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        userController = new UserController(context, new Mock<ILogger<UserController>>().Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAll()
    {
        var users = await userController.GetAll();
        Assert.AreEqual(8, users.Count());

        foreach (var user in users)
        {
            Assert.AreEqual(user.SubjectId == "sub_deletableUser" || user.SubjectId == "sub_viewer", user.Deletable);
        }
    }

    [TestMethod]
    public async Task GetSelf()
    {
        var user = await userController.GetSelf();
        Assert.IsNotNull(user);
        Assert.AreEqual("sub_admin", user.SubjectId);
        Assert.IsTrue(user.IsAdmin);
        Assert.IsFalse(user.Deletable);
        Assert.AreEqual(5, user.WorkgroupRoles.Count());
    }

    [TestMethod]
    public async Task GetUserById()
    {
        var user = await context.UsersWithIncludes.AsNoTracking().SingleOrDefaultAsync(u => u.SubjectId == "sub_editor");
        Assert.IsNotNull(user);

        var result = await userController.GetUserById(user.Id);
        ActionResultAssert.IsOk(result);

        var returnedUser = (result as OkObjectResult).Value as Models.User;
        Assert.AreEqual("e. user", returnedUser.Name);
        Assert.AreEqual("sub_editor", returnedUser.SubjectId);
        Assert.AreEqual("editor", returnedUser.FirstName);
        Assert.AreEqual("user", returnedUser.LastName);
        Assert.IsFalse(returnedUser.IsAdmin);
        Assert.IsFalse(returnedUser.IsDisabled);
        Assert.IsFalse(returnedUser.Deletable);
        Assert.AreEqual(1, returnedUser.WorkgroupRoles.Count());
        Assert.AreEqual(Models.Role.Editor, returnedUser.WorkgroupRoles.First().Role);
    }

    [TestMethod]
    public async Task GetUserByIdNotFound()
    {
        var result = await userController.GetUserById(0);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task EditUser()
    {
        var user = await context.UsersWithIncludes.AsNoTracking().SingleOrDefaultAsync(u => u.SubjectId == "sub_validator");
        Assert.IsNotNull(user);
        Assert.IsFalse(user.IsAdmin);
        Assert.IsFalse(user.IsDisabled);

        user.IsAdmin = true;
        user.DisabledAt = DateTime.UtcNow;
        user.FirstName = "Updated";

        var result = await userController.Edit(user);
        ActionResultAssert.IsOk(result);

        var updatedUser = (result as OkObjectResult).Value as Models.User;
        Assert.AreEqual(user.Id, updatedUser.Id);
        Assert.IsTrue(updatedUser.IsAdmin);
        Assert.IsTrue(updatedUser.IsDisabled);
        Assert.AreNotEqual("Updated", updatedUser.FirstName);
    }

    [TestMethod]
    public async Task EditUserNotFound()
    {
        var result = await userController.Edit(new Models.User { Id = 0 });
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task DeleteUser()
    {
        var user = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.SubjectId == "sub_deletableUser");
        Assert.IsNotNull(user);

        var result = await userController.Delete(user.Id);
        ActionResultAssert.IsOk(result);
    }

    [TestMethod]
    public async Task DeleteUserNotFound()
    {
        var result = await userController.Delete(0);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task DeleteUserNotDeletable()
    {
        var user = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.SubjectId == "sub_filesUser");
        Assert.IsNotNull(user);

        var result = await userController.Delete(user.Id);
        ActionResultAssert.IsInternalServerError(result, "The user is associated with boreholes, layers, stratigraphies, workflows, files or borehole files and cannot be deleted.");
    }
}
