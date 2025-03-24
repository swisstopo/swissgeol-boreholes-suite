using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Reflection;

namespace BDMS;

[TestClass]
public class BoreholePermissionServiceTest
{
    private const string AdminSubjectId = "sub_admin";
    private const string EditorSubjectId = "sub_editor";
    private const string ViewerSubjectId = "sub_viewer";
    private const int AdminUserId = 1;
    private const int DefaultWorkgroupId = 1;

    private BoreholePermissionService boreholePermissionService;
    private BdmsContext context;

    private Mock<TimeProvider> timeProviderMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var loggerMock = new Mock<ILogger<BoreholePermissionService>>();
        timeProviderMock = new Mock<TimeProvider>();

        boreholePermissionService = new BoreholePermissionService(context, loggerMock.Object, timeProviderMock.Object);
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task CanEditBoreholeWithUserNotSet()
        => await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () => await boreholePermissionService.CanEditBoreholeAsync(null, null));

    [TestMethod]
    public async Task CanEditBoreholeWithUnknownUser()
        => await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () => await boreholePermissionService.CanEditBoreholeAsync("NON-EXISTENT-NAME", null));

    [TestMethod]
    public async Task CanEditBoreholeWithUnknownBorehole()
        => await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () => await boreholePermissionService.CanEditBoreholeAsync(EditorSubjectId, null));

    [TestMethod]
    public async Task CanEditBoreholeWithUnauthorizedUser()
    {
        var borehole = await context.Boreholes.FirstAsync();
        Assert.AreEqual(false, await boreholePermissionService.CanEditBoreholeAsync("sub_deletableUser", borehole.Id));
    }

    [TestMethod]
    public async Task CanEditBoreholeByOtherUser()
    {
        var borehole = GetLockedBorehole(lockedByAdmin: true);

        // Fake a date which is within the lock timeout
        timeProviderMock.Setup(x => x.GetUtcNow()).Returns(borehole.Locked.Value.AddMinutes(1));

        Assert.AreEqual(false, await boreholePermissionService.CanEditBoreholeAsync(EditorSubjectId, borehole.Id));
    }

    [TestMethod]
    public async Task CanEditBoreholeForAdminUser()
    {
        var borehole = GetLockedBorehole(lockedByAdmin: false);

        // Fake a date which is within the lock timeout
        timeProviderMock.Setup(x => x.GetUtcNow()).Returns(borehole.Locked.Value.AddMinutes(1));

        Assert.AreEqual(false, await boreholePermissionService.CanEditBoreholeAsync(AdminSubjectId, borehole.Id));
    }

    [TestMethod]
    public async Task CreateForLockedBoreholeBySameUser()
    {
        var borehole = GetLockedBorehole(lockedByAdmin: true);

        // Fake a date which is within the lock timeout
        var fakeUtcDate = borehole.Locked.Value.AddMinutes(BoreholePermissionService.LockTimeoutInMinutes - 1);
        timeProviderMock.Setup(x => x.GetUtcNow()).Returns(fakeUtcDate);

        Assert.AreEqual(true, await boreholePermissionService.CanEditBoreholeAsync(AdminSubjectId, borehole.Id));
    }

    [TestMethod]
    public async Task CreateForLockedBoreholeWithElapsedLockTimeout()
    {
        var borehole = GetLockedBorehole(lockedByAdmin: false);

        // Fake a date which is after the lock timeout
        var fakeUtcDate = borehole.Locked.Value.AddMinutes(BoreholePermissionService.LockTimeoutInMinutes + 1);
        timeProviderMock.Setup(x => x.GetUtcNow()).Returns(fakeUtcDate);

        Assert.AreEqual(false, await boreholePermissionService.CanEditBoreholeAsync(AdminSubjectId, borehole.Id));
    }

    [TestMethod]
    public async Task IsUserLackingPermissionsWithUnauthorizedUser()
    {
        var borehole = await context.Boreholes.FirstAsync();
        Assert.AreEqual(true, await boreholePermissionService.CanViewBoreholeAsync("sub_deletableUser", borehole.Id));
    }

    [TestMethod]
    public async Task HasUserWorkgroupPermissionsAsyncWithEditorIsInWorkgroup()
    {
        var boreholes = await context.Boreholes.Include(b => b.Workflows).ToListAsync();
        var editorBorehole = boreholes.First(x => x.Workflows.Count > 0 && x.Workflows.Any(w => w.Role == Role.Editor));

        var result = await boreholePermissionService.CanViewBoreholeAsync(EditorSubjectId, editorBorehole.Id).ConfigureAwait(false);
        Assert.IsTrue(result);
    }

    [TestMethod]
    public async Task HasUserWorkgroupPermissionsAsyncWithEditorIsNotInWorkgroup()
    {
        var boreholes = await context.Boreholes.Include(b => b.Workflows).ToListAsync();
        var editorBorehole = boreholes.First(x => x.Workflows.Count > 0 && x.Workflows.Any(w => w.Role == Role.Editor));

        // Update workgroupId of first borehole to simulate a workgroup mismatch
        editorBorehole.WorkgroupId = 2;
        await context.SaveChangesAsync().ConfigureAwait(false);

        var result = await boreholePermissionService.CanViewBoreholeAsync(EditorSubjectId, editorBorehole.Id).ConfigureAwait(false);
        Assert.IsFalse(result);
    }

    [TestMethod]
    public async Task HasUserWorkgroupPermissionsAsyncWithAdminIsNotInWorkgroup()
    {
        var boreholes = await context.Boreholes.Include(b => b.Workflows).ToListAsync();
        var editorBorehole = boreholes.First(x => x.Workflows.Count > 0 && x.Workflows.Any(w => w.Role == Role.Editor));

        // Update workgroupId of first borehole to simulate a workgroup mismatch
        editorBorehole.WorkgroupId = 2;
        await context.SaveChangesAsync().ConfigureAwait(false);

        var result = await boreholePermissionService.CanViewBoreholeAsync(AdminSubjectId, editorBorehole.Id).ConfigureAwait(false);
        Assert.IsTrue(result);
    }

    [TestMethod]
    public async Task HasUserWorkgroupPermissionsAsyncWithViewerIsInWorkgroup()
    {
        var boreholes = await context.Boreholes.Include(b => b.Workflows).ToListAsync();
        var editorBorehole = boreholes.First(x => x.Workflows.Count > 0 && x.Workflows.Any(w => w.Role == Role.Editor));

        var result = await boreholePermissionService.CanViewBoreholeAsync(ViewerSubjectId, editorBorehole.Id).ConfigureAwait(false);
        Assert.IsTrue(result);
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupNullUser()
    {
        Assert.IsFalse(boreholePermissionService.HasUserRoleOnWorkgroup(null, 1, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupNullWorkgroup()
    {
        Assert.IsFalse(boreholePermissionService.HasUserRoleOnWorkgroup(new User(), null, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupNoWorkgroups()
    {
        var userWithoutWorkgroups = new User();
        Assert.AreEqual(null, userWithoutWorkgroups.WorkgroupRoles);

        Assert.IsFalse(boreholePermissionService.HasUserRoleOnWorkgroup(userWithoutWorkgroups, 1, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupNotPartOfWorkgroup()
    {
        var user = new User();
        var workgroupRoles = new List<UserWorkgroupRole> { new UserWorkgroupRole { WorkgroupId = 2, Role = Role.Editor } };

        SetUserWorkgroupRoles(user, workgroupRoles);

        Assert.IsTrue(boreholePermissionService.HasUserRoleOnWorkgroup(user, 1, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupWrongRole()
    {
        var user = new User();
        var workgroupRoles = new List<UserWorkgroupRole> { new UserWorkgroupRole { WorkgroupId = 1, Role = Role.View } };

        SetUserWorkgroupRoles(user, workgroupRoles);

        Assert.IsTrue(boreholePermissionService.HasUserRoleOnWorkgroup(user, 1, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroup()
    {
        var user = new User();
        var workgroupRoles = new List<UserWorkgroupRole> { new UserWorkgroupRole { WorkgroupId = 1, Role = Role.Editor } };

        SetUserWorkgroupRoles(user, workgroupRoles);

        Assert.IsFalse(boreholePermissionService.HasUserRoleOnWorkgroup(user, 1, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupAdminUser()
    {
        var user = new User { IsAdmin = true };

        Assert.IsFalse(boreholePermissionService.HasUserRoleOnWorkgroup(user, 1, Role.Editor));
    }

    [TestMethod]
    public async Task HasUserRoleOnWorkgroupAsync()
    {
        Assert.IsFalse(await boreholePermissionService.HasUserRoleOnWorkgroupAsync(AdminSubjectId, DefaultWorkgroupId, Role.Editor));
    }

    private Borehole GetLockedBorehole(bool lockedByAdmin)
    {
        bool LockedCondition(Borehole borehole) => lockedByAdmin ? borehole.LockedById == AdminUserId : borehole.LockedById != AdminUserId;

        return context.Boreholes.GetAllWithIncludes()
            .Where(b => b.Workflows.Any(w => w.UserId == AdminUserId))
            .AsEnumerable()
            .First(b => b.Locked.HasValue && LockedCondition(b));
    }

    private void SetUserWorkgroupRoles(User user, IEnumerable<UserWorkgroupRole> workgroupRoles)
    {
        // Use reflection to set the readonly property
        var workgroupRolesField = typeof(User).GetField("<WorkgroupRoles>k__BackingField", BindingFlags.Instance | BindingFlags.NonPublic);
        workgroupRolesField.SetValue(user, workgroupRoles);
    }
}
