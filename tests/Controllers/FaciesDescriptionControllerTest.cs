using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class FaciesDescriptionControllerTest
{
    private BdmsContext context;
    private FaciesDescriptionController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(false);
        controller = new FaciesDescriptionController(context, new Mock<ILogger<FaciesDescriptionController>>().Object, boreholeLockServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAllEntriesAsync()
    {
        var response = await controller.GetAsync().ConfigureAwait(false);
        IEnumerable<FaciesDescription>? faciesDescriptions = response;
        Assert.IsNotNull(faciesDescriptions);
        Assert.AreEqual(30_000, faciesDescriptions.Count());
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
        ActionResultAssert.IsNotFound(response.Result);
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
        Assert.AreEqual(9003, faciesDescription.DescriptionQualityId);
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
            DescriptionQuality = null,
            DescriptionQualityId = 9003,
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
            DescriptionQualityId = 9001,
        };

        var faciesDescriptionToEdit = context.FaciesDescriptions.Single(c => c.Id == id);
        Assert.AreEqual(4, faciesDescriptionToEdit.CreatedById);
        Assert.AreEqual(2, faciesDescriptionToEdit.UpdatedById);
        Assert.AreEqual(6_000_003, faciesDescriptionToEdit.StratigraphyId);
        Assert.AreEqual("bandwidth impactful connecting", faciesDescriptionToEdit.Description);

        // Update FaciesDescription
        var response = await controller.EditAsync(newFaciesDescription);
        ActionResultAssert.IsOk(response.Result);

        // Assert Updates and unchanged values
        var updatedFaciesDescription = context.FaciesDescriptions.Single(c => c.Id == id);

        Assert.AreEqual(3, updatedFaciesDescription.CreatedById);
        Assert.AreEqual(1, updatedFaciesDescription.UpdatedById);
        Assert.AreEqual(6_000_010, updatedFaciesDescription.StratigraphyId);
        Assert.AreEqual("solid state web-enabled Maryland", updatedFaciesDescription.Description);
        Assert.AreEqual(9001, updatedFaciesDescription.DescriptionQualityId);
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9815784;
        var faciesDescription = new FaciesDescription
        {
            Id = id,
            StratigraphyId = 6000001,
        };

        // Upate FaciesDescription
        var response = await controller.EditAsync(faciesDescription);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutFaciesDescriptionReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
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
            DescriptionQualityId = 9003,
        };

        var response = await controller.CreateAsync(faciesDescription);
        ActionResultAssert.IsOk(response.Result);
        faciesDescription = await context.FaciesDescriptions.FindAsync(faciesDescription.Id);
        Assert.IsNotNull(faciesDescription);
        Assert.AreEqual("SILDOV", faciesDescription.Description);

        var deleteResponse = await controller.DeleteAsync(faciesDescription.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(faciesDescription.Id);
        ActionResultAssert.IsNotFound(deleteResponse);

        var getResponse = await controller.GetByIdAsync(faciesDescription.Id);
        ActionResultAssert.IsNotFound(getResponse.Result);
    }

    [TestMethod]
    public async Task CreateAsyncWithExistingId()
    {
        var faciesDescription = new FaciesDescription
        {
            Id = 10_000_010,
            Description = "TAMENL",
            StratigraphyId = 6000001,
        };

        var getResponse = await controller.GetByIdAsync(faciesDescription.Id);
        ActionResultAssert.IsOk(getResponse.Result);

        var response = await controller.CreateAsync(faciesDescription);
        ActionResultAssert.IsInternalServerError(response.Result);
    }
}
