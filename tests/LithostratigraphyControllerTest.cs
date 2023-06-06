using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class LithostratigraphyControllerTest
{
    private BdmsContext context;
    private LithostratigraphyController controller;

    private int lithostratigraphyCount;

    private LithostratigraphyLayer GetLithostratigraphy() => new LithostratigraphyLayer
        {
            StratigraphyId = 6_000_001,
            CreatedById = 2,
            Created = new DateTime(2023, 5, 30, 12, 9, 42).ToUniversalTime(),
            UpdatedById = 5,
            Updated = new DateTime(2023, 5, 31, 13, 10, 44).ToUniversalTime(),
            FromDepth = 10,
            ToDepth = 20,
            IsLast = true,
            LithostratigraphyId = 15_300_284,
        };

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new LithostratigraphyController(ContextFactory.CreateContext(), new Mock<ILogger<LithostratigraphyLayer>>().Object) { ControllerContext = GetControllerContextAdmin() };

        lithostratigraphyCount = context.LithostratigraphyLayers.Count();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Assert.AreEqual(lithostratigraphyCount, context.LithostratigraphyLayers.Count(), "Tests need to remove lithostratigraphy entries they create.");

        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyIdForInexistentId()
    {
        var response = await controller.GetAsync(94578122).ConfigureAwait(false);
        IEnumerable<LithostratigraphyLayer>? lithostratigraphies = response;
        Assert.IsNotNull(lithostratigraphies);
        Assert.AreEqual(0, lithostratigraphies.Count());
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyId()
    {
        var response = await controller.GetAsync(6_000_095).ConfigureAwait(false);
        IEnumerable<LithostratigraphyLayer>? lithostratigraphies = response;
        Assert.IsNotNull(lithostratigraphies);
        Assert.AreEqual(10, lithostratigraphies.Count());
    }

    [TestMethod]
    public async Task GetLithostratigraphyByInexistentId()
    {
        var response = await controller.GetByIdAsync(9263667).ConfigureAwait(false);
        Assert.IsInstanceOfType(response.Result, typeof(NotFoundResult));
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
    public async Task CreateLithostratigraphy()
    {
        var lithostratigraphy = GetLithostratigraphy();

        try
        {
            var response = await controller.CreateAsync(lithostratigraphy);
            Assert.IsInstanceOfType(response, typeof(OkObjectResult));

            lithostratigraphy = await context.LithostratigraphyLayers.FindAsync(lithostratigraphy.Id);
            Assert.IsNotNull(lithostratigraphy);
            Assert.AreEqual(15_300_284, lithostratigraphy.LithostratigraphyId);
        }
        finally
        {
            if (lithostratigraphy != null)
            {
                var lithoToDelete = context.LithostratigraphyLayers.SingleOrDefault(x => x.Id == lithostratigraphy.Id);
                if (lithoToDelete != null)
                {
                    context.Remove(lithoToDelete);
                    await context.SaveChangesAsync();
                }
            }
        }
    }

    [TestMethod]
    public async Task DeleteLithostratigraphy()
    {
        var lithostratigraphy = GetLithostratigraphy();

        try
        {
            context.Add(lithostratigraphy);
            await context.SaveChangesAsync();

            var response = await controller.DeleteAsync(lithostratigraphy.Id);
            Assert.IsInstanceOfType(response, typeof(OkResult));

            response = await controller.DeleteAsync(lithostratigraphy.Id);
            Assert.IsInstanceOfType(response, typeof(NotFoundResult));

            Assert.AreEqual(null, context.LithostratigraphyLayers.SingleOrDefault(x => x.Id == lithostratigraphy.Id));
        }
        finally
        {
            var lithoToDelete = context.LithostratigraphyLayers.SingleOrDefault(x => x.Id == lithostratigraphy.Id);
            if (lithoToDelete != null)
            {
                context.Remove(lithoToDelete);
                await context.SaveChangesAsync();
            }
        }
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
            IsLast = false,
            LithostratigraphyId = 15_300_623,
        };

        try
        {
            context.Add(lithostratigraphy);
            await context.SaveChangesAsync();

            changedLithostratigraphy.Id = lithostratigraphy.Id;
            var response = await controller.EditAsync(changedLithostratigraphy);
            Assert.IsInstanceOfType(response, typeof(OkObjectResult));

            var updatedContext = ContextFactory.CreateContext();
            lithostratigraphy = updatedContext.LithostratigraphyLayers.SingleOrDefault(x => x.Id == lithostratigraphy.Id);
            Assert.IsNotNull(lithostratigraphy);
            Assert.AreEqual(15_300_623, lithostratigraphy.LithostratigraphyId);
        }
        finally
        {
            if (lithostratigraphy != null)
            {
                var lithoToDelete = context.LithostratigraphyLayers.SingleOrDefault(x => x.Id == lithostratigraphy.Id);
                if (lithoToDelete != null)
                {
                    context.Remove(lithoToDelete);
                    await context.SaveChangesAsync();
                }
            }
        }
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9815784;
        var lithostratigraphy = new LithostratigraphyLayer
        {
            Id = id,
        };

        var response = await controller.EditAsync(lithostratigraphy);
        var notFoundResult = response as NotFoundResult;
        Assert.AreEqual(404, notFoundResult.StatusCode);
    }

    [TestMethod]
    public async Task EditWithoutContentReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        var badRequestResult = response as BadRequestObjectResult;
        Assert.AreEqual(400, badRequestResult.StatusCode);
    }

    [TestMethod]
    public async Task GetEntriesByProfileIdLayerSorting()
    {
        var stratigraphyId = 6_000_009;
        var createdLayerIds = new List<int>();

        try
        {
            // create layers out of order
            await CreateLayer(createdLayerIds, new LithostratigraphyLayer { StratigraphyId = stratigraphyId, FromDepth = 130, ToDepth = 140 });
            await CreateLayer(createdLayerIds, new LithostratigraphyLayer { StratigraphyId = stratigraphyId, FromDepth = 100, ToDepth = 110 });
            await CreateLayer(createdLayerIds, new LithostratigraphyLayer { StratigraphyId = stratigraphyId, FromDepth = 120, ToDepth = 130 });

            var layers = await controller.GetAsync(stratigraphyId).ConfigureAwait(false);
            Assert.IsNotNull(layers);
            Assert.AreEqual(13, layers.Count());
            for (int i = 1; i < layers.Count(); i++)
            {
                Assert.IsTrue(layers.ElementAt(i - 1).FromDepth <= layers.ElementAt(i).FromDepth, "Expected layers to be sorted by FromDepth but after {0} followed {1}", layers.ElementAt(i - 1).FromDepth, layers.ElementAt(i).FromDepth);
            }
        }
        finally
        {
            foreach (var layerId in createdLayerIds)
            {
                await controller.DeleteAsync(layerId).ConfigureAwait(false);
            }
        }
    }

    private async Task CreateLayer(List<int> layerIds, LithostratigraphyLayer layer)
    {
        var response = await controller.CreateAsync(layer);
        if (response is OkObjectResult result && result.Value is IIdentifyable responseLayer)
        {
            layerIds.Add(responseLayer.Id);
        }
    }
}
