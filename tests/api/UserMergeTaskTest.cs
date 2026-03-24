using BDMS.Controllers;
using BDMS.Maintenance;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace BDMS;

[TestClass]
public class UserMergeTaskTest : MaintenanceTaskTestBase
{
    protected override IEnumerable<IMaintenanceTask> CreateMaintenanceTasks() => [new UserMergeTask()];

    [TestInitialize]
    public async Task EnsureUniqueSeededEmails()
    {
        // Give each pre-seeded user a unique email so they don't form duplicate
        // groups and interfere with test-specific assertions.
        foreach (var user in await Context.Users.ToListAsync())
        {
            user.Email = $"seeded-{user.Id}@unique.test";
        }

        await Context.SaveChangesAsync().ConfigureAwait(false);
    }

    private User CreateUser(string subjectId, string email, string firstName, string lastName, DateTime? createdAt = null, DateTime? disabledAt = null, bool nullCreatedAt = false)
    {
        var user = new User
        {
            SubjectId = subjectId,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            Name = firstName.ToLowerInvariant(),
            CreatedAt = nullCreatedAt ? null : createdAt ?? DateTime.UtcNow,
            DisabledAt = disabledAt,
        };
        Context.Users.Add(user);
        Context.SaveChanges();
        return user;
    }

    [TestMethod]
    public async Task MergesDuplicateUsersAndReassignsAllForeignKeys()
    {
        var oldUser = CreateUser("sub_BLAZEVAULT_old", "blazevault@test.com", "BLAZEVAULT", "Old", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("sub_BLAZEVAULT_new", "blazevault@test.com", "BLAZEVAULT", "New", DateTime.UtcNow);

        var borehole = new Borehole { CreatedBy = oldUser, UpdatedBy = oldUser, LockedBy = oldUser };
        Context.Boreholes.Add(borehole);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var updatedBorehole = await Context.Boreholes.AsNoTracking().SingleAsync(b => b.Id == borehole.Id);
        Assert.AreEqual(newUser.Id, updatedBorehole.CreatedById);
        Assert.AreEqual(newUser.Id, updatedBorehole.UpdatedById);
        Assert.AreEqual(newUser.Id, updatedBorehole.LockedById);

        var disabledUser = await Context.Users.AsNoTracking().SingleAsync(u => u.Id == oldUser.Id);
        Assert.IsNotNull(disabledUser.DisabledAt);
    }

    [TestMethod]
    public async Task MergesUserWorkgroupRoleWithoutDuplicates()
    {
        var oldUser = CreateUser("sub_NIGHTPRISM_old", "nightprism@test.com", "NIGHTPRISM", "Old", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("sub_NIGHTPRISM_new", "nightprism@test.com", "NIGHTPRISM", "New", DateTime.UtcNow);

        var workgroup = await Context.Workgroups.FirstAsync();
        Context.UserWorkgroupRoles.Add(new UserWorkgroupRole { UserId = oldUser.Id, WorkgroupId = workgroup.Id, Role = Role.Editor });
        await Context.SaveChangesAsync().ConfigureAwait(false);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var roles = await Context.UserWorkgroupRoles.AsNoTracking().Where(r => r.UserId == newUser.Id).ToListAsync();
        Assert.IsTrue(roles.Any(r => r.WorkgroupId == workgroup.Id && r.Role == Role.Editor));
    }

    [TestMethod]
    public async Task MergesUserWorkgroupRoleWithOverlappingRoles()
    {
        var oldUser = CreateUser("sub_STORMQUILL_old", "stormquill@test.com", "STORMQUILL", "Old", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("sub_STORMQUILL_new", "stormquill@test.com", "STORMQUILL", "New", DateTime.UtcNow);

        var workgroup = await Context.Workgroups.FirstAsync();
        Context.UserWorkgroupRoles.Add(new UserWorkgroupRole { UserId = oldUser.Id, WorkgroupId = workgroup.Id, Role = Role.Editor });
        Context.UserWorkgroupRoles.Add(new UserWorkgroupRole { UserId = oldUser.Id, WorkgroupId = workgroup.Id, Role = Role.Validator });
        Context.UserWorkgroupRoles.Add(new UserWorkgroupRole { UserId = newUser.Id, WorkgroupId = workgroup.Id, Role = Role.Publisher });
        await Context.SaveChangesAsync().ConfigureAwait(false);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var roles = await Context.UserWorkgroupRoles.AsNoTracking().Where(r => r.UserId == newUser.Id && r.WorkgroupId == workgroup.Id).ToListAsync();
        Assert.HasCount(3, roles);
        Assert.IsTrue(roles.Any(r => r.Role == Role.Editor));
        Assert.IsTrue(roles.Any(r => r.Role == Role.Validator));
        Assert.IsTrue(roles.Any(r => r.Role == Role.Publisher));

        var oldRoles = await Context.UserWorkgroupRoles.AsNoTracking().Where(r => r.UserId == oldUser.Id).ToListAsync();
        Assert.HasCount(0, oldRoles);
    }

    [TestMethod]
    public async Task MergesTermsAcceptedWithOverlappingEntries()
    {
        var oldUser = CreateUser("sub_FROSTPEAK_old", "frostpeak@test.com", "FROSTPEAK", "Old", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("sub_FROSTPEAK_new", "frostpeak@test.com", "FROSTPEAK", "New", DateTime.UtcNow);

        var term = new Term { TextEn = "FROSTPEAK test term", Creation = DateTime.UtcNow };
        Context.Terms.Add(term);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        Context.Set<TermsAccepted>().Add(new TermsAccepted { UserId = oldUser.Id, TermId = term.Id, AcceptedAt = DateTime.UtcNow });
        Context.Set<TermsAccepted>().Add(new TermsAccepted { UserId = newUser.Id, TermId = term.Id, AcceptedAt = DateTime.UtcNow });
        await Context.SaveChangesAsync().ConfigureAwait(false);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var terms = await Context.Set<TermsAccepted>().AsNoTracking().Where(t => t.UserId == newUser.Id && t.TermId == term.Id).ToListAsync();
        Assert.HasCount(1, terms);

        var oldTerms = await Context.Set<TermsAccepted>().AsNoTracking().Where(t => t.UserId == oldUser.Id).ToListAsync();
        Assert.HasCount(0, oldTerms);
    }

    [TestMethod]
    public async Task HandlesMultipleDuplicateGroups()
    {
        var oldUserA = CreateUser("sub_SILENTDRIFT_old", "silentdrift@test.com", "SILENTDRIFT", "Old", DateTime.UtcNow.AddDays(-10));
        CreateUser("sub_SILENTDRIFT_new", "silentdrift@test.com", "SILENTDRIFT", "New", DateTime.UtcNow);

        var oldUserB = CreateUser("sub_CORALSPIRE_old", "coralspire@test.com", "CORALSPIRE", "Old", DateTime.UtcNow.AddDays(-10));
        CreateUser("sub_CORALSPIRE_new", "coralspire@test.com", "CORALSPIRE", "New", DateTime.UtcNow);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var state = (await Service.GetTaskStatesAsync()).Single(s => s.Type == MaintenanceTaskType.UserMerge);
        Assert.AreEqual(2, state.AffectedCount);

        Assert.IsNotNull((await Context.Users.AsNoTracking().SingleAsync(u => u.Id == oldUserA.Id)).DisabledAt);
        Assert.IsNotNull((await Context.Users.AsNoTracking().SingleAsync(u => u.Id == oldUserB.Id)).DisabledAt);
    }

    [TestMethod]
    public async Task DryRunMakesNoChanges()
    {
        var oldUser = CreateUser("sub_VOIDEMBER_old", "voidember@test.com", "VOIDEMBER", "Old", DateTime.UtcNow.AddDays(-10));
        CreateUser("sub_VOIDEMBER_new", "voidember@test.com", "VOIDEMBER", "New", DateTime.UtcNow);

        var borehole = new Borehole { CreatedBy = oldUser };
        Context.Boreholes.Add(borehole);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: true), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var state = (await Service.GetTaskStatesAsync()).Single(s => s.Type == MaintenanceTaskType.UserMerge);
        Assert.AreEqual(1, state.AffectedCount);

        // Verify nothing actually changed.
        var unchangedBorehole = await Context.Boreholes.AsNoTracking().SingleAsync(b => b.Id == borehole.Id);
        Assert.AreEqual(oldUser.Id, unchangedBorehole.CreatedById);

        var unchangedUser = await Context.Users.AsNoTracking().SingleAsync(u => u.Id == oldUser.Id);
        Assert.IsNull(unchangedUser.DisabledAt);
    }

    [TestMethod]
    public async Task SkipsSingleUserEmails()
    {
        var uniqueUser = CreateUser("sub_ASHWEAVER", "ashweaver@test.com", "ASHWEAVER", "Unique", DateTime.UtcNow);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var state = (await Service.GetTaskStatesAsync()).Single(s => s.Type == MaintenanceTaskType.UserMerge);
        Assert.IsNull(state.Message, $"Task failed with: {state.Message}");
        Assert.AreEqual(0, state.AffectedCount);

        var user = await Context.Users.AsNoTracking().SingleAsync(u => u.Id == uniqueUser.Id);
        Assert.IsNull(user.DisabledAt);
    }

    [TestMethod]
    public async Task PreservesTargetDisabledState()
    {
        var disabledAt = DateTime.UtcNow.AddDays(-1);
        CreateUser("sub_IRONBLOOM_old", "ironbloom@test.com", "IRONBLOOM", "Old", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("sub_IRONBLOOM_new", "ironbloom@test.com", "IRONBLOOM", "New", DateTime.UtcNow, disabledAt: disabledAt);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var target = await Context.Users.AsNoTracking().SingleAsync(u => u.Id == newUser.Id);
        Assert.IsNotNull(target.DisabledAt);
        Assert.AreEqual(disabledAt.Date, target.DisabledAt.Value.Date);
    }

    [TestMethod]
    public async Task HandlesThreeOrMoreDuplicatesInGroup()
    {
        var oldest = CreateUser("sub_BLAZERIFT_oldest", "blazerift@test.com", "BLAZERIFT", "Oldest", DateTime.UtcNow.AddDays(-20));
        var middle = CreateUser("sub_BLAZERIFT_middle", "blazerift@test.com", "BLAZERIFT", "Middle", DateTime.UtcNow.AddDays(-10));
        var newest = CreateUser("sub_BLAZERIFT_newest", "blazerift@test.com", "BLAZERIFT", "Newest", DateTime.UtcNow);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var state = (await Service.GetTaskStatesAsync()).Single(s => s.Type == MaintenanceTaskType.UserMerge);
        Assert.AreEqual(2, state.AffectedCount);

        Assert.IsNotNull((await Context.Users.AsNoTracking().SingleAsync(u => u.Id == oldest.Id)).DisabledAt);
        Assert.IsNotNull((await Context.Users.AsNoTracking().SingleAsync(u => u.Id == middle.Id)).DisabledAt);
        Assert.IsNull((await Context.Users.AsNoTracking().SingleAsync(u => u.Id == newest.Id)).DisabledAt);
    }

    [TestMethod]
    public async Task GroupsEmailsCaseInsensitively()
    {
        var lower = CreateUser("sub_ECLIPSEFANG_lower", "eclipsefang@test.com", "ECLIPSEFANG", "Lower", DateTime.UtcNow.AddDays(-10));
        var upper = CreateUser("sub_ECLIPSEFANG_upper", "ECLIPSEFANG@TEST.COM", "ECLIPSEFANG", "Upper", DateTime.UtcNow);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var state = (await Service.GetTaskStatesAsync()).Single(s => s.Type == MaintenanceTaskType.UserMerge);
        Assert.AreEqual(1, state.AffectedCount);

        Assert.IsNotNull((await Context.Users.AsNoTracking().SingleAsync(u => u.Id == lower.Id)).DisabledAt);
        Assert.IsNull((await Context.Users.AsNoTracking().SingleAsync(u => u.Id == upper.Id)).DisabledAt);
    }

    [TestMethod]
    public async Task HandlesBoreholeFileTripleFkReassignment()
    {
        var oldUser = CreateUser("sub_PRISMVOLT_old", "prismvolt@test.com", "PRISMVOLT", "Old", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("sub_PRISMVOLT_new", "prismvolt@test.com", "PRISMVOLT", "New", DateTime.UtcNow);

        var borehole = new Borehole { CreatedBy = newUser, UpdatedBy = newUser };
        Context.Boreholes.Add(borehole);

        var file = new Models.File { CreatedBy = newUser, Name = "PRISMVOLT.pdf", Type = "application/pdf", NameUuid = "prismvolt-uuid" };
        Context.Files.Add(file);

        await Context.SaveChangesAsync().ConfigureAwait(false);

        Context.BoreholeFiles.Add(new BoreholeFile { BoreholeId = borehole.Id, FileId = file.Id, UserId = oldUser.Id, CreatedById = oldUser.Id, UpdatedById = oldUser.Id });
        await Context.SaveChangesAsync().ConfigureAwait(false);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var bf = await Context.BoreholeFiles.AsNoTracking().SingleAsync(b => b.BoreholeId == borehole.Id && b.FileId == file.Id);
        Assert.AreEqual(newUser.Id, bf.UserId);
        Assert.AreEqual(newUser.Id, bf.CreatedById);
        Assert.AreEqual(newUser.Id, bf.UpdatedById);
    }

    [TestMethod]
    public async Task KeepsUserWithHighestId()
    {
        var older = CreateUser("sub_GHOSTPULSE_old", "ghostpulse@test.com", "GHOSTPULSE", "Old");
        var newer = CreateUser("sub_GHOSTPULSE_new", "ghostpulse@test.com", "GHOSTPULSE", "New");
        Assert.IsTrue(newer.Id > older.Id);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        // User with lower Id should be treated as oldest and get disabled.
        Assert.IsNotNull((await Context.Users.AsNoTracking().SingleAsync(u => u.Id == older.Id)).DisabledAt);
        Assert.IsNull((await Context.Users.AsNoTracking().SingleAsync(u => u.Id == newer.Id)).DisabledAt);
    }

    [TestMethod]
    public async Task StartUserMergeReturns202AndConflictReturns409()
    {
        CreateUser("sub_CRIMSONTIDE_old", "crimsontide@test.com", "CRIMSONTIDE", "Old", DateTime.UtcNow.AddDays(-10));
        CreateUser("sub_CRIMSONTIDE_new", "crimsontide@test.com", "CRIMSONTIDE", "New", DateTime.UtcNow);

        // First start should succeed.
        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));

        // Second start while running should fail.
        Assert.IsFalse(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));

        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);
    }

    /// <summary>
    /// Guards against silent regressions when new FK relationships to User are added.
    /// Queries all User FKs independently from the production code and asserts that
    /// <see cref="UserMergeTask.GetUserForeignKeys"/> discovers every single one.
    /// If this test fails, a new table references User but the merge task would skip it,
    /// leaving orphaned FK references after a merge.
    /// </summary>
    [TestMethod]
    public void EfMetadataSafetyNetCoversAllUserForeignKeys()
    {
        // Production code: uses GetColumnName(storeObject) which resolves the column name
        // for a specific table. This can return null for columns not mapped to that table
        // (e.g. with table splitting or TPT inheritance), and the production code filters
        // those out. This is what the merge task actually uses for SQL generation.
        var discoveredFks = UserMergeTask.GetUserForeignKeys(Context);

        // Independent query: uses GetColumnName() without a table argument, which returns
        // the default column name regardless of table mapping. This serves as the ground
        // truth for all User FKs in the model. If these two sets diverge, a FK relationship
        // is being missed by the merge task.
        var allModelFks = Context.Model.GetEntityTypes()
            .SelectMany(e => e.GetForeignKeys())
            .Where(fk => fk.PrincipalEntityType.ClrType == typeof(User))
            .SelectMany(fk => fk.Properties.Select(p => (TableName: fk.DeclaringEntityType.GetTableName()!, ColumnName: p.GetColumnName()!)))
            .ToList();

        foreach (var (tableName, columnName) in allModelFks)
        {
            Assert.IsTrue(
                discoveredFks.Any(d => d.TableName == tableName && d.ColumnName == columnName),
                $"FK {tableName}.{columnName} -> User is not covered by UserMergeTask.");
        }
    }

    [TestMethod]
    public async Task SourceUserIsDeletableAfterMerge()
    {
        var oldUser = CreateUser("sub_DAWNFORGE_old", "dawnforge@test.com", "DAWNFORGE", "Old", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("sub_DAWNFORGE_new", "dawnforge@test.com", "DAWNFORGE", "New", DateTime.UtcNow);

        // Standard FK: borehole with CreatedBy/UpdatedBy
        var borehole = new Borehole { CreatedBy = oldUser, UpdatedBy = oldUser };
        Context.Boreholes.Add(borehole);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        // Standard FK: stratigraphy with CreatedBy/UpdatedBy
        Context.Stratigraphies.Add(new Stratigraphy { BoreholeId = borehole.Id, CreatedBy = oldUser, UpdatedBy = oldUser });
        await Context.SaveChangesAsync().ConfigureAwait(false);

        // Triple FK: BoreholeFile with UserId/CreatedById/UpdatedById
        var file = new Models.File { CreatedBy = newUser, Name = "DAWNFORGE.pdf", Type = "application/pdf", NameUuid = "dawnforge-uuid" };
        Context.Files.Add(file);
        await Context.SaveChangesAsync().ConfigureAwait(false);
        Context.BoreholeFiles.Add(new BoreholeFile { BoreholeId = borehole.Id, FileId = file.Id, UserId = oldUser.Id, CreatedById = oldUser.Id, UpdatedById = oldUser.Id });
        await Context.SaveChangesAsync().ConfigureAwait(false);

        // Composite-key FK: UserWorkgroupRole
        var workgroup = await Context.Workgroups.FirstAsync().ConfigureAwait(false);
        Context.UserWorkgroupRoles.Add(new UserWorkgroupRole { UserId = oldUser.Id, WorkgroupId = workgroup.Id, Role = Role.Editor });
        await Context.SaveChangesAsync().ConfigureAwait(false);

        // Composite-key FK: TermsAccepted
        var term = new Term { TextEn = "DAWNFORGE test term", Creation = DateTime.UtcNow };
        Context.Terms.Add(term);
        await Context.SaveChangesAsync().ConfigureAwait(false);
        Context.Set<TermsAccepted>().Add(new TermsAccepted { UserId = oldUser.Id, TermId = term.Id, AcceptedAt = DateTime.UtcNow });
        await Context.SaveChangesAsync().ConfigureAwait(false);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        // After merge, the source user should have zero FK references and be deletable.
        var controller = new UserController(Context, new Mock<ILogger<UserController>>().Object, Helpers.CreateBoreholePermissionServiceMock().Object);
        controller.ControllerContext = Helpers.GetControllerContextAdmin();
        var result = await controller.Delete(oldUser.Id);
        ActionResultAssert.IsOk(result);

        Assert.IsFalse(await Context.Users.AsNoTracking().AnyAsync(u => u.Id == oldUser.Id));
    }
}
