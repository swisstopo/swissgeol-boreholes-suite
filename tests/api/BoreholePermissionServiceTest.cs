using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace BDMS;

[TestClass]
public class BoreholePermissionServiceTest
{
    private const string AdminSubjectId = "sub_admin";
    private const string EditorSubjectId = "sub_editor";
    private const string ViewerSubjectId = "sub_viewer";
    private const int AdminUserId = 1;
    private const int EditorUserId = 2;
    private const int DefaultWorkgroupId = 1;

    private readonly DateTime mockNow = new DateTime(2025, 4, 14, 16, 58, 24, DateTimeKind.Utc);

    private BoreholePermissionService boreholePermissionService;
    private BdmsContext context;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var loggerMock = new Mock<ILogger<BoreholePermissionService>>();
        var timeProviderMock = new Mock<TimeProvider>();
        timeProviderMock.Setup(x => x.GetUtcNow()).Returns(mockNow);

        boreholePermissionService = new BoreholePermissionService(context, loggerMock.Object, timeProviderMock.Object);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    private static User GetEditorUser()
    {
        var editor = new User
        {
            Name = "Editor",
            Id = EditorUserId,
            WorkgroupRoles = { new UserWorkgroupRole { WorkgroupId = DefaultWorkgroupId, Role = Role.Editor } },
        };

        return editor;
    }

    private static User GetPublisherUser()
    {
        var publisher = new User
        {
            Name = "Publisher",
            Id = 5,
            WorkgroupRoles = { new UserWorkgroupRole { WorkgroupId = DefaultWorkgroupId, Role = Role.Publisher } },
        };

        return publisher;
    }

    private static User GetAdminUser() => new User { Name = "Admin", IsAdmin = true };

    private static User GetOtherWorkgroupUser()
    {
        var editor = new User
        {
            Name = "Editor from another Workgroup",
            Id = 70816,
            WorkgroupRoles = { new UserWorkgroupRole { WorkgroupId = 613, Role = Role.Editor } },
        };

        return editor;
    }

    [TestMethod]
    public void BoreholeInEditing()
    {
        var borehole = new Borehole
        {
            Name = "Borehole in editing",
            WorkgroupId = DefaultWorkgroupId,
            Workflow = new Workflow { Id = 1, Status = WorkflowStatus.Draft },
        };

        Assert.IsFalse(boreholePermissionService.CanViewBorehole(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanViewBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetPublisherUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetAdminUser(), borehole));

        // Check if user can edit borehole
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(GetPublisherUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(GetAdminUser(), borehole));

        // Check if user can change borehole status
        Assert.IsFalse(boreholePermissionService.CanChangeBoreholeStatus(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanChangeBoreholeStatus(GetOtherWorkgroupUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanChangeBoreholeStatus(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanChangeBoreholeStatus(GetPublisherUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanChangeBoreholeStatus(GetAdminUser(), borehole));
    }

    [TestMethod]
    public void BoreholeInPublishing()
    {
        var borehole = new Borehole
        {
            Name = "Borehole in publication",
            WorkgroupId = DefaultWorkgroupId,
            Workflow = new Workflow
            {
                Id = 4,
                Status = WorkflowStatus.Published,
            },
        };

        Assert.IsFalse(boreholePermissionService.CanViewBorehole(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanViewBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetPublisherUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetAdminUser(), borehole));

        // Check if user can edit borehole
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetEditorUser(), borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetPublisherUser(), borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetAdminUser(), borehole));

        // Check if user can change borehole status
        Assert.IsFalse(boreholePermissionService.CanChangeBoreholeStatus(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanChangeBoreholeStatus(GetOtherWorkgroupUser(), borehole));
        Assert.IsFalse(boreholePermissionService.CanChangeBoreholeStatus(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanChangeBoreholeStatus(GetPublisherUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanChangeBoreholeStatus(GetAdminUser(), borehole));
    }

    [TestMethod]
    public void BoreholeLocked()
    {
        var editor = GetEditorUser();

        var editor2 = GetEditorUser();
        editor2.Id = 42;

        var borehole = new Borehole
        {
            Name = "Borehole locked by Editor",
            WorkgroupId = DefaultWorkgroupId,
            Workflow = new Workflow { Id = 93298, Status = WorkflowStatus.Draft },
            Locked = mockNow.AddMinutes(-1),
            LockedById = editor.Id,
        };

        Assert.IsFalse(boreholePermissionService.CanViewBorehole(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanViewBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(editor, borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(editor2, borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetPublisherUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetAdminUser(), borehole));

        Assert.IsFalse(boreholePermissionService.CanEditBorehole(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(editor, borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(editor2, borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetPublisherUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(GetAdminUser(), borehole));
    }

    [TestMethod]
    public void BoreholeLockExpired()
    {
        var borehole = new Borehole
        {
            Name = "Borehole locked by Admin a day ago",
            WorkgroupId = DefaultWorkgroupId,
            Workflow = new Workflow { Id = 74028, Status = WorkflowStatus.Draft },
            Locked = mockNow.AddMinutes(-(BoreholePermissionService.LockTimeoutInMinutes + 1)),
            LockedById = AdminUserId,
        };

        Assert.IsFalse(boreholePermissionService.CanViewBorehole(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanViewBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetPublisherUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetAdminUser(), borehole));

        Assert.IsFalse(boreholePermissionService.CanEditBorehole(new User(), borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(GetPublisherUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(GetAdminUser(), borehole));
    }

    [TestMethod]
    public void BoreholeWithNullWorkflows()
    {
        var borehole = new Borehole
        {
            Name = "Borehole without workflows",
            WorkgroupId = DefaultWorkgroupId,
        };

        Assert.IsFalse(boreholePermissionService.CanViewBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetAdminUser(), borehole));

        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(GetAdminUser(), borehole));
    }

    [TestMethod]
    public void BoreholeWithoutWorkgroupId()
    {
        var borehole = new Borehole
        {
            Name = "Borehole without workgroupId",
        };

        Assert.IsFalse(boreholePermissionService.CanViewBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsFalse(boreholePermissionService.CanViewBorehole(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanViewBorehole(GetAdminUser(), borehole));

        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetOtherWorkgroupUser(), borehole));
        Assert.IsFalse(boreholePermissionService.CanEditBorehole(GetEditorUser(), borehole));
        Assert.IsTrue(boreholePermissionService.CanEditBorehole(GetAdminUser(), borehole));
    }

    [TestMethod]
    public async Task CanEditBoreholeAsyncWithUserNotSet()
    {
        await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () => await boreholePermissionService.CanEditBoreholeAsync(null, null));
    }

    [TestMethod]
    public async Task CanEditBoreholeAsyncWithUnknownUser()
    {
        await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () => await boreholePermissionService.CanEditBoreholeAsync("NON-EXISTENT-NAME", null));
    }

    [TestMethod]
    public async Task CanEditBoreholeAsyncWithUnknownBorehole()
    {
        await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () => await boreholePermissionService.CanEditBoreholeAsync(EditorSubjectId, null));
    }

    [TestMethod]
    public async Task CanEditBoreholeAsync()
    {
        var borehole = await context.Boreholes.FirstAsync();
        Assert.IsFalse(await boreholePermissionService.CanEditBoreholeAsync(ViewerSubjectId, borehole.Id));
    }

    [TestMethod]
    public async Task CanViewBoreholeAsyncWithUserNotSet()
        => await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () => await boreholePermissionService.CanViewBoreholeAsync(null, null));

    [TestMethod]
    public async Task CanViewBoreholeAsyncWithUnknownUser()
        => await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () => await boreholePermissionService.CanViewBoreholeAsync("NON-EXISTENT-NAME", null));

    [TestMethod]
    public async Task CanViewBoreholeAsyncWithUnknownBorehole()
        => await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () => await boreholePermissionService.CanViewBoreholeAsync(EditorSubjectId, null));

    [TestMethod]
    public async Task CanViewBoreholeAsync()
    {
        var borehole = await context.Boreholes.FirstAsync();
        Assert.IsTrue(await boreholePermissionService.CanViewBoreholeAsync(ViewerSubjectId, borehole.Id));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupNullUser()
    {
        Assert.ThrowsExactly<NullReferenceException>(() => boreholePermissionService.HasUserRoleOnWorkgroup(null, 1, Role.Editor));
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
        Assert.AreEqual(0, userWithoutWorkgroups.WorkgroupRoles.Count);

        Assert.IsFalse(boreholePermissionService.HasUserRoleOnWorkgroup(userWithoutWorkgroups, 1, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupNotPartOfWorkgroup()
    {
        var user = new User
        {
            WorkgroupRoles = { new UserWorkgroupRole { WorkgroupId = 2, Role = Role.Editor } },
        };

        Assert.IsFalse(boreholePermissionService.HasUserRoleOnWorkgroup(user, 1, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupWrongRole()
    {
        var user = new User
        {
            WorkgroupRoles = { new UserWorkgroupRole { WorkgroupId = 1, Role = Role.View } },
        };

        Assert.IsFalse(boreholePermissionService.HasUserRoleOnWorkgroup(user, 1, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroup()
    {
        var user = new User
        {
            WorkgroupRoles = { new UserWorkgroupRole { WorkgroupId = 1, Role = Role.Editor } },
        };

        Assert.IsTrue(boreholePermissionService.HasUserRoleOnWorkgroup(user, 1, Role.Editor));
    }

    [TestMethod]
    public void HasUserRoleOnWorkgroupAdminUser()
    {
        var user = new User { IsAdmin = true };

        Assert.IsTrue(boreholePermissionService.HasUserRoleOnWorkgroup(user, 1, Role.Editor));
    }

    [TestMethod]
    public async Task HasUserRoleOnWorkgroupAsync()
    {
        Assert.IsTrue(await boreholePermissionService.HasUserRoleOnWorkgroupAsync(AdminSubjectId, DefaultWorkgroupId, Role.Editor));
    }
}
