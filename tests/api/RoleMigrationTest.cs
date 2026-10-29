using BDMS.Migrations;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace BDMS;

/// <summary>
/// Runs the role migrations against users that hold several roles in a workgroup. The test database is
/// already migrated, so each test first restores the schema and role ids the migrations start from.
/// Everything runs in the test transaction and is rolled back afterwards.
/// </summary>
[TestClass]
public class RoleMigrationTest
{
    private const int OldReader = 0;
    private const int OldEditor = 1;
    private const int OldReviewer = 2;
    private const int OldValidator = 3;
    private const int OldPublisher = 4;

    private BdmsContext context;
    private Workgroup workgroup;
    private Workgroup otherWorkgroup;

    [TestInitialize]
    public async Task TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        await RestorePreMigrationRolesAsync();

        workgroup = new Workgroup { Name = "FROSTBYTE" };
        otherWorkgroup = new Workgroup { Name = "EMBERFALL" };
        context.Workgroups.AddRange(workgroup, otherWorkgroup);
        await context.SaveChangesAsync();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task KeepsOnlyTheHighestRolePerUserAndWorkgroup()
    {
        var publisher = await CreateUserWithRolesAsync("PUBLISHER", workgroup, OldReader, OldEditor, OldPublisher);
        var validator = await CreateUserWithRolesAsync("VALIDATOR", workgroup, OldEditor, OldValidator);
        var reviewerAndValidator = await CreateUserWithRolesAsync("REVIEWVALID", workgroup, OldReviewer, OldValidator);
        var reviewer = await CreateUserWithRolesAsync("REVIEWER", workgroup, OldEditor, OldReviewer);
        var reader = await CreateUserWithRolesAsync("READER", workgroup, OldReader);
        await AddRolesAsync(reader, otherWorkgroup, OldReader, OldPublisher);

        await RunRoleMigrationsAsync();

        var roles = await context.UserWorkgroupRoles.AsNoTracking()
            .Where(r => r.WorkgroupId == workgroup.Id || r.WorkgroupId == otherWorkgroup.Id)
            .ToListAsync();

        Assert.AreEqual(6, roles.Count);
        Assert.AreEqual(Role.Publisher, roles.Single(r => r.UserId == publisher.Id).Role);
        Assert.AreEqual(Role.Reviewer, roles.Single(r => r.UserId == validator.Id).Role);
        Assert.AreEqual(Role.Reviewer, roles.Single(r => r.UserId == reviewerAndValidator.Id).Role);
        Assert.AreEqual(Role.Reviewer, roles.Single(r => r.UserId == reviewer.Id).Role);
        Assert.AreEqual(Role.Reader, roles.Single(r => r.UserId == reader.Id && r.WorkgroupId == workgroup.Id).Role);
        Assert.AreEqual(Role.Publisher, roles.Single(r => r.UserId == reader.Id && r.WorkgroupId == otherWorkgroup.Id).Role);
    }

    [TestMethod]
    public async Task MovesValidatorsToReviewer()
    {
        var validator = await CreateUserWithRolesAsync("VALIDATOR", workgroup, OldValidator);

        await RunRoleMigrationsAsync();

        var role = await context.UserWorkgroupRoles.AsNoTracking().SingleAsync(r => r.UserId == validator.Id);
        Assert.AreEqual(Role.Reviewer, role.Role);
    }

    [TestMethod]
    public async Task LeavesRolesMatchingTheRoleEnum()
    {
        await RunRoleMigrationsAsync();

        var roleNames = await context.Database
            .SqlQueryRaw<string>("SELECT name AS \"Value\" FROM bdms.roles ORDER BY id")
            .ToListAsync();

        CollectionAssert.AreEqual(Enum.GetNames<Role>().Select(name => name.ToUpperInvariant()).ToList(), roleNames);
    }

    /// <summary>
    /// Reverts the effects of the role migrations: the old role names, Publisher at id 4,
    /// a separate Validator role at id 3 and a primary key that allows several roles per workgroup.
    /// </summary>
    private async Task RestorePreMigrationRolesAsync()
    {
        await context.Database.ExecuteSqlRawAsync(@"
            INSERT INTO bdms.roles (id, name, config) SELECT 4, 'PUBLIC', config FROM bdms.roles WHERE id = 3;
            UPDATE bdms.users_roles SET role_id = 4 WHERE role_id = 3;
            UPDATE bdms.roles SET name = 'VIEW' WHERE id = 0;
            UPDATE bdms.roles SET name = 'EDIT' WHERE id = 1;
            UPDATE bdms.roles SET name = 'CONTROL' WHERE id = 2;
            UPDATE bdms.roles SET name = 'VALID' WHERE id = 3;
            ALTER TABLE bdms.users_roles DROP CONSTRAINT ""PK_users_roles"";
            ALTER TABLE bdms.users_roles ADD CONSTRAINT users_roles_pkey PRIMARY KEY (user_id, role_id, workgroup_id);");
    }

    private async Task RunRoleMigrationsAsync()
    {
        Migration[] migrations = [new OneRolePerUserWorkgroup(), new RemoveValidatorRole(), new RenameRoles()];
        var sqlGenerator = context.GetService<IMigrationsSqlGenerator>();
        var provider = context.Database.ProviderName ?? throw new InvalidOperationException("The test context has no database provider.");

        foreach (var migration in migrations)
        {
            migration.ActiveProvider = provider;
            foreach (var command in sqlGenerator.Generate(migration.UpOperations))
            {
                await context.Database.ExecuteSqlRawAsync(command.CommandText);
            }
        }
    }

    private async Task<User> CreateUserWithRolesAsync(string firstName, Workgroup roleWorkgroup, params int[] roleIds)
    {
        var user = new User
        {
            SubjectId = $"sub_{firstName.ToLowerInvariant()}_migration",
            Email = $"{firstName.ToLowerInvariant()}@migration.test",
            FirstName = firstName,
            LastName = "MIGRATION",
            Name = firstName.ToLowerInvariant(),
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        await AddRolesAsync(user, roleWorkgroup, roleIds);
        return user;
    }

    private async Task AddRolesAsync(User user, Workgroup roleWorkgroup, params int[] roleIds)
    {
        foreach (var roleId in roleIds)
        {
            await context.Database.ExecuteSqlAsync(
                $"INSERT INTO bdms.users_roles (user_id, workgroup_id, role_id) VALUES ({user.Id}, {roleWorkgroup.Id}, {roleId})");
        }
    }
}
