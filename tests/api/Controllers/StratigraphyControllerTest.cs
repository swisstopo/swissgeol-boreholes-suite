using BDMS.Authentication;
using BDMS.Models;
using BDMS.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Collections.ObjectModel;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class StratigraphyControllerTest
{
    private const int StratigraphyId = 6_000_003;

    private BdmsContext context;
    private StratigraphyController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new StratigraphyController(context, new Mock<ILogger<StratigraphyController>>().Object, boreholePermissionServiceMock.Object, new LithologyTabContentService(context)) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        var result = await controller.GetAsync(81294572).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task GetStratigraphyByBoreholeId()
    {
        // Pick any seeded borehole that has at least one stratigraphy so the test
        // is robust against changes in random borehole-to-stratigraphy assignment.
        var seededStratigraphy = await context.Stratigraphies
            .AsNoTracking()
            .OrderBy(s => s.BoreholeId)
            .ThenBy(s => s.Id)
            .FirstAsync();
        var boreholeId = seededStratigraphy.BoreholeId;

        var result = await controller.GetAsync(boreholeId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        var stratigraphies = ((OkObjectResult?)result.Result)?.Value as List<Stratigraphy>;
        Assert.IsNotNull(stratigraphies);
        Assert.IsTrue(stratigraphies.Count >= 1);

        var first = stratigraphies[0];
        Assert.AreEqual(boreholeId, first.BoreholeId);
        Assert.IsFalse(string.IsNullOrWhiteSpace(first.Name));
        Assert.IsTrue(first.CreatedById is null or >= 1 and <= 5);
        Assert.IsTrue(first.UpdatedById is >= 1 and <= 5);
        Assert.IsTrue(stratigraphies.Any(s => s.IsPrimary));
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
        Assert.AreEqual("sub_editor", copiedStratigraphy.CreatedBy.SubjectId);
        Assert.AreEqual("sub_validator", copiedStratigraphy.UpdatedBy.SubjectId);
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
        Assert.AreEqual(originalStratigraphy.LithologicalDescriptions.Count, copiedStratigraphy.LithologicalDescriptions.Count);
        Assert.AreEqual(originalStratigraphy.LithologicalDescriptions.First().FromDepth, copiedStratigraphy.LithologicalDescriptions.First().FromDepth);
        Assert.AreEqual(originalStratigraphy.LithologicalDescriptions.First().ToDepth, copiedStratigraphy.LithologicalDescriptions.First().ToDepth);
        Assert.AreEqual(originalStratigraphy.LithologicalDescriptions.First().Description, copiedStratigraphy.LithologicalDescriptions.First().Description);
        Assert.AreEqual(originalStratigraphy.FaciesDescriptions.Count, copiedStratigraphy.FaciesDescriptions.Count);
        Assert.AreEqual(originalStratigraphy.FaciesDescriptions.First().FromDepth, copiedStratigraphy.FaciesDescriptions.First().FromDepth);
        Assert.AreEqual(originalStratigraphy.FaciesDescriptions.First().ToDepth, copiedStratigraphy.FaciesDescriptions.First().ToDepth);
        Assert.AreEqual(originalStratigraphy.FaciesDescriptions.First().Description, copiedStratigraphy.FaciesDescriptions.First().Description);
        Assert.AreEqual(originalStratigraphy.FaciesDescriptions.First().FaciesId, copiedStratigraphy.FaciesDescriptions.First().FaciesId);
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

        var existingStratigraphy = await context.Stratigraphies.FirstAsync();
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
        // Precondition: Find a borehole that has more than one stratigraphy and pick the primary.
        var boreholeIdWithMultipleStratigraphies = await context.Stratigraphies
            .AsNoTracking()
            .GroupBy(s => s.BoreholeId)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .FirstAsync();

        var getResult = await controller.GetAsync(boreholeIdWithMultipleStratigraphies);
        ActionResultAssert.IsOk(getResult.Result);
        var stratigraphies = ((OkObjectResult?)getResult.Result)?.Value as List<Stratigraphy>;
        Assert.IsNotNull(stratigraphies);
        var primaryStratigraphy = stratigraphies.SingleOrDefault(s => s.IsPrimary);
        Assert.IsNotNull(primaryStratigraphy);

        var deleteResult = await controller.DeleteAsync(primaryStratigraphy.Id);
        ActionResultAssert.IsInternalServerError(deleteResult);
    }

    [TestMethod]
    public async Task DeleteForLockedBorehole()
    {
        SetupControllerWithAlwaysLockedBorehole();

        var existingStratigraphy = await context.Stratigraphies.FirstAsync();
        var deleteResult = await controller.DeleteAsync(existingStratigraphy.Id);
        ActionResultAssert.IsUnauthorized(deleteResult);
    }

    [TestMethod]
    public async Task Create()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var stratigraphyToAdd = new Stratigraphy
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "KODACLUSTER",
        };

        var createResult = await CreateAsync(stratigraphyToAdd);
        var createdStratigraphy = GetStratigraphy(GetCreatedStratigraphy(createResult).Id);
        Assert.AreEqual(stratigraphyToAdd.BoreholeId, createdStratigraphy.BoreholeId);
        Assert.AreEqual(stratigraphyToAdd.Name, createdStratigraphy.Name);

        // Because the stratigraphy is the first one for the borehole, it is automatically the primary stratigraphy.
        Assert.AreEqual(true, createdStratigraphy.IsPrimary);
    }

    [TestMethod]
    public async Task CreateHeaderOnlyWithNullLithologyCreatesNoLithologyRows()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var edit = new StratigraphyTabEdit
        {
            Stratigraphy = new Stratigraphy
            {
                BoreholeId = boreholeWithoutStratigraphy.Id,
                Name = "HEADERONLY",
            },
            LithologyTab = null,
        };

        var createResult = await controller.CreateStratigraphiesAsync(new Collection<StratigraphyTabEdit> { edit });
        var created = ActionResultAssert.IsOkObjectResult<Collection<StratigraphyTabEdit>>(createResult.Result).Single();

        Assert.AreEqual(0, created.LithologyTab!.Lithologies.Count);
        Assert.AreEqual(0, created.LithologyTab!.LithologicalDescriptions.Count);
        Assert.AreEqual(0, created.LithologyTab!.FaciesDescriptions.Count);
        Assert.AreEqual(0, await context.Lithologies.CountAsync(l => l.StratigraphyId == created.Stratigraphy.Id));
    }

    [TestMethod]
    public async Task CreateWithPopulatedLithology()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var edit = new StratigraphyTabEdit
        {
            Stratigraphy = new Stratigraphy
            {
                BoreholeId = boreholeWithoutStratigraphy.Id,
                Name = "WITHLITHOLOGY",
            },
            LithologyTab = new LithologyTabContents
            {
                Lithologies =
                {
                    new Lithology
                    {
                        FromDepth = 0,
                        ToDepth = 10,
                        IsUnconsolidated = true,
                        HasBedding = false,
                        Notes = "Created with stratigraphy",
                        LithologyDescriptions = new List<LithologyDescription>
                        {
                            new LithologyDescription { IsFirst = true, ColorPrimaryId = 100000077 },
                        },
                    },
                },
            },
        };

        var createResult = await controller.CreateStratigraphiesAsync(new Collection<StratigraphyTabEdit> { edit });
        var created = ActionResultAssert.IsOkObjectResult<Collection<StratigraphyTabEdit>>(createResult.Result).Single();

        Assert.AreEqual(1, created.LithologyTab!.Lithologies.Count);
        Assert.AreEqual("Created with stratigraphy", created.LithologyTab!.Lithologies[0].Notes);

        // The lithology can be loaded through the dedicated lithology contents endpoint.
        var getResult = await controller.GetLithologyContentsAsync(created.Stratigraphy.Id);
        var contents = ActionResultAssert.IsOkObjectResult<LithologyTabContents>(getResult.Result);
        Assert.AreEqual(1, contents.Lithologies.Count);
        Assert.AreEqual("Created with stratigraphy", contents.Lithologies[0].Notes);
    }

    [TestMethod]
    public async Task CreateAdditionalStratigraphyForExistingBorehole()
    {
        var boreholeWithExistingStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => b.Stratigraphies.Any());

        var stratigraphyToAdd = new Stratigraphy
        {
            BoreholeId = boreholeWithExistingStratigraphy.Id,
            Name = "STORMSTEED",
        };

        var createResult = await CreateAsync(stratigraphyToAdd);
        var createdStratigraphy = GetStratigraphy(GetCreatedStratigraphy(createResult).Id);
        Assert.AreEqual(stratigraphyToAdd.BoreholeId, createdStratigraphy.BoreholeId);
        Assert.AreEqual(stratigraphyToAdd.Name, createdStratigraphy.Name);

        // Because the stratigraphy is the second one for the borehole, it is not automatically the primary stratigraphy.
        Assert.AreEqual(false, createdStratigraphy.IsPrimary);
    }

    [TestMethod]
    public async Task CreateAdditionalStratigraphyWithIsPrimary()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var stratigraphy1 = new Stratigraphy
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "WINDFOOT",
        };

        var createResult1 = await CreateAsync(stratigraphy1);
        var firstStratigraphy = GetStratigraphy(GetCreatedStratigraphy(createResult1).Id);
        Assert.AreEqual(true, firstStratigraphy.IsPrimary);

        var stratigraphy2 = new Stratigraphy
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "ECHOGOAT",
            IsPrimary = true,
        };

        var createResult2 = await CreateAsync(stratigraphy2);
        var secondStratigraphy = GetStratigraphy(GetCreatedStratigraphy(createResult2).Id);
        Assert.AreEqual(true, secondStratigraphy.IsPrimary);

        firstStratigraphy = GetStratigraphy(firstStratigraphy.Id);
        Assert.AreEqual(false, firstStratigraphy.IsPrimary);
    }

    [TestMethod]
    public async Task CreateMultipleStratigraphiesInOneCallWithDesignatedPrimary()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var edits = new Collection<StratigraphyTabEdit>
        {
            new() { Stratigraphy = new Stratigraphy { BoreholeId = boreholeWithoutStratigraphy.Id, Name = "BULK-A" } },
            new() { Stratigraphy = new Stratigraphy { BoreholeId = boreholeWithoutStratigraphy.Id, Name = "BULK-B", IsPrimary = true } },
        };

        var createResult = await controller.CreateStratigraphiesAsync(edits);
        var created = ActionResultAssert.IsOkObjectResult<Collection<StratigraphyTabEdit>>(createResult.Result);
        Assert.AreEqual(2, created.Count);

        var primaries = await context.Stratigraphies
            .Where(s => s.BoreholeId == boreholeWithoutStratigraphy.Id && s.IsPrimary)
            .ToListAsync();
        Assert.AreEqual(1, primaries.Count);
        Assert.AreEqual("BULK-B", primaries.Single().Name);
    }

    [TestMethod]
    public async Task CreateWithExistingName()
    {
        var baseStratigraphy = await context.Stratigraphies.FirstAsync();

        var stratigraphyToCreate = new Stratigraphy
        {
            BoreholeId = baseStratigraphy.BoreholeId,
            Name = baseStratigraphy.Name,
        };

        var createResult = await CreateAsync(stratigraphyToCreate);
        ActionResultAssert.IsInternalServerError(createResult.Result, "Name must be unique");
        var problemDetails = (ProblemDetails)((ObjectResult)createResult.Result!).Value!;
        Assert.AreEqual("mustBeUnique", problemDetails.Extensions["messageKey"]);
        CollectionAssert.AreEquivalent(
            new List<string> { baseStratigraphy.Name! },
            ((IEnumerable<string>)problemDetails.Extensions["conflictingNames"]!).ToList());
    }

    [TestMethod]
    public async Task CreateWithDuplicateInBatchNamesReturnsMustBeUnique()
    {
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());

        var edits = new Collection<StratigraphyTabEdit>
        {
            new() { Stratigraphy = new Stratigraphy { BoreholeId = boreholeWithoutStratigraphy.Id, Name = "DUPLICATE" } },
            new() { Stratigraphy = new Stratigraphy { BoreholeId = boreholeWithoutStratigraphy.Id, Name = "DUPLICATE" } },
        };

        var createResult = await controller.CreateStratigraphiesAsync(edits);
        ActionResultAssert.IsInternalServerError(createResult.Result, "Name must be unique");
        var problemDetails = (ProblemDetails)((ObjectResult)createResult.Result!).Value!;
        Assert.AreEqual("mustBeUnique", problemDetails.Extensions["messageKey"]);

        // The offending name is reported once so the client can flag the right row.
        CollectionAssert.AreEquivalent(
            new List<string> { "DUPLICATE" },
            ((IEnumerable<string>)problemDetails.Extensions["conflictingNames"]!).ToList());
    }

    [TestMethod]
    public async Task CreateWithInvalidStratigraphy()
    {
        // BoreholeId = int.MinValue is treated as a valid (single) borehole id by the combined create,
        // passes the always-allow permission mock, and only fails on SaveChanges (FK violation),
        // which the controller maps to InternalServerError.
        var inexistentBoreholeId = int.MinValue;
        var invalidStratigraphy = new Stratigraphy { BoreholeId = inexistentBoreholeId };
        var createResult = await CreateAsync(invalidStratigraphy);
        ActionResultAssert.IsInternalServerError(createResult.Result);
    }

    [TestMethod]
    public async Task CreateWithUserNotSet()
    {
        // The combined create resolves the borehole id from the payload before the permission check,
        // so a real existing borehole id is required to exercise the Unauthorized path.
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());
        controller.ControllerContext.HttpContext.User = null;
        var createResult = await CreateAsync(new Stratigraphy { BoreholeId = boreholeWithoutStratigraphy.Id });
        ActionResultAssert.IsUnauthorized(createResult.Result);
    }

    [TestMethod]
    public async Task CreateForLockedBorehole()
    {
        SetupControllerWithAlwaysLockedBorehole();

        // The combined create resolves the borehole id from the payload before the permission check,
        // so a real existing borehole id is required to exercise the Unauthorized path.
        var boreholeWithoutStratigraphy = await context.BoreholesWithIncludes.FirstAsync(b => !b.Stratigraphies.Any());
        var createResult = await CreateAsync(new Stratigraphy { BoreholeId = boreholeWithoutStratigraphy.Id });
        ActionResultAssert.IsUnauthorized(createResult.Result);
    }

    [TestMethod]
    public async Task Edit()
    {
        var borehole = await context.Boreholes.OrderBy(x => x.CreatedById).LastAsync();
        var stratigraphyToEdit = await context.Stratigraphies.FirstAsync();
        stratigraphyToEdit.BoreholeId = borehole.Id;
        stratigraphyToEdit.IsPrimary = false;
        stratigraphyToEdit.Date = new DateTime(1999, 9, 9).ToUniversalTime();
        stratigraphyToEdit.Name = "ERRONEOUS";

        var editResult = await EditAsync(stratigraphyToEdit);
        var editedStratigraphy = GetEditedStratigraphy(editResult);
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

        var firstStratigraphy = new Stratigraphy
        {
            IsPrimary = true,
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "FALLOUT-VII",
        };

        var secondStratigraphy = new Stratigraphy
        {
            IsPrimary = false,
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "KARMACANDID",
        };

        firstStratigraphy = GetCreatedStratigraphy(await CreateAsync(firstStratigraphy));
        secondStratigraphy = GetCreatedStratigraphy(await CreateAsync(secondStratigraphy));

        // Setting the second stratigraphy as the main stratigraphy
        // should set the first stratigraphy as non-main.
        secondStratigraphy.IsPrimary = true;
        secondStratigraphy = GetEditedStratigraphy(await EditAsync(secondStratigraphy));
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

        var stratigraphy1 = new Stratigraphy
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "DECKDIXIE",
        };

        var createResult1 = await CreateAsync(stratigraphy1);
        GetCreatedStratigraphy(createResult1);

        var stratigraphy2 = new Stratigraphy
        {
            BoreholeId = boreholeWithoutStratigraphy.Id,
            Name = "FOREMANDESPERADO",
        };

        var createResult2 = await CreateAsync(stratigraphy2);
        var secondStratigraphy = GetCreatedStratigraphy(createResult2);
        secondStratigraphy.Name = "DECKDIXIE";
        var updateResult = await EditAsync(secondStratigraphy);
        ActionResultAssert.IsInternalServerError(updateResult.Result, "Name must be unique");
        var problemDetails = (ProblemDetails)((ObjectResult)updateResult.Result!).Value!;
        Assert.AreEqual("mustBeUnique", problemDetails.Extensions["messageKey"]);

        secondStratigraphy = GetStratigraphy(secondStratigraphy.Id);
        Assert.AreEqual(stratigraphy2.Name, secondStratigraphy.Name);
    }

    [TestMethod]
    public async Task EditForLockedBorehole()
    {
        SetupControllerWithAlwaysLockedBorehole();

        var existingStratigraphy = await context.Stratigraphies.FirstAsync();
        var editResult = await EditAsync(existingStratigraphy);
        ActionResultAssert.IsUnauthorized(editResult.Result);
    }

    [TestMethod]
    public async Task EditWithInexistentStratigraphyReturnsNotFound()
    {
        var stratigraphy = new Stratigraphy
        {
            Id = 9815784,
            BoreholeId = (await context.Stratigraphies.FirstAsync()).BoreholeId,
            Name = "INEXISTENT",
        };

        var editResult = await EditAsync(stratigraphy);
        ActionResultAssert.IsNotFound(editResult.Result);
    }

    [TestMethod]
    public async Task GetLithologyContentsForInexistentStratigraphyReturnsNotFound()
    {
        var result = await controller.GetLithologyContentsAsync(94578122);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task GetLithologyContentsWithInsufficientPermissionReturnsUnauthorized()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_unauthorized", PolicyNames.Viewer);
        var stratigraphyId = (await context.Stratigraphies.FirstAsync()).Id;

        var result = await controller.GetLithologyContentsAsync(stratigraphyId);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    private Task<ActionResult<Collection<StratigraphyTabEdit>>> CreateAsync(Stratigraphy? stratigraphy)
        => controller.CreateStratigraphiesAsync(new Collection<StratigraphyTabEdit> { new() { Stratigraphy = stratigraphy! } });

    private Task<ActionResult<StratigraphyTabEdit>> EditAsync(Stratigraphy? stratigraphy)
        => controller.EditStratigraphyAsync(new StratigraphyTabEdit { Stratigraphy = stratigraphy! });

    private static Stratigraphy GetCreatedStratigraphy(ActionResult<Collection<StratigraphyTabEdit>> createResult)
        => ActionResultAssert.IsOkObjectResult<Collection<StratigraphyTabEdit>>(createResult.Result)[0].Stratigraphy;

    private static Stratigraphy GetEditedStratigraphy(ActionResult<StratigraphyTabEdit> editResult)
        => ActionResultAssert.IsOkObjectResult<StratigraphyTabEdit>(editResult.Result).Stratigraphy;

    private Stratigraphy? GetStratigraphy(int id)
    {
        return context.StratigraphiesWithIncludes
            .Include(s => s.CreatedBy)
            .Include(s => s.UpdatedBy)
            .SingleOrDefault(s => s.Id == id);
    }

    private void SetupControllerWithAlwaysLockedBorehole()
    {
        var boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(false);

        controller = new StratigraphyController(context, new Mock<ILogger<StratigraphyController>>().Object, boreholePermissionServiceMock.Object, new LithologyTabContentService(context)) { ControllerContext = GetControllerContextAdmin() };
    }
}
