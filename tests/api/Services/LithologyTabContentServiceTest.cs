using BDMS.Models;
using static BDMS.Helpers;

namespace BDMS.Services;

[TestClass]
public class LithologyTabContentServiceTest
{
    private BdmsContext context;
    private LithologyTabContentService service;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        service = new LithologyTabContentService(context);
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task StageUnconsolidatedLithologyWithoutBeddingKeepsOnlyFirstDescription()
    {
        var stratigraphyId = context.Stratigraphies.First().Id;
        var lithology = GetCompleteLithology(stratigraphyId);
        lithology.HasBedding = false;

        var createdStratigraphyId = await StageAndCreateAsync(lithology);
        var contents = await service.LoadContentAsync(createdStratigraphyId);
        var createdLithology = contents.Lithologies.Single();

        Assert.AreEqual(25.5, createdLithology.FromDepth);
        Assert.AreEqual(30.0, createdLithology.ToDepth);
        Assert.IsTrue(createdLithology.IsUnconsolidated);
        Assert.IsFalse(createdLithology.HasBedding);
        Assert.IsNull(createdLithology.Share);
        Assert.AreEqual("Test lithology", createdLithology.Notes);
        Assert.AreEqual(100000175, createdLithology.AlterationDegreeId);
        Assert.AreEqual(21102002, createdLithology.CompactnessId);
        Assert.AreEqual(21116001, createdLithology.CohesionId);
        Assert.AreEqual(21105001, createdLithology.HumidityId);
        Assert.AreEqual(21103010, createdLithology.ConsistencyId);
        Assert.AreEqual(21101002, createdLithology.PlasticityId);
        CollectionAssert.AreEquivalent(new List<int> { 23101004, 23101015 }, createdLithology.UscsTypeCodelistIds.ToList());
        Assert.AreEqual(100000493, createdLithology.UscsDeterminationId);
        CollectionAssert.AreEquivalent(new List<int> { 100000167 }, createdLithology.RockConditionCodelistIds.ToList());
        Assert.AreEqual(0, createdLithology.TextureMetaCodelistIds.Count);

        // Only one description should be saved since HasBedding is false.
        Assert.AreEqual(1, createdLithology.LithologyDescriptions.Count);
        var lithologyDescription = createdLithology.LithologyDescriptions.First();
        Assert.IsTrue(lithologyDescription.IsFirst);
        Assert.AreEqual(100000077, lithologyDescription.ColorPrimaryId);
        Assert.AreEqual(100000083, lithologyDescription.ColorSecondaryId);
        Assert.AreEqual(100000022, lithologyDescription.LithologyUnconMainId);
        Assert.AreEqual(100000051, lithologyDescription.LithologyUncon2Id);
        Assert.AreEqual(100000054, lithologyDescription.LithologyUncon3Id);
        Assert.AreEqual(100000045, lithologyDescription.LithologyUncon4Id);
        Assert.AreEqual(100000039, lithologyDescription.LithologyUncon5Id);
        Assert.AreEqual(100000049, lithologyDescription.LithologyUncon6Id);
        CollectionAssert.AreEquivalent(new List<int> { 21108004, 21108008 }, lithologyDescription.ComponentUnconOrganicCodelistIds.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 9102 }, lithologyDescription.ComponentUnconDebrisCodelistIds.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21110002, 21110004, 21110003 }, lithologyDescription.GrainShapeCodelistIds.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21115001 }, lithologyDescription.GrainAngularityCodelistIds.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000503, 100000513 }, lithologyDescription.LithologyUnconDebrisCodelistIds.ToList());

        // Consolidated side must be cleared.
        Assert.IsNull(lithologyDescription.LithologyConId);
        Assert.AreEqual(0, lithologyDescription.ComponentConParticleCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.ComponentConMineralCodelistIds.Count);
        Assert.IsNull(lithologyDescription.GrainAngularityId);
        Assert.IsNull(lithologyDescription.GrainSizeId);
        Assert.IsNull(lithologyDescription.GradationId);
        Assert.IsNull(lithologyDescription.CementationId);
        Assert.AreEqual(0, lithologyDescription.StructureSynGenCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.StructurePostGenCodelistIds.Count);
    }

    [TestMethod]
    public async Task StageConsolidatedLithologyWithBeddingKeepsBothDescriptions()
    {
        var stratigraphyId = context.Stratigraphies.First().Id;
        var lithology = GetCompleteLithology(stratigraphyId);
        lithology.IsUnconsolidated = false;

        var createdStratigraphyId = await StageAndCreateAsync(lithology);
        var contents = await service.LoadContentAsync(createdStratigraphyId);
        var createdLithology = contents.Lithologies.Single();

        Assert.AreEqual(25.5, createdLithology.FromDepth);
        Assert.AreEqual(30.0, createdLithology.ToDepth);
        Assert.IsFalse(createdLithology.IsUnconsolidated);
        Assert.IsTrue(createdLithology.HasBedding);
        Assert.AreEqual(70, createdLithology.Share);
        Assert.AreEqual("Test lithology", createdLithology.Notes);
        Assert.AreEqual(100000175, createdLithology.AlterationDegreeId);
        Assert.IsNull(createdLithology.CompactnessId);
        Assert.IsNull(createdLithology.CohesionId);
        Assert.IsNull(createdLithology.HumidityId);
        Assert.IsNull(createdLithology.ConsistencyId);
        Assert.IsNull(createdLithology.PlasticityId);
        Assert.AreEqual(0, createdLithology.UscsTypeCodelistIds.Count);
        Assert.IsNull(createdLithology.UscsDeterminationId);
        Assert.AreEqual(0, createdLithology.RockConditionCodelistIds.Count);
        CollectionAssert.AreEquivalent(new List<int> { 100000470, 100000477 }, createdLithology.TextureMetaCodelistIds.ToList());
        Assert.AreEqual(2, createdLithology.LithologyDescriptions.Count);
        var firstLithologyDescription = createdLithology.LithologyDescriptions.First(ld => ld.IsFirst);
        Assert.AreEqual(100000077, firstLithologyDescription.ColorPrimaryId);
        Assert.AreEqual(100000083, firstLithologyDescription.ColorSecondaryId);
        Assert.IsNull(firstLithologyDescription.LithologyUnconMainId);
        Assert.IsNull(firstLithologyDescription.LithologyUncon2Id);
        Assert.IsNull(firstLithologyDescription.LithologyUncon3Id);
        Assert.IsNull(firstLithologyDescription.LithologyUncon4Id);
        Assert.IsNull(firstLithologyDescription.LithologyUncon5Id);
        Assert.IsNull(firstLithologyDescription.LithologyUncon6Id);
        Assert.AreEqual(0, firstLithologyDescription.ComponentUnconOrganicCodelistIds.Count);
        Assert.AreEqual(0, firstLithologyDescription.ComponentUnconDebrisCodelistIds.Count);
        Assert.AreEqual(0, firstLithologyDescription.GrainShapeCodelistIds.Count);
        Assert.AreEqual(0, firstLithologyDescription.GrainAngularityCodelistIds.Count);
        Assert.AreEqual(0, firstLithologyDescription.LithologyUnconDebrisCodelistIds.Count);
        Assert.AreEqual(100000508, firstLithologyDescription.LithologyConId);
        CollectionAssert.AreEquivalent(new List<int> { 100000186, 100000181 }, firstLithologyDescription.ComponentConParticleCodelistIds.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000260 }, firstLithologyDescription.ComponentConMineralCodelistIds.ToList());
        Assert.AreEqual(21115007, firstLithologyDescription.GrainAngularityId);
        Assert.AreEqual(21109007, firstLithologyDescription.GrainSizeId);
        Assert.AreEqual(30000015, firstLithologyDescription.GradationId);
        Assert.AreEqual(100000360, firstLithologyDescription.CementationId);
        CollectionAssert.AreEquivalent(new List<int> { 100000377, 100000365, 100000399 }, firstLithologyDescription.StructureSynGenCodelistIds.ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000428, 100000435 }, firstLithologyDescription.StructurePostGenCodelistIds.ToList());
    }

    [TestMethod]
    public async Task StageUnspecifiedLithologyClearsEverything()
    {
        var stratigraphyId = context.Stratigraphies.First().Id;
        var lithology = GetCompleteLithology(stratigraphyId);
        lithology.IsUnconsolidated = null;

        var createdStratigraphyId = await StageAndCreateAsync(lithology);
        var contents = await service.LoadContentAsync(createdStratigraphyId);
        var createdLithology = contents.Lithologies.Single();

        Assert.IsNull(createdLithology.IsUnconsolidated);

        // Bedding and share are not applicable to unspecified lithologies.
        Assert.IsFalse(createdLithology.HasBedding);
        Assert.IsNull(createdLithology.Share);

        // The service clears AlterationDegreeId for unspecified lithologies (unlike the old controller).
        Assert.IsNull(createdLithology.AlterationDegreeId);

        // Both unconsolidated-side and consolidated-side fields must be cleared.
        Assert.IsNull(createdLithology.CompactnessId);
        Assert.IsNull(createdLithology.CohesionId);
        Assert.IsNull(createdLithology.HumidityId);
        Assert.IsNull(createdLithology.ConsistencyId);
        Assert.IsNull(createdLithology.PlasticityId);
        Assert.IsNull(createdLithology.UscsDeterminationId);
        Assert.AreEqual(0, createdLithology.UscsTypeCodelistIds.Count);
        Assert.AreEqual(0, createdLithology.RockConditionCodelistIds.Count);
        Assert.AreEqual(0, createdLithology.TextureMetaCodelistIds.Count);

        // Unspecified lithologies have no descriptions.
        Assert.AreEqual(0, createdLithology.LithologyDescriptions.Count);
    }

    [TestMethod]
    public async Task SyncEditLithologyToUnspecifiedClearsBothSides()
    {
        var stratigraphyId = context.Stratigraphies.First().Id;
        var createdStratigraphyId = await StageAndCreateAsync(GetCompleteLithology(stratigraphyId));

        var contents = await service.LoadContentAsync(createdStratigraphyId);
        var existing = contents.Lithologies.Single();

        var editPayload = new Lithology
        {
            Id = existing.Id,
            UpdatedById = 3,
            StratigraphyId = createdStratigraphyId,
            FromDepth = existing.FromDepth,
            ToDepth = existing.ToDepth,
            IsUnconsolidated = null,
            HasBedding = false,
            Notes = "Switched to unspecified",
            LithologyDescriptions = existing.LithologyDescriptions.Where(ld => ld.IsFirst).ToList(),
        };

        await service.SyncContentAsync(createdStratigraphyId, new LithologyTabContents { Lithologies = { editPayload } });
        await context.SaveChangesAsync();

        var updatedContents = await service.LoadContentAsync(createdStratigraphyId);
        var updatedLithology = updatedContents.Lithologies.Single();

        Assert.IsNull(updatedLithology.IsUnconsolidated);
        Assert.IsFalse(updatedLithology.HasBedding);
        Assert.IsNull(updatedLithology.Share);
        Assert.AreEqual(0, updatedLithology.UscsTypeCodelistIds.Count);
        Assert.AreEqual(0, updatedLithology.RockConditionCodelistIds.Count);
        Assert.AreEqual(0, updatedLithology.TextureMetaCodelistIds.Count);
        Assert.IsNull(updatedLithology.CompactnessId);
        Assert.IsNull(updatedLithology.CohesionId);
        Assert.IsNull(updatedLithology.HumidityId);
        Assert.IsNull(updatedLithology.ConsistencyId);
        Assert.IsNull(updatedLithology.PlasticityId);
        Assert.IsNull(updatedLithology.UscsDeterminationId);
        Assert.AreEqual(0, updatedLithology.LithologyDescriptions.Count);
    }

    [TestMethod]
    public async Task SyncEditUnconsolidatedToConsolidatedClearsUnconAndKeepsSingleDescription()
    {
        var stratigraphyId = context.Stratigraphies.First().Id;
        var createdStratigraphyId = await StageAndCreateAsync(GetCompleteLithology(stratigraphyId));

        var contents = await service.LoadContentAsync(createdStratigraphyId);
        var existing = contents.Lithologies.Single();

        var newLithology = new Lithology
        {
            Id = existing.Id,
            UpdatedById = 3,
            StratigraphyId = createdStratigraphyId,
            FromDepth = existing.FromDepth + 5,
            ToDepth = existing.ToDepth + 5,
            IsUnconsolidated = false,
            HasBedding = false,
            Notes = "Updated in test",
            AlterationDegreeId = 100000176,
            CompactnessId = 21102002,
            CohesionId = 21116001,
            RockConditionCodelistIds = new List<int> { 100000167 },
            TextureMetaCodelistIds = new List<int> { 100000469, 100000482 },
            LithologyDescriptions = existing.LithologyDescriptions.Where(ld => ld.IsFirst).ToList(),
        };

        await service.SyncContentAsync(createdStratigraphyId, new LithologyTabContents { Lithologies = { newLithology } });
        await context.SaveChangesAsync();

        var updatedContents = await service.LoadContentAsync(createdStratigraphyId);
        var updatedLithology = updatedContents.Lithologies.Single();

        Assert.AreEqual(createdStratigraphyId, updatedLithology.StratigraphyId);
        Assert.AreEqual(newLithology.FromDepth, updatedLithology.FromDepth);
        Assert.AreEqual(newLithology.ToDepth, updatedLithology.ToDepth);
        Assert.IsFalse(updatedLithology.IsUnconsolidated);
        Assert.IsFalse(updatedLithology.HasBedding);
        Assert.IsNull(updatedLithology.Share);
        Assert.AreEqual(newLithology.Notes, updatedLithology.Notes);
        Assert.AreEqual(newLithology.AlterationDegreeId, updatedLithology.AlterationDegreeId);
        Assert.IsNull(updatedLithology.CompactnessId);
        Assert.IsNull(updatedLithology.CohesionId);
        Assert.IsNull(updatedLithology.HumidityId);
        Assert.IsNull(updatedLithology.ConsistencyId);
        Assert.IsNull(updatedLithology.PlasticityId);
        Assert.AreEqual(0, updatedLithology.UscsTypeCodelistIds.Count);
        Assert.IsNull(updatedLithology.UscsDeterminationId);
        Assert.AreEqual(0, updatedLithology.RockConditionCodelistIds.Count);
        CollectionAssert.AreEquivalent(new List<int> { 100000469, 100000482 }, updatedLithology.TextureMetaCodelistIds.ToList());
        Assert.AreEqual(1, updatedLithology.LithologyDescriptions.Count);
        var lithologyDescription = updatedLithology.LithologyDescriptions.First();
        Assert.IsTrue(lithologyDescription.IsFirst);
        Assert.AreEqual(existing.LithologyDescriptions.First(ld => ld.IsFirst).Id, lithologyDescription.Id);
        Assert.IsNull(lithologyDescription.LithologyUnconMainId);
        Assert.IsNull(lithologyDescription.LithologyUncon2Id);
        Assert.IsNull(lithologyDescription.LithologyUncon3Id);
        Assert.IsNull(lithologyDescription.LithologyUncon4Id);
        Assert.IsNull(lithologyDescription.LithologyUncon5Id);
        Assert.IsNull(lithologyDescription.LithologyUncon6Id);
        Assert.AreEqual(0, lithologyDescription.ComponentUnconOrganicCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.ComponentUnconDebrisCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.GrainShapeCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.GrainAngularityCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.LithologyUnconDebrisCodelistIds.Count);

        // Exactly one description remains in the database (the non-first one was deleted).
        var remainingDescriptions = context.LithologyDescriptions.Where(ld => ld.LithologyId == existing.Id).ToList();
        Assert.AreEqual(1, remainingDescriptions.Count);
        Assert.AreEqual(lithologyDescription.Id, remainingDescriptions[0].Id);
    }

    [TestMethod]
    public async Task SyncEditLithologyDescriptionUpdatesCodesAndColors()
    {
        var stratigraphyId = context.Stratigraphies.First().Id;
        var createdStratigraphyId = await StageAndCreateAsync(GetCompleteLithology(stratigraphyId));

        var contents = await service.LoadContentAsync(createdStratigraphyId);
        var existing = contents.Lithologies.Single();
        Assert.IsTrue(existing.IsUnconsolidated);
        Assert.IsTrue(existing.HasBedding);
        Assert.AreEqual(2, existing.LithologyDescriptions.Count);

        var descriptionToEdit = existing.LithologyDescriptions.First(ld => !ld.IsFirst);
        var originalDescriptionId = descriptionToEdit.Id;
        var originalColorPrimaryId = descriptionToEdit.ColorPrimaryId;
        var originalLithologyUnconMainId = descriptionToEdit.LithologyUnconMainId;
        var originalComponentUnconOrganicCount = descriptionToEdit.ComponentUnconOrganicCodelistIds.Count;

        var modifiedDescriptions = existing.LithologyDescriptions.ToList();
        var indexToModify = modifiedDescriptions.FindIndex(ld => ld.Id == originalDescriptionId);
        modifiedDescriptions[indexToModify] = new LithologyDescription
        {
            Id = originalDescriptionId,
            LithologyId = existing.Id,
            IsFirst = false,
            ColorPrimaryId = 100000079,
            ColorSecondaryId = 100000082,
            LithologyUnconMainId = 100000027,
            LithologyUncon2Id = 100000042,
            ComponentUnconOrganicCodelistIds = new List<int> { 21108005 },
            GrainShapeCodelistIds = new List<int> { 21110004 },
        };

        var editedLithology = new Lithology
        {
            Id = existing.Id,
            StratigraphyId = createdStratigraphyId,
            FromDepth = existing.FromDepth + 2,
            ToDepth = existing.ToDepth + 2,
            IsUnconsolidated = true, // Keep as unconsolidated so uncon values are not reset.
            HasBedding = true,
            Notes = "Updated with edited description",
            LithologyDescriptions = modifiedDescriptions,
            RockConditionCodelistIds = new List<int> { 100000169 },
        };

        await service.SyncContentAsync(createdStratigraphyId, new LithologyTabContents { Lithologies = { editedLithology } });
        await context.SaveChangesAsync();

        var updatedContents = await service.LoadContentAsync(createdStratigraphyId);
        var updatedLithology = updatedContents.Lithologies.Single();

        Assert.IsTrue(updatedLithology.IsUnconsolidated);
        Assert.IsTrue(updatedLithology.HasBedding);
        Assert.AreEqual(2, updatedLithology.LithologyDescriptions.Count);
        Assert.AreEqual(1, updatedLithology.RockConditionCodelistIds.Count);
        Assert.AreEqual(100000169, updatedLithology.RockConditionCodelistIds.First());

        var editedDescription = updatedLithology.LithologyDescriptions.First(ld => ld.Id == originalDescriptionId);
        Assert.AreEqual(100000079, editedDescription.ColorPrimaryId);
        Assert.AreNotEqual(originalColorPrimaryId, editedDescription.ColorPrimaryId);
        Assert.AreEqual(100000082, editedDescription.ColorSecondaryId);
        Assert.AreEqual(100000027, editedDescription.LithologyUnconMainId);
        Assert.AreNotEqual(originalLithologyUnconMainId, editedDescription.LithologyUnconMainId);

        Assert.AreEqual(1, editedDescription.ComponentUnconOrganicCodelistIds.Count);
        Assert.IsTrue(editedDescription.ComponentUnconOrganicCodelistIds.Contains(21108005));
        Assert.AreNotEqual(originalComponentUnconOrganicCount, editedDescription.ComponentUnconOrganicCodelistIds.Count);
        Assert.IsTrue(editedDescription.GrainShapeCodelistIds.Contains(21110004));
    }

    [TestMethod]
    public async Task SyncCreatesUpdatesAndDeletesLithologiesInOneCall()
    {
        var stratigraphyId = context.Stratigraphies.First().Id;

        // Start with two lithologies.
        var stratigraphy = new Stratigraphy
        {
            BoreholeId = context.Boreholes.First().Id,
            Name = $"SYNC-{Guid.NewGuid()}",
        };
        await service.StageContentForCreateAsync(stratigraphy, new LithologyTabContents
        {
            Lithologies =
            {
                new Lithology { FromDepth = 0, ToDepth = 10, IsUnconsolidated = true, HasBedding = false, Notes = "Keep" },
                new Lithology { FromDepth = 10, ToDepth = 20, IsUnconsolidated = true, HasBedding = false, Notes = "Remove" },
            },
        });
        await context.AddAsync(stratigraphy);
        await context.SaveChangesAsync();
        var createdStratigraphyId = stratigraphy.Id;

        var initialContents = await service.LoadContentAsync(createdStratigraphyId);
        var keepLithology = initialContents.Lithologies.Single(l => l.Notes == "Keep");

        // Submit: keep one (modified), drop the "Remove" one, add a brand-new one (Id 0).
        keepLithology.Notes = "Keep modified";
        var syncContents = new LithologyTabContents
        {
            Lithologies =
            {
                keepLithology,
                new Lithology { FromDepth = 20, ToDepth = 30, IsUnconsolidated = true, HasBedding = false, Notes = "Added" },
            },
        };

        await service.SyncContentAsync(createdStratigraphyId, syncContents);
        await context.SaveChangesAsync();

        var finalContents = await service.LoadContentAsync(createdStratigraphyId);
        var notes = finalContents.Lithologies.Select(l => l.Notes).ToList();
        Assert.AreEqual(2, finalContents.Lithologies.Count);
        CollectionAssert.AreEquivalent(new List<string> { "Keep modified", "Added" }, notes);
        Assert.IsFalse(notes.Contains("Remove"));
    }

    [TestMethod]
    public async Task StageMultipleLithologiesStripsPerTypeCodes()
    {
        var stratigraphy = new Stratigraphy
        {
            BoreholeId = context.Boreholes.First().Id,
            Name = $"BULK-{Guid.NewGuid()}",
        };

        await service.StageContentForCreateAsync(stratigraphy, new LithologyTabContents
        {
            Lithologies =
            {
                new Lithology
                {
                    FromDepth = 10,
                    ToDepth = 20,
                    IsUnconsolidated = true,
                    HasBedding = false,
                    Notes = "Bulk created lithology 1",
                    LithologyDescriptions = new List<LithologyDescription>
                    {
                        new LithologyDescription { IsFirst = true, ColorPrimaryId = 100000077 },
                    },
                },
                new Lithology
                {
                    FromDepth = 20,
                    ToDepth = 30,
                    IsUnconsolidated = true,
                    HasBedding = false,
                    Notes = "Bulk created lithology 2",
                    LithologyDescriptions = new List<LithologyDescription>
                    {
                        new LithologyDescription
                        {
                            IsFirst = true,
                            ColorPrimaryId = 100000077,
                            ComponentConParticleCodelistIds = new List<int> { 100000186, 100000181 },
                            ComponentConMineralCodelistIds = new List<int> { 100000260 },
                            ComponentUnconDebrisCodelistIds = new List<int> { 9102 },
                        },
                    },
                },
                new Lithology
                {
                    FromDepth = 30,
                    ToDepth = 40,
                    IsUnconsolidated = false,
                    HasBedding = false,
                    AlterationDegreeId = 100000176,
                    CompactnessId = 21102002,
                    CohesionId = 21116001,
                    Notes = "Bulk created lithology 3",
                    LithologyDescriptions = new List<LithologyDescription>
                    {
                        new LithologyDescription
                        {
                            IsFirst = true,
                            ColorPrimaryId = 100000077,
                            ComponentConParticleCodelistIds = new List<int> { 100000186, 100000181 },
                            ComponentConMineralCodelistIds = new List<int> { 100000260 },
                            ComponentUnconDebrisCodelistIds = new List<int> { 9102 },
                        },
                    },
                },
            },
        });
        await context.AddAsync(stratigraphy);
        await context.SaveChangesAsync();

        var contents = await service.LoadContentAsync(stratigraphy.Id);
        Assert.AreEqual(3, contents.Lithologies.Count);

        // Unconsolidated lithology: con codes stripped, uncon debris kept.
        var unconDescription = contents.Lithologies.Single(l => l.Notes == "Bulk created lithology 2").LithologyDescriptions.Single();
        Assert.AreEqual(0, unconDescription.ComponentConParticleCodelistIds.Count);
        Assert.AreEqual(0, unconDescription.ComponentConMineralCodelistIds.Count);
        Assert.AreEqual(1, unconDescription.ComponentUnconDebrisCodelistIds.Count);

        // Consolidated lithology: con codes kept, uncon debris stripped.
        var conDescription = contents.Lithologies.Single(l => l.Notes == "Bulk created lithology 3").LithologyDescriptions.Single();
        Assert.AreEqual(2, conDescription.ComponentConParticleCodelistIds.Count);
        Assert.AreEqual(1, conDescription.ComponentConMineralCodelistIds.Count);
        Assert.AreEqual(0, conDescription.ComponentUnconDebrisCodelistIds.Count);
    }

    [TestMethod]
    public void ValidateChildStratigraphyIdsDetectsForeignReference()
    {
        var stratigraphyId = context.Stratigraphies.First().Id;
        var foreignStratigraphyId = context.Stratigraphies.Skip(1).First().Id;

        var validContents = new LithologyTabContents
        {
            Lithologies = { new Lithology { StratigraphyId = stratigraphyId } },
            LithologicalDescriptions = { new LithologicalDescription { StratigraphyId = 0 } },
        };
        Assert.IsTrue(service.ValidateChildStratigraphyIds(validContents, stratigraphyId, out var validError));
        Assert.IsNull(validError);

        var invalidContents = new LithologyTabContents
        {
            Lithologies = { new Lithology { StratigraphyId = foreignStratigraphyId } },
        };
        Assert.IsFalse(service.ValidateChildStratigraphyIds(invalidContents, stratigraphyId, out var invalidError));
        Assert.IsNotNull(invalidError);
    }

    private async Task<int> StageAndCreateAsync(Lithology lithology)
    {
        var stratigraphy = new Stratigraphy
        {
            BoreholeId = context.Boreholes.First().Id,
            Name = $"Service test {Guid.NewGuid()}",
        };

        await service.StageContentForCreateAsync(stratigraphy, new LithologyTabContents { Lithologies = { lithology } });
        await context.AddAsync(stratigraphy);
        await context.SaveChangesAsync();

        return stratigraphy.Id;
    }

    private static Lithology GetCompleteLithology(int stratigraphyId)
        => new Lithology
        {
            CreatedById = 2,
            UpdatedById = 2,
            Created = new DateTime(2022, 10, 4, 13, 19, 34, DateTimeKind.Utc),
            StratigraphyId = stratigraphyId,
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
            TextureMetaCodelistIds = new List<int> { 100000470, 100000477 },
            LithologyDescriptions = new List<LithologyDescription>
            {
                new LithologyDescription
                {
                    IsFirst = false,
                    ColorPrimaryId = 100000124,
                    ColorSecondaryId = 100000117,
                    LithologyUnconMainId = 100000033,
                    LithologyUncon2Id = 100000044,
                    LithologyUncon3Id = 100000041,
                    LithologyUncon4Id = 100000052,
                    LithologyUncon5Id = 100000037,
                    LithologyUncon6Id = 100000053,
                    ComponentUnconOrganicCodelistIds = new List<int> { 21108003, 21108006, 21108008 },
                    ComponentUnconDebrisCodelistIds = new List<int> { 9100, 9100 },
                    GrainShapeCodelistIds = new List<int> { 21110002, 21110003 },
                    GrainAngularityCodelistIds = new List<int> { 21115007, 21115001 },
                    LithologyUnconDebrisCodelistIds = new List<int> { 100000536, 100000556, 100000570 },
                    LithologyConId = 100000540,
                    ComponentConParticleCodelistIds = new List<int> { 100000183 },
                    ComponentConMineralCodelistIds = new List<int> { 100000251, 100000262 },
                    GrainAngularityId = 21115001,
                    GrainSizeId = 100000499,
                    GradationId = 100000494,
                    CementationId = 100000357,
                    StructureSynGenCodelistIds = new List<int> { 100000372, 100000391 },
                    StructurePostGenCodelistIds = new List<int> { 100000426, 100000463, 100000456 },
                },
                new LithologyDescription
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
}
