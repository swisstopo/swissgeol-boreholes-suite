using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace BDMS;

[TestClass]
public class LayerControllerTest
{
    private BdmsContext context;
    private LayerController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new LayerController(ContextFactory.CreateContext(), new Mock<ILogger<LayerController>>().Object);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAllEntriesAsync()
    {
        var response = await controller.GetAsync().ConfigureAwait(false);
        IEnumerable<Layer>? layers = response?.Value;
        Assert.IsNotNull(layers);
        Assert.AreEqual(1500, layers.Count());
    }

    [TestMethod]
    public async Task GetEntriesByProfileIdReturnsNotFoundForInexistantId()
    {
        var result = await controller.GetAsync(94578122).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task GetEntriesByProfileId()
    {
        var response = await controller.GetAsync(6009).ConfigureAwait(false);
        IEnumerable<Layer>? layers = response?.Value;
        Assert.IsNotNull(layers);
        Assert.AreEqual(10, layers.Count());
    }

    [TestMethod]
    public async Task GetLayerByInexistantIdReturnsNotFound()
    {
        var response = await controller.GetByIdAsync(9483157).ConfigureAwait(false);
        Assert.IsInstanceOfType(response.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task GetLayerById()
    {
        var response = await controller.GetByIdAsync(7005).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var layer = okResult.Value as Layer;
        Assert.AreEqual(7005, layer.Id);
        Assert.AreEqual(2.274020571389245, layer.CasingInnerDiameter);
        Assert.AreEqual("Malaysian Ringgit Distributed Sleek mint green", layer.Notes);
        Assert.AreEqual(15101007, layer.LithologyId);
    }

    [TestMethod]
    public async Task EditLayerWithCompleteLayer()
    {
        var id = 7089;
        var originalLayer = new Layer
        {
            Alteration = null,
            AlterationId = null,
            Casing = "invoice overriding",
            CasingDateFinish = new DateOnly(2021, 5, 29),
            CasingDateSpud = new DateOnly(2021, 7, 16),
            CasingInnerDiameter = 10.9742215,
            CasingKind = null,
            CasingKindId = null,
            CasingMaterial = null,
            CasingMaterialId = null,
            CasingOuterDiameter = 13.89372933,
            Chronostratigraphy = null,
            ChronostratigraphyId = 15001136,
            Cohesion = null,
            CohesionId = 21116001,
            Compactness = null,
            CompactnessId = 21102007,
            Consistance = null,
            ConsistanceId = 21103004,
            CreatedBy = null,
            CreatedById = 3,
            Creation = new DateTime(2021, 8, 3, 6, 15, 55).ToUniversalTime(),
            DescriptionFacies = "Awesome Steel Gloves bandwidth Berkshire Mission open system",
            DescriptionLithological = "Metal Baby grow",
            FillKind = null,
            FillKindId = 25000302,
            FillMaterial = null,
            FillMaterialId = 25000306,
            FromDepth = 90,
            GradationId = 1491193234,
            GrainSize1 = null,
            GrainSize1Id = 21101004,
            GrainSize2 = null,
            GrainSize2Id = 21103009,
            Humidity = null,
            HumidityId = 21105001,
            Id = 7089,
            Import = -633416693,
            Instrument = "Metal",
            InstrumentKind = null,
            InstrumentKindId = 25000209,
            InstrumentStatus = null,
            InstrumentStatusId = 25000215,
            InstrumentCasing = null,
            InstrumentCasingId = 6008,
            IsLast = true,
            IsStriae = true,
            IsUndefined = false,
            Kirost = null,
            KirostId = 21117001,
            Lithok = null,
            LithokId = 21117002,
            Lithology = null,
            LithologyId = 15101055,
            LithologyTopBedrock = null,
            LithologyTopBedrockId = 15104417,
            Lithostratigraphy = null,
            LithostratigraphyId = null,
            Notes = "Pakistan Rupee Investment Account AGP Engineer",
            OriginalUscs = "Bedfordshire",
            Plasticity = null,
            PlasticityId = 21101005,
            QtDescription = null,
            QtDescriptionId = null,
            SoilState = null,
            SoilStateId = 21117001,
            Stratigraphy = null,
            StratigraphyId = 6008,
            Symbol = null,
            SymbolId = 21117001,
            ToDepth = 100,
            Unconrocks = null,
            UnconrocksId = 21117002,
            Update = new DateTime(2021, 2, 14, 8, 55, 34).ToUniversalTime(),
            UpdatedBy = null,
            UpdatedById = 3,
            Uscs1 = null,
            Uscs1Id = 23101016,
            Uscs2 = null,
            Uscs2Id = 23101010,
            Uscs3 = null,
            Uscs3Id = 23101012,
            UscsDetermination = null,
            UscsDeterminationId = null,
        };

        var newLayer = new Layer
        {
            Id = id,
            CreatedById = 4,
            UpdatedById = 4,
            Creation = new DateTime(2021, 2, 14, 8, 55, 34).ToUniversalTime(),
            Notes = "Freddy ate more cake than Maria.",
        };

        var layerToEdit = context.Layers.Single(c => c.Id == id);
        Assert.AreEqual(3, layerToEdit.CreatedById);
        Assert.AreEqual("Pakistan Rupee Investment Account AGP Engineer", layerToEdit.Notes);

        // Upate Layer
        var response = await controller.EditAsync(newLayer);
        var okResult = response as OkObjectResult;
        Assert.AreEqual(200, okResult.StatusCode);

        // Assert Updates and unchanged values
        var updatedContext = ContextFactory.CreateContext();
        var updatedLayer = updatedContext.Layers.Single(c => c.Id == id);

        Assert.AreEqual(4, updatedLayer.CreatedById);
        Assert.AreEqual("Freddy ate more cake than Maria.", updatedLayer.Notes);

        // Reset edits
        _ = await controller.EditAsync(originalLayer);
    }

    [TestMethod]
    public async Task EditWithInexistantIdReturnsNotFound()
    {
        var id = 9487794;
        var layer = new Layer
        {
            Id = id,
        };

        // Upate Layer
        var response = await controller.EditAsync(layer);
        var notFoundResult = response as NotFoundResult;
        Assert.AreEqual(404, notFoundResult.StatusCode);
    }

    [TestMethod]
    public async Task EditWithoutLayerReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        var badRequestResult = response as BadRequestObjectResult;
        Assert.AreEqual(400, badRequestResult.StatusCode);
    }
}
