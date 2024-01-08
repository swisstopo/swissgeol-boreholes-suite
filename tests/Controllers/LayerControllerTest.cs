using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class LayerControllerTest
{
    private BdmsContext context;
    private LayerController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        controller = new LayerController(context, new Mock<ILogger<Layer>>().Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    [TestCategory("LongRunning")]
    public async Task GetAllEntriesAsync()
    {
        var response = await controller.GetAsync().ConfigureAwait(false);
        IEnumerable<Layer>? layers = response?.Value;
        Assert.IsNotNull(layers);
        Assert.AreEqual(100000, layers.Count());
    }

    [TestMethod]
    public async Task GetEntriesByProfileIdInexistentId()
    {
        var response = await controller.GetAsync(94578122).ConfigureAwait(false);
        var layers = response?.Value;
        Assert.IsNotNull(layers);
        Assert.AreEqual(0, layers.Count());
    }

    [TestMethod]
    public async Task GetEntriesByProfileIdExistingIdNoLayers()
    {
        var emptyStratigraphy = new Stratigraphy { KindId = 3000 };

        context.Stratigraphies.Add(emptyStratigraphy);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var response = await controller.GetAsync(emptyStratigraphy.Id).ConfigureAwait(false);
        var layers = response?.Value;
        Assert.IsNotNull(layers);
        Assert.AreEqual(0, layers.Count());
    }

    [TestMethod]
    public async Task GetEntriesByProfileId()
    {
        var response = await controller.GetAsync(6_000_009).ConfigureAwait(false);
        IEnumerable<Layer>? layers = response?.Value;
        Assert.IsNotNull(layers);
        Assert.AreEqual(10, layers.Count());
    }

    [TestMethod]
    public async Task GetLayerByInexistentIdReturnsNotFound()
    {
        var response = await controller.GetByIdAsync(9483157).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task GetLayerById()
    {
        var response = await controller.GetByIdAsync(7_000_005).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var layer = okResult.Value as Layer;
        Assert.AreEqual(7_000_005, layer.Id);
        Assert.AreEqual(2.274020571389245, layer.CasingInnerDiameter);
        Assert.AreEqual("Handcrafted Plains hacking reboot", layer.Notes);
        Assert.AreEqual(15104431, layer.LithologyId);
    }

    [TestMethod]
    public async Task EditLayerWithCompleteLayer()
    {
        var id = 7_000_089;

        var newLayer = new Layer
        {
            Id = id,
            CreatedById = 4,
            UpdatedById = 4,
            Created = new DateTime(2021, 2, 14, 8, 55, 34).ToUniversalTime(),
            InstrumentCasingId = 0,
            Notes = "Freddy ate more cake than Maria.",
            StratigraphyId = 6_000_010,
        };

        var layerToEdit = context.Layers.Single(c => c.Id == id);
        Assert.AreEqual(3, layerToEdit.CreatedById);
        Assert.AreEqual(2, layerToEdit.UpdatedById);
        Assert.AreEqual(6_000_008, layerToEdit.InstrumentCasingId);
        Assert.AreEqual("Practical Concrete Ball Fully-configurable invoice Small Rubber Car", layerToEdit.Notes);

        // Update Layer
        var response = await controller.EditAsync(newLayer);
        ActionResultAssert.IsOk(response.Result);

        // Assert Updates and unchanged values
        var updatedLayer = ActionResultAssert.IsOkObjectResult<Layer>(response.Result);

        Assert.AreEqual(4, updatedLayer.CreatedById);
        Assert.AreEqual(1, updatedLayer.UpdatedById);
        Assert.AreEqual(0, updatedLayer.InstrumentCasingId);
        Assert.AreEqual("Freddy ate more cake than Maria.", updatedLayer.Notes);
    }

    [TestMethod]
    public async Task EditLayerCodelists()
    {
        var id = 7_000_089;

        var layerWithChanges = new Layer
        {
            Id = id,
            CreatedById = 4,
            UpdatedById = 4,
            Created = new DateTime(2021, 2, 14, 8, 55, 34).ToUniversalTime(),
            InstrumentCasingId = 0,
            Notes = "Freddy ate more cake than Maria.",
            StratigraphyId = 6_000_010,
            CodelistIds = new List<int> { 23101017, 23101018, 23101001 },
        };

        var layerToEdit = context.Layers.Include(l => l.LayerCodelists).Include(c => c.Codelists).Single(c => c.Id == id);
        Assert.AreEqual(3, layerToEdit.Codelists.Count);
        var codelistIds = layerToEdit.Codelists.Select(c => c.Id).ToList();
        CollectionAssert.Contains(codelistIds, 23101017);
        CollectionAssert.Contains(codelistIds, 23101018);
        CollectionAssert.Contains(codelistIds, 23101019);

        // Update Layer
        var response = await controller.EditAsync(layerWithChanges);

        // Assert Updates and unchanged values
        var updatedLayer = ActionResultAssert.IsOkObjectResult<Layer>(response.Result);
        Assert.AreEqual(3, updatedLayer.Codelists.Count);
        codelistIds = updatedLayer.Codelists.Select(c => c.Id).ToList();
        CollectionAssert.Contains(codelistIds, 23101017);
        CollectionAssert.Contains(codelistIds, 23101018);
        CollectionAssert.Contains(codelistIds, 23101001);

        layerWithChanges.CodelistIds = null;

        // Update Layer
        response = await controller.EditAsync(layerWithChanges);

        // Assert Updates and unchanged values
        updatedLayer = ActionResultAssert.IsOkObjectResult<Layer>(response.Result);
        Assert.AreEqual(0, updatedLayer.Codelists.Count);

        layerWithChanges.CodelistIds = new List<int> { 23101002 };

        // Update Layer
        response = await controller.EditAsync(layerWithChanges);

        // Assert Updates and unchanged values
        updatedLayer = ActionResultAssert.IsOkObjectResult<Layer>(response.Result);
        Assert.AreEqual(1, updatedLayer.Codelists.Count);
        Assert.AreEqual(23101002, updatedLayer.Codelists.First().Id);
    }

    [TestMethod]
    public async Task EditWithInexistentIdReturnsNotFound()
    {
        var id = 9487794;
        var layer = new Layer
        {
            Id = id,
        };

        // Upate Layer
        var response = await controller.EditAsync(layer);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutLayerReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task CreateWithCompleteLayer()
    {
        var firstCodeListId = 9100;
        var secondCodeListId = 9101;

        var layerToAdd = new Layer
        {
            Alteration = null,
            AlterationId = null,
            Casing = "invoice overriding",
            CasingDateFinish = new DateTime(2021, 5, 29, 21, 00, 00).ToUniversalTime(),
            CasingDateSpud = new DateTime(2021, 7, 16, 13, 20, 25).ToUniversalTime(),
            CasingInnerDiameter = 10.9742215,
            CasingKind = null,
            CasingKindId = null,
            CasingMaterial = null,
            CasingMaterialId = null,
            CasingOuterDiameter = 13.89372933,
            Cohesion = null,
            CohesionId = 21116001,
            Compactness = null,
            CompactnessId = 21102007,
            Consistance = null,
            ConsistanceId = 21103004,
            CreatedBy = null,
            CreatedById = 3,
            Created = new DateTime(2021, 8, 3, 6, 15, 55).ToUniversalTime(),
            FillKind = null,
            FillKindId = 25000302,
            FillMaterial = null,
            FillMaterialId = 25000306,
            FromDepth = 90,
            GradationId = 30000016,
            GrainSize1 = null,
            GrainSize1Id = 21101004,
            GrainSize2 = null,
            GrainSize2Id = 21103009,
            Humidity = null,
            HumidityId = 21105001,
            Id = 8_000_000,
            Instrument = "Metal",
            InstrumentKind = null,
            InstrumentKindId = 25000209,
            InstrumentStatus = null,
            InstrumentStatusId = 25000215,
            InstrumentCasing = null,
            InstrumentCasingId = 6_000_008,
            IsLast = true,
            IsStriae = true,
            IsUndefined = false,
            Lithology = null,
            LithologyId = 15101055,
            LithologyTopBedrock = null,
            LithologyTopBedrockId = 15104417,
            Lithostratigraphy = null,
            LithostratigraphyId = null,
            Notes = "Baby grow strategic haptic",
            OriginalUscs = "Bedfordshire",
            Plasticity = null,
            PlasticityId = 21101005,
            QtDescription = null,
            QtDescriptionId = null,
            Stratigraphy = null,
            StratigraphyId = 6_000_008,
            ToDepth = 100,
            Updated = new DateTime(2021, 2, 14, 8, 55, 34).ToUniversalTime(),
            UpdatedBy = null,
            UpdatedById = 3,
            Uscs1 = null,
            Uscs1Id = 23101016,
            Uscs2 = null,
            Uscs2Id = 23101010,
            CodelistIds = new List<int> { firstCodeListId, secondCodeListId },
        };

        var response = await controller.CreateAsync(layerToAdd);
        var okResult = response.Result as OkObjectResult;

        var addedLayer = context.Layers.Include(l => l.Codelists).Single(c => c.Id == layerToAdd.Id);

        Assert.AreEqual(layerToAdd.AlterationId, addedLayer.AlterationId);
        Assert.AreEqual(layerToAdd.Casing, addedLayer.Casing);
        Assert.AreEqual(layerToAdd.CasingDateFinish, addedLayer.CasingDateFinish);
        Assert.AreEqual(layerToAdd.CasingDateSpud, addedLayer.CasingDateSpud);
        Assert.AreEqual(layerToAdd.CasingInnerDiameter, addedLayer.CasingInnerDiameter);
        Assert.AreEqual(layerToAdd.CasingKindId, addedLayer.CasingKindId);
        Assert.AreEqual(layerToAdd.CasingMaterialId, addedLayer.CasingMaterialId);
        Assert.AreEqual(layerToAdd.CasingOuterDiameter, addedLayer.CasingOuterDiameter);
        Assert.AreEqual(layerToAdd.CohesionId, addedLayer.CohesionId);
        Assert.AreEqual(layerToAdd.CompactnessId, addedLayer.CompactnessId);
        Assert.AreEqual(layerToAdd.ConsistanceId, addedLayer.ConsistanceId);
        Assert.AreEqual(layerToAdd.FillKindId, addedLayer.FillKindId);
        Assert.AreEqual(layerToAdd.FillMaterialId, addedLayer.FillMaterialId);
        Assert.AreEqual(layerToAdd.FromDepth, addedLayer.FromDepth);
        Assert.AreEqual(layerToAdd.GradationId, addedLayer.GradationId);
        Assert.AreEqual(layerToAdd.GrainSize1Id, addedLayer.GrainSize1Id);
        Assert.AreEqual(layerToAdd.GrainSize2Id, addedLayer.GrainSize2Id);
        Assert.AreEqual(layerToAdd.HumidityId, addedLayer.HumidityId);
        Assert.AreEqual(layerToAdd.Id, addedLayer.Id);
        Assert.AreEqual(layerToAdd.Instrument, addedLayer.Instrument);
        Assert.AreEqual(layerToAdd.InstrumentKindId, addedLayer.InstrumentKindId);
        Assert.AreEqual(layerToAdd.InstrumentStatusId, addedLayer.InstrumentStatusId);
        Assert.AreEqual(layerToAdd.InstrumentCasingId, addedLayer.InstrumentCasingId);
        Assert.AreEqual(layerToAdd.IsLast, addedLayer.IsLast);
        Assert.AreEqual(layerToAdd.IsStriae, addedLayer.IsStriae);
        Assert.AreEqual(layerToAdd.IsUndefined, addedLayer.IsUndefined);
        Assert.AreEqual(layerToAdd.LithologyId, addedLayer.LithologyId);
        Assert.AreEqual(layerToAdd.LithologyTopBedrockId, addedLayer.LithologyTopBedrockId);
        Assert.AreEqual(layerToAdd.LithostratigraphyId, addedLayer.LithostratigraphyId);
        Assert.AreEqual(layerToAdd.Notes, addedLayer.Notes);
        Assert.AreEqual(layerToAdd.OriginalUscs, addedLayer.OriginalUscs);
        Assert.AreEqual(layerToAdd.PlasticityId, addedLayer.PlasticityId);
        Assert.AreEqual(layerToAdd.QtDescriptionId, addedLayer.QtDescriptionId);
        Assert.AreEqual(layerToAdd.StratigraphyId, addedLayer.StratigraphyId);
        Assert.AreEqual(layerToAdd.ToDepth, addedLayer.ToDepth);
        Assert.AreEqual(layerToAdd.Uscs1Id, addedLayer.Uscs1Id);
        Assert.AreEqual(layerToAdd.Uscs2Id, addedLayer.Uscs2Id);

        Assert.AreEqual(layerToAdd.Updated.Value.Date, addedLayer.Updated?.Date);
        Assert.AreEqual(layerToAdd.UpdatedById, addedLayer.UpdatedById);
        Assert.AreEqual(layerToAdd.CreatedById, addedLayer.CreatedById);
        Assert.AreEqual(layerToAdd.Created.Value.Date, addedLayer.Created?.Date);

        Assert.AreEqual(layerToAdd.LayerCodelists.Count, addedLayer.LayerCodelists.Count);
        var layerCodeList = addedLayer.LayerCodelists.Single(c => c.CodelistId == firstCodeListId);
        Assert.IsNotNull(layerCodeList.Codelist);
        layerCodeList = addedLayer.LayerCodelists.Single(c => c.CodelistId == secondCodeListId);
        Assert.IsNotNull(layerCodeList.Codelist);
    }
}
