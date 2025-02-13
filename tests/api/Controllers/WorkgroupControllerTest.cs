using BDMS.Models;
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
    private readonly Mock<ILogger<WorkgroupController>> loggerMock = new();
    private BdmsContext context;
    private WorkgroupController workgroupController;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        workgroupController = new WorkgroupController(context, loggerMock.Object) { ControllerContext = GetControllerContextAdmin() };
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
        var workgroup = new Workgroup { Name = "FIRESTOPPEXAMPLE" };
        var result = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(result);

        var createdWorkgroup = (result as OkObjectResult).Value as Workgroup;
        Assert.AreEqual(workgroup.Name, createdWorkgroup.Name);
        Assert.IsNotNull(createdWorkgroup.CreatedAt);
        Assert.IsFalse(createdWorkgroup.IsDisabled);
        Assert.AreEqual("{}", createdWorkgroup.Settings);
    }

    [TestMethod]
    public async Task EditWorkgroup()
    {
        var workgroup = new Workgroup { Name = "New Workgroup" };
        var createResult = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(createResult);
        var createdWorkgroup = (createResult as OkObjectResult).Value as Workgroup;

        await context.Boreholes.AddAsync(new Borehole { WorkgroupId = createdWorkgroup.Id });
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
        var updatedWorkgroup = (result as OkObjectResult).Value as Workgroup;

        Assert.AreEqual(createdWorkgroup.Id, updatedWorkgroup.Id);
        Assert.AreEqual("Updated Workgroup", updatedWorkgroup.Name);
        Assert.IsTrue(updatedWorkgroup.IsDisabled);
        Assert.AreEqual(1, updatedWorkgroup.BoreholeCount);
    }

    [TestMethod]
    public async Task EditWorkgroupNotFound()
    {
        var result = await workgroupController.Edit(new Workgroup { Id = 0 });
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task DeleteWorkgroup()
    {
        var workgroup = new Workgroup { Name = "CLOWNSHOES" };
        var createResult = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(createResult);
        var createdWorkgroup = (createResult as OkObjectResult).Value as Workgroup;

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
    public async Task SetSingleRole()
    {
        var user = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.FirstName == "editor");
        var workgroup = new Workgroup { Name = "WINDDESPERADO" };
        var createResult = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(createResult);
        var createdWorkgroup = (createResult as OkObjectResult).Value as Workgroup;

        // Set role for user
        var setRoleResult = await workgroupController.SetRoles([CreateUserWorkgroupRole(user, createdWorkgroup, Role.Editor, true)]);

        ActionResultAssert.IsOk(setRoleResult);
        var userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(1, userWorkgroupRoles.Count);
        Assert.AreEqual(Role.Editor, userWorkgroupRoles[0].Role);

        // Cannot set the same role twice
        setRoleResult = await workgroupController.SetRoles([CreateUserWorkgroupRole(user, createdWorkgroup, Role.Editor, true)]);
        ActionResultAssert.IsOk(setRoleResult);
        userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(1, userWorkgroupRoles.Count);
        Assert.AreEqual(Role.Editor, userWorkgroupRoles[0].Role);

        // Set another role for user
        setRoleResult = await workgroupController.SetRoles([CreateUserWorkgroupRole(user, createdWorkgroup, Role.View, true)]);
        ActionResultAssert.IsOk(setRoleResult);
        userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(2, userWorkgroupRoles.Count);
        Assert.IsTrue(userWorkgroupRoles.Any(r => r.Role == Role.Editor));
        Assert.IsTrue(userWorkgroupRoles.Any(r => r.Role == Role.View));

        // Cannot remove a role that does not exist
        setRoleResult = await workgroupController.SetRoles([CreateUserWorkgroupRole(user, createdWorkgroup, Role.Publisher, false)]);
        ActionResultAssert.IsOk(setRoleResult);
        userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(2, userWorkgroupRoles.Count);
        Assert.IsTrue(userWorkgroupRoles.Any(r => r.Role == Role.Editor));
        Assert.IsTrue(userWorkgroupRoles.Any(r => r.Role == Role.View));

        // Remove a role
        setRoleResult = await workgroupController.SetRoles([CreateUserWorkgroupRole(user, createdWorkgroup, Role.Editor, false)]);
        ActionResultAssert.IsOk(setRoleResult);
        userWorkgroupRoles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user.Id).ToListAsync();
        Assert.AreEqual(1, userWorkgroupRoles.Count);
        Assert.AreEqual(Role.View, userWorkgroupRoles[0].Role);
    }

    [TestMethod]
    public async Task SetRoles()
    {
        var user1 = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.FirstName == "editor");
        var user2 = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.FirstName == "viewer");
        var workgroup = new Workgroup { Name = "TECHWARRIORS" };
        var createResult = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(createResult);
        var createdWorkgroup = (createResult as OkObjectResult).Value as Workgroup;

        // Set roles for multiple users
        var userWorkgroupRoles = new UserWorkgroupRole[]
        {
            CreateUserWorkgroupRole(user1, createdWorkgroup, Role.Editor, true),
            CreateUserWorkgroupRole(user2, createdWorkgroup, Role.View, true),
        };
        var setRolesResult = await workgroupController.SetRoles(userWorkgroupRoles);
        ActionResultAssert.IsOk(setRolesResult);

        // Verify roles are added
        var roles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id).ToListAsync();
        Assert.AreEqual(2, roles.Count);
        Assert.IsTrue(roles.Any(r => r.UserId == user1.Id && r.Role == Role.Editor));
        Assert.IsTrue(roles.Any(r => r.UserId == user2.Id && r.Role == Role.View));

        // Add an additional role for one user and remove for another
        userWorkgroupRoles[0].Role = Role.Publisher;
        userWorkgroupRoles[1].IsActive = false;
        setRolesResult = await workgroupController.SetRoles(userWorkgroupRoles);
        ActionResultAssert.IsOk(setRolesResult);

        // Verify roles are updated
        roles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id).ToListAsync();
        Assert.AreEqual(2, roles.Count); // First user now has 2 roles
        Assert.IsTrue(roles.Any(r => r.UserId == user1.Id && r.Role == Role.Publisher));
        Assert.IsFalse(roles.Any(r => r.UserId == user2.Id)); // Role removed for user2

        // Attempt to add duplicate role
        userWorkgroupRoles[0].IsActive = true;
        setRolesResult = await workgroupController.SetRoles(userWorkgroupRoles);
        ActionResultAssert.IsOk(setRolesResult);

        loggerMock.Verify(
            x => x.Log(
            LogLevel.Information,
            It.IsAny<EventId>(),
            It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("no changes were made.")),
            It.IsAny<Exception>(),
            (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()),
            Times.Exactly(2));

        roles = await context.UserWorkgroupRoles.AsNoTracking().Where(r => r.WorkgroupId == createdWorkgroup.Id && r.UserId == user1.Id).ToListAsync();
        Assert.AreEqual(2, roles.Count); // No duplicate roles should be added
    }

    [TestMethod]
    public async Task SetWithIsActiveNull()
    {
        var user2 = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.FirstName == "viewer");
        var workgroup = new Workgroup { Name = "SHRIMPLACES" };
        var createResult = await workgroupController.Create(workgroup);
        ActionResultAssert.IsOk(createResult);
        var createdWorkgroup = (createResult as OkObjectResult).Value as Workgroup;

        // Set roles for multiple users
        var userWorkgroupRoles = new UserWorkgroupRole[]
        {
            CreateUserWorkgroupRole(user2, createdWorkgroup, Role.Validator, null),
        };

        var setRolesResult = await workgroupController.SetRoles(userWorkgroupRoles);
        ActionResultAssert.IsOk(setRolesResult);

        loggerMock.Verify(
        x => x.Log(
        LogLevel.Warning,
        It.IsAny<EventId>(),
        It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("No active state for the user's workgroup role was provided in the request body")),
        It.IsAny<Exception>(),
        (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()),
        Times.Once);

        var validUserWorkgroupRoles = new UserWorkgroupRole[]
        {
            CreateUserWorkgroupRole(user2, createdWorkgroup, Role.Validator, true),
        };
    }

    private UserWorkgroupRole CreateUserWorkgroupRole(User user, Workgroup workgroup, Role role, bool? isActive) =>
        new UserWorkgroupRole { UserId = user.Id, WorkgroupId = workgroup.Id, Role = role, IsActive = isActive };
}
