using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.ObjectModel;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class LithologyControllerTest
{
    private BdmsContext context;
    private LithologyController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new LithologyController(context, new Mock<ILogger<LithologyController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetByStratigraphyIdReturnsTabContents()
    {
        var stratigraphyId = context.Lithologies.First().StratigraphyId;
        var response = await controller.GetByStratigraphyIdAsync(stratigraphyId).ConfigureAwait(false);

        var ok = response.Result as OkObjectResult;
        Assert.IsNotNull(ok);
        var contents = ok.Value as LithologyTabContents;
        Assert.IsNotNull(contents);
        Assert.IsTrue(contents.Lithologies.Any(), "Expected at least one lithology for the stratigraphy");

        for (var i = 1; i < contents.Lithologies.Count; i++)
        {
            Assert.IsTrue(contents.Lithologies[i - 1].FromDepth <= contents.Lithologies[i].FromDepth);
        }
    }

    [TestMethod]
    public async Task GetByStratigraphyIdReturnsNotFoundForInexistentId()
    {
        var response = await controller.GetByStratigraphyIdAsync(94578122).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task GetByStratigraphyIdReturnsUnauthorizedWithoutViewRights()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_unauthorized", PolicyNames.Viewer);
        var stratigraphyId = context.Stratigraphies.First().Id;

        var response = await controller.GetByStratigraphyIdAsync(stratigraphyId).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task CreateAddsSingleStratigraphyAndContentsInOneTransaction()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());
        var unconsolidatedLithology = GetCompleteLithology(); // IsUnconsolidated = true, carries USCS codelist ids
        var consolidatedLithology = MakeLithology(isUnconsolidated: false, fromDepth: 30, toDepth: 40);
        var unspecifiedLithology = MakeLithology(isUnconsolidated: null, fromDepth: 40, toDepth: 50);

        var request = MakeBatch(
            new StratigraphyWithLithology
            {
                Stratigraphy = new Stratigraphy
                {
                    BoreholeId = boreholeWithoutStratigraphy.Id,
                    Name = "LITHTAB-CREATE-1",
                    IsPrimary = false,
                },
                Lithologies = new Collection<Lithology> { unconsolidatedLithology, consolidatedLithology, unspecifiedLithology },
                LithologicalDescriptions = new Collection<LithologicalDescription>
                {
                    new() { FromDepth = 0, ToDepth = 10, Description = "Description" },
                },
                FaciesDescriptions = new Collection<FaciesDescription>
                {
                    new() { FromDepth = 0, ToDepth = 5, Description = "Facies" },
                },
            });

        var response = await controller.CreateAsync(request).ConfigureAwait(false);
        var results = ExtractOkBatch(response);
        Assert.AreEqual(1, results.Count);
        var body = results[0];

        Assert.AreNotEqual(0, body.Stratigraphy.Id);

        // First stratigraphy of a borehole becomes primary automatically.
        Assert.IsTrue(body.Stratigraphy.IsPrimary);

        Assert.AreEqual(3, body.Lithologies.Count);
        Assert.IsTrue(body.Lithologies.All(l => l.StratigraphyId == body.Stratigraphy.Id));
        Assert.IsTrue(body.Lithologies.All(l => l.Id != 0));

        Assert.AreEqual(1, body.LithologicalDescriptions.Count);
        Assert.AreEqual(body.Stratigraphy.Id, body.LithologicalDescriptions[0].StratigraphyId);

        Assert.AreEqual(1, body.FaciesDescriptions.Count);
        Assert.AreEqual(body.Stratigraphy.Id, body.FaciesDescriptions[0].StratigraphyId);

        // Each lithology's IsUnconsolidated value is preserved end-to-end — true / false / null all round-trip.
        var savedUnconsolidated = body.Lithologies.Single(l => l.FromDepth == unconsolidatedLithology.FromDepth);
        var savedConsolidated = body.Lithologies.Single(l => l.FromDepth == consolidatedLithology.FromDepth);
        var savedUnspecified = body.Lithologies.Single(l => l.FromDepth == unspecifiedLithology.FromDepth);
        Assert.AreEqual(true, savedUnconsolidated.IsUnconsolidated);
        Assert.AreEqual(false, savedConsolidated.IsUnconsolidated);
        Assert.IsNull(savedUnspecified.IsUnconsolidated, "Unspecified lithology must persist with IsUnconsolidated=null, not be coerced to false.");

        CollectionAssert.AreEquivalent(new List<int> { 23101004, 23101015 }, savedUnconsolidated.UscsTypeCodelistIds!.ToList());
    }

    [TestMethod]
    public async Task CreateAddsMultipleStratigraphiesInOneTransaction()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());
        var request = MakeBatch(
            MakeBatchEntry(boreholeWithoutStratigraphy.Id, "BATCH-A", lithologyDepthFrom: 0),
            MakeBatchEntry(boreholeWithoutStratigraphy.Id, "BATCH-B", lithologyDepthFrom: 10),
            MakeBatchEntry(boreholeWithoutStratigraphy.Id, "BATCH-C", lithologyDepthFrom: 20));

        var response = await controller.CreateAsync(request).ConfigureAwait(false);
        var results = ExtractOkBatch(response);
        Assert.AreEqual(3, results.Count);
        CollectionAssert.AllItemsAreUnique(results.Select(r => r.Stratigraphy.Id).ToList());

        // Only the first one in the batch auto-promotes to primary.
        Assert.IsTrue(results[0].Stratigraphy.IsPrimary);
        Assert.IsFalse(results[1].Stratigraphy.IsPrimary);
        Assert.IsFalse(results[2].Stratigraphy.IsPrimary);

        foreach (var result in results)
        {
            Assert.AreEqual(1, result.Lithologies.Count);
            Assert.AreEqual(result.Stratigraphy.Id, result.Lithologies[0].StratigraphyId);
        }
    }

    [TestMethod]
    public async Task CreateAutoSuffixesConflictingNames()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        // First batch establishes "report_1" and "report_2".
        var firstBatch = await controller.CreateAsync(MakeBatch(
            MakeBatchEntry(boreholeWithoutStratigraphy.Id, "report_1", lithologyDepthFrom: 0),
            MakeBatchEntry(boreholeWithoutStratigraphy.Id, "report_2", lithologyDepthFrom: 10))).ConfigureAwait(false);
        var firstResults = ExtractOkBatch(firstBatch);
        Assert.AreEqual("report_1", firstResults[0].Stratigraphy.Name);
        Assert.AreEqual("report_2", firstResults[1].Stratigraphy.Name);

        // Re-importing the same PDF lands as "report_1 (1)" and "report_2 (1)".
        var secondBatch = await controller.CreateAsync(MakeBatch(
            MakeBatchEntry(boreholeWithoutStratigraphy.Id, "report_1", lithologyDepthFrom: 0),
            MakeBatchEntry(boreholeWithoutStratigraphy.Id, "report_2", lithologyDepthFrom: 10))).ConfigureAwait(false);
        var secondResults = ExtractOkBatch(secondBatch);
        Assert.AreEqual("report_1 (1)", secondResults[0].Stratigraphy.Name);
        Assert.AreEqual("report_2 (1)", secondResults[1].Stratigraphy.Name);
    }

    [TestMethod]
    public async Task CreateRejectsMixedBoreholes()
    {
        var firstBorehole = (await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any())).Id;
        var secondBorehole = (await context.BoreholesWithIncludes.FirstAsync(b => b.Id != firstBorehole && !b.Stratigraphies.Any())).Id;

        var request = MakeBatch(
            MakeBatchEntry(firstBorehole, "MIXED-A", lithologyDepthFrom: 0),
            MakeBatchEntry(secondBorehole, "MIXED-B", lithologyDepthFrom: 0));

        var response = await controller.CreateAsync(request).ConfigureAwait(false);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task CreateReturnsBadRequestForNullRequest()
    {
        var response = await controller.CreateAsync(null!).ConfigureAwait(false);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task CreateReturnsBadRequestForEmptyBatch()
    {
        var response = await controller.CreateAsync(new Collection<StratigraphyWithLithology>()).ConfigureAwait(false);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task CreateReturnsUnauthorizedForLockedBorehole()
    {
        SetupControllerWithAlwaysLockedBorehole();
        var request = MakeBatch(MakeBatchEntry(context.Boreholes.First().Id, "should-fail", lithologyDepthFrom: 0));

        var response = await controller.CreateAsync(request).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task CreatePersistsCompleteUnconsolidatedLithology()
    {
        var boreholeId = (await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any())).Id;
        var input = GetFullyPopulatedLithology(isUnconsolidated: true, fromDepth: 10, toDepth: 20);

        var response = await controller.CreateAsync(MakeBatch(new StratigraphyWithLithology
        {
            Stratigraphy = new Stratigraphy { BoreholeId = boreholeId, Name = "uncon-full" },
            Lithologies = new Collection<Lithology> { input },
        })).ConfigureAwait(false);

        var saved = ExtractOkBatch(response)[0].Lithologies.Single();
        var savedDescription = saved.LithologyDescriptions!.Single();

        // Base + unconsolidated lithology fields round-trip.
        Assert.AreEqual(true, saved.IsUnconsolidated);
        Assert.AreEqual(true, saved.HasBedding);
        Assert.AreEqual(70, saved.Share);
        Assert.AreEqual("Round-trip test", saved.Notes);
        Assert.AreEqual(100000175, saved.AlterationDegreeId);
        Assert.AreEqual(21102002, saved.CompactnessId);
        Assert.AreEqual(21116001, saved.CohesionId);
        Assert.AreEqual(21105001, saved.HumidityId);
        Assert.AreEqual(21103010, saved.ConsistencyId);
        Assert.AreEqual(21101002, saved.PlasticityId);
        Assert.AreEqual(100000493, saved.UscsDeterminationId);
        CollectionAssert.AreEquivalent(new List<int> { 23101004, 23101015 }, saved.UscsTypeCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000167 }, saved.RockConditionCodelistIds!.ToList());

        // Consolidated-side lithology fields must be empty.
        Assert.AreEqual(0, saved.TextureMetaCodelistIds!.Count);

        // Unconsolidated-side description fields round-trip.
        Assert.AreEqual(100000077, savedDescription.ColorPrimaryId);
        Assert.AreEqual(100000083, savedDescription.ColorSecondaryId);
        Assert.AreEqual(100000022, savedDescription.LithologyUnconMainId);
        Assert.AreEqual(100000051, savedDescription.LithologyUncon2Id);
        Assert.AreEqual(100000054, savedDescription.LithologyUncon3Id);
        Assert.AreEqual(100000045, savedDescription.LithologyUncon4Id);
        Assert.AreEqual(100000039, savedDescription.LithologyUncon5Id);
        Assert.AreEqual(100000049, savedDescription.LithologyUncon6Id);
        Assert.IsTrue(savedDescription.HasStriae);
        CollectionAssert.AreEquivalent(new List<int> { 21108004, 21108008 }, savedDescription.ComponentUnconOrganicCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 9102 }, savedDescription.ComponentUnconDebrisCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21110002, 21110004, 21110003 }, savedDescription.GrainShapeCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21115001 }, savedDescription.GrainAngularityCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000503, 100000513 }, savedDescription.LithologyUnconDebrisCodelistIds!.ToList());

        // Consolidated-side description fields must be cleared.
        Assert.IsNull(savedDescription.LithologyConId);
        Assert.IsNull(savedDescription.GrainAngularityId);
        Assert.IsNull(savedDescription.GrainSizeId);
        Assert.IsNull(savedDescription.GradationId);
        Assert.IsNull(savedDescription.CementationId);
        Assert.AreEqual(0, savedDescription.ComponentConParticleCodelistIds!.Count);
        Assert.AreEqual(0, savedDescription.ComponentConMineralCodelistIds!.Count);
        Assert.AreEqual(0, savedDescription.StructureSynGenCodelistIds!.Count);
        Assert.AreEqual(0, savedDescription.StructurePostGenCodelistIds!.Count);
    }

    [TestMethod]
    public async Task CreatePersistsCompleteConsolidatedLithology()
    {
        var boreholeId = (await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any())).Id;
        var input = GetFullyPopulatedLithology(isUnconsolidated: false, fromDepth: 10, toDepth: 20);

        var response = await controller.CreateAsync(MakeBatch(new StratigraphyWithLithology
        {
            Stratigraphy = new Stratigraphy { BoreholeId = boreholeId, Name = "con-full" },
            Lithologies = new Collection<Lithology> { input },
        })).ConfigureAwait(false);

        var saved = ExtractOkBatch(response)[0].Lithologies.Single();
        var savedDescription = saved.LithologyDescriptions!.Single();

        // Base + consolidated lithology fields round-trip.
        Assert.AreEqual(false, saved.IsUnconsolidated);
        Assert.AreEqual(true, saved.HasBedding);
        Assert.AreEqual(70, saved.Share);
        Assert.AreEqual("Round-trip test", saved.Notes);
        Assert.AreEqual(100000175, saved.AlterationDegreeId);
        CollectionAssert.AreEquivalent(new List<int> { 100000470, 100000477 }, saved.TextureMetaCodelistIds!.ToList());

        // Unconsolidated-side lithology fields must be cleared.
        Assert.IsNull(saved.CompactnessId);
        Assert.IsNull(saved.CohesionId);
        Assert.IsNull(saved.HumidityId);
        Assert.IsNull(saved.ConsistencyId);
        Assert.IsNull(saved.PlasticityId);
        Assert.IsNull(saved.UscsDeterminationId);
        Assert.AreEqual(0, saved.UscsTypeCodelistIds!.Count);
        Assert.AreEqual(0, saved.RockConditionCodelistIds!.Count);

        // Consolidated-side description fields round-trip.
        Assert.AreEqual(100000508, savedDescription.LithologyConId);
        Assert.AreEqual(21115007, savedDescription.GrainAngularityId);
        Assert.AreEqual(21109007, savedDescription.GrainSizeId);
        Assert.AreEqual(30000015, savedDescription.GradationId);
        Assert.AreEqual(100000360, savedDescription.CementationId);
        CollectionAssert.AreEquivalent(new List<int> { 100000186, 100000181 }, savedDescription.ComponentConParticleCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000260 }, savedDescription.ComponentConMineralCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000377, 100000365, 100000399 }, savedDescription.StructureSynGenCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000428, 100000435 }, savedDescription.StructurePostGenCodelistIds!.ToList());

        // Unconsolidated-side description fields must be cleared.
        Assert.IsNull(savedDescription.LithologyUnconMainId);
        Assert.IsNull(savedDescription.LithologyUncon2Id);
        Assert.IsNull(savedDescription.LithologyUncon3Id);
        Assert.IsNull(savedDescription.LithologyUncon4Id);
        Assert.IsNull(savedDescription.LithologyUncon5Id);
        Assert.IsNull(savedDescription.LithologyUncon6Id);
        Assert.IsFalse(savedDescription.HasStriae);
        Assert.AreEqual(0, savedDescription.ComponentUnconOrganicCodelistIds!.Count);
        Assert.AreEqual(0, savedDescription.ComponentUnconDebrisCodelistIds!.Count);
        Assert.AreEqual(0, savedDescription.GrainShapeCodelistIds!.Count);
        Assert.AreEqual(0, savedDescription.GrainAngularityCodelistIds!.Count);
        Assert.AreEqual(0, savedDescription.LithologyUnconDebrisCodelistIds!.Count);
    }

    [TestMethod]
    public async Task CreateUnspecifiedLithologyClearsAllCategorizationFields()
    {
        var boreholeId = (await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any())).Id;

        // Populate every field on both sides; the backend must null/empty everything except
        // FromDepth, ToDepth, Notes, and HasBedding (which is forced to false).
        var input = GetFullyPopulatedLithology(isUnconsolidated: null, fromDepth: 10, toDepth: 20);

        var response = await controller.CreateAsync(MakeBatch(new StratigraphyWithLithology
        {
            Stratigraphy = new Stratigraphy { BoreholeId = boreholeId, Name = "unspec-full" },
            Lithologies = new Collection<Lithology> { input },
        })).ConfigureAwait(false);

        var saved = ExtractOkBatch(response)[0].Lithologies.Single();

        // Preserved.
        Assert.AreEqual(10, saved.FromDepth);
        Assert.AreEqual(20, saved.ToDepth);
        Assert.AreEqual("Round-trip test", saved.Notes);

        // Forced regardless of input.
        Assert.IsNull(saved.IsUnconsolidated);
        Assert.IsFalse(saved.HasBedding);
        Assert.IsNull(saved.Share);

        // Everything else cleared — including AlterationDegreeId which exists at the base level.
        Assert.IsNull(saved.AlterationDegreeId);
        Assert.IsNull(saved.CompactnessId);
        Assert.IsNull(saved.CohesionId);
        Assert.IsNull(saved.HumidityId);
        Assert.IsNull(saved.ConsistencyId);
        Assert.IsNull(saved.PlasticityId);
        Assert.IsNull(saved.UscsDeterminationId);
        Assert.AreEqual(0, saved.UscsTypeCodelistIds!.Count);
        Assert.AreEqual(0, saved.RockConditionCodelistIds!.Count);
        Assert.AreEqual(0, saved.TextureMetaCodelistIds!.Count);

        // Unspecified lithologies carry no lithology descriptions.
        Assert.AreEqual(0, saved.LithologyDescriptions!.Count);
    }

    [TestMethod]
    public async Task UpdateLithologyFlipsCategorizationSide()
    {
        var boreholeId = (await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any())).Id;

        // Seed with a fully populated unconsolidated lithology.
        var createResponse = await controller.CreateAsync(MakeBatch(new StratigraphyWithLithology
        {
            Stratigraphy = new Stratigraphy { BoreholeId = boreholeId, Name = "edit-flip" },
            Lithologies = new Collection<Lithology> { GetFullyPopulatedLithology(isUnconsolidated: true, fromDepth: 10, toDepth: 20) },
        })).ConfigureAwait(false);
        var seeded = ExtractOkBatch(createResponse)[0];
        var stratigraphyId = seeded.Stratigraphy.Id;
        var seededLithology = seeded.Lithologies.Single();

        // Flip to consolidated. Set consolidated-only fields; old unconsolidated fields stay on
        // the object so we can confirm the backend wipes them on update.
        seededLithology.IsUnconsolidated = false;
        seededLithology.TextureMetaCodelistIds = new List<int> { 100000470, 100000477 };
        var seededDescription = seededLithology.LithologyDescriptions!.Single();
        seededDescription.LithologyConId = 100000508;
        seededDescription.ComponentConParticleCodelistIds = new List<int> { 100000186 };
        seededDescription.GrainSizeId = 21109007;

        var updateResponse = await controller.UpdateContentsAsync(stratigraphyId, new LithologyTabContents
        {
            Lithologies = new Collection<Lithology> { seededLithology },
        }).ConfigureAwait(false);
        var updated = ((StratigraphyWithLithology)((OkObjectResult)updateResponse.Result!).Value!).Lithologies.Single();
        var updatedDescription = updated.LithologyDescriptions!.Single();

        // Consolidated side now set.
        Assert.AreEqual(false, updated.IsUnconsolidated);
        CollectionAssert.AreEquivalent(new List<int> { 100000470, 100000477 }, updated.TextureMetaCodelistIds!.ToList());
        Assert.AreEqual(100000508, updatedDescription.LithologyConId);
        CollectionAssert.AreEquivalent(new List<int> { 100000186 }, updatedDescription.ComponentConParticleCodelistIds!.ToList());
        Assert.AreEqual(21109007, updatedDescription.GrainSizeId);

        // Unconsolidated side wiped on update.
        Assert.IsNull(updated.CompactnessId);
        Assert.IsNull(updated.CohesionId);
        Assert.IsNull(updated.HumidityId);
        Assert.IsNull(updated.ConsistencyId);
        Assert.IsNull(updated.PlasticityId);
        Assert.IsNull(updated.UscsDeterminationId);
        Assert.AreEqual(0, updated.UscsTypeCodelistIds!.Count);
        Assert.AreEqual(0, updated.RockConditionCodelistIds!.Count);
        Assert.IsNull(updatedDescription.LithologyUnconMainId);
        Assert.IsFalse(updatedDescription.HasStriae);
        Assert.AreEqual(0, updatedDescription.ComponentUnconOrganicCodelistIds!.Count);
        Assert.AreEqual(0, updatedDescription.GrainShapeCodelistIds!.Count);
        Assert.AreEqual(0, updatedDescription.LithologyUnconDebrisCodelistIds!.Count);
    }

    [TestMethod]
    public async Task UpdateUnconsolidatedLithologyDiffsCodelistLinks()
    {
        var boreholeId = (await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any())).Id;

        // Seed with a fully populated unconsolidated lithology.
        var createResponse = await controller.CreateAsync(MakeBatch(new StratigraphyWithLithology
        {
            Stratigraphy = new Stratigraphy { BoreholeId = boreholeId, Name = "uncon-edit-codelists" },
            Lithologies = new Collection<Lithology> { GetFullyPopulatedLithology(fromDepth: 10, toDepth: 20, isUnconsolidated: true) },
        })).ConfigureAwait(false);
        var seeded = ExtractOkBatch(createResponse)[0];
        var stratigraphyId = seeded.Stratigraphy.Id;
        var seededLithology = seeded.Lithologies.Single();
        var seededDescription = seededLithology.LithologyDescriptions!.Single();

        // Mutate every unconsolidated codelist link collection to exercise add / keep / drop / clear.
        // The join-table diff runs in UpdateLithologyCodesAsync / UpdateLithologyDescriptionCodesAsync.
        seededLithology.UscsTypeCodelistIds = new List<int> { 23101015 };                          // drop 23101004, keep 23101015
        seededLithology.RockConditionCodelistIds = new List<int> { 100000167, 100000169 };         // keep + add
        seededLithology.Notes = "Updated notes";                                                    // scalar update

        seededDescription.ComponentUnconOrganicCodelistIds = new List<int> { 21108003, 21108004 }; // drop 21108008, keep 21108004, add 21108003
        seededDescription.ComponentUnconDebrisCodelistIds = new List<int> { 9100 };                // replace 9102 with 9100
        seededDescription.GrainShapeCodelistIds = new List<int>();                                  // clear all
        seededDescription.GrainAngularityCodelistIds = new List<int> { 21115001, 21115007 };        // keep + add
        seededDescription.LithologyUnconDebrisCodelistIds = new List<int> { 100000536 };           // replace both
        seededDescription.HasStriae = false;                                                        // scalar flip

        var updateResponse = await controller.UpdateContentsAsync(stratigraphyId, new LithologyTabContents
        {
            Lithologies = new Collection<Lithology> { seededLithology },
        }).ConfigureAwait(false);
        var updated = ((StratigraphyWithLithology)((OkObjectResult)updateResponse.Result!).Value!).Lithologies.Single();
        var updatedDescription = updated.LithologyDescriptions!.Single();

        // Identity preserved — the existing row is edited in place, not recreated.
        Assert.AreEqual(seededLithology.Id, updated.Id);
        Assert.AreEqual(seededDescription.Id, updatedDescription.Id);

        // Each codelist collection diffed correctly.
        CollectionAssert.AreEquivalent(new List<int> { 23101015 }, updated.UscsTypeCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000167, 100000169 }, updated.RockConditionCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21108003, 21108004 }, updatedDescription.ComponentUnconOrganicCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 9100 }, updatedDescription.ComponentUnconDebrisCodelistIds!.ToList());
        Assert.AreEqual(0, updatedDescription.GrainShapeCodelistIds!.Count);
        CollectionAssert.AreEquivalent(new List<int> { 21115001, 21115007 }, updatedDescription.GrainAngularityCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000536 }, updatedDescription.LithologyUnconDebrisCodelistIds!.ToList());

        // Scalar updates ride along on the same PUT.
        Assert.AreEqual("Updated notes", updated.Notes);
        Assert.IsFalse(updatedDescription.HasStriae);
    }

    [TestMethod]
    public async Task UpdateConsolidatedLithologyDiffsCodelistLinks()
    {
        var boreholeId = (await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any())).Id;

        // Seed with a fully populated consolidated lithology.
        var createResponse = await controller.CreateAsync(MakeBatch(new StratigraphyWithLithology
        {
            Stratigraphy = new Stratigraphy { BoreholeId = boreholeId, Name = "con-edit-codelists" },
            Lithologies = new Collection<Lithology> { GetFullyPopulatedLithology(fromDepth: 10, toDepth: 20, isUnconsolidated: false) },
        })).ConfigureAwait(false);
        var seeded = ExtractOkBatch(createResponse)[0];
        var stratigraphyId = seeded.Stratigraphy.Id;
        var seededLithology = seeded.Lithologies.Single();
        var seededDescription = seededLithology.LithologyDescriptions!.Single();

        // Mutate every consolidated codelist link collection — add / keep / drop / clear.
        seededLithology.TextureMetaCodelistIds = new List<int> { 100000469, 100000470, 100000482 }; // keep 100000470, drop 100000477, add 100000469 + 100000482

        seededDescription.ComponentConParticleCodelistIds = new List<int> { 100000183, 100000181 };               // keep 100000181, drop 100000186, add 100000183
        seededDescription.ComponentConMineralCodelistIds = new List<int>();                                        // clear all
        seededDescription.StructureSynGenCodelistIds = new List<int> { 100000391 };                                // replace all
        seededDescription.StructurePostGenCodelistIds = new List<int> { 100000428, 100000435, 100000456, 100000463 }; // keep both + add two
        seededDescription.GrainSizeId = 100000499;                                                                 // scalar swap

        var updateResponse = await controller.UpdateContentsAsync(stratigraphyId, new LithologyTabContents
        {
            Lithologies = new Collection<Lithology> { seededLithology },
        }).ConfigureAwait(false);
        var updated = ((StratigraphyWithLithology)((OkObjectResult)updateResponse.Result!).Value!).Lithologies.Single();
        var updatedDescription = updated.LithologyDescriptions!.Single();

        // Identity preserved.
        Assert.AreEqual(seededLithology.Id, updated.Id);
        Assert.AreEqual(seededDescription.Id, updatedDescription.Id);

        // Each codelist collection diffed correctly.
        CollectionAssert.AreEquivalent(new List<int> { 100000469, 100000470, 100000482 }, updated.TextureMetaCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000183, 100000181 }, updatedDescription.ComponentConParticleCodelistIds!.ToList());
        Assert.AreEqual(0, updatedDescription.ComponentConMineralCodelistIds!.Count);
        CollectionAssert.AreEquivalent(new List<int> { 100000391 }, updatedDescription.StructureSynGenCodelistIds!.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000428, 100000435, 100000456, 100000463 }, updatedDescription.StructurePostGenCodelistIds!.ToList());
        Assert.AreEqual(100000499, updatedDescription.GrainSizeId);
    }

    [TestMethod]
    public async Task UpdateContentsAddsUpdatesAndDeletes()
    {
        var stratigraphyId = await SeedStratigraphyWithContentsAsync().ConfigureAwait(false);

        var initial = await controller.GetByStratigraphyIdAsync(stratigraphyId).ConfigureAwait(false);
        var initialContents = (LithologyTabContents)((OkObjectResult)initial.Result!).Value!;
        Assert.AreEqual(2, initialContents.Lithologies.Count);
        Assert.AreEqual(2, initialContents.LithologicalDescriptions.Count);
        Assert.AreEqual(1, initialContents.FaciesDescriptions.Count);

        var keptLithology = initialContents.Lithologies[0];
        keptLithology.Notes = "updated-during-replace";
        var newLithology = MakeLithology(isUnconsolidated: false, fromDepth: 99, toDepth: 100);

        var keptDescription = initialContents.LithologicalDescriptions[0];
        keptDescription.Description = "edited";
        var newDescription = new LithologicalDescription { FromDepth = 50, ToDepth = 60, Description = "added" };

        var request = new LithologyTabContents
        {
            Lithologies = new Collection<Lithology> { keptLithology, newLithology },
            LithologicalDescriptions = new Collection<LithologicalDescription> { keptDescription, newDescription },
            FaciesDescriptions = new Collection<FaciesDescription>(),
        };

        var response = await controller.UpdateContentsAsync(stratigraphyId, request).ConfigureAwait(false);
        var ok = response.Result as OkObjectResult;
        Assert.IsNotNull(ok);
        var body = (StratigraphyWithLithology)ok.Value!;

        Assert.AreEqual(2, body.Lithologies.Count);
        Assert.IsTrue(body.Lithologies.Any(l => l.Id == keptLithology.Id && l.Notes == "updated-during-replace"));
        Assert.IsTrue(body.Lithologies.Any(l => l.FromDepth == 99 && l.Id != 0));

        Assert.AreEqual(2, body.LithologicalDescriptions.Count);
        Assert.IsTrue(body.LithologicalDescriptions.Any(d => d.Id == keptDescription.Id && d.Description == "edited"));
        Assert.IsTrue(body.LithologicalDescriptions.Any(d => d.Description == "added" && d.Id != 0));

        Assert.AreEqual(0, body.FaciesDescriptions.Count);
    }

    [TestMethod]
    public async Task UpdateContentsRejectsMismatchingStratigraphyId()
    {
        var stratigraphyId = await SeedStratigraphyWithContentsAsync().ConfigureAwait(false);
        var otherStratigraphyId = stratigraphyId + 999;

        var foreignChild = MakeLithology(isUnconsolidated: true, fromDepth: 0, toDepth: 1);
        foreignChild.StratigraphyId = otherStratigraphyId;

        var request = new LithologyTabContents
        {
            Lithologies = new Collection<Lithology> { foreignChild },
        };

        var response = await controller.UpdateContentsAsync(stratigraphyId, request).ConfigureAwait(false);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task UpdateContentsReturnsNotFoundForInexistentStratigraphy()
    {
        var response = await controller.UpdateContentsAsync(94578122, new LithologyTabContents()).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task UpdateContentsReturnsUnauthorizedForLockedBorehole()
    {
        var stratigraphyId = await SeedStratigraphyWithContentsAsync().ConfigureAwait(false);
        SetupControllerWithAlwaysLockedBorehole();

        var response = await controller.UpdateContentsAsync(stratigraphyId, new LithologyTabContents()).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task UpdateContentsRejectsForeignChildIds()
    {
        var stratigraphyId = await SeedStratigraphyWithContentsAsync().ConfigureAwait(false);
        var otherStratigraphyId = (await context.Stratigraphies.FirstAsync(s => s.Id != stratigraphyId)).Id;
        var foreignLithologyId = (await context.Lithologies.FirstAsync(l => l.StratigraphyId == otherStratigraphyId)).Id;

        var request = new LithologyTabContents
        {
            Lithologies = new Collection<Lithology>
            {
                new Lithology { Id = foreignLithologyId, StratigraphyId = stratigraphyId, FromDepth = 0, ToDepth = 1 },
            },
        };

        var response = await controller.UpdateContentsAsync(stratigraphyId, request).ConfigureAwait(false);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    private async Task<int> SeedStratigraphyWithContentsAsync()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());
        var seedResponse = await controller.CreateAsync(MakeBatch(new StratigraphyWithLithology
        {
            Stratigraphy = new Stratigraphy { BoreholeId = boreholeWithoutStratigraphy.Id, Name = $"seed-{Guid.NewGuid()}" },
            Lithologies = new Collection<Lithology>
            {
                MakeLithology(isUnconsolidated: true, fromDepth: 0, toDepth: 10),
                MakeLithology(isUnconsolidated: false, fromDepth: 10, toDepth: 20),
            },
            LithologicalDescriptions = new Collection<LithologicalDescription>
            {
                new() { FromDepth = 0, ToDepth = 10, Description = "first" },
                new() { FromDepth = 10, ToDepth = 20, Description = "second" },
            },
            FaciesDescriptions = new Collection<FaciesDescription>
            {
                new() { FromDepth = 0, ToDepth = 10, Description = "facies" },
            },
        })).ConfigureAwait(false);

        var results = ExtractOkBatch(seedResponse);
        return results[0].Stratigraphy.Id;
    }

    private void SetupControllerWithAlwaysLockedBorehole()
    {
        var locked = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        locked.Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>())).ReturnsAsync(false);
        locked.Setup(x => x.CanViewBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>())).ReturnsAsync(true);
        controller = new LithologyController(context, new Mock<ILogger<LithologyController>>().Object, locked.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    private static Collection<StratigraphyWithLithology> MakeBatch(params StratigraphyWithLithology[] entries)
        => new(entries.ToList());

    private static StratigraphyWithLithology MakeBatchEntry(int boreholeId, string name, double lithologyDepthFrom) => new()
    {
        Stratigraphy = new Stratigraphy { BoreholeId = boreholeId, Name = name, IsPrimary = false },
        Lithologies = new Collection<Lithology>
        {
            MakeLithology(isUnconsolidated: true, fromDepth: lithologyDepthFrom, toDepth: lithologyDepthFrom + 5),
        },
    };

    private static Collection<StratigraphyWithLithology> ExtractOkBatch(ActionResult<Collection<StratigraphyWithLithology>> response)
    {
        var ok = response.Result as OkObjectResult;
        Assert.IsNotNull(ok);
        return (Collection<StratigraphyWithLithology>)ok.Value!;
    }

    private static Lithology MakeLithology(double fromDepth, double toDepth, bool? isUnconsolidated) => new()
    {
        Id = 0,
        FromDepth = fromDepth,
        ToDepth = toDepth,
        IsUnconsolidated = isUnconsolidated,
        HasBedding = false,
        LithologyDescriptions = [new LithologyDescription { IsFirst = true }],
    };

    // Populates every field on both the unconsolidated and consolidated sides. Used by the deep
    // round-trip tests to verify that whichever side the caller's IsUnconsolidated value picks
    // survives and the opposite side gets cleared.
    private static Lithology GetFullyPopulatedLithology(double fromDepth, double toDepth, bool? isUnconsolidated) => new()
    {
        Id = 0,
        FromDepth = fromDepth,
        ToDepth = toDepth,
        IsUnconsolidated = isUnconsolidated,
        HasBedding = true,
        Share = 70,
        Notes = "Round-trip test",
        AlterationDegreeId = 100000175,
        CompactnessId = 21102002,
        CohesionId = 21116001,
        HumidityId = 21105001,
        ConsistencyId = 21103010,
        PlasticityId = 21101002,
        UscsTypeCodelistIds = new List<int> { 23101004, 23101015 },
        UscsDeterminationId = 100000493,
        RockConditionCodelistIds = new List<int> { 100000167 },
        TextureMetaCodelistIds = new List<int> { 100000470, 100000477 },
        LithologyDescriptions = new List<LithologyDescription>
        {
            new()
            {
                IsFirst = true,
                ColorPrimaryId = 100000077,
                ColorSecondaryId = 100000083,
                LithologyUnconMainId = 100000022,
                LithologyUncon2Id = 100000051,
                LithologyUncon3Id = 100000054,
                LithologyUncon4Id = 100000045,
                LithologyUncon5Id = 100000039,
                LithologyUncon6Id = 100000049,
                HasStriae = true,
                ComponentUnconOrganicCodelistIds = new List<int> { 21108004, 21108008 },
                ComponentUnconDebrisCodelistIds = new List<int> { 9102 },
                GrainShapeCodelistIds = new List<int> { 21110002, 21110004, 21110003 },
                GrainAngularityCodelistIds = new List<int> { 21115001 },
                LithologyUnconDebrisCodelistIds = new List<int> { 100000503, 100000513 },
                LithologyConId = 100000508,
                ComponentConParticleCodelistIds = new List<int> { 100000186, 100000181 },
                ComponentConMineralCodelistIds = new List<int> { 100000260 },
                GrainAngularityId = 21115007,
                GrainSizeId = 21109007,
                GradationId = 30000015,
                CementationId = 100000360,
                StructureSynGenCodelistIds = new List<int> { 100000377, 100000365, 100000399 },
                StructurePostGenCodelistIds = new List<int> { 100000428, 100000435 },
            },
        },
    };

    private static Lithology GetCompleteLithology() => new()
    {
        Id = 0,
        FromDepth = 25.5,
        ToDepth = 30.0,
        IsUnconsolidated = true,
        HasBedding = true,
        Share = 70,
        Notes = "Test lithology",
        AlterationDegreeId = 100000175,
        CompactnessId = 21102002,
        CohesionId = 21116001,
        HumidityId = 21105001,
        ConsistencyId = 21103010,
        PlasticityId = 21101002,
        UscsTypeCodelistIds = new List<int> { 23101004, 23101015 },
        UscsDeterminationId = 100000493,
        RockConditionCodelistIds = new List<int> { 100000167 },
        LithologyDescriptions = new List<LithologyDescription>
        {
            new()
            {
                IsFirst = true,
                ColorPrimaryId = 100000077,
                ColorSecondaryId = 100000083,
                LithologyUnconMainId = 100000022,
                ComponentUnconOrganicCodelistIds = new List<int> { 21108004 },
            },
            new()
            {
                IsFirst = false,
                ColorPrimaryId = 100000124,
                LithologyUnconMainId = 100000033,
            },
        },
    };
}
