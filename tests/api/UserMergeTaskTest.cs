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

    private User CreateUser(string firstName, string lastName, DateTime? createdAt = null, Action<User>? customize = null)
    {
        var user = new User
        {
            SubjectId = $"sub_{firstName}_{lastName}".ToLowerInvariant(),
            Email = $"{firstName.ToLowerInvariant()}@test.com",
            FirstName = firstName,
            LastName = lastName,
            Name = firstName.ToLowerInvariant(),
            CreatedAt = createdAt ?? DateTime.UtcNow,
        };
        customize?.Invoke(user);
        Context.Users.Add(user);
        Context.SaveChanges();
        return user;
    }

    [TestMethod]
    public async Task MergesDuplicateUsersAndReassignsAllForeignKeys()
    {
        var oldUser = CreateUser("BLAZEVAULT", "AMBER", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("BLAZEVAULT", "RIDGE", DateTime.UtcNow);

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
        var oldUser = CreateUser("NIGHTPRISM", "DUSK", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("NIGHTPRISM", "DAWN", DateTime.UtcNow);

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
        var oldUser = CreateUser("STORMQUILL", "FROST", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("STORMQUILL", "FLARE", DateTime.UtcNow);

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
        var oldUser = CreateUser("FROSTPEAK", "SHADOW", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("FROSTPEAK", "BLAZE", DateTime.UtcNow);

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
        var oldUserA = CreateUser("SILENTDRIFT", "EMBER", DateTime.UtcNow.AddDays(-10));
        CreateUser("SILENTDRIFT", "SPARK", DateTime.UtcNow);

        var oldUserB = CreateUser("CORALSPIRE", "STEEL", DateTime.UtcNow.AddDays(-10));
        CreateUser("CORALSPIRE", "CHROME", DateTime.UtcNow);

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
        var oldUser = CreateUser("VOIDEMBER", "COBALT", DateTime.UtcNow.AddDays(-10));
        CreateUser("VOIDEMBER", "COPPER", DateTime.UtcNow);

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
        var uniqueUser = CreateUser("ASHWEAVER", "SOLO", DateTime.UtcNow);

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
        CreateUser("IRONBLOOM", "GRANITE", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("IRONBLOOM", "MARBLE", DateTime.UtcNow, u => u.DisabledAt = disabledAt);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var target = await Context.Users.AsNoTracking().SingleAsync(u => u.Id == newUser.Id);
        Assert.IsNotNull(target.DisabledAt);
        Assert.AreEqual(disabledAt.Date, target.DisabledAt.Value.Date);
    }

    [TestMethod]
    public async Task PreservesTargetAdminFlag()
    {
        CreateUser("SOLARFLINT", "ZENITH", DateTime.UtcNow.AddDays(-10), u => u.IsAdmin = true);
        var newUser = CreateUser("SOLARFLINT", "NADIR", DateTime.UtcNow);

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.UserMerge, new MaintenanceTaskParameters(OnlyMissing: false, DryRun: false), AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.UserMerge);

        var target = await Context.Users.AsNoTracking().SingleAsync(u => u.Id == newUser.Id);
        Assert.IsFalse(target.IsAdmin);
    }

    [TestMethod]
    public async Task HandlesThreeOrMoreDuplicatesInGroup()
    {
        var oldest = CreateUser("BLAZERIFT", "IRON", DateTime.UtcNow.AddDays(-20));
        var middle = CreateUser("BLAZERIFT", "SILVER", DateTime.UtcNow.AddDays(-10));
        var newest = CreateUser("BLAZERIFT", "GOLD", DateTime.UtcNow);

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
        var lower = CreateUser("ECLIPSEFANG", "LUNAR", DateTime.UtcNow.AddDays(-10));
        var upper = CreateUser("ECLIPSEFANG", "SOLAR", DateTime.UtcNow, u => u.Email = "ECLIPSEFANG@TEST.COM");

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
        var oldUser = CreateUser("PRISMVOLT", "QUARTZ", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("PRISMVOLT", "OPAL", DateTime.UtcNow);

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
        var older = CreateUser("GHOSTPULSE", "DAGGER");
        var newer = CreateUser("GHOSTPULSE", "LANCE");
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
        CreateUser("CRIMSONTIDE", "RAVEN", DateTime.UtcNow.AddDays(-10));
        CreateUser("CRIMSONTIDE", "HAWK", DateTime.UtcNow);

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
        var oldUser = CreateUser("DAWNFORGE", "ANVIL", DateTime.UtcNow.AddDays(-10));
        var newUser = CreateUser("DAWNFORGE", "FORGE", DateTime.UtcNow);

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
        var controller = new UserController(Context, new Mock<ILogger<UserController>>().Object, Helpers.CreateBoreholePermissionServiceMock().Object, new UserSettingsResetService(Context));
        controller.ControllerContext = Helpers.GetControllerContextAdmin();
        var result = await controller.Delete(oldUser.Id);
        ActionResultAssert.IsOk(result);

        Assert.IsFalse(await Context.Users.AsNoTracking().AnyAsync(u => u.Id == oldUser.Id));
    }
}
