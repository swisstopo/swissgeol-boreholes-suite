using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS;

[TestClass]
public class BoreholeDataAvailabilityTest
{
    private BdmsContext context;

    [TestInitialize]
    public void TestInitialize() => context = ContextFactory.GetTestContext();

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task AvailabilityMatchesTheLoadedChildData()
    {
        var sampleIds = await GetSampleBoreholeIdsAsync();
        var boreholes = await context.BoreholesWithIncludes
            .AsNoTracking()
            .Where(b => sampleIds.Contains(b.Id))
            .ToListAsync();
        Assert.AreEqual(sampleIds.Count, boreholes.Count);

        var results = new List<BoreholeDataAvailability>();
        foreach (var borehole in boreholes)
        {
            var actual = await context.GetBoreholeDataAvailabilityAsync(borehole.Id);
            Assert.AreEqual(GetExpectedAvailability(borehole), actual, $"Borehole {borehole.Id}");
            results.Add(actual);
        }

        AssertEveryFlagIsSeenTrueAndFalse(results);
    }

    [TestMethod]
    public async Task ParentsWithoutChildrenSetOnlyTheParentFlags()
    {
        var completionKindId = await context.Codelists
            .Where(c => c.Schema == CompletionSchemas.CompletionKindSchema)
            .Select(c => c.Id)
            .FirstAsync();
        var id = await AddBoreholeAsync(borehole =>
        {
            borehole.Stratigraphies = new List<Stratigraphy> { new() { Name = "Without layers" } };
            borehole.Completions = new List<Completion> { new() { Name = "Without parts", KindId = completionKindId, IsPrimary = true } };
        });

        var actual = await context.GetBoreholeDataAvailabilityAsync(id);

        Assert.AreEqual(new BoreholeDataAvailability { HasStratigraphy = true, HasCompletion = true }, actual);
    }

    [TestMethod]
    public async Task ObservationTypeFlagsOnlyMatchTheirOwnType()
    {
        var quantityId = await context.Codelists
            .Where(c => c.Schema == HydrogeologySchemas.WateringressQualitySchema)
            .Select(c => c.Id)
            .FirstAsync();
        var id = await AddBoreholeAsync(borehole =>
            borehole.Observations = new List<Observation>
            {
                new WaterIngress { Type = ObservationType.WaterIngress, IsOpenBorehole = true, QuantityId = quantityId },
            });

        var actual = await context.GetBoreholeDataAvailabilityAsync(id);

        Assert.AreEqual(new BoreholeDataAvailability { HasObservation = true, HasWaterIngress = true }, actual);
    }

    private async Task<int> AddBoreholeAsync(Action<Borehole> addChildren)
    {
        var borehole = new Borehole { WorkgroupId = 1 };
        addChildren(borehole);
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync();
        return borehole.Id;
    }

    // One seeded borehole per kind of child data, the first seeded boreholes for mixed cases,
    // and boreholes created here for the empty and parent-only cases.
    private async Task<HashSet<int>> GetSampleBoreholeIdsAsync()
    {
        var ids = (await context.Boreholes.OrderBy(b => b.Id).Select(b => b.Id).Take(20).ToListAsync()).ToHashSet();
        ids.Add(await context.Sections.Select(s => s.BoreholeId).FirstAsync());
        ids.Add(await context.BoreholeGeometry.Select(g => g.BoreholeId).FirstAsync());
        ids.Add(await context.Stratigraphies.Where(s => context.Lithologies.Any(l => l.StratigraphyId == s.Id)).Select(s => s.BoreholeId).FirstAsync());
        ids.Add(await context.Stratigraphies.Where(s => context.LithostratigraphyLayers.Any(l => l.StratigraphyId == s.Id)).Select(s => s.BoreholeId).FirstAsync());
        ids.Add(await context.Stratigraphies.Where(s => context.ChronostratigraphyLayers.Any(l => l.StratigraphyId == s.Id)).Select(s => s.BoreholeId).FirstAsync());
        ids.Add(await context.Completions.Where(c => context.Casings.Any(x => x.CompletionId == c.Id)).Select(c => c.BoreholeId).FirstAsync());
        ids.Add(await context.Completions.Where(c => context.Backfills.Any(x => x.CompletionId == c.Id)).Select(c => c.BoreholeId).FirstAsync());
        ids.Add(await context.Completions.Where(c => context.Instrumentations.Any(x => x.CompletionId == c.Id)).Select(c => c.BoreholeId).FirstAsync());
        ids.Add(await context.WaterIngresses.Select(o => o.BoreholeId).FirstAsync());
        ids.Add(await context.GroundwaterLevelMeasurements.Select(o => o.BoreholeId).FirstAsync());
        ids.Add(await context.Hydrotests.Select(o => o.BoreholeId).FirstAsync());
        ids.Add(await context.FieldMeasurements.Select(o => o.BoreholeId).FirstAsync());
        ids.Add(await context.Profiles.Select(p => p.BoreholeId).FirstAsync());
        ids.Add(await context.Photos.Select(p => p.BoreholeId).FirstAsync());
        ids.Add(await context.Documents.Select(d => d.BoreholeId).FirstAsync());
        ids.Add(await context.LogRuns.Select(l => l.BoreholeId).FirstAsync());
        ids.Add(await AddBoreholeAsync(_ => { }));
        return ids;
    }

    // Mirrors what the client computed from the full borehole graph before the flags moved to the server.
    private static BoreholeDataAvailability GetExpectedAvailability(Borehole borehole) => new()
    {
        HasSections = borehole.Sections?.Count > 0,
        HasGeometry = borehole.BoreholeGeometry?.Count > 0,
        HasStratigraphy = borehole.Stratigraphies?.Count > 0,
        HasLithology = borehole.Stratigraphies?.Any(s => s.Lithologies?.Count > 0) == true,
        HasLithostratigraphy = borehole.Stratigraphies?.Any(s => s.LithostratigraphyLayers?.Count > 0) == true,
        HasChronostratigraphy = borehole.Stratigraphies?.Any(s => s.ChronostratigraphyLayers?.Count > 0) == true,
        HasCompletion = borehole.Completions?.Count > 0,
        HasCasings = borehole.Completions?.Any(c => c.Casings?.Count > 0) == true,
        HasBackfills = borehole.Completions?.Any(c => c.Backfills?.Count > 0) == true,
        HasInstrumentations = borehole.Completions?.Any(c => c.Instrumentations?.Count > 0) == true,
        HasObservation = borehole.Observations?.Count > 0,
        HasWaterIngress = borehole.Observations?.Any(o => o.Type == ObservationType.WaterIngress) == true,
        HasGroundwaterLevelMeasurement = borehole.Observations?.Any(o => o.Type == ObservationType.GroundwaterLevelMeasurement) == true,
        HasHydrotest = borehole.Observations?.Any(o => o.Type == ObservationType.Hydrotest) == true,
        HasFieldMeasurement = borehole.Observations?.Any(o => o.Type == ObservationType.FieldMeasurement) == true,
        HasProfiles = borehole.Profiles?.Count > 0,
        HasPhotos = borehole.Photos?.Count > 0,
        HasDocuments = borehole.Documents?.Count > 0,
        HasLogRuns = borehole.LogRuns?.Count > 0,
    };

    private static void AssertEveryFlagIsSeenTrueAndFalse(IReadOnlyCollection<BoreholeDataAvailability> results)
    {
        foreach (var flag in typeof(BoreholeDataAvailability).GetProperties().Where(p => p.PropertyType == typeof(bool)))
        {
            var values = results.Select(r => flag.GetValue(r) is true).ToHashSet();
            Assert.IsTrue(values.SetEquals(new[] { true, false }), $"The sample must contain boreholes with and without {flag.Name}.");
        }
    }
}
