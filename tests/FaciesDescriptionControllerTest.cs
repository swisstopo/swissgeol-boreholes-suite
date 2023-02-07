using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class FaciesDescriptionControllerTest
{
    private BdmsContext context;
    private FaciesDescriptionController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new FaciesDescriptionController(ContextFactory.CreateContext(), new Mock<ILogger<FaciesDescription>>().Object) { ControllerContext = GetControllerContextAdmin() };
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
        IEnumerable<FaciesDescription>? faciesDescriptions = response;
        Assert.IsNotNull(faciesDescriptions);
        Assert.AreEqual(100_000, faciesDescriptions.Count());
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyIdForInexistentId()
    {
        var response = await controller.GetAsync(94578122).ConfigureAwait(false);
        IEnumerable<FaciesDescription>? faciesDescriptions = response;
        Assert.IsNotNull(faciesDescriptions);
        Assert.AreEqual(0, faciesDescriptions.Count());
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyId()
    {
        var response = await controller.GetAsync(6_000_095).ConfigureAwait(false);
        IEnumerable<FaciesDescription>? faciesDescriptions = response;
        Assert.IsNotNull(faciesDescriptions);
        Assert.AreEqual(10, faciesDescriptions.Count());
    }

    [TestMethod]
    public async Task GetFaciesDescriptionByInexistentId()
    {
        var response = await controller.GetByIdAsync(9263667).ConfigureAwait(false);
        Assert.IsInstanceOfType(response.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task GetFaciesDescriptionById()
    {
        var response = await controller.GetByIdAsync(10_000_014).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var faciesDescription = okResult.Value as FaciesDescription;
        Assert.AreEqual(10_000_014, faciesDescription.Id);
        Assert.AreEqual(40, faciesDescription.FromDepth);
        Assert.AreEqual(50, faciesDescription.ToDepth);
        Assert.AreEqual("radical Technician Personal Loan Account", faciesDescription.Description);
        Assert.AreEqual(9002, faciesDescription.QtDescriptionId);
        Assert.AreEqual(6_000_001, faciesDescription.StratigraphyId);
    }

    [TestMethod]
    public async Task EditFaciesDescriptionWithCompleteFaciesDescription()
    {
        var id = 10_000_039;
        var originalFaciesDescription = new FaciesDescription
        {
            CreatedBy = null,
            CreatedById = 4,
            Created = new DateTime(2021, 12, 23, 8, 57, 51).ToUniversalTime(),
            Description = "bandwidth impactful connecting",
            FromDepth = 90,
            ToDepth = 100,
            Id = 10_000_039,
            IsLast = true,
            QtDescription = null,
            QtDescriptionId = 9003,
            Updated = new DateTime(2021, 11, 14, 8, 3, 19).ToUniversalTime(),
            UpdatedBy = null,
            UpdatedById = 2,
            StratigraphyId = 6_000_003,
        };

        var newFaciesDescription = new FaciesDescription
        {
            Id = id,
            CreatedById = 3,
            UpdatedById = 3,
            Created = new DateTime(2021, 3, 31, 16, 55, 02).ToUniversalTime(),
            StratigraphyId = 6_000_010,
            Description = "solid state web-enabled Maryland",
            QtDescriptionId = 9001,
        };

        var faciesDescriptionToEdit = context.FaciesDescriptions.Single(c => c.Id == id);
        Assert.AreEqual(4, faciesDescriptionToEdit.CreatedById);
        Assert.AreEqual(2, faciesDescriptionToEdit.UpdatedById);
        Assert.AreEqual(6_000_003, faciesDescriptionToEdit.StratigraphyId);
        Assert.AreEqual("bandwidth impactful connecting", faciesDescriptionToEdit.Description);

        try
        {
            // Update FaciesDescription
            var response = await controller.EditAsync(newFaciesDescription);
            var okResult = response as OkObjectResult;
            Assert.AreEqual(200, okResult.StatusCode);

            // Assert Updates and unchanged values
            var updatedContext = ContextFactory.CreateContext();
            var updatedFaciesDescription = updatedContext.FaciesDescriptions.Single(c => c.Id == id);

            Assert.AreEqual(3, updatedFaciesDescription.CreatedById);
            Assert.AreEqual(1, updatedFaciesDescription.UpdatedById);
            Assert.AreEqual(6_000_010, updatedFaciesDescription.StratigraphyId);
            Assert.AreEqual("solid state web-enabled Maryland", updatedFaciesDescription.Description);
            Assert.AreEqual(9001, updatedFaciesDescription.QtDescriptionId);
        }
        finally
        {
            // Reset edits
            var cleanupContext = ContextFactory.CreateContext();
            cleanupContext.Update(originalFaciesDescription);
            await cleanupContext.SaveChangesAsync();
        }
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9815784;
        var faciesDescription = new FaciesDescription
        {
            Id = id,
        };

        // Upate FaciesDescription
        var response = await controller.EditAsync(faciesDescription);
        var notFoundResult = response as NotFoundResult;
        Assert.AreEqual(404, notFoundResult.StatusCode);
    }

    [TestMethod]
    public async Task EditWithoutFaciesDescriptionReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        var badRequestResult = response as BadRequestObjectResult;
        Assert.AreEqual(400, badRequestResult.StatusCode);
    }

    [TestMethod]
    public async Task CreateAndDeleteAsync()
    {
        var faciesDescription = new FaciesDescription
        {
            CreatedById = 2,
            UpdatedById = 2,
            Created = new DateTime(2022, 10, 4, 13, 19, 34).ToUniversalTime(),
            StratigraphyId = 6_000_010,
            Description = "SILDOV",
            QtDescriptionId = 9003,
        };

        var response = await controller.CreateAsync(faciesDescription);
        Assert.IsInstanceOfType(response, typeof(OkObjectResult));
        faciesDescription = await context.FaciesDescriptions.FindAsync(faciesDescription.Id);
        Assert.IsNotNull(faciesDescription);
        Assert.AreEqual("SILDOV", faciesDescription.Description);

        response = await controller.DeleteAsync(faciesDescription.Id);
        Assert.IsInstanceOfType(response, typeof(OkResult));

        response = await controller.DeleteAsync(faciesDescription.Id);
        Assert.IsInstanceOfType(response, typeof(NotFoundResult));

        var getResponse = await controller.GetByIdAsync(faciesDescription.Id);
        Assert.IsInstanceOfType(getResponse.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task CreateAsyncWithExistingId()
    {
        var faciesDescription = new FaciesDescription
        {
            Id = 10_000_010,
            Description = "TAMENL",
        };

        var getResponse = await controller.GetByIdAsync(faciesDescription.Id);
        Assert.IsInstanceOfType(getResponse.Result, typeof(OkObjectResult));

        var response = await controller.CreateAsync(faciesDescription);
        var result = response as ObjectResult;
        Assert.IsInstanceOfType(result.Value, typeof(ProblemDetails));
        Assert.AreEqual(500, result.StatusCode);
    }
}
