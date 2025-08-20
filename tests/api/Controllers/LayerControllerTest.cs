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
public class LayerControllerTest
{
    private BdmsContext context;
    private LayerController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new LayerController(context, new Mock<ILogger<LayerController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
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
        Assert.AreEqual(30_000, layers.Count());
    }

    [TestMethod]
    public async Task GetAsyncFiltersLayersBasedOnWorkgroupPermissions()
    {
        // Add a new borehole with layers and workgroup that is not default
        var newBorehole = new Borehole()
        {
            Name = "Test Borehole",
            WorkgroupId = 4,
        };
        await context.Boreholes.AddAsync(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var newStratigraphy = new Stratigraphy()
        {
            BoreholeId = newBorehole.Id,
        };
        await context.Stratigraphies.AddAsync(newStratigraphy);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var newLithologyLayer = new Layer()
        {
            StratigraphyId = newStratigraphy.Id,
        };
        await context.Layers.AddAsync(newLithologyLayer);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var layersResponse = await controller.GetAsync().ConfigureAwait(false);
        IEnumerable<Layer>? layersForAdmin = layersResponse.Value;
        Assert.IsNotNull(layersForAdmin);
        Assert.AreEqual(30001, layersForAdmin.Count());

        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);

        var layersResponse2 = await controller.GetAsync().ConfigureAwait(false);
        IEnumerable<Layer>? layersForEditor = layersResponse2.Value;
        Assert.IsNotNull(layersForEditor);
        Assert.AreEqual(28500, layersForEditor.Count());
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
        var emptyStratigraphy = new Stratigraphy();

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
        Assert.AreEqual("transform mesh Brand Fantastic", layer.Notes);
        Assert.AreEqual(15104811, layer.LithologyId);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var layerId = context.Layers.First().Id;

        var response = await controller.GetByIdAsync(layerId).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(response.Result);
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
            Notes = "Freddy ate more cake than Maria.",
            StratigraphyId = 6_000_010,
        };

        var layerToEdit = context.Layers.Single(c => c.Id == id);
        Assert.AreEqual(3, layerToEdit.CreatedById);
        Assert.AreEqual(4, layerToEdit.UpdatedById);
        Assert.AreEqual("Generic Metal Soap Island Tasty Fresh Sausages Fresh", layerToEdit.Notes);

        // Update Layer
        var response = await controller.EditAsync(newLayer);
        ActionResultAssert.IsOk(response.Result);

        // Assert Updates and unchanged values
        var updatedLayer = ActionResultAssert.IsOkObjectResult<Layer>(response.Result);

        Assert.AreEqual(4, updatedLayer.CreatedById);
        Assert.AreEqual(1, updatedLayer.UpdatedById);
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
            Notes = "Freddy ate more cake than Maria.",
            StratigraphyId = 6_000_010,
            ColorCodelistIds = new List<int> { 21112012 },
            DebrisCodelistIds = new List<int> { 9103, 9104, 9105 },
            GrainShapeCodelistIds = new List<int> { 21110003, 21110002 },
            GrainAngularityCodelistIds = new List<int> { 21115005, 21115008, 21115001 },
            OrganicComponentCodelistIds = new List<int> { 21108007, 21108002, 21108003, 21108004, 21108006 },
            Uscs3CodelistIds = new List<int> { 23101017, 23101018, 23101001 },
        };

        var layerToEdit = await context.LayersWithIncludes.AsNoTracking().SingleAsync(x => x.Id == id).ConfigureAwait(false);
        Assert.AreEqual(4, layerToEdit.Uscs3Codelists.Count);
        Assert.AreEqual(1, layerToEdit.ColorCodelists.Count);
        Assert.AreEqual(2, layerToEdit.DebrisCodelists.Count);
        Assert.AreEqual(1, layerToEdit.GrainShapeCodelists.Count);
        Assert.AreEqual(4, layerToEdit.GrainAngularityCodelists.Count);
        Assert.AreEqual(4, layerToEdit.OrganicComponentCodelists.Count);

        // Update Layer
        var response = await controller.EditAsync(layerWithChanges);

        // Assert Updates and unchanged values
        var updatedLayer = ActionResultAssert.IsOkObjectResult<Layer>(response.Result);
        Assert.AreEqual(3, updatedLayer.Uscs3Codelists.Count);
        var uscs3Codelists = updatedLayer.Uscs3Codelists.Select(c => c.Id).ToList();
        CollectionAssert.Contains(uscs3Codelists, 23101017);
        CollectionAssert.Contains(uscs3Codelists, 23101018);
        CollectionAssert.Contains(uscs3Codelists, 23101001);

        Assert.AreEqual(1, updatedLayer.ColorCodelists.Count);
        var colorCodelists = updatedLayer.ColorCodelists.Select(c => c.Id).ToList();
        CollectionAssert.Contains(colorCodelists, 21112012);

        Assert.AreEqual(3, updatedLayer.DebrisCodelists.Count);
        var debrisCodelists = updatedLayer.DebrisCodelists.Select(c => c.Id).ToList();
        CollectionAssert.Contains(debrisCodelists, 9103);
        CollectionAssert.Contains(debrisCodelists, 9104);
        CollectionAssert.Contains(debrisCodelists, 9105);

        Assert.AreEqual(2, updatedLayer.GrainShapeCodelists.Count);
        var grainShapeCodelists = updatedLayer.GrainShapeCodelists.Select(c => c.Id).ToList();
        CollectionAssert.Contains(grainShapeCodelists, 21110003);
        CollectionAssert.Contains(grainShapeCodelists, 21110002);

        Assert.AreEqual(3, updatedLayer.GrainAngularityCodelists.Count);
        var grainAngularityCodelists = updatedLayer.GrainAngularityCodelists.Select(c => c.Id).ToList();
        CollectionAssert.Contains(grainAngularityCodelists, 21115005);
        CollectionAssert.Contains(grainAngularityCodelists, 21115008);
        CollectionAssert.Contains(grainAngularityCodelists, 21115001);

        Assert.AreEqual(5, updatedLayer.OrganicComponentCodelists.Count);
        var organicComponentCodelists = updatedLayer.OrganicComponentCodelists.Select(c => c.Id).ToList();
        CollectionAssert.Contains(organicComponentCodelists, 21108007);
        CollectionAssert.Contains(organicComponentCodelists, 21108002);
        CollectionAssert.Contains(organicComponentCodelists, 21108003);
        CollectionAssert.Contains(organicComponentCodelists, 21108004);
        CollectionAssert.Contains(organicComponentCodelists, 21108006);

        layerWithChanges.Uscs3CodelistIds = null;
        layerWithChanges.ColorCodelistIds = null;
        layerWithChanges.DebrisCodelistIds = null;
        layerWithChanges.GrainShapeCodelistIds = null;
        layerWithChanges.GrainAngularityCodelistIds = null;

        // Update Layer
        response = await controller.EditAsync(layerWithChanges);

        // Assert Updates and unchanged values
        updatedLayer = ActionResultAssert.IsOkObjectResult<Layer>(response.Result);
        Assert.AreEqual(0, updatedLayer.Uscs3Codelists.Count);
        Assert.AreEqual(0, updatedLayer.ColorCodelists.Count);
        Assert.AreEqual(0, updatedLayer.DebrisCodelists.Count);
        Assert.AreEqual(0, updatedLayer.GrainShapeCodelists.Count);
        Assert.AreEqual(0, updatedLayer.GrainAngularityCodelists.Count);
        Assert.AreEqual(5, updatedLayer.OrganicComponentCodelists.Count);

        layerWithChanges.Uscs3CodelistIds = new List<int> { 23101002 };
        layerWithChanges.ColorCodelistIds = new List<int> { 21112012 };
        layerWithChanges.DebrisCodelistIds = new List<int> { 9103 };

        // Update Layer
        response = await controller.EditAsync(layerWithChanges);

        // Assert Updates and unchanged values
        updatedLayer = ActionResultAssert.IsOkObjectResult<Layer>(response.Result);
        Assert.AreEqual(1, updatedLayer.Uscs3Codelists.Count);
        Assert.AreEqual(23101002, updatedLayer.Uscs3Codelists.First().Id);

        Assert.AreEqual(1, updatedLayer.ColorCodelists.Count);
        Assert.AreEqual(21112012, updatedLayer.ColorCodelists.First().Id);
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
        var firstColorCodeListId = 21112025;
        var secondColorCodeListId = 21112022;

        var layerToAdd = new Layer
        {
            Alteration = null,
            AlterationId = null,
            Cohesion = null,
            CohesionId = 21116001,
            Compactness = null,
            CompactnessId = 21102007,
            ColorCodelistIds = new List<int> { firstColorCodeListId, secondColorCodeListId },
            Consistance = null,
            ConsistanceId = 21103004,
            CreatedBy = null,
            CreatedById = 3,
            Created = new DateTime(2021, 8, 3, 6, 15, 55).ToUniversalTime(),
            DebrisCodelistIds = new List<int> { 9103, 9104, 9105 },
            FromDepth = 90,
            GradationId = 30000016,
            GrainSize1 = null,
            GrainSize1Id = 21101004,
            GrainSize2 = null,
            GrainSize2Id = 21103009,
            GrainAngularityCodelistIds = new List<int> { 21115001, 21115002 },
            GrainShapeCodelistIds = new List<int> { 21110001, 21110002 },
            Humidity = null,
            HumidityId = 21105001,
            Id = 8_000_000,
            IsLast = true,
            IsStriae = true,
            IsUndefined = false,
            Lithology = null,
            LithologyId = 15104901,
            LithologyTopBedrock = null,
            LithologyTopBedrockId = 15104902,
            Lithostratigraphy = null,
            LithostratigraphyId = null,
            Notes = "Baby grow strategic haptic",
            OriginalUscs = "Bedfordshire",
            OrganicComponentCodelistIds = new List<int> { 21108001, 21108002 },
            Plasticity = null,
            PlasticityId = 21101005,
            DescriptionQuality = null,
            DescriptionQualityId = null,
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
            Uscs3CodelistIds = new List<int> { 23101014, 23101017 },
        };

        var response = await controller.CreateAsync(layerToAdd);
        var okResult = response.Result as OkObjectResult;

        var addedLayer = await context.LayersWithIncludes.SingleAsync(x => x.Id == layerToAdd.Id).ConfigureAwait(false);

        Assert.AreEqual(layerToAdd.AlterationId, addedLayer.AlterationId);
        Assert.AreEqual(layerToAdd.CohesionId, addedLayer.CohesionId);
        Assert.AreEqual(layerToAdd.CompactnessId, addedLayer.CompactnessId);
        Assert.AreEqual(layerToAdd.ConsistanceId, addedLayer.ConsistanceId);
        Assert.AreEqual(layerToAdd.FromDepth, addedLayer.FromDepth);
        Assert.AreEqual(layerToAdd.GradationId, addedLayer.GradationId);
        Assert.AreEqual(layerToAdd.GrainSize1Id, addedLayer.GrainSize1Id);
        Assert.AreEqual(layerToAdd.GrainSize2Id, addedLayer.GrainSize2Id);
        Assert.AreEqual(layerToAdd.HumidityId, addedLayer.HumidityId);
        Assert.AreEqual(layerToAdd.Id, addedLayer.Id);
        Assert.AreEqual(layerToAdd.IsLast, addedLayer.IsLast);
        Assert.AreEqual(layerToAdd.IsStriae, addedLayer.IsStriae);
        Assert.AreEqual(layerToAdd.IsUndefined, addedLayer.IsUndefined);
        Assert.AreEqual(layerToAdd.LithologyId, addedLayer.LithologyId);
        Assert.AreEqual(layerToAdd.LithologyTopBedrockId, addedLayer.LithologyTopBedrockId);
        Assert.AreEqual(layerToAdd.LithostratigraphyId, addedLayer.LithostratigraphyId);
        Assert.AreEqual(layerToAdd.Notes, addedLayer.Notes);
        Assert.AreEqual(layerToAdd.OriginalUscs, addedLayer.OriginalUscs);
        Assert.AreEqual(layerToAdd.PlasticityId, addedLayer.PlasticityId);
        Assert.AreEqual(layerToAdd.DescriptionQualityId, addedLayer.DescriptionQualityId);
        Assert.AreEqual(layerToAdd.StratigraphyId, addedLayer.StratigraphyId);
        Assert.AreEqual(layerToAdd.ToDepth, addedLayer.ToDepth);
        Assert.AreEqual(layerToAdd.Uscs1Id, addedLayer.Uscs1Id);
        Assert.AreEqual(layerToAdd.Uscs2Id, addedLayer.Uscs2Id);

        Assert.AreEqual(layerToAdd.Updated.Value.Date, addedLayer.Updated?.Date);
        Assert.AreEqual(layerToAdd.UpdatedById, addedLayer.UpdatedById);
        Assert.AreEqual(layerToAdd.CreatedById, addedLayer.CreatedById);
        Assert.AreEqual(layerToAdd.Created.Value.Date, addedLayer.Created?.Date);

        Assert.AreEqual(layerToAdd.ColorCodelists.Count, addedLayer.ColorCodelists.Count);
        Assert.AreEqual(layerToAdd.DebrisCodelists.Count, addedLayer.DebrisCodelists.Count);
        Assert.AreEqual(layerToAdd.GrainShapeCodelists.Count, addedLayer.GrainShapeCodelists.Count);
        Assert.AreEqual(layerToAdd.GrainAngularityCodelists.Count, addedLayer.GrainAngularityCodelists.Count);
        Assert.AreEqual(layerToAdd.OrganicComponentCodelists.Count, addedLayer.OrganicComponentCodelists.Count);
        Assert.AreEqual(layerToAdd.Uscs3Codelists.Count, addedLayer.Uscs3Codelists.Count);

        var layerColorCode = addedLayer.LayerColorCodes.Single(c => c.CodelistId == firstColorCodeListId);
        Assert.IsNotNull(layerColorCode.Codelist);

        layerColorCode = addedLayer.LayerColorCodes.Single(c => c.CodelistId == secondColorCodeListId);
        Assert.IsNotNull(layerColorCode.Codelist);
    }
}
