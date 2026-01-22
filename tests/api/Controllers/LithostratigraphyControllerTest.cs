using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class LithostratigraphyControllerTest
{
    private BdmsContext context;
    private LithostratigraphyController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    private LithostratigraphyLayer GetLithostratigraphy() => new LithostratigraphyLayer
    {
        StratigraphyId = 6_000_001,
        CreatedById = 2,
        Created = new DateTime(2023, 5, 30, 12, 9, 42).ToUniversalTime(),
        UpdatedById = 5,
        Updated = new DateTime(2023, 5, 31, 13, 10, 44).ToUniversalTime(),
        FromDepth = 10,
        ToDepth = 20,
        LithostratigraphyId = 15_300_284,
    };

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new LithostratigraphyController(context, new Mock<ILogger<LithostratigraphyController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
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
        IEnumerable<LithostratigraphyLayer>? lithostratigraphies = response.Value;
        Assert.IsNotNull(lithostratigraphies);
        Assert.AreEqual(10, lithostratigraphies.Count());
    }

    [TestMethod]
    public async Task GetLithostratigraphyByInexistentId()
    {
        var response = await controller.GetByIdAsync(9263667).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task GetLithostratigraphyById()
    {
        var response = await controller.GetByIdAsync(14_000_014).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var lithostratigraphy = okResult.Value as LithostratigraphyLayer;
        Assert.AreEqual(14_000_014, lithostratigraphy.Id);
        Assert.AreEqual(40, lithostratigraphy.FromDepth);
        Assert.AreEqual(50, lithostratigraphy.ToDepth);
        Assert.AreEqual(15_302_431, lithostratigraphy.LithostratigraphyId);
        Assert.AreEqual(6_000_001, lithostratigraphy.StratigraphyId);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var response = await controller.GetByIdAsync(14_000_014).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task CreateLithostratigraphy()
    {
        var lithostratigraphy = GetLithostratigraphy();

        var response = await controller.CreateAsync(lithostratigraphy);
        ActionResultAssert.IsOk(response.Result);

        lithostratigraphy = await context.LithostratigraphyLayers.FindAsync(lithostratigraphy.Id);
        Assert.IsNotNull(lithostratigraphy);
        Assert.AreEqual(15_300_284, lithostratigraphy.LithostratigraphyId);
    }

    [TestMethod]
    public async Task DeleteLithostratigraphy()
    {
        var lithostratigraphy = GetLithostratigraphy();

        context.Add(lithostratigraphy);
        await context.SaveChangesAsync();

        var response = await controller.DeleteAsync(lithostratigraphy.Id);
        ActionResultAssert.IsOk(response);

        response = await controller.DeleteAsync(lithostratigraphy.Id);
        ActionResultAssert.IsNotFound(response);

        Assert.AreEqual(null, context.LithostratigraphyLayers.SingleOrDefault(x => x.Id == lithostratigraphy.Id));
    }

    [TestMethod]
    public async Task EditLithostratigraphy()
    {
        var lithostratigraphy = GetLithostratigraphy();

        var changedLithostratigraphy = new LithostratigraphyLayer
        {
            StratigraphyId = 6_000_002,
            CreatedById = 3,
            Created = new DateTime(2022, 4, 29, 11, 37, 40).ToUniversalTime(),
            UpdatedById = 4,
            Updated = new DateTime(2022, 4, 30, 10, 34, 41).ToUniversalTime(),
            FromDepth = 30,
            ToDepth = 40,
            LithostratigraphyId = 15_300_623,
        };

        context.Add(lithostratigraphy);
        await context.SaveChangesAsync();

        changedLithostratigraphy.Id = lithostratigraphy.Id;
        var response = await controller.EditAsync(changedLithostratigraphy);
        ActionResultAssert.IsOk(response.Result);

        lithostratigraphy = context.LithostratigraphyLayers.SingleOrDefault(x => x.Id == lithostratigraphy.Id);
        Assert.IsNotNull(lithostratigraphy);
        Assert.AreEqual(15_300_623, lithostratigraphy.LithostratigraphyId);
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9815784;
        var lithostratigraphy = new LithostratigraphyLayer
        {
            Id = id,
            StratigraphyId = 6000001,
        };

        var response = await controller.EditAsync(lithostratigraphy);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutContentReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task GetEntriesByProfileIdLayerSorting()
    {
        var stratigraphyId = 6_000_009;
        var createdLayerIds = new List<int>();

        // Create layers out of order
        await CreateLayer(createdLayerIds, new LithostratigraphyLayer { StratigraphyId = stratigraphyId, FromDepth = 130, ToDepth = 140 });
        await CreateLayer(createdLayerIds, new LithostratigraphyLayer { StratigraphyId = stratigraphyId, FromDepth = 100, ToDepth = 110 });
        await CreateLayer(createdLayerIds, new LithostratigraphyLayer { StratigraphyId = stratigraphyId, FromDepth = 120, ToDepth = 130 });

        var response = await controller.GetAsync(stratigraphyId).ConfigureAwait(false);
        var layers = response.Value;
        Assert.IsNotNull(layers);
        Assert.AreEqual(13, layers.Count());
        for (int i = 1; i < layers.Count(); i++)
        {
            Assert.IsTrue(layers.ElementAt(i - 1).FromDepth <= layers.ElementAt(i).FromDepth, string.Format("Expected layers to be sorted by FromDepth but after {0} followed {1}", layers.ElementAt(i - 1).FromDepth, layers.ElementAt(i).FromDepth));
        }
    }

    private async Task CreateLayer(List<int> layerIds, LithostratigraphyLayer layer)
    {
        var response = await controller.CreateAsync(layer);
        if (response.Result is OkObjectResult && response.Value is IIdentifyable responseLayer)
        {
            layerIds.Add(responseLayer.Id);
        }
    }
}
