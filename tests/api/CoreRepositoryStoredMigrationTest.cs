using BDMS.Migrations;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace BDMS;

/// <summary>
/// Runs <see cref="AddCoreRepositoryStoredAndSourceType"/> against a borehole that existed before it.
/// The test database is already migrated, so each test first removes what the migration adds.
/// Everything runs in the test transaction and is rolled back afterwards.
/// </summary>
[TestClass]
public class CoreRepositoryStoredMigrationTest
{
    private const string ExistingBoreholeName = "CORESTORE_EXISTING";
    private const string NewBoreholeName = "CORESTORE_NEW";

    private BdmsContext context;

    [TestInitialize]
    public async Task TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        await RestorePreMigrationSchemaAsync();
        await context.Database.ExecuteSqlAsync($"INSERT INTO bdms.borehole (original_name) VALUES ({ExistingBoreholeName})");
        await RunMigrationAsync(new AddCoreRepositoryStoredAndSourceType());
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task ExistingBoreholeIsSetToFalse()
    {
        var borehole = await context.Boreholes.AsNoTracking().SingleAsync(b => b.OriginalName == ExistingBoreholeName);
        Assert.AreEqual(false, borehole.CoreRepositoryStored);
    }

    [TestMethod]
    public async Task BoreholeInsertedWithoutTheColumnDefaultsToFalse()
    {
        await context.Database.ExecuteSqlAsync($"INSERT INTO bdms.borehole (original_name) VALUES ({NewBoreholeName})");

        var borehole = await context.Boreholes.AsNoTracking().SingleAsync(b => b.OriginalName == NewBoreholeName);
        Assert.AreEqual(false, borehole.CoreRepositoryStored);
    }

    [TestMethod]
    public async Task ExplicitNullIsKeptOnInsert()
    {
        var borehole = new Borehole { OriginalName = NewBoreholeName, CoreRepositoryStored = null };
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync();

        var stored = await context.Boreholes.AsNoTracking().SingleAsync(b => b.Id == borehole.Id);
        Assert.IsNull(stored.CoreRepositoryStored);
    }

    [TestMethod]
    public async Task InsertsSixSourceTypesInOrder()
    {
        var sourceTypes = await context.Codelists.AsNoTracking()
            .Where(c => c.Schema == BoreholeSchemas.SourceTypeSchema)
            .OrderBy(c => c.Order)
            .ToListAsync();

        CollectionAssert.AreEqual(
            new[] { "driller's log", "borehole profile", "report", "plan", "other", "not specified" },
            sourceTypes.Select(c => c.En).ToArray());
        CollectionAssert.AreEqual(
            new[] { "Bohrmeisterprotokoll", "Bohrprofil", "Bericht", "Plan", "anderer", "keine Angabe" },
            sourceTypes.Select(c => c.De).ToArray());
        CollectionAssert.AreEqual(
            new[] { "journal de forage", "profil de forage", "rapport", "plan", "autre", "sans indication" },
            sourceTypes.Select(c => c.Fr).ToArray());
        CollectionAssert.AreEqual(
            new[] { "rapporto dalla perforazione", "profilo di perforazione", "rapporto", "piano", "altro", "senza indicazioni" },
            sourceTypes.Select(c => c.It).ToArray());
        CollectionAssert.AreEqual(new int?[] { 1, 2, 3, 4, 5, 6 }, sourceTypes.Select(c => c.Order).ToArray());
        Assert.IsTrue(sourceTypes.All(c => c.Code == string.Empty));
    }

    /// <summary>
    /// Reverts the effects of the migration: no source type table and codelists, no core repository column.
    /// </summary>
    private async Task RestorePreMigrationSchemaAsync()
    {
        await context.Database.ExecuteSqlRawAsync(@"
            DROP TABLE bdms.borehole_source_type_codelist;
            DELETE FROM bdms.codelist WHERE ""schema"" = 'source_type';
            ALTER TABLE bdms.borehole DROP COLUMN core_repository_stored;");
    }

    private async Task RunMigrationAsync(Migration migration)
    {
        var sqlGenerator = context.GetService<IMigrationsSqlGenerator>();
        migration.ActiveProvider = context.Database.ProviderName ?? throw new InvalidOperationException("The test context has no database provider.");

        foreach (var command in sqlGenerator.Generate(migration.UpOperations))
        {
            await context.Database.ExecuteSqlRawAsync(command.CommandText);
        }
    }
}
