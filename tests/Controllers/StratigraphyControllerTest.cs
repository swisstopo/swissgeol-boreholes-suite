using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class StratigraphyControllerTest
{
    private const int StratigraphyId = 6_000_003;

    private BdmsContext context;
    private StratigraphyController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();

        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(false);

        controller = new StratigraphyController(context, new Mock<ILogger<Stratigraphy>>().Object, boreholeLockServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAsyncReturnsAllEntities()
    {
        var stratigraphies = await controller.GetAsync();
        Assert.IsNotNull(stratigraphies);
        Assert.AreEqual(10000, stratigraphies.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        var stratigraphies = await controller.GetAsync(81294572).ConfigureAwait(false);
        Assert.IsNotNull(stratigraphies);
        Assert.AreEqual(0, stratigraphies.Count());
    }

    [TestMethod]
    public async Task GetEntriesByProfileIdExistingIdNoLayers()
    {
        var emptyBorehole = new Borehole();
        context.Boreholes.Add(emptyBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var layers = await controller.GetAsync(emptyBorehole.Id).ConfigureAwait(false);
        Assert.IsNotNull(layers);
        Assert.AreEqual(0, layers.Count());
    }

    [TestMethod]
    public async Task GetCasingsByBoreholeId()
    {
        var stratigraphies = await controller.GetAsync(1000017, 3002).ConfigureAwait(false);
        Assert.IsNotNull(stratigraphies);
        Assert.AreEqual(1, stratigraphies.Count());
        var stratigraphy = stratigraphies.Single();

        Assert.AreEqual(stratigraphy.BoreholeId, 1000017);
        Assert.AreEqual(stratigraphy.CreatedById, 2);
        Assert.AreEqual(stratigraphy.FillCasingId, 6000009);
        Assert.AreEqual(stratigraphy.IsPrimary, true);
        Assert.AreEqual(stratigraphy.KindId, 3002);
        Assert.AreEqual(stratigraphy.Name, "Alessandro Bergstrom");
        Assert.AreEqual(stratigraphy.Notes, "I saw one of these in Tanzania and I bought one.");
        Assert.AreEqual(stratigraphy.UpdatedById, 2);
    }

    [TestMethod]
    public async Task Copy()
    {
        var originalStratigraphy = GetStratigraphy(StratigraphyId);
        Assert.IsNotNull(originalStratigraphy?.Layers, "Precondition: Stratigraphy has Layers");
        Assert.IsTrue(originalStratigraphy?.Layers.Any(x => x.LayerCodelists?.Any() ?? false), "Precondition: Stratigraphy has layers with multiple codelist values");
        Assert.IsNotNull(originalStratigraphy?.LithologicalDescriptions, "Precondition: Stratigraphy has LithologicalDescriptions");
        Assert.IsNotNull(originalStratigraphy?.FaciesDescriptions, "Precondition: Stratigraphy has FaciesDescriptions");

        var result = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        var copiedStratigraphyId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedStratigraphyId);
        Assert.IsInstanceOfType(copiedStratigraphyId, typeof(int));
        var copiedStratigraphy = GetStratigraphy((int)copiedStratigraphyId);

        Assert.AreEqual("Earnest Little (Clone)", copiedStratigraphy.Name);
        Assert.AreEqual("sub_admin", copiedStratigraphy.CreatedBy.SubjectId);
        Assert.AreEqual("sub_controller", copiedStratigraphy.UpdatedBy.SubjectId);
        Assert.AreEqual(false, copiedStratigraphy.IsPrimary);
        Assert.AreSame(originalStratigraphy.Kind, copiedStratigraphy.Kind);
        Assert.AreEqual(originalStratigraphy.FillCasing.Kind, copiedStratigraphy.FillCasing.Kind);

        Assert.AreNotEqual(originalStratigraphy.Id, copiedStratigraphy.Id);
        Assert.AreNotSame(originalStratigraphy.Layers, copiedStratigraphy.Layers);
        Assert.AreNotEqual(originalStratigraphy.Layers.First().Id, copiedStratigraphy.Layers.First().Id);
        Assert.AreEqual("Drives olive", copiedStratigraphy.Layers.First().Casing);

        Assert.AreNotSame(originalStratigraphy.LithologicalDescriptions, copiedStratigraphy.LithologicalDescriptions);
        Assert.AreNotEqual(originalStratigraphy.LithologicalDescriptions.First().Id, copiedStratigraphy.LithologicalDescriptions.First().Id);
        Assert.AreEqual("Drives olive mobile", copiedStratigraphy.LithologicalDescriptions.First().Description);

        Assert.AreNotSame(originalStratigraphy.FaciesDescriptions, copiedStratigraphy.FaciesDescriptions);
        Assert.AreNotEqual(originalStratigraphy.FaciesDescriptions.First().Id, copiedStratigraphy.FaciesDescriptions.First().Id);
        Assert.AreEqual("Drives olive mobile", copiedStratigraphy.FaciesDescriptions.First().Description);

        Assert.AreNotSame(originalStratigraphy.ChronostratigraphyLayers, copiedStratigraphy.ChronostratigraphyLayers);
        Assert.AreNotEqual(originalStratigraphy.ChronostratigraphyLayers.First().Id, copiedStratigraphy.ChronostratigraphyLayers.First().Id);
        Assert.AreEqual(15001144, copiedStratigraphy.ChronostratigraphyLayers.First().ChronostratigraphyId);

        Assert.AreNotSame(originalStratigraphy.Layers.First().LayerCodelists, copiedStratigraphy.Layers.First().LayerCodelists);
        Assert.AreEqual(originalStratigraphy.Layers.First().LayerCodelists.Count, copiedStratigraphy.Layers.First().LayerCodelists.Count);
    }

    private Stratigraphy? GetStratigraphy(int id)
    {
        return context.Stratigraphies
            .Include(s => s.CreatedBy)
            .Include(s => s.UpdatedBy)
            .Include(s => s.Kind)
            .Include(s => s.FillCasing)
            .Include(s => s.Layers).ThenInclude(l => l.LayerCodelists)
            .Include(s => s.LithologicalDescriptions)
            .Include(s => s.FaciesDescriptions)
            .Include(s => s.ChronostratigraphyLayers)
            .SingleOrDefault(s => s.Id == id);
    }

    [TestMethod]
    public async Task CopyInvalidStratigraphyId()
    {
        var result = await controller.CopyAsync(0).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task CopyWithUnknownUser()
    {
        controller.HttpContext.SetClaimsPrincipal("NON-EXISTENT-NAME", PolicyNames.Admin);
        var result = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyWithUserNotSet()
    {
        controller.ControllerContext.HttpContext.User = null;
        await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () =>
        {
            await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        });
    }

    [TestMethod]
    public async Task CopyWithNonAdminUser()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);
        var result = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        // delete stratigraphy copy
        var copiedStratigraphyId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedStratigraphyId);
        Assert.IsInstanceOfType(copiedStratigraphyId, typeof(int));
    }

    [TestMethod]
    public async Task Delete()
    {
        // Prepare stratigraphy to delete
        var copyResult = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        ActionResultAssert.IsOk(copyResult.Result);

        var stratigraphyToDeleteId = ((OkObjectResult?)copyResult.Result)?.Value;
        Assert.IsNotNull(stratigraphyToDeleteId);

        // Delete and assert
        var stratigraphyToDelete = GetStratigraphy((int)stratigraphyToDeleteId);
        await controller.DeleteAsync(stratigraphyToDelete.Id).ConfigureAwait(false);
        Assert.AreEqual(null, GetStratigraphy((int)stratigraphyToDeleteId));
    }

    [TestMethod]
    public async Task DeleteMainStratigraphySetsLatestStratigraphyAsPrimary()
    {
        // Precondition: Find a group of three stratigraphies with one main stratigraphy
        var stratigraphies = await controller.GetAsync();
        var stratigraphyTestCandidates = stratigraphies
            .Where(x => x.KindId == StratigraphyController.StratigraphyKindId)
            .GroupBy(x => x.BoreholeId)
            .Where(g => g.Count() > 1 && g.Count(x => x.IsPrimary.GetValueOrDefault()) == 1)
            .ToList();

        Assert.AreEqual(true, stratigraphyTestCandidates.Any(), "Precondition: There is at least one group of stratigraphies with one main stratigraphy");

        // Delete primary stratigraphy and assert that
        // the latest stratigraphy is now the main stratigraphy
        var stratigraphiesUnderTest = stratigraphyTestCandidates.First();
        var latestNonPrimaryStratigraphy = stratigraphiesUnderTest.Where(x => !x.IsPrimary.GetValueOrDefault()).OrderByDescending(x => x.Created).First();
        var stratigraphyToDelete = stratigraphiesUnderTest.Single(x => x.IsPrimary.GetValueOrDefault());

        await controller.DeleteAsync(stratigraphyToDelete.Id).ConfigureAwait(false);
        Assert.AreEqual(null, GetStratigraphy(stratigraphyToDelete.Id));

        latestNonPrimaryStratigraphy = GetStratigraphy(latestNonPrimaryStratigraphy.Id);
        Assert.AreNotEqual(null, latestNonPrimaryStratigraphy);
        Assert.AreEqual(true, latestNonPrimaryStratigraphy.IsPrimary.GetValueOrDefault());
    }

    [TestMethod]
    public async Task Create()
    {
        var boreholeWithoutStratigraphy = await context
            .Boreholes
            .Include(b => b.Stratigraphies)
            .FirstAsync(b => !b.Stratigraphies.Any());

        var stratigraphyToAdd = new Stratigraphy
        {
            KindId = StratigraphyController.StratigraphyKindId,
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "KODACLUSTER",
            Notes = "ARGONTITAN",
        };

        var createResult = await controller.CreateAsync(stratigraphyToAdd);
        ActionResultAssert.IsOk(createResult.Result);

        var createdStratigraphy = (Stratigraphy?)((OkObjectResult)createResult.Result!).Value;
        createdStratigraphy = GetStratigraphy(createdStratigraphy.Id);
        AssertStratigraphy(createdStratigraphy, boreholeWithoutStratigraphy.Id, "KODACLUSTER", "ARGONTITAN");

        // Because the stratigraphy is the first one for the borehole, it is automatically the primary stratigraphy.
        Assert.AreEqual(true, createdStratigraphy.IsPrimary);
    }

    [TestMethod]
    public async Task CreateAdditionalStratigraphyForExistingBorehole()
    {
        var boreholeWithExistingStratigraphy = await context
            .Boreholes
            .Include(b => b.Stratigraphies)
            .FirstAsync(b => b.Stratigraphies.Any());

        var stratigraphyToAdd = new Stratigraphy
        {
            KindId = StratigraphyController.StratigraphyKindId,
            BoreholeId = boreholeWithExistingStratigraphy.Id,
            Name = "STORMSTEED",
            Notes = "GALAXYJEEP",
        };

        var createResult = await controller.CreateAsync(stratigraphyToAdd);
        ActionResultAssert.IsOk(createResult.Result);

        var createdStratigraphy = (Stratigraphy?)((OkObjectResult)createResult.Result!).Value;
        createdStratigraphy = GetStratigraphy(createdStratigraphy.Id);
        AssertStratigraphy(createdStratigraphy, boreholeWithExistingStratigraphy.Id, "STORMSTEED", "GALAXYJEEP");

        // Because the stratigraphy is the second one for the borehole, it is not automatically the primary stratigraphy.
        Assert.AreEqual(false, createdStratigraphy.IsPrimary);
    }

    [TestMethod]
    public async Task CreateWithNullStratigraphy()
    {
        var createResult = await controller.CreateAsync(null);
        ActionResultAssert.IsBadRequest(createResult.Result);
    }

    [TestMethod]
    public async Task CreateWithInvalidStratigraphy()
    {
        var inexistentBoreholeId = int.MinValue;
        var invalidStratigraphy = new Stratigraphy { BoreholeId = inexistentBoreholeId };
        var createResult = await controller.CreateAsync(invalidStratigraphy);
        ActionResultAssert.IsInternalServerError(createResult.Result);
    }

    [TestMethod]
    public async Task CreateWithUserNotSet()
    {
        controller.ControllerContext.HttpContext.User = null;
        var createResult = await controller.CreateAsync(new());
        ActionResultAssert.IsInternalServerError(createResult.Result);
    }

    [TestMethod]
    public async Task CreateForLockedBorehole()
    {
        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(true);

        controller = new StratigraphyController(context, new Mock<ILogger<Stratigraphy>>().Object, boreholeLockServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };

        var createResult = await controller.CreateAsync(new());
        ActionResultAssert.IsInternalServerError(createResult.Result);
    }

    [TestMethod]
    public async Task AddBedrockLayer()
    {
        // Prepare stratigraphy to add the bedrock layer for.
        var boreholeWithBedrock = await context.Boreholes.FirstAsync(x => x.TopBedrock.HasValue);
        var stratigraphyWithoutBedrockLayer = new Stratigraphy
        {
            KindId = StratigraphyController.StratigraphyKindId,
            BoreholeId = boreholeWithBedrock.Id,
            Name = "MAESTROHEART",
            Notes = "BATONTOPPER",
        };

        var createResult = await controller.CreateAsync(stratigraphyWithoutBedrockLayer);
        stratigraphyWithoutBedrockLayer = ActionResultAssert.IsOkObjectResult<Stratigraphy>(createResult.Result);
        AssertStratigraphy(stratigraphyWithoutBedrockLayer, boreholeWithBedrock.Id, "MAESTROHEART", "BATONTOPPER");

        // Add bedrock and assert
        var addBedrockResult = await controller.AddBedrockLayerAsync(stratigraphyWithoutBedrockLayer.Id);
        ActionResultAssert.IsOk(addBedrockResult.Result);

        var bedrockLayerId = (int)((OkObjectResult?)addBedrockResult.Result)?.Value!;
        var bedrockLayer = await context.Layers.FindAsync(bedrockLayerId);
        Assert.AreEqual(stratigraphyWithoutBedrockLayer.Id, bedrockLayer.StratigraphyId);
        Assert.AreEqual(boreholeWithBedrock.TopBedrock.Value, bedrockLayer.FromDepth);
        Assert.AreEqual(boreholeWithBedrock.LithologyTopBedrockId, bedrockLayer.LithologyTopBedrockId);
        Assert.AreEqual(boreholeWithBedrock.LithostratigraphyId, bedrockLayer.LithostratigraphyId);
        Assert.AreEqual(false, bedrockLayer.IsLast);
    }

    [TestMethod]
    public async Task AddBedrockLayerForBoreholeWithoutTopBedrockValue()
    {
        // Prepare stratigraphy to add the bedrock layer for.
        var boreholeWithoutBedrock = await context.Boreholes.FirstAsync(x => !x.TopBedrock.HasValue);
        var stratigraphyWithoutBedrockLayer = new Stratigraphy
        {
            KindId = StratigraphyController.StratigraphyKindId,
            BoreholeId = boreholeWithoutBedrock.Id,
            Name = "CHIPPEWARECORD",
            Notes = "FIREFALCON",
        };

        var createResult = await controller.CreateAsync(stratigraphyWithoutBedrockLayer);
        stratigraphyWithoutBedrockLayer = ActionResultAssert.IsOkObjectResult<Stratigraphy>(createResult.Result);
        AssertStratigraphy(stratigraphyWithoutBedrockLayer, boreholeWithoutBedrock.Id, "CHIPPEWARECORD", "FIREFALCON");

        var addBedrockResult = await controller.AddBedrockLayerAsync(stratigraphyWithoutBedrockLayer.Id);
        ActionResultAssert.IsInternalServerError(addBedrockResult.Result, "bedrock");
    }

    [TestMethod]
    public async Task AddBedrockLayerForLockedBorehole()
    {
        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(true);

        controller = new StratigraphyController(context, new Mock<ILogger<Stratigraphy>>().Object, boreholeLockServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };

        var existingStratigraphy = await context.Stratigraphies.FirstAsync();
        var addBedrockResult = await controller.AddBedrockLayerAsync(existingStratigraphy.Id);
        ActionResultAssert.IsInternalServerError(addBedrockResult.Result, "locked");
    }

    private void AssertStratigraphy(Stratigraphy actual, int expectedBoreholeId, string exptectedName, string expectedNotes)
    {
        Assert.AreEqual(StratigraphyController.StratigraphyKindId, actual.KindId);
        Assert.AreEqual(expectedBoreholeId, actual.BoreholeId);
        Assert.AreEqual(exptectedName, actual.Name);
        Assert.AreEqual(expectedNotes, actual.Notes);
    }
}
