using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class ChronostratigraphyControllerTest
{
    private BdmsContext context;
    private ChronostratigraphyController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new ChronostratigraphyController(ContextFactory.CreateContext(), new Mock<ILogger<ChronostratigraphyLayer>>().Object) { ControllerContext = GetControllerContextAdmin() };
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
        IEnumerable<ChronostratigraphyLayer>? chronostratigraphies = response;
        Assert.IsNotNull(chronostratigraphies);
        Assert.AreEqual(100_000, chronostratigraphies.Count());
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyIdForInexistentId()
    {
        var response = await controller.GetAsync(94578122).ConfigureAwait(false);
        IEnumerable<ChronostratigraphyLayer>? chronostratigraphies = response;
        Assert.IsNotNull(chronostratigraphies);
        Assert.AreEqual(0, chronostratigraphies.Count());
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyId()
    {
        var response = await controller.GetAsync(6_000_095).ConfigureAwait(false);
        IEnumerable<ChronostratigraphyLayer>? chronostratigraphies = response;
        Assert.IsNotNull(chronostratigraphies);
        Assert.AreEqual(10, chronostratigraphies.Count());
    }

    [TestMethod]
    public async Task GetChronostratigraphyByInexistentId()
    {
        var response = await controller.GetByIdAsync(9263667).ConfigureAwait(false);
        Assert.IsInstanceOfType(response.Result, typeof(NotFoundResult));
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
        Assert.AreEqual(15_001_086, chronostratigraphy.ChronostratigraphyId);
        Assert.AreEqual(6_000_001, chronostratigraphy.StratigraphyId);
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
            IsLast = true,
            Chronostratigraphy = null,
            ChronostratigraphyId = 15_001_098,
            Updated = new DateTime(2021, 6, 27, 4, 22,  39).ToUniversalTime(),
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

        var chronostratigraphyToEdit = context.Chronostratigraphies.Single(c => c.Id == id);
        Assert.AreEqual(2, chronostratigraphyToEdit.CreatedById);
        Assert.AreEqual(5, chronostratigraphyToEdit.UpdatedById);
        Assert.AreEqual(6_000_003, chronostratigraphyToEdit.StratigraphyId);
        Assert.AreEqual(15_001_098, chronostratigraphyToEdit.ChronostratigraphyId);

        try
        {
            // Update Chronostratigraphy
            var response = await controller.EditAsync(newChronostratigraphy);
            var okResult = response as OkObjectResult;
            Assert.AreEqual(200, okResult.StatusCode);

            // Assert Updates and unchanged values
            var updatedContext = ContextFactory.CreateContext();
            var updatedChronostratigraphy = updatedContext.Chronostratigraphies.Single(c => c.Id == id);

            Assert.AreEqual(3, updatedChronostratigraphy.CreatedById);
            Assert.AreEqual(1, updatedChronostratigraphy.UpdatedById);
            Assert.AreEqual(6_000_010, updatedChronostratigraphy.StratigraphyId);
            Assert.AreEqual(15_001_057, updatedChronostratigraphy.ChronostratigraphyId);
        }
        finally
        {
            // Reset edits
            var cleanupContext = ContextFactory.CreateContext();
            cleanupContext.Update(originalChronostratigraphy);
            await cleanupContext.SaveChangesAsync();
        }
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9815784;
        var chronostratigraphy = new ChronostratigraphyLayer
        {
            Id = id,
        };

        // Upate FaciesDescription
        var response = await controller.EditAsync(chronostratigraphy);
        var notFoundResult = response as NotFoundResult;
        Assert.AreEqual(404, notFoundResult.StatusCode);
    }

    [TestMethod]
    public async Task EditWithoutChronostratigraphyReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        var badRequestResult = response as BadRequestObjectResult;
        Assert.AreEqual(400, badRequestResult.StatusCode);
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
        Assert.IsInstanceOfType(response, typeof(OkObjectResult));
        chronostratigraphy = await context.Chronostratigraphies.FindAsync(chronostratigraphy.Id);
        Assert.IsNotNull(chronostratigraphy);
        Assert.AreEqual(15001036, chronostratigraphy.ChronostratigraphyId);

        response = await controller.DeleteAsync(chronostratigraphy.Id);
        Assert.IsInstanceOfType(response, typeof(OkResult));

        response = await controller.DeleteAsync(chronostratigraphy.Id);
        Assert.IsInstanceOfType(response, typeof(NotFoundResult));

        var getResponse = await controller.GetByIdAsync(chronostratigraphy.Id);
        Assert.IsInstanceOfType(getResponse.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task CreateAsyncWithExistingId()
    {
        var chronostratigraphy = new ChronostratigraphyLayer
        {
            Id = 11_000_010,
            ChronostratigraphyId = 15001045,
        };

        var getResponse = await controller.GetByIdAsync(chronostratigraphy.Id);
        Assert.IsInstanceOfType(getResponse.Result, typeof(OkObjectResult));

        var response = await controller.CreateAsync(chronostratigraphy);
        var result = response as ObjectResult;
        Assert.IsInstanceOfType(result.Value, typeof(ProblemDetails));
        Assert.AreEqual(500, result.StatusCode);
    }
}
