using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

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
        controller = new LayerController(ContextFactory.CreateContext(), new Mock<ILogger<Layer>>().Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

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
    public async Task GetEntriesByProfileIdReturnsNotFoundForInexistentId()
    {
        var result = await controller.GetAsync(94578122).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
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
        Assert.IsInstanceOfType(response.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task GetLayerById()
    {
        var response = await controller.GetByIdAsync(7_000_005).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var layer = okResult.Value as Layer;
        Assert.AreEqual(7_000_005, layer.Id);
        Assert.AreEqual(2.274020571389245, layer.CasingInnerDiameter);
        Assert.AreEqual("Tasty Soft Mouse Drive Internal invoice", layer.Notes);
        Assert.AreEqual(15101036, layer.LithologyId);
    }

    [TestMethod]
    public async Task EditLayerWithCompleteLayer()
    {
        var id = 7_000_089;
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
            Created = new DateTime(2021, 8, 3, 6, 15, 55).ToUniversalTime(),
            DescriptionFacies = "Awesome Steel Gloves bandwidth Berkshire Mission open system",
            DescriptionLithological = "Metal Baby grow",
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
            Id = 7_000_089,
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
            UscsDetermination = null,
            UscsDeterminationId = null,
        };

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
        Assert.AreEqual(3, layerToEdit.UpdatedById);
        Assert.AreEqual(6_000_008, layerToEdit.InstrumentCasingId);
        Assert.AreEqual("Baby grow strategic haptic", layerToEdit.Notes);

        try
        {
            // Update Layer
            var response = await controller.EditAsync(newLayer);
            var okResult = response as OkObjectResult;
            Assert.AreEqual(200, okResult.StatusCode);

            // Assert Updates and unchanged values
            var updatedContext = ContextFactory.CreateContext();
            var updatedLayer = updatedContext.Layers.Single(c => c.Id == id);

            Assert.AreEqual(4, updatedLayer.CreatedById);
            Assert.AreEqual(1, updatedLayer.UpdatedById);
            Assert.AreEqual(0, updatedLayer.InstrumentCasingId);
            Assert.AreEqual("Freddy ate more cake than Maria.", updatedLayer.Notes);
        }
        finally
        {
            // Reset edits
            var cleanupContext = ContextFactory.CreateContext();
            cleanupContext.Update(originalLayer);
            await cleanupContext.SaveChangesAsync();
        }
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
