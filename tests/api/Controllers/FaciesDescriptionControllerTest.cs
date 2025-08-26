using BDMS.Authentication;
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
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new FaciesDescriptionController(context, new Mock<ILogger<FaciesDescriptionController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
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
        var notFoundResponse = await controller.GetAsync(651335213).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(notFoundResponse.Result);
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyId()
    {
        var response = await controller.GetAsync(6_000_095).ConfigureAwait(false);
        IEnumerable<FaciesDescription>? faciesDescriptions = response.Value;
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
        Assert.AreEqual("Hawaii radical Technician", faciesDescription.Description);
        Assert.AreEqual(6_000_001, faciesDescription.StratigraphyId);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var faciesDescriptionId = context.FaciesDescriptions.First().Id;
        var response = await controller.GetByIdAsync(faciesDescriptionId).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task EditFaciesDescriptionWithCompleteFaciesDescription()
    {
        var id = 10_000_039;

        var newFaciesDescription = new FaciesDescription
        {
            Id = id,
            CreatedById = 3,
            UpdatedById = 3,
            Created = new DateTime(2021, 3, 31, 16, 55, 02).ToUniversalTime(),
            StratigraphyId = 6_000_010,
            Description = "solid state web-enabled Maryland",
        };

        var faciesDescriptionToEdit = context.FaciesDescriptions.Single(c => c.Id == id);
        Assert.AreEqual(1, faciesDescriptionToEdit.CreatedById);
        Assert.AreEqual(4, faciesDescriptionToEdit.UpdatedById);
        Assert.AreEqual(6_000_003, faciesDescriptionToEdit.StratigraphyId);
        Assert.AreEqual("Home Loan Account bandwidth impactful", faciesDescriptionToEdit.Description);

        // Update FaciesDescription
        var response = await controller.EditAsync(newFaciesDescription);
        ActionResultAssert.IsOk(response.Result);

        // Assert Updates and unchanged values
        var updatedFaciesDescription = context.FaciesDescriptions.Single(c => c.Id == id);

        Assert.AreEqual(3, updatedFaciesDescription.CreatedById);
        Assert.AreEqual(1, updatedFaciesDescription.UpdatedById);
        Assert.AreEqual(6_000_010, updatedFaciesDescription.StratigraphyId);
        Assert.AreEqual("solid state web-enabled Maryland", updatedFaciesDescription.Description);
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
