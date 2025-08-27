using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class LithologyControllerTest
{
    private BdmsContext context;
    private LithologyController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new LithologyController(context, new Mock<ILogger<LithologyController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAsyncReturnsUnauthorizedWithInsufficientRights()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_unauthorized", PolicyNames.Viewer);

        var unauthorizedResponse = await controller.GetAsync(context.StratigraphiesV2.First().Id).ConfigureAwait(false);
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
        // Find a stratigraphy with lithologies
        var stratigraphyId = context.Lithologies.First().StratigraphyId;

        var response = await controller.GetAsync(stratigraphyId).ConfigureAwait(false);
        IEnumerable<Lithology>? lithologies = response.Value;
        Assert.IsNotNull(lithologies);
        Assert.IsTrue(lithologies.Any(), "Expected at least one lithology in the response");
    }

    [TestMethod]
    public async Task GetLithologyByInexistentId()
    {
        var response = await controller.GetByIdAsync(9263667).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task GetLithologyById()
    {
        // Get an existing lithology from the database
        var existingLithology = context.Lithologies.First();

        var response = await controller.GetByIdAsync(existingLithology.Id).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var lithology = okResult.Value as Lithology;

        Assert.AreEqual(existingLithology.Id, lithology.Id);
        Assert.AreEqual(existingLithology.StratigraphyId, lithology.StratigraphyId);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var lithologyId = context.Lithologies.First().Id;

        var response = await controller.GetByIdAsync(lithologyId).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task EditLithologyWithCompleteLithology()
    {
        var existingLithology = context.Lithologies.First();
        var id = existingLithology.Id;

        var originalValues = new
        {
            existingLithology.CreatedById,
            existingLithology.UpdatedById,
            existingLithology.StratigraphyId,
            existingLithology.FromDepth,
            existingLithology.ToDepth,
            existingLithology.IsUnconsolidated,
        };

        var newLithology = new Lithology
        {
            Id = id,
            CreatedById = 3,
            UpdatedById = 3,
            Created = DateTime.UtcNow,
            StratigraphyId = existingLithology.StratigraphyId,
            FromDepth = existingLithology.FromDepth + 5,
            ToDepth = existingLithology.ToDepth + 5,
            IsUnconsolidated = !existingLithology.IsUnconsolidated,
            Notes = "Updated in test",
        };

        var lithologyToEdit = context.Lithologies.Single(c => c.Id == id);
        Assert.AreEqual(originalValues.CreatedById, lithologyToEdit.CreatedById);
        Assert.AreEqual(originalValues.UpdatedById, lithologyToEdit.UpdatedById);
        Assert.AreEqual(originalValues.StratigraphyId, lithologyToEdit.StratigraphyId);
        Assert.AreEqual(originalValues.FromDepth, lithologyToEdit.FromDepth);
        Assert.AreEqual(originalValues.ToDepth, lithologyToEdit.ToDepth);
        Assert.AreEqual(originalValues.IsUnconsolidated, lithologyToEdit.IsUnconsolidated);

        // Update Lithology
        var response = await controller.EditAsync(newLithology);
        ActionResultAssert.IsOk(response.Result);

        // Assert Updates and unchanged values
        var updatedLithology = context.Lithologies.Single(c => c.Id == id);

        Assert.AreEqual(3, updatedLithology.CreatedById);
        Assert.AreEqual(1, updatedLithology.UpdatedById);
        Assert.AreEqual(originalValues.StratigraphyId, updatedLithology.StratigraphyId);
        Assert.AreEqual(newLithology.FromDepth, updatedLithology.FromDepth);
        Assert.AreEqual(newLithology.ToDepth, updatedLithology.ToDepth);
        Assert.AreEqual(newLithology.IsUnconsolidated, updatedLithology.IsUnconsolidated);
        Assert.AreEqual("Updated in test", updatedLithology.Notes);
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9815784;
        var lithology = new Lithology
        {
            Id = id,
            StratigraphyId = 6000001,
            FromDepth = 10,
            ToDepth = 20,
        };

        // Update Lithology
        var response = await controller.EditAsync(lithology);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutLithologyReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task CreateAndDeleteAsync()
    {
        // Get a valid stratigraphy ID
        var stratigraphyId = context.StratigraphiesV2.First().Id;

        var lithology = new Lithology
        {
            CreatedById = 2,
            UpdatedById = 2,
            Created = new DateTime(2022, 10, 4, 13, 19, 34, DateTimeKind.Utc),
            StratigraphyId = stratigraphyId,
            FromDepth = 25.5,
            ToDepth = 30.0,
            IsUnconsolidated = true,
            HasBedding = false,
            Notes = "Test lithology",
        };

        var response = await controller.CreateAsync(lithology);
        ActionResultAssert.IsOk(response.Result);
        lithology = await context.Lithologies.FindAsync(lithology.Id);
        Assert.IsNotNull(lithology);
        Assert.AreEqual(25.5, lithology.FromDepth);
        Assert.AreEqual(30.0, lithology.ToDepth);
        Assert.AreEqual("Test lithology", lithology.Notes);

        var deleteResponse = await controller.DeleteAsync(lithology.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(lithology.Id);
        ActionResultAssert.IsNotFound(deleteResponse);

        var getResponse = await controller.GetByIdAsync(lithology.Id);
        ActionResultAssert.IsNotFound(getResponse.Result);
    }

    [TestMethod]
    public async Task DeleteAsyncWithandWithoutPermissions()
    {
        // Create a lithology to delete
        var stratigraphyId = context.StratigraphiesV2.First().Id;
        var lithology = new Lithology
        {
            StratigraphyId = stratigraphyId,
            FromDepth = 45.0,
            ToDepth = 50.0,
            IsUnconsolidated = true,
            HasBedding = false,
            Notes = "Lithology for delete test",
        };

        var createResponse = await controller.CreateAsync(lithology);
        ActionResultAssert.IsOk(createResponse.Result);

        // Set up permission service to deny access
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        // Attempt to delete the lithology
        var deleteResponse = await controller.DeleteAsync(lithology.Id);

        Assert.IsInstanceOfType(deleteResponse, typeof(ObjectResult));
        ObjectResult objectResult = (ObjectResult)deleteResponse;
        ProblemDetails problemDetails = (ProblemDetails)objectResult.Value!;
        Assert.AreEqual("The borehole is locked by another user or you are missing permissions.", problemDetails.Detail);

        // Verify the lithology still exists
        var getResponse = await controller.GetByIdAsync(lithology.Id);
        ActionResultAssert.IsOk(getResponse.Result);

        // Reset permissions to delete
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(true);

        await controller.DeleteAsync(lithology.Id);

        // Verify the lithology no longer exists
        var notFoundResponse = await controller.GetByIdAsync(lithology.Id);
        ActionResultAssert.IsNotFound(notFoundResponse.Result);
    }

    [TestMethod]
    public async Task CreateAsyncWithExistingId()
    {
        var existingLithology = context.Lithologies.First();
        var lithology = new Lithology
        {
            Id = existingLithology.Id,
            StratigraphyId = existingLithology.StratigraphyId,
            FromDepth = 40,
            ToDepth = 50,
        };

        var getResponse = await controller.GetByIdAsync(lithology.Id);
        ActionResultAssert.IsOk(getResponse.Result);

        var response = await controller.CreateAsync(lithology);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyIdLayerSorting()
    {
        // Find a stratigraphy to use
        var stratigraphyId = context.StratigraphiesV2.First().Id;
        var createdLayerIds = new List<int>();

        // Create layers out of order
        await CreateLayer(createdLayerIds, new Lithology { StratigraphyId = stratigraphyId, FromDepth = 130, ToDepth = 140 });
        await CreateLayer(createdLayerIds, new Lithology { StratigraphyId = stratigraphyId, FromDepth = 100, ToDepth = 110 });
        await CreateLayer(createdLayerIds, new Lithology { StratigraphyId = stratigraphyId, FromDepth = 120, ToDepth = 130 });

        var response = await controller.GetAsync(stratigraphyId).ConfigureAwait(false);
        var layers = response.Value;
        Assert.IsNotNull(layers);

        // Verify sorting
        for (int i = 1; i < layers.Count(); i++)
        {
            Assert.IsTrue(
                layers.ElementAt(i - 1).FromDepth <= layers.ElementAt(i).FromDepth,
                "Expected layers to be sorted by FromDepth but after {0} followed {1}",
                layers.ElementAt(i - 1).FromDepth,
                layers.ElementAt(i).FromDepth);
        }
    }

    [TestMethod]
    public async Task CreateLithologyWithInvalidValuesReturnsBadRequest()
    {
        // Test with bedding=true but no share value
        var lithology = new Lithology
        {
            StratigraphyId = context.StratigraphiesV2.First().Id,
            FromDepth = 10,
            ToDepth = 20,
            HasBedding = true,  // This requires Share to be set
            Share = null, // This will cause the validation to fail
        };

        var response = await controller.CreateAsync(lithology);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    private async Task CreateLayer(List<int> layerIds, Lithology layer)
    {
        var response = await controller.CreateAsync(layer);
        if (response.Result is OkObjectResult && response.Value is IIdentifyable responseLayer)
        {
            layerIds.Add(responseLayer.Id);
        }
    }
}
