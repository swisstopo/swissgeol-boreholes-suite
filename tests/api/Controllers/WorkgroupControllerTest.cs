using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class WorkgroupControllerTest
{
    private BdmsContext context;
    private WorkgroupController workgroupController;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        workgroupController = new WorkgroupController(context, new Mock<ILogger<WorkgroupController>>().Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAll()
    {
        var workgroups = await workgroupController.GetAll();
        Assert.AreEqual(6, workgroups.Count());
    }

    [TestMethod]
    public async Task CreateWorkgroup()
    {
        var workgroup = new Models.Workgroup { Name = "New Workgroup" };
        var result = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(result);

        var createdWorkgroup = (result as OkObjectResult).Value as Models.Workgroup;
        Assert.AreEqual(workgroup.Name, createdWorkgroup.Name);
        Assert.IsNotNull(createdWorkgroup.CreatedAt);
        Assert.IsFalse(createdWorkgroup.IsDisabled);
        Assert.AreEqual("{}", createdWorkgroup.Settings);
    }

    [TestMethod]
    public async Task EditWorkgroup()
    {
        var workgroup = new Models.Workgroup { Name = "New Workgroup" };
        var createResult = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(createResult);
        var createdWorkgroup = (createResult as OkObjectResult).Value as Models.Workgroup;

        await context.Boreholes.AddAsync(new Models.Borehole { WorkgroupId = createdWorkgroup.Id });
        await context.SaveChangesAsync();

        var workgroupToEdit = await context.WorkgroupsWithIncludes.AsNoTracking().SingleOrDefaultAsync(u => u.Id == createdWorkgroup.Id);
        Assert.AreEqual("New Workgroup", workgroupToEdit.Name);
        Assert.IsFalse(workgroupToEdit.IsDisabled);
        Assert.AreEqual(1, workgroupToEdit.BoreholeCount);

        workgroupToEdit.Name = "Updated Workgroup";
        workgroupToEdit.DisabledAt = DateTime.UtcNow;
        workgroupToEdit.Boreholes.Clear();

        var result = await workgroupController.Edit(workgroupToEdit);
        ActionResultAssert.IsOk(result);
        var updatedWorkgroup = (result as OkObjectResult).Value as Models.Workgroup;

        Assert.AreEqual(createdWorkgroup.Id, updatedWorkgroup.Id);
        Assert.AreEqual("Updated Workgroup", updatedWorkgroup.Name);
        Assert.IsTrue(updatedWorkgroup.IsDisabled);
        Assert.AreEqual(1, updatedWorkgroup.BoreholeCount);
    }

    [TestMethod]
    public async Task EditWorkgroupNotFound()
    {
        var result = await workgroupController.Edit(new Models.Workgroup { Id = 0 });
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task DeleteWorkgroup()
    {
        var workgroup = new Models.Workgroup { Name = "New Workgroup" };
        var createResult = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(createResult);
        var createdWorkgroup = (createResult as OkObjectResult).Value as Models.Workgroup;

        var deleteResult = await workgroupController.Delete(createdWorkgroup.Id);
        ActionResultAssert.IsOk(deleteResult);

        var workgroupExists = await context.Workgroups.AsNoTracking().AnyAsync(u => u.Id == createdWorkgroup.Id);
        Assert.IsFalse(workgroupExists);
    }

    [TestMethod]
    public async Task DeleteWorkgroupNotFound()
    {
        var result = await workgroupController.Delete(0);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task DeleteWorkgroupNotDeletable()
    {
        var workgroup = await context.WorkgroupsWithIncludes.AsNoTracking().SingleOrDefaultAsync(u => u.Id == 1);
        Assert.IsNotNull(workgroup);

        var result = await workgroupController.Delete(workgroup.Id);
        ActionResultAssert.IsInternalServerError(result, "The workgroup is associated with boreholes and cannot be deleted.");
    }

    [TestMethod]
    public async Task SetRole()
    {
        var user = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.FirstName == "editor");
        var workgroup = new Models.Workgroup { Name = "WINDDESPERADO" };
        var createResult = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(createResult);
        var createdWorkgroup = (createResult as OkObjectResult).Value as Models.Workgroup;

        // Set role for user
        var setRoleResult = await workgroupController.SetRole(
            new Models.UserWorkgroupRole()
            {
                UserId = user.Id,
                WorkgroupId = createdWorkgroup.Id,
                Role = Models.Role.Editor,
                IsActive = true,
            });
        ActionResultAssert.IsOk(setRoleResult);
        var userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(1, userWorkgroupRoles.Count);
        Assert.AreEqual(Models.Role.Editor, userWorkgroupRoles[0].Role);

        // Cannot set the same role twice
        setRoleResult = await workgroupController.SetRole(
            new Models.UserWorkgroupRole()
            {
                UserId = user.Id,
                WorkgroupId = createdWorkgroup.Id,
                Role = Models.Role.Editor,
                IsActive = true,
            });
        ActionResultAssert.IsOk(setRoleResult);
        userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(1, userWorkgroupRoles.Count);
        Assert.AreEqual(Models.Role.Editor, userWorkgroupRoles[0].Role);

        // Set another role for user
        setRoleResult = await workgroupController.SetRole(
            new Models.UserWorkgroupRole()
            {
                UserId = user.Id,
                WorkgroupId = createdWorkgroup.Id,
                Role = Models.Role.View,
                IsActive = true,
            });
        ActionResultAssert.IsOk(setRoleResult);
        userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(2, userWorkgroupRoles.Count);
        Assert.IsTrue(userWorkgroupRoles.Any(r => r.Role == Models.Role.Editor));
        Assert.IsTrue(userWorkgroupRoles.Any(r => r.Role == Models.Role.View));

        // Cannot remove a role that does not exist
        setRoleResult = await workgroupController.SetRole(
            new Models.UserWorkgroupRole()
            {
                UserId = user.Id,
                WorkgroupId = createdWorkgroup.Id,
                Role = Models.Role.Publisher,
                IsActive = false,
            });
        ActionResultAssert.IsOk(setRoleResult);
        userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(2, userWorkgroupRoles.Count);
        Assert.IsTrue(userWorkgroupRoles.Any(r => r.Role == Models.Role.Editor));
        Assert.IsTrue(userWorkgroupRoles.Any(r => r.Role == Models.Role.View));

        // Remove a role
        setRoleResult = await workgroupController.SetRole(
            new Models.UserWorkgroupRole()
            {
                UserId = user.Id,
                WorkgroupId = createdWorkgroup.Id,
                Role = Models.Role.Editor,
                IsActive = false,
            });
        ActionResultAssert.IsOk(setRoleResult);
        userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(1, userWorkgroupRoles.Count);
        Assert.AreEqual(Models.Role.View, userWorkgroupRoles[0].Role);
    }
}
