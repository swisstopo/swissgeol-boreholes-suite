using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class LithologicalDescriptionControllerTest
{
    private BdmsContext context;
    private LithologicalDescriptionController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new LithologicalDescriptionController(context, new Mock<ILogger<LithologicalDescriptionController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetEntriesByStratigraphyIdForInexistentId()
    {
        var response = await controller.GetAsync(94578122).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task GetAsyncReturnsUnauthorizedWithInsufficientRights()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_unauthorized", PolicyNames.Viewer);

        var unauthorizedResponse = await controller.GetAsync(context.Stratigraphies.First().Id).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(unauthorizedResponse.Result);
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyId()
    {
        var response = await controller.GetAsync(6_000_095).ConfigureAwait(false);
        IEnumerable<LithologicalDescription>? lithologicalDescriptions = response.Value;
        Assert.IsNotNull(lithologicalDescriptions);
        Assert.AreEqual(10, lithologicalDescriptions.Count());
    }

    [TestMethod]
    public async Task GetLithologicalDescriptionByInexistentId()
    {
        var response = await controller.GetByIdAsync(9483157).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task GetLithologicalDescriptionById()
    {
        var response = await controller.GetByIdAsync(9_000_015).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var lithologicalDescription = okResult.Value as LithologicalDescription;
        Assert.AreEqual(9_000_015, lithologicalDescription.Id);
        Assert.AreEqual(50, lithologicalDescription.FromDepth);
        Assert.AreEqual(60, lithologicalDescription.ToDepth);
        Assert.AreEqual("Sleek Metrics Mountains", lithologicalDescription.Description);
        Assert.AreEqual(6_000_001, lithologicalDescription.StratigraphyId);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var lithologicalDescriptionId = context.LithologicalDescriptions.First().Id;
        var response = await controller.GetByIdAsync(lithologicalDescriptionId).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task EditLithologicalDescriptionWithCompleteLithologicalDescription()
    {
        var id = 9_000_069;
        var originalLithologicalDescription = new LithologicalDescription
        {
            CreatedBy = null,
            CreatedById = 1,
            Created = new DateTime(2021, 11, 30, 12, 10, 33).ToUniversalTime(),
            Description = "Libyan Dinar 1080p leading edge",
            FromDepth = 90,
            ToDepth = 100,
            Id = 9_000_069,
            Updated = new DateTime(2021, 3, 31, 16, 55, 02).ToUniversalTime(),
            UpdatedBy = null,
            UpdatedById = 5,
            StratigraphyId = 6_000_006,
        };

        var newLithologicalDescription = new LithologicalDescription
        {
            Id = id,
            CreatedById = 4,
            UpdatedById = 4,
            Created = new DateTime(2021, 2, 14, 8, 55, 34).ToUniversalTime(),
            StratigraphyId = 6_000_010,
            Description = "Freddy ate more cucumber than Maria.",
        };

        var lithologicalDescriptionToEdit = context.LithologicalDescriptions.Single(c => c.Id == id);
        Assert.AreEqual(1, lithologicalDescriptionToEdit.CreatedById);
        Assert.AreEqual(1, lithologicalDescriptionToEdit.UpdatedById);
        Assert.AreEqual(6_000_006, lithologicalDescriptionToEdit.StratigraphyId);
        Assert.AreEqual("frame Libyan Dinar 1080p", lithologicalDescriptionToEdit.Description);

        // Update LithologicalDescription
        var response = await controller.EditAsync(newLithologicalDescription);
        ActionResultAssert.IsOk(response.Result);

        // Assert Updates and unchanged values
        var updatedLithologicalDescription = context.LithologicalDescriptions.Single(c => c.Id == id);

        Assert.AreEqual(4, updatedLithologicalDescription.CreatedById);
        Assert.AreEqual(1, updatedLithologicalDescription.UpdatedById);
        Assert.AreEqual(6_000_010, updatedLithologicalDescription.StratigraphyId);
        Assert.AreEqual("Freddy ate more cucumber than Maria.", updatedLithologicalDescription.Description);
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9487794;
        var lithologicalDescription = new LithologicalDescription
        {
            Id = id,
            StratigraphyId = 6000001,
        };

        // Upate LithologicalDescription
        var response = await controller.EditAsync(lithologicalDescription);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutLithologicalDescriptionReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task CreateAndDeleteAsync()
    {
        var lithologicalDescription = new LithologicalDescription
        {
            CreatedById = 1,
            UpdatedById = 1,
            Created = new DateTime(2022, 11, 3, 14, 20, 09).ToUniversalTime(),
            StratigraphyId = 6_000_010,
            Description = "SPOLYP",
        };

        var response = await controller.CreateAsync(lithologicalDescription);
        ActionResultAssert.IsOk(response.Result);
        lithologicalDescription = await context.LithologicalDescriptions.FindAsync(lithologicalDescription.Id);
        Assert.IsNotNull(lithologicalDescription);
        Assert.AreEqual("SPOLYP", lithologicalDescription.Description);

        var deleteResponse = await controller.DeleteAsync(lithologicalDescription.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(lithologicalDescription.Id);
        ActionResultAssert.IsNotFound(deleteResponse);

        var getResponse = await controller.GetByIdAsync(lithologicalDescription.Id);
        ActionResultAssert.IsNotFound(getResponse.Result);
    }

    [TestMethod]
    public async Task CreateAsyncWithExistingId()
    {
        var lithologicalDescription = new LithologicalDescription
        {
            Id = 9_000_010,
            Description = "RANHEN",
            StratigraphyId = 6000001,
        };

        var getResponse = await controller.GetByIdAsync(lithologicalDescription.Id);
        ActionResultAssert.IsOk(getResponse.Result);

        var response = await controller.CreateAsync(lithologicalDescription);
        ActionResultAssert.IsInternalServerError(response.Result);
    }

    [TestMethod]
    public async Task BulkCreateAsyncCreatesMultipleLithologicalDescriptions()
    {
        var stratigraphyId = context.Stratigraphies.First().Id;
        var lithologicalDescriptions = new List<LithologicalDescription>
        {
            new LithologicalDescription
            {
                CreatedById = 1,
                UpdatedById = 1,
                StratigraphyId = stratigraphyId,
                FromDepth = 10,
                ToDepth = 20,
                Description = "Bulk created description 1",
            },
            new LithologicalDescription
            {
                CreatedById = 1,
                UpdatedById = 1,
                StratigraphyId = stratigraphyId,
                FromDepth = 20,
                ToDepth = 30,
                Description = "Bulk created description 2",
            },
            new LithologicalDescription
            {
                CreatedById = 1,
                UpdatedById = 1,
                StratigraphyId = stratigraphyId,
                FromDepth = 30,
                ToDepth = 40,
                Description = "Bulk created description 3",
            },
        };

        var response = await controller.BulkCreateAsync(lithologicalDescriptions);

        ActionResultAssert.IsOk(response.Result);
        var okResult = response.Result as OkObjectResult;
        var createdDescriptions = okResult.Value as IEnumerable<LithologicalDescription>;
        Assert.IsNotNull(createdDescriptions);
        Assert.AreEqual(3, createdDescriptions.Count());

        var getResponse = await controller.GetAsync(stratigraphyId);
        var retrievedDescriptions = getResponse.Value.Where(d =>
            d.Description == "Bulk created description 1" ||
            d.Description == "Bulk created description 2" ||
            d.Description == "Bulk created description 3");

        Assert.AreEqual(3, retrievedDescriptions.Count());

        // Delete the created descriptions
        foreach (var description in retrievedDescriptions)
        {
            await controller.DeleteAsync(description.Id);
        }
    }

    [TestMethod]
    public async Task BulkCreateAsyncWithEmptyListReturnsBadRequest()
    {
        var response = await controller.BulkCreateAsync(new List<LithologicalDescription>());
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task BulkCreateAsyncWithDifferentStratigraphyIdsReturnsBadRequest()
    {
        var lithologicalDescriptions = new List<LithologicalDescription>
        {
            new LithologicalDescription
            {
                StratigraphyId = 6_000_001,
                FromDepth = 10,
                ToDepth = 20,
                Description = "Different stratigraphy 1",
            },
            new LithologicalDescription
            {
                StratigraphyId = 6_000_002,
                FromDepth = 20,
                ToDepth = 30,
                Description = "Different stratigraphy 2",
            }
        };

        var response = await controller.BulkCreateAsync(lithologicalDescriptions);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task BulkCreateAsyncWithNonExistentStratigraphyIdReturnsNotFound()
    {
        var lithologicalDescriptions = new List<LithologicalDescription>
        {
            new LithologicalDescription
            {
                StratigraphyId = 9999999,
                FromDepth = 10,
                ToDepth = 20,
                Description = "Non-existent stratigraphy",
            }
        };

        var response = await controller.BulkCreateAsync(lithologicalDescriptions);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task BulkCreateAsyncReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var stratigraphyId = context.Stratigraphies.First().Id;
        var lithologicalDescriptions = new List<LithologicalDescription>
        {
            new LithologicalDescription
            {
                StratigraphyId = stratigraphyId,
                FromDepth = 10,
                ToDepth = 20,
                Description = "No permission",
            },
        };

        var unauthorizedResponse = await controller.BulkCreateAsync(lithologicalDescriptions);
        ActionResultAssert.IsUnauthorized(unauthorizedResponse.Result);
    }
}
