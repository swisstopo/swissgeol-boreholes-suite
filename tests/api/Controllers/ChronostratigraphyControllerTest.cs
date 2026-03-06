using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class ChronostratigraphyControllerTest
{
    private BdmsContext context;
    private ChronostratigraphyController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new ChronostratigraphyController(context, new Mock<ILogger<ChronostratigraphyController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAsyncReturnsUnauthorizedWithInsufficientRights()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_unauthorized", PolicyNames.Viewer);

        var unauthorizedResponse = await controller.GetAsync(context.Stratigraphies.First().Id).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(unauthorizedResponse.Result);
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyIdForInexistentId()
    {
        var notFoundResponse = await controller.GetAsync(94578122).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(notFoundResponse.Result);
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyId()
    {
        var response = await controller.GetAsync(6_000_095).ConfigureAwait(false);
        IEnumerable<ChronostratigraphyLayer>? chronostratigraphies = response.Value;
        Assert.IsNotNull(chronostratigraphies);
        Assert.AreEqual(10, chronostratigraphies.Count());
    }

    [TestMethod]
    public async Task GetChronostratigraphyByInexistentId()
    {
        var response = await controller.GetByIdAsync(9263667).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task GetChronostratigraphyById()
    {
        var response = await controller.GetByIdAsync(11_000_014).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var chronostratigraphy = okResult.Value as ChronostratigraphyLayer;
        Assert.AreEqual(11_000_014, chronostratigraphy.Id);
        Assert.AreEqual(40, chronostratigraphy.FromDepth);
        Assert.AreEqual(50, chronostratigraphy.ToDepth);
        Assert.AreEqual(15_001_080, chronostratigraphy.ChronostratigraphyId);
        Assert.AreEqual(6_000_001, chronostratigraphy.StratigraphyId);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var chronostratigraphyId = context.ChronostratigraphyLayers.First().Id;

        var response = await controller.GetByIdAsync(chronostratigraphyId).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task EditChronostratigraphyWithCompleteChronostratigraphy()
    {
        var id = 11_000_039;
        var originalChronostratigraphy = new ChronostratigraphyLayer
        {
            CreatedBy = null,
            CreatedById = 2,
            Created = new DateTime(2021, 4, 10, 12, 43, 45).ToUniversalTime(),
            FromDepth = 90,
            ToDepth = 100,
            Id = 11_000_039,
            Chronostratigraphy = null,
            ChronostratigraphyId = 15_001_088,
            Updated = new DateTime(2021, 6, 27, 4, 22, 39).ToUniversalTime(),
            UpdatedBy = null,
            UpdatedById = 5,
            StratigraphyId = 6_000_003,
        };

        var newChronostratigraphy = new ChronostratigraphyLayer
        {
            Id = id,
            CreatedById = 3,
            UpdatedById = 3,
            Created = new DateTime(2021, 4, 29, 15, 56, 01).ToUniversalTime(),
            StratigraphyId = 6_000_010,
            ChronostratigraphyId = 15_001_057,
        };

        var chronostratigraphyToEdit = context.ChronostratigraphyLayers.Single(c => c.Id == id);
        Assert.AreEqual(originalChronostratigraphy.CreatedById, chronostratigraphyToEdit.CreatedById);
        Assert.AreEqual(originalChronostratigraphy.UpdatedById, chronostratigraphyToEdit.UpdatedById);
        Assert.AreEqual(originalChronostratigraphy.StratigraphyId, chronostratigraphyToEdit.StratigraphyId);
        Assert.AreEqual(originalChronostratigraphy.ChronostratigraphyId, chronostratigraphyToEdit.ChronostratigraphyId);

        // Update Chronostratigraphy
        var response = await controller.EditAsync(newChronostratigraphy);
        ActionResultAssert.IsOk(response.Result);

        // Assert Updates and unchanged values
        var updatedChronostratigraphy = context.ChronostratigraphyLayers.Single(c => c.Id == id);

        Assert.AreEqual(3, updatedChronostratigraphy.CreatedById);
        Assert.AreEqual(1, updatedChronostratigraphy.UpdatedById);
        Assert.AreEqual(6_000_010, updatedChronostratigraphy.StratigraphyId);
        Assert.AreEqual(15_001_057, updatedChronostratigraphy.ChronostratigraphyId);
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9815784;
        var chronostratigraphy = new ChronostratigraphyLayer
        {
            Id = id,
            StratigraphyId = 6000001,
        };

        // Upate FaciesDescription
        var response = await controller.EditAsync(chronostratigraphy);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutChronostratigraphyReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task CreateAndDeleteAsync()
    {
        var chronostratigraphy = new ChronostratigraphyLayer
        {
            CreatedById = 2,
            UpdatedById = 2,
            Created = new DateTime(2022, 10, 4, 13, 19, 34).ToUniversalTime(),
            StratigraphyId = 6_000_010,
            ChronostratigraphyId = 15001036,
        };

        var response = await controller.CreateAsync(chronostratigraphy);
        ActionResultAssert.IsOk(response.Result);
        chronostratigraphy = await context.ChronostratigraphyLayers.FindAsync(chronostratigraphy.Id);
        Assert.IsNotNull(chronostratigraphy);
        Assert.AreEqual(15001036, chronostratigraphy.ChronostratigraphyId);

        var deleteResponse = await controller.DeleteAsync(chronostratigraphy.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(chronostratigraphy.Id);
        ActionResultAssert.IsNotFound(deleteResponse);

        var getResponse = await controller.GetByIdAsync(chronostratigraphy.Id);
        ActionResultAssert.IsNotFound(getResponse.Result);
    }

    [TestMethod]
    public async Task CreateAsyncWithExistingId()
    {
        var chronostratigraphy = new ChronostratigraphyLayer
        {
            Id = 11_000_010,
            ChronostratigraphyId = 15001045,
            StratigraphyId = 6000001,
        };

        var getResponse = await controller.GetByIdAsync(chronostratigraphy.Id);
        ActionResultAssert.IsOk(getResponse.Result);

        var response = await controller.CreateAsync(chronostratigraphy);
        ActionResultAssert.IsInternalServerError(response.Result);
    }

    [TestMethod]
    public async Task GetEntriesByProfileIdLayerSorting()
    {
        var stratigraphyId = 6_000_009;
        var createdLayerIds = new List<int>();

        // Create layers out of order
        await CreateLayer(createdLayerIds, new ChronostratigraphyLayer { StratigraphyId = stratigraphyId, FromDepth = 130, ToDepth = 140 });
        await CreateLayer(createdLayerIds, new ChronostratigraphyLayer { StratigraphyId = stratigraphyId, FromDepth = 100, ToDepth = 110 });
        await CreateLayer(createdLayerIds, new ChronostratigraphyLayer { StratigraphyId = stratigraphyId, FromDepth = 120, ToDepth = 130 });

        var response = await controller.GetAsync(stratigraphyId).ConfigureAwait(false);
        var layers = response.Value;
        Assert.IsNotNull(layers);
        Assert.AreEqual(13, layers.Count());
        for (int i = 1; i < layers.Count(); i++)
        {
            Assert.IsTrue(layers.ElementAt(i - 1).FromDepth <= layers.ElementAt(i).FromDepth, string.Format("Expected layers to be sorted by FromDepth but after {0} followed {1}", layers.ElementAt(i - 1).FromDepth, layers.ElementAt(i).FromDepth));
        }
    }

    private async Task CreateLayer(List<int> layerIds, ChronostratigraphyLayer layer)
    {
        var response = await controller.CreateAsync(layer);
        if (response.Result is OkObjectResult && response.Value is IIdentifyable responseLayer)
        {
            layerIds.Add(responseLayer.Id);
        }
    }
}
