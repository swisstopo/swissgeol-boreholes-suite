using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Reflection;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class BoreholeLockServiceTest
{
    private const string AdminSubjectId = "sub_admin";
    private const string EditorSubjectId = "sub_editor";
    private const string ViewerSubjectId = "sub_viewer";
    private const int AdminUserId = 1;
    private const int DefaultWorkgroupId = 1;

    private BoreholeLockService boreholeLockService;
    private BdmsContext context;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var loggerMock = new Mock<ILogger<BoreholeLockService>>();
        var timeProviderMock = new Mock<TimeProvider>();

        boreholeLockService = new BoreholeLockService(context, loggerMock.Object, timeProviderMock.Object);
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task IsBoreholeLockedWithUserNotSet()
        => await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () => await boreholeLockService.IsBoreholeLockedAsync(null, null));

    [TestMethod]
    public async Task IsBoreholeLockedWithUnknownUser()
        => await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () => await boreholeLockService.IsBoreholeLockedAsync(null, "NON-EXISTENT-NAME"));

    [TestMethod]
    public async Task IsBoreholeLockedWithUnknownBorehole()
        => await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () => await boreholeLockService.IsBoreholeLockedAsync(null, EditorSubjectId));

    [TestMethod]
    public async Task IsBoreholeLockedWithUnauthorizedUser()
    {
        var borehole = await context.Boreholes.FirstAsync();
        Assert.AreEqual(true, await boreholeLockService.IsBoreholeLockedAsync(borehole.Id, "sub_deletableUser"));
    }

    [TestMethod]
    public async Task IsUserLackingPermissionsWithUnauthorizedUser()
    {
        var borehole = await context.Boreholes.FirstAsync();
        Assert.AreEqual(true, await boreholeLockService.IsUserLackingPermissionsAsync(borehole.Id, "sub_deletableUser"));
    }

    [TestMethod]
    public async Task IsBoreholeLockedByOtherUser()
    {
        var borehole = GetLockedBorehole(lockedByAdmin: true);

        // Fake a date which is within the lock timeout
        var timeProviderMock = CreateTimeProviderMock(borehole.Locked.Value.AddMinutes(1));
        boreholeLockService = new BoreholeLockService(context, new Mock<ILogger<BoreholeLockService>>().Object, timeProviderMock.Object);

        Assert.AreEqual(true, await boreholeLockService.IsBoreholeLockedAsync(borehole.Id, EditorSubjectId));
    }

    [TestMethod]
    public async Task IsBoreholeLockedForAdminUser()
    {
        var borehole = GetLockedBorehole(lockedByAdmin: false);

        // Fake a date which is within the lock timeout
        var timeProviderMock = CreateTimeProviderMock(borehole.Locked.Value.AddMinutes(1));
        boreholeLockService = new BoreholeLockService(context, new Mock<ILogger<BoreholeLockService>>().Object, timeProviderMock.Object);

        Assert.AreEqual(false, await boreholeLockService.IsBoreholeLockedAsync(borehole.Id, AdminSubjectId));
    }

    [TestMethod]
    public async Task CreateForLockedBoreholeBySameUser()
    {
        var borehole = GetLockedBorehole(lockedByAdmin: true);

        // Fake a date which is within the lock timeout
        var fakeUtcDate = borehole.Locked.Value.AddMinutes(BoreholeLockService.LockTimeoutInMinutes - 1);
        var timeProviderMock = CreateTimeProviderMock(fakeUtcDate);
        boreholeLockService = new BoreholeLockService(context, new Mock<ILogger<BoreholeLockService>>().Object, timeProviderMock.Object);

        Assert.AreEqual(false, await boreholeLockService.IsBoreholeLockedAsync(borehole.Id, AdminSubjectId));
    }

    [TestMethod]
    public async Task CreateForLockedBoreholeWithElapsedLockTimeout()
    {
        var borehole = GetLockedBorehole(lockedByAdmin: false);

        // Fake a date which is after the lock timeout
        var fakeUtcDate = borehole.Locked.Value.AddMinutes(BoreholeLockService.LockTimeoutInMinutes + 1);
        var timeProviderMock = CreateTimeProviderMock(fakeUtcDate);
        boreholeLockService = new BoreholeLockService(context, new Mock<ILogger<BoreholeLockService>>().Object, timeProviderMock.Object);

        Assert.AreEqual(false, await boreholeLockService.IsBoreholeLockedAsync(borehole.Id, AdminSubjectId));
    }

    [TestMethod]
    public async Task HasUserWorkgroupPermissionsAsyncWithEditorIsInWorkgroup()
    {
        var boreholes = await context.Boreholes.Include(b => b.Workflows).ToListAsync();
        var editorBorehole = boreholes.First(x => x.Workflows.Count > 0 && x.Workflows.Any(w => w.Role == Role.Editor));

        var result = await boreholeLockService.HasUserWorkgroupPermissionsAsync(editorBorehole.Id, EditorSubjectId).ConfigureAwait(false);
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

        var result = await boreholeLockService.HasUserWorkgroupPermissionsAsync(editorBorehole.Id, EditorSubjectId).ConfigureAwait(false);
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

        var result = await boreholeLockService.HasUserWorkgroupPermissionsAsync(editorBorehole.Id, AdminSubjectId).ConfigureAwait(false);
        Assert.IsTrue(result);
    }

    [TestMethod]
    public async Task HasUserWorkgroupPermissionsAsyncWithViewerIsInWorkgroup()
    {
        var boreholes = await context.Boreholes.Include(b => b.Workflows).ToListAsync();
        var editorBorehole = boreholes.First(x => x.Workflows.Count > 0 && x.Workflows.Any(w => w.Role == Role.Editor));

        var result = await boreholeLockService.HasUserWorkgroupPermissionsAsync(editorBorehole.Id, ViewerSubjectId).ConfigureAwait(false);
        Assert.IsTrue(result);
    }

    [TestMethod]
    public void IsUserLackingWorkgroupRoleNullUser()
    {
        Assert.IsTrue(boreholeLockService.IsUserLackingWorkgroupRole(null, 1, Role.Editor));
    }

    [TestMethod]
    public void IsUserLackingWorkgroupRoleNoWorkgroups()
    {
        var userWithoutWorkgroups = new User();
        Assert.AreEqual(null, userWithoutWorkgroups.WorkgroupRoles);

        Assert.IsTrue(boreholeLockService.IsUserLackingWorkgroupRole(userWithoutWorkgroups, 1, Role.Editor));
    }

    [TestMethod]
    public void IsUserLackingWorkgroupRoleNotPartOfWorkgroup()
    {
        var user = new User();
        var workgroupRoles = new List<UserWorkgroupRole> { new UserWorkgroupRole { WorkgroupId = 2, Role = Role.Editor } };

        SetUserWorkgroupRoles(user, workgroupRoles);

        Assert.IsTrue(boreholeLockService.IsUserLackingWorkgroupRole(user, 1, Role.Editor));
    }

    [TestMethod]
    public void IsUserLackingWorkgroupRoleWrongRole()
    {
        var user = new User();
        var workgroupRoles = new List<UserWorkgroupRole> { new UserWorkgroupRole { WorkgroupId = 1, Role = Role.View } };

        SetUserWorkgroupRoles(user, workgroupRoles);

        Assert.IsTrue(boreholeLockService.IsUserLackingWorkgroupRole(user, 1, Role.Editor));
    }

    [TestMethod]
    public void IsUserLackingWorkgroupRole()
    {
        var user = new User();
        var workgroupRoles = new List<UserWorkgroupRole> { new UserWorkgroupRole { WorkgroupId = 1, Role = Role.Editor } };

        SetUserWorkgroupRoles(user, workgroupRoles);

        Assert.IsFalse(boreholeLockService.IsUserLackingWorkgroupRole(user, 1, Role.Editor));
    }

    [TestMethod]
    public void IsUserLackingWorkgroupRoleAdminUser()
    {
        var user = new User { IsAdmin = true };

        Assert.IsFalse(boreholeLockService.IsUserLackingWorkgroupRole(user, 1, Role.Editor));
    }

    [TestMethod]
    public async Task IsUserLackingWorkgroupRoleAsync()
    {
        Assert.IsFalse(await boreholeLockService.IsUserLackingWorkgroupRoleAsync(AdminSubjectId, DefaultWorkgroupId, Role.Editor));
    }

    private void SetUserWorkgroupRoles(User user, IEnumerable<UserWorkgroupRole> workgroupRoles)
    {
        // Use reflection to set the readonly property
        var workgroupRolesField = typeof(User).GetField("<WorkgroupRoles>k__BackingField", BindingFlags.Instance | BindingFlags.NonPublic);
        workgroupRolesField.SetValue(user, workgroupRoles);
    }

    private Borehole GetLockedBorehole(bool lockedByAdmin)
    {
        bool LockedCondition(Borehole borehole) => lockedByAdmin ? borehole.LockedById == AdminUserId : borehole.LockedById != AdminUserId;

        return context.BoreholesWithIncludes
            .Where(b => b.Workflows.Any(w => w.UserId == AdminUserId))
            .AsEnumerable()
            .First(b => b.Locked.HasValue && LockedCondition(b));
    }

    private static Mock<TimeProvider> CreateTimeProviderMock(DateTime fakeUtcDate)
    {
        var timeProviderMock = new Mock<TimeProvider>();
        timeProviderMock
            .Setup(x => x.GetUtcNow())
            .Returns(fakeUtcDate);

        return timeProviderMock;
    }
}
