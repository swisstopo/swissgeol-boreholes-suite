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
public class StratigraphyV2ControllerTest
{
    private const int StratigraphyId = 6_000_003;

    private BdmsContext context;
    private StratigraphyV2Controller controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new StratigraphyV2Controller(context, new Mock<ILogger<StratigraphyV2Controller>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        var result = await controller.GetAsync(81294572).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        var stratigraphies = ((OkObjectResult?)result.Result)?.Value as List<StratigraphyV2>;
        Assert.IsNotNull(stratigraphies);
        Assert.AreEqual(0, stratigraphies.Count);
    }

    [TestMethod]
    public async Task GetStratigraphyByBoreholeId()
    {
        var result = await controller.GetAsync(1000972).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        var stratigraphies = ((OkObjectResult?)result.Result)?.Value as List<StratigraphyV2>;
        Assert.IsNotNull(stratigraphies);
        Assert.AreEqual(2, stratigraphies.Count);

        Assert.AreEqual(1000972, stratigraphies[0].BoreholeId);
        Assert.AreEqual("Sarah Ziemann", stratigraphies[0].Name);
        Assert.AreEqual(3, stratigraphies[0].CreatedById);
        Assert.AreEqual(3, stratigraphies[0].UpdatedById);
        Assert.AreEqual(true, stratigraphies[0].IsPrimary);
    }

    [TestMethod]
    public async Task Copy()
    {
        var originalStratigraphy = GetStratigraphy(StratigraphyId);
        var result = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        var copiedStratigraphyId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedStratigraphyId);
        Assert.IsInstanceOfType(copiedStratigraphyId, typeof(int));
        var copiedStratigraphy = GetStratigraphy((int)copiedStratigraphyId);

        Assert.AreEqual("Guadalupe Schowalter (Clone)", copiedStratigraphy.Name);
        Assert.AreEqual("sub_controller", copiedStratigraphy.CreatedBy.SubjectId);
        Assert.AreEqual("sub_controller", copiedStratigraphy.UpdatedBy.SubjectId);
        Assert.AreEqual(false, copiedStratigraphy.IsPrimary);
        Assert.AreNotEqual(originalStratigraphy.Id, copiedStratigraphy.Id);
        Assert.AreEqual(originalStratigraphy.Date, copiedStratigraphy.Date);
        Assert.AreEqual(originalStratigraphy.Lithologies.Count, copiedStratigraphy.Lithologies.Count);
        Assert.AreNotEqual(originalStratigraphy.Lithologies.First().Id, copiedStratigraphy.Lithologies.First().Id);
        Assert.AreEqual(originalStratigraphy.Lithologies.First().IsUnconsolidated, copiedStratigraphy.Lithologies.First().IsUnconsolidated);
        Assert.AreEqual(originalStratigraphy.Lithologies.First().AlterationDegreeId, copiedStratigraphy.Lithologies.First().AlterationDegreeId);
        Assert.AreEqual(originalStratigraphy.Lithologies.First().LithologyDescriptions.Count, copiedStratigraphy.Lithologies.First().LithologyDescriptions.Count);
        Assert.AreNotEqual(originalStratigraphy.Lithologies.First().LithologyDescriptions.First().Id, copiedStratigraphy.Lithologies.First().LithologyDescriptions.First().Id);
        Assert.AreEqual(originalStratigraphy.Lithologies.First().LithologyDescriptions.First().ColorPrimaryId, copiedStratigraphy.Lithologies.First().LithologyDescriptions.First().ColorPrimaryId);
    }

    [TestMethod]
    public async Task CopyInvalidStratigraphyId()
    {
        var result = await controller.CopyAsync(0).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task CopyWithNonAdminUser()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);
        var result = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        // delete stratigraphy copy
        var copiedStratigraphyId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedStratigraphyId);
        Assert.IsInstanceOfType(copiedStratigraphyId, typeof(int));
    }

    [TestMethod]
    public async Task CopyForLockedBorehole()
    {
        SetupControllerWithAlwaysLockedBorehole();

        var existingStratigraphy = await context.StratigraphiesV2.FirstAsync();
        var copyResult = await controller.CopyAsync(existingStratigraphy.Id);
        ActionResultAssert.IsUnauthorized(copyResult.Result);
    }

    [TestMethod]
    public async Task Delete()
    {
        // Prepare stratigraphy to delete
        var copyResult = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        ActionResultAssert.IsOk(copyResult.Result);

        var stratigraphyToDeleteId = ((OkObjectResult?)copyResult.Result)?.Value;
        Assert.IsNotNull(stratigraphyToDeleteId);

        // Delete and assert
        var stratigraphyToDelete = GetStratigraphy((int)stratigraphyToDeleteId);
        await controller.DeleteAsync(stratigraphyToDelete.Id).ConfigureAwait(false);
        Assert.AreEqual(null, GetStratigraphy((int)stratigraphyToDeleteId));
    }

    [TestMethod]
    public async Task DeleteMainStratigraphyNotAllowedIfOthersExist()
    {
        // Precondition: Find a group of three stratigraphies with one main stratigraphy
        var stratigraphies = context.StratigraphiesV2;
        var stratigraphyTestCandidates = stratigraphies
            .GroupBy(x => x.BoreholeId)
            .Where(g => !g.Any(s => s.IsPrimary))
            .ToList();

        var primaryStratigraphy = new StratigraphyV2
        {
            Id = stratigraphies.Max(x => x.Id) + 1,
            BoreholeId = stratigraphyTestCandidates[0].Key,
            IsPrimary = true,
            Name = "KODACLUSTER",
        };

        await context.AddAsync(primaryStratigraphy);

        await context.SaveChangesAsync();

        Assert.AreEqual(true, stratigraphyTestCandidates.Any(), "Precondition: There is at least one group of stratigraphies with one main stratigraphy");

        var deleteResult = await controller.DeleteAsync(primaryStratigraphy.Id);
        ActionResultAssert.IsInternalServerError(deleteResult);
    }

    [TestMethod]
    public async Task DeleteForLockedBorehole()
    {
        SetupControllerWithAlwaysLockedBorehole();

        var existingStratigraphy = await context.StratigraphiesV2.FirstAsync();
        var deleteResult = await controller.DeleteAsync(existingStratigraphy.Id);
        ActionResultAssert.IsUnauthorized(deleteResult);
    }

    [TestMethod]
    public async Task Create()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var stratigraphyToAdd = new StratigraphyV2
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "KODACLUSTER",
        };

        var createResult = await controller.CreateAsync(stratigraphyToAdd);
        ActionResultAssert.IsOk(createResult.Result);

        var createdStratigraphy = (StratigraphyV2?)((OkObjectResult)createResult.Result!).Value;
        createdStratigraphy = GetStratigraphy(createdStratigraphy.Id);
        Assert.AreEqual(stratigraphyToAdd.BoreholeId, createdStratigraphy.BoreholeId);
        Assert.AreEqual(stratigraphyToAdd.Name, createdStratigraphy.Name);

        // Because the stratigraphy is the first one for the borehole, it is automatically the primary stratigraphy.
        Assert.AreEqual(true, createdStratigraphy.IsPrimary);
    }

    [TestMethod]
    public async Task CreateAdditionalStratigraphyForExistingBorehole()
    {
        var boreholeWithExistingStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => b.Stratigraphies.Any());

        var stratigraphyToAdd = new StratigraphyV2
        {
            BoreholeId = boreholeWithExistingStratigraphy.Id,
            Name = "STORMSTEED",
        };

        var createResult = await controller.CreateAsync(stratigraphyToAdd);
        ActionResultAssert.IsOk(createResult.Result);

        var createdStratigraphy = (StratigraphyV2?)((OkObjectResult)createResult.Result!).Value;
        createdStratigraphy = GetStratigraphy(createdStratigraphy.Id);
        Assert.AreEqual(stratigraphyToAdd.BoreholeId, createdStratigraphy.BoreholeId);
        Assert.AreEqual(stratigraphyToAdd.Name, createdStratigraphy.Name);

        // Because the stratigraphy is the second one for the borehole, it is not automatically the primary stratigraphy.
        Assert.AreEqual(false, createdStratigraphy.IsPrimary);
    }

    [TestMethod]
    public async Task CreateAdditionalStratigraphyWithIsPrimary()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var stratigraphy1 = new StratigraphyV2
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "WINDFOOT",
        };

        var createResult1 = await controller.CreateAsync(stratigraphy1);
        ActionResultAssert.IsOk(createResult1.Result);
        var firstStratigraphy = (StratigraphyV2?)((OkObjectResult)createResult1.Result!).Value;
        firstStratigraphy = GetStratigraphy(firstStratigraphy.Id);
        Assert.AreEqual(true, firstStratigraphy.IsPrimary);

        var stratigraphy2 = new StratigraphyV2
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "ECHOGOAT",
            IsPrimary = true,
        };

        var createResult2 = await controller.CreateAsync(stratigraphy2);
        ActionResultAssert.IsOk(createResult2.Result);
        var secondStratigraphy = (StratigraphyV2?)((OkObjectResult)createResult2.Result!).Value;
        secondStratigraphy = GetStratigraphy(secondStratigraphy.Id);
        Assert.AreEqual(true, secondStratigraphy.IsPrimary);

        firstStratigraphy = GetStratigraphy(firstStratigraphy.Id);
        Assert.AreEqual(false, firstStratigraphy.IsPrimary);
    }

    [TestMethod]
    public async Task CreateWithExistingName()
    {
        var baseStratigraphy = await context.StratigraphiesV2.FirstAsync();

        var stratigraphyToCreate = new StratigraphyV2
        {
            BoreholeId = baseStratigraphy.BoreholeId,
            Name = baseStratigraphy.Name,
        };

        var createResult = await controller.CreateAsync(stratigraphyToCreate);
        ActionResultAssert.IsInternalServerError(createResult.Result, "Name must be unique");
    }

    [TestMethod]
    public async Task CreateWithNullStratigraphy()
    {
        var createResult = await controller.CreateAsync(null);
        ActionResultAssert.IsBadRequest(createResult.Result);
    }

    [TestMethod]
    public async Task CreateWithInvalidStratigraphy()
    {
        var inexistentBoreholeId = int.MinValue;
        var invalidStratigraphy = new StratigraphyV2 { BoreholeId = inexistentBoreholeId };
        var createResult = await controller.CreateAsync(invalidStratigraphy);
        ActionResultAssert.IsInternalServerError(createResult.Result);
    }

    [TestMethod]
    public async Task CreateWithUserNotSet()
    {
        controller.ControllerContext.HttpContext.User = null;
        var createResult = await controller.CreateAsync(new());
        ActionResultAssert.IsInternalServerError(createResult.Result);
    }

    [TestMethod]
    public async Task CreateForLockedBorehole()
    {
        SetupControllerWithAlwaysLockedBorehole();

        var createResult = await controller.CreateAsync(new());
        ActionResultAssert.IsUnauthorized(createResult.Result);
    }

    [TestMethod]
    public async Task Edit()
    {
        var borehole = await context.Boreholes.OrderBy(x => x.CreatedById).LastAsync();
        var stratigraphyToEdit = await context.StratigraphiesV2.FirstAsync();
        stratigraphyToEdit.BoreholeId = borehole.Id;
        stratigraphyToEdit.IsPrimary = false;
        stratigraphyToEdit.Date = new DateTime(1999, 9, 9).ToUniversalTime();
        stratigraphyToEdit.Name = "ERRONEOUS";

        var editResult = await controller.EditAsync(stratigraphyToEdit);
        var editedStratigraphy = ActionResultAssert.IsOkObjectResult<StratigraphyV2>(editResult.Result);
        Assert.AreEqual(borehole.Id, editedStratigraphy.BoreholeId);
        Assert.AreEqual(false, editedStratigraphy.IsPrimary);
        Assert.AreEqual(new DateTime(1999, 9, 9).ToUniversalTime(), editedStratigraphy.Date);
        Assert.AreEqual("ERRONEOUS", editedStratigraphy.Name);
    }

    [TestMethod]
    public async Task EditSetMainStratigraphy()
    {
        // Precondition: Create two stratigraphies for the same borehole,
        // one of which is the main stratigraphy.
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var firstStratigraphy = new StratigraphyV2
        {
            IsPrimary = true,
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "FALLOUT-VII",
        };

        var secondStratigraphy = new StratigraphyV2
        {
            IsPrimary = false,
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "KARMACANDID",
        };

        firstStratigraphy = ActionResultAssert.IsOkObjectResult<StratigraphyV2>((await controller.CreateAsync(firstStratigraphy)).Result);
        secondStratigraphy = ActionResultAssert.IsOkObjectResult<StratigraphyV2>((await controller.CreateAsync(secondStratigraphy)).Result);

        // Setting the second stratigraphy as the main stratigraphy
        // should set the first stratigraphy as non-main.
        secondStratigraphy.IsPrimary = true;
        secondStratigraphy = ActionResultAssert.IsOkObjectResult<StratigraphyV2>((await controller.EditAsync(secondStratigraphy)).Result);
        Assert.AreEqual(true, secondStratigraphy.IsPrimary);
        Assert.AreEqual("KARMACANDID", secondStratigraphy.Name);

        firstStratigraphy = GetStratigraphy(firstStratigraphy.Id);
        Assert.AreEqual(false, firstStratigraphy.IsPrimary);
        Assert.AreEqual("FALLOUT-VII", firstStratigraphy.Name);
    }

    [TestMethod]
    public async Task EditWithExistingName()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var stratigraphy1 = new StratigraphyV2
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "DECKDIXIE",
        };

        var createResult1 = await controller.CreateAsync(stratigraphy1);
        ActionResultAssert.IsOk(createResult1.Result);

        var stratigraphy2 = new StratigraphyV2
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "FOREMANDESPERADO",
        };

        var createResult2 = await controller.CreateAsync(stratigraphy2);
        ActionResultAssert.IsOk(createResult2.Result);
        var secondStratigraphy = (StratigraphyV2?)((OkObjectResult)createResult2.Result!).Value;
        secondStratigraphy.Name = "DECKDIXIE";
        var updateResult = await controller.EditAsync(secondStratigraphy);
        ActionResultAssert.IsInternalServerError(updateResult.Result, "Name must be unique");

        secondStratigraphy = GetStratigraphy(secondStratigraphy.Id);
        Assert.AreEqual(stratigraphy2.Name, secondStratigraphy.Name);
    }

    [TestMethod]
    public async Task EditForLockedBorehole()
    {
        SetupControllerWithAlwaysLockedBorehole();

        var existingStratigraphy = await context.StratigraphiesV2.FirstAsync();
        var editResult = await controller.EditAsync(existingStratigraphy);
        ActionResultAssert.IsUnauthorized(editResult.Result);
    }

    [TestMethod]
    public async Task EditWithNullStratigraphy()
    {
        var editResult = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(editResult.Result);
    }

    private StratigraphyV2? GetStratigraphy(int id)
    {
        return context.StratigraphiesV2WithIncludes.SingleOrDefault(s => s.Id == id);
    }

    private void SetupControllerWithAlwaysLockedBorehole()
    {
        var boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(false);

        controller = new StratigraphyV2Controller(context, new Mock<ILogger<StratigraphyV2Controller>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }
}
