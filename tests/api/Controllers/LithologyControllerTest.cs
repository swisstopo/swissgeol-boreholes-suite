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
    public async Task GetEntriesByStratigraphyIdLithologySorting()
    {
        // Find a stratigraphy to use
        var stratigraphyId = context.StratigraphiesV2.First().Id;
        var createdLithologyIds = new List<int>();

        // Create lithologies out of order
        await CreateLithology(createdLithologyIds, new Lithology { StratigraphyId = stratigraphyId, FromDepth = 130, ToDepth = 140 });
        await CreateLithology(createdLithologyIds, new Lithology { StratigraphyId = stratigraphyId, FromDepth = 100, ToDepth = 110 });
        await CreateLithology(createdLithologyIds, new Lithology { StratigraphyId = stratigraphyId, FromDepth = 120, ToDepth = 130 });

        var response = await controller.GetAsync(stratigraphyId).ConfigureAwait(false);
        var lithologies = response.Value;
        Assert.IsNotNull(lithologies);

        // Verify sorting
        for (int i = 1; i < lithologies.Count(); i++)
        {
            Assert.IsTrue(
                lithologies.ElementAt(i - 1).FromDepth <= lithologies.ElementAt(i).FromDepth,
                string.Format("Expected lithologies to be sorted by FromDepth but after {0} followed {1}", lithologies.ElementAt(i - 1).FromDepth, lithologies.ElementAt(i).FromDepth));
        }
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
    public async Task CreateAndDeleteAsync()
    {
        var stratigraphyId = context.StratigraphiesV2.First().Id;
        var lithology = GetCompleteLithology(stratigraphyId);
        lithology.HasBedding = false;

        var response = await controller.CreateAsync(lithology);
        ActionResultAssert.IsOk(response.Result);
        var okObjectResult = response.Result as OkObjectResult;
        Assert.IsNotNull(okObjectResult);
        var createdLithology = okObjectResult.Value as Lithology;
        Assert.IsNotNull(createdLithology);
        Assert.AreEqual(25.5, createdLithology.FromDepth);
        Assert.AreEqual(30.0, createdLithology.ToDepth);
        Assert.IsTrue(createdLithology.IsUnconsolidated);
        Assert.IsFalse(createdLithology.HasBedding);
        Assert.IsNull(createdLithology.Share);
        Assert.AreEqual("Test lithology", createdLithology.Notes);
        Assert.AreEqual(100000175, createdLithology.AlterationDegreeId);
        Assert.AreEqual(21102002, createdLithology.CompactnessId);
        Assert.AreEqual(21116001, createdLithology.CohesionId);
        Assert.AreEqual(21105001, createdLithology.HumidityId);
        Assert.AreEqual(21103010, createdLithology.ConsistencyId);
        Assert.AreEqual(21101002, createdLithology.PlasticityId);
        CollectionAssert.AreEquivalent(new List<int> { 23101004, 23101015 }, createdLithology.LithologyUscsTypeCodes.Select(c => c.CodelistId).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 23101004, 23101015 }, createdLithology.UscsTypeCodelists.Select(c => c.Id).ToList());
        Assert.AreEqual(100000493, createdLithology.UscsDeterminationId);
        CollectionAssert.AreEquivalent(new List<int> { 100000167 }, createdLithology.LithologyRockConditionCodes.Select(c => c.CodelistId).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000167 }, createdLithology.RockConditionCodelists.Select(c => c.Id).ToList());
        Assert.AreEqual(0, createdLithology.LithologyTextureMetaCodes.Count);
        Assert.AreEqual(1, createdLithology.LithologyDescriptions.Count); // Only one description should be saved since HasBedding is false
        var lithologyDescription = createdLithology.LithologyDescriptions.First();
        Assert.IsTrue(lithologyDescription.IsFirst);
        Assert.AreEqual(100000077, lithologyDescription.ColorPrimaryId);
        Assert.AreEqual(100000083, lithologyDescription.ColorSecondaryId);
        Assert.AreEqual(100000022, lithologyDescription.LithologyUnconMainId);
        Assert.AreEqual(100000051, lithologyDescription.LithologyUncon2Id);
        Assert.AreEqual(100000054, lithologyDescription.LithologyUncon3Id);
        Assert.AreEqual(100000045, lithologyDescription.LithologyUncon4Id);
        Assert.AreEqual(100000039, lithologyDescription.LithologyUncon5Id);
        Assert.AreEqual(100000049, lithologyDescription.LithologyUncon6Id);
        CollectionAssert.AreEquivalent(new List<int> { 21108004, 21108008 }, lithologyDescription.LithologyDescriptionComponentUnconOrganicCodes.Select(c => c.CodelistId).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21108004, 21108008 }, lithologyDescription.ComponentUnconOrganicCodelists.Select(c => c.Id).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 9102 }, lithologyDescription.LithologyDescriptionComponentUnconDebrisCodes.Select(c => c.CodelistId).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 9102 }, lithologyDescription.ComponentUnconDebrisCodelists.Select(c => c.Id).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21110002, 21110004, 21110003 }, lithologyDescription.LithologyDescriptionGrainShapeCodes.Select(c => c.CodelistId).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21110002, 21110004, 21110003 }, lithologyDescription.GrainShapeCodelists.Select(c => c.Id).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21115001 }, lithologyDescription.LithologyDescriptionGrainAngularityCodes.Select(c => c.CodelistId).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 21115001 }, lithologyDescription.GrainAngularityCodelists.Select(c => c.Id).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000503, 100000513 }, lithologyDescription.LithologyDescriptionLithologyUnconDebrisCodes.Select(c => c.CodelistId).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000503, 100000513 }, lithologyDescription.LithologyUnconDebrisCodelists.Select(c => c.Id).ToList());
        Assert.IsNull(lithologyDescription.LithologyConId);
        Assert.AreEqual(0, lithologyDescription.LithologyDescriptionComponentConParticleCodes.Count);
        Assert.AreEqual(0, lithologyDescription.LithologyDescriptionComponentConMineralCodes.Count);
        Assert.IsNull(lithologyDescription.GrainAngularityId);
        Assert.IsNull(lithologyDescription.GrainSizeId);
        Assert.IsNull(lithologyDescription.GradationId);
        Assert.IsNull(lithologyDescription.CementationId);
        Assert.AreEqual(0, lithologyDescription.LithologyDescriptionStructureSynGenCodes.Count);
        Assert.AreEqual(0, lithologyDescription.LithologyDescriptionStructurePostGenCodes.Count);

        var deleteResponse = await controller.DeleteAsync(createdLithology.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(createdLithology.Id);
        ActionResultAssert.IsNotFound(deleteResponse);

        var getResponse = await controller.GetByIdAsync(createdLithology.Id);
        ActionResultAssert.IsNotFound(getResponse.Result);
    }

    [TestMethod]
    public async Task CreateConsolidatedLithologyAsync()
    {
        var stratigraphyId = context.StratigraphiesV2.First().Id;
        var lithology = GetCompleteLithology(stratigraphyId);
        lithology.IsUnconsolidated = false;

        var response = await controller.CreateAsync(lithology);
        ActionResultAssert.IsOk(response.Result);
        var okObjectResult = response.Result as OkObjectResult;
        Assert.IsNotNull(okObjectResult);
        var createdLithology = okObjectResult.Value as Lithology;
        Assert.IsNotNull(createdLithology);
        Assert.AreEqual(25.5, createdLithology.FromDepth);
        Assert.AreEqual(30.0, createdLithology.ToDepth);
        Assert.IsFalse(createdLithology.IsUnconsolidated);
        Assert.IsTrue(createdLithology.HasBedding);
        Assert.AreEqual(70, createdLithology.Share);
        Assert.AreEqual("Test lithology", createdLithology.Notes);
        Assert.AreEqual(100000175, createdLithology.AlterationDegreeId);
        Assert.IsNull(createdLithology.CompactnessId);
        Assert.IsNull(createdLithology.CohesionId);
        Assert.IsNull(createdLithology.HumidityId);
        Assert.IsNull(createdLithology.ConsistencyId);
        Assert.IsNull(createdLithology.PlasticityId);
        Assert.AreEqual(0, createdLithology.LithologyUscsTypeCodes.Count);
        Assert.IsNull(createdLithology.UscsDeterminationId);
        Assert.AreEqual(0, createdLithology.LithologyRockConditionCodes.Count);
        CollectionAssert.AreEquivalent(new List<int> { 100000470, 100000477 }, createdLithology.LithologyTextureMetaCodes.Select(c => c.CodelistId).ToList());
        Assert.AreEqual(2, createdLithology.LithologyDescriptions.Count);
        var firstLithologyDescription = createdLithology.LithologyDescriptions.First();
        Assert.IsTrue(firstLithologyDescription.IsFirst);
        Assert.AreEqual(100000077, firstLithologyDescription.ColorPrimaryId);
        Assert.AreEqual(100000083, firstLithologyDescription.ColorSecondaryId);
        Assert.IsNull(firstLithologyDescription.LithologyUnconMainId);
        Assert.IsNull(firstLithologyDescription.LithologyUncon2Id);
        Assert.IsNull(firstLithologyDescription.LithologyUncon3Id);
        Assert.IsNull(firstLithologyDescription.LithologyUncon4Id);
        Assert.IsNull(firstLithologyDescription.LithologyUncon5Id);
        Assert.IsNull(firstLithologyDescription.LithologyUncon6Id);
        Assert.AreEqual(0, firstLithologyDescription.LithologyDescriptionComponentUnconOrganicCodes.Count);
        Assert.AreEqual(0, firstLithologyDescription.LithologyDescriptionComponentUnconDebrisCodes.Count);
        Assert.AreEqual(0, firstLithologyDescription.LithologyDescriptionGrainShapeCodes.Count);
        Assert.AreEqual(0, firstLithologyDescription.LithologyDescriptionGrainAngularityCodes.Count);
        Assert.AreEqual(0, firstLithologyDescription.LithologyDescriptionLithologyUnconDebrisCodes.Count);
        Assert.AreEqual(100000508, firstLithologyDescription.LithologyConId);
        CollectionAssert.AreEquivalent(new List<int> { 100000186, 100000181 }, firstLithologyDescription.LithologyDescriptionComponentConParticleCodes.Select(c => c.CodelistId).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000260 }, firstLithologyDescription.LithologyDescriptionComponentConMineralCodes.Select(c => c.CodelistId).ToList());
        Assert.AreEqual(21115007, firstLithologyDescription.GrainAngularityId);
        Assert.AreEqual(21109007, firstLithologyDescription.GrainSizeId);
        Assert.AreEqual(30000015, firstLithologyDescription.GradationId);
        Assert.AreEqual(100000360, firstLithologyDescription.CementationId);
        CollectionAssert.AreEquivalent(new List<int> { 100000377, 100000365, 100000399 }, firstLithologyDescription.LithologyDescriptionStructureSynGenCodes.Select(c => c.CodelistId).ToList());
        CollectionAssert.AreEquivalent(new List<int> { 100000428, 100000435 }, firstLithologyDescription.LithologyDescriptionStructurePostGenCodes.Select(c => c.CodelistId).ToList());

        var deleteResponse = await controller.DeleteAsync(createdLithology.Id);
        ActionResultAssert.IsOk(deleteResponse);
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
    public async Task EditLithologyWithCompleteLithology()
    {
        var stratigraphyId = context.StratigraphiesV2.First().Id;
        var existingUnconsolidatedLithology = GetCompleteLithology(stratigraphyId);
        var createResponse = await controller.CreateAsync(existingUnconsolidatedLithology);
        ActionResultAssert.IsOk(createResponse.Result);
        var okObjectResult = createResponse.Result as OkObjectResult;
        Assert.IsNotNull(okObjectResult);
        existingUnconsolidatedLithology = okObjectResult.Value as Lithology;

        var newLithology = new Lithology
        {
            Id = existingUnconsolidatedLithology.Id,
            UpdatedById = 3,
            StratigraphyId = existingUnconsolidatedLithology.StratigraphyId,
            FromDepth = existingUnconsolidatedLithology.FromDepth + 5,
            ToDepth = existingUnconsolidatedLithology.ToDepth + 5,
            IsUnconsolidated = false,
            HasBedding = false,
            Notes = "Updated in test",
            AlterationDegreeId = 100000176,
            CompactnessId = 21102002,
            CohesionId = 21116001,
            RockConditionCodelistIds = new List<int> { 100000167 },
            TextureMetaCodelistIds = new List<int> { 100000469, 100000482 },
            LithologyDescriptions = existingUnconsolidatedLithology.LithologyDescriptions.Where(ld => ld.IsFirst).ToList(),
        };

        // Update Lithology
        var response = await controller.EditAsync(newLithology);
        ActionResultAssert.IsOk(response.Result);
        var updatedOkObjectResult = response.Result as OkObjectResult;
        var updatedLithology = updatedOkObjectResult.Value as Lithology;

        Assert.AreEqual(1, updatedLithology.UpdatedById);
        Assert.AreEqual(existingUnconsolidatedLithology.StratigraphyId, updatedLithology.StratigraphyId);
        Assert.AreEqual(newLithology.FromDepth, updatedLithology.FromDepth);
        Assert.AreEqual(newLithology.ToDepth, updatedLithology.ToDepth);
        Assert.AreEqual(newLithology.IsUnconsolidated, updatedLithology.IsUnconsolidated);
        Assert.IsFalse(updatedLithology.HasBedding);
        Assert.IsNull(updatedLithology.Share);
        Assert.AreEqual(newLithology.Notes, updatedLithology.Notes);
        Assert.AreEqual(newLithology.AlterationDegreeId, updatedLithology.AlterationDegreeId);
        Assert.IsNull(updatedLithology.CompactnessId);
        Assert.IsNull(updatedLithology.CohesionId);
        Assert.IsNull(updatedLithology.HumidityId);
        Assert.IsNull(updatedLithology.ConsistencyId);
        Assert.IsNull(updatedLithology.PlasticityId);
        Assert.AreEqual(0, updatedLithology.UscsTypeCodelistIds.Count);
        Assert.IsNull(updatedLithology.UscsDeterminationId);
        Assert.AreEqual(0, updatedLithology.RockConditionCodelistIds.Count);
        CollectionAssert.AreEquivalent(new List<int> { 100000469, 100000482 }, updatedLithology.TextureMetaCodelistIds.ToList());
        Assert.AreEqual(1, updatedLithology.LithologyDescriptions.Count);
        var lithologyDescription = updatedLithology.LithologyDescriptions.First();
        Assert.IsTrue(lithologyDescription.IsFirst);
        Assert.AreEqual(existingUnconsolidatedLithology.LithologyDescriptions.First().Id, lithologyDescription.Id);
        Assert.AreEqual(existingUnconsolidatedLithology.LithologyDescriptions.First().ColorPrimaryId, lithologyDescription.ColorPrimaryId);
        Assert.AreEqual(existingUnconsolidatedLithology.LithologyDescriptions.First().ColorSecondaryId, lithologyDescription.ColorSecondaryId);
        Assert.IsNull(lithologyDescription.LithologyUnconMainId);
        Assert.IsNull(lithologyDescription.LithologyUncon2Id);
        Assert.IsNull(lithologyDescription.LithologyUncon3Id);
        Assert.IsNull(lithologyDescription.LithologyUncon4Id);
        Assert.IsNull(lithologyDescription.LithologyUncon5Id);
        Assert.IsNull(lithologyDescription.LithologyUncon6Id);
        Assert.AreEqual(0, lithologyDescription.ComponentUnconOrganicCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.ComponentUnconDebrisCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.GrainShapeCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.GrainAngularityCodelistIds.Count);
        Assert.AreEqual(0, lithologyDescription.LithologyUnconDebrisCodelistIds.Count);

        var oldLithologyDescriptions = context.LithologyDescriptions.Where(ld => ld.LithologyId == existingUnconsolidatedLithology.Id).ToList();
        Assert.AreEqual(1, oldLithologyDescriptions.Count);
        Assert.AreEqual(lithologyDescription.Id, oldLithologyDescriptions[0].Id);
    }

    [TestMethod]
    public async Task EditLithologyLithologyDescription()
    {
        var stratigraphyId = context.StratigraphiesV2.First().Id;
        var existingUnconsolidatedLithology = GetCompleteLithology(stratigraphyId);
        var createResponse = await controller.CreateAsync(existingUnconsolidatedLithology);
        ActionResultAssert.IsOk(createResponse.Result);
        var okObjectResult = createResponse.Result as OkObjectResult;
        Assert.IsNotNull(okObjectResult);
        existingUnconsolidatedLithology = okObjectResult.Value as Lithology;
        Assert.IsNotNull(existingUnconsolidatedLithology);

        Assert.IsTrue(existingUnconsolidatedLithology.IsUnconsolidated);
        Assert.IsTrue(existingUnconsolidatedLithology.HasBedding);
        Assert.AreEqual(2, existingUnconsolidatedLithology.LithologyDescriptions.Count);

        // Get the first description to modify
        var descriptionToEdit = existingUnconsolidatedLithology.LithologyDescriptions.First(ld => !ld.IsFirst);
        var originalDescriptionId = descriptionToEdit.Id;
        var originalColorPrimaryId = descriptionToEdit.ColorPrimaryId;

        var originalLithologyUnconMainId = descriptionToEdit.LithologyUnconMainId;
        var originalComponentUnconOrganicCodelistIds = descriptionToEdit.ComponentUnconOrganicCodelistIds.ToList();

        var modifiedDescriptions = existingUnconsolidatedLithology.LithologyDescriptions.ToList();
        var indexToModify = modifiedDescriptions.FindIndex(ld => ld.Id == originalDescriptionId);

        // Update properties of the existing description
        modifiedDescriptions[indexToModify] = new LithologyDescription
        {
            Id = originalDescriptionId,
            LithologyId = existingUnconsolidatedLithology.Id,
            IsFirst = false,
            ColorPrimaryId = 100000079, // Changed color primary
            ColorSecondaryId = 100000082, // Changed color secondary
            LithologyUnconMainId = 100000027, // Changed main fraction
            LithologyUncon2Id = 100000042, // Changed second fraction
            ComponentUnconOrganicCodelistIds = new List<int> { 21108005 },
            GrainShapeCodelistIds = new List<int> { 21110004 },
        };

        // Prepare edited lithology
        var editedLithology = new Lithology
        {
            Id = existingUnconsolidatedLithology.Id,
            StratigraphyId = existingUnconsolidatedLithology.StratigraphyId,
            FromDepth = existingUnconsolidatedLithology.FromDepth + 2,
            ToDepth = existingUnconsolidatedLithology.ToDepth + 2,
            IsUnconsolidated = true, // Keep as unconsolidated so uncon values are not reset.
            HasBedding = true,
            Notes = "Updated with edited description",
            LithologyDescriptions = modifiedDescriptions,
            RockConditionCodelistIds = new List<int> { 100000169 },
        };

        var editResponse = await controller.EditAsync(editedLithology);
        ActionResultAssert.IsOk(editResponse.Result);
        var editedResult = editResponse.Result as OkObjectResult;
        var updatedLithology = editedResult.Value as Lithology;

        Assert.IsTrue(updatedLithology.IsUnconsolidated);
        Assert.IsTrue(updatedLithology.HasBedding);

        Assert.AreEqual(2, updatedLithology.LithologyDescriptions.Count);
        Assert.AreEqual(1, updatedLithology.RockConditionCodelistIds.Count);
        Assert.AreEqual(100000169, updatedLithology.RockConditionCodelistIds.First());

        // Find the edited description
        var editedDescription = updatedLithology.LithologyDescriptions.First(ld => ld.Id == originalDescriptionId);
        Assert.IsNotNull(editedDescription);

        // Verify the description was updated
        Assert.AreEqual(100000079, editedDescription.ColorPrimaryId);
        Assert.AreNotEqual(originalColorPrimaryId, editedDescription.ColorPrimaryId);
        Assert.AreEqual(100000082, editedDescription.ColorSecondaryId);
        Assert.AreEqual(100000027, editedDescription.LithologyUnconMainId);
        Assert.AreNotEqual(originalLithologyUnconMainId, editedDescription.LithologyUnconMainId);

        // Check codelists were updated
        Assert.AreEqual(1, editedDescription.ComponentUnconOrganicCodelistIds.Count, "Should have one component unconsolidated organic ID");
        Assert.IsTrue(editedDescription.ComponentUnconOrganicCodelistIds.Contains(21108005), "Should contain the new component unconsolidated organic ID");
        Assert.AreNotEqual(originalComponentUnconOrganicCodelistIds.Count, editedDescription.ComponentUnconOrganicCodelistIds.Count, "Number of component unconsolidated organic IDs should be different from original");
        Assert.IsTrue(editedDescription.GrainShapeCodelistIds.Contains(21110004), "Should contain the new grain shape ID");

        // Clean up
        await controller.DeleteAsync(existingUnconsolidatedLithology.Id);
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
    public async Task BulkCreateAsyncCreatesMultipleLithologies()
    {
        var stratigraphyId = context.StratigraphiesV2.First().Id;
        var lithologies = new List<Lithology>
        {
            new Lithology
            {
                StratigraphyId = stratigraphyId,
                FromDepth = 10,
                ToDepth = 20,
                IsUnconsolidated = true,
                HasBedding = false,
                Notes = "Bulk created lithology 1",
                LithologyDescriptions = new List<LithologyDescription>
                {
                    new LithologyDescription
                    {
                        IsFirst = true,
                        ColorPrimaryId = 100000077,
                    },
                },
            },
            new Lithology
            {
                StratigraphyId = stratigraphyId,
                FromDepth = 20,
                ToDepth = 30,
                IsUnconsolidated = true,
                HasBedding = false,
                Notes = "Bulk created lithology 2",
                LithologyDescriptions = new List<LithologyDescription>
                {
                    new LithologyDescription
                    {
                        IsFirst = true,
                        ColorPrimaryId = 100000077,
                        ComponentConParticleCodelistIds = new List<int> { 100000186, 100000181 },
                        ComponentConMineralCodelistIds = new List<int> { 100000260 },
                        ComponentUnconDebrisCodelistIds = new List<int> { 9102 },
                    },
                },
            },
            new Lithology
            {
                StratigraphyId = stratigraphyId,
                FromDepth = 30,
                ToDepth = 40,
                IsUnconsolidated = false,
                HasBedding = false,
                AlterationDegreeId = 100000176,
                CompactnessId = 21102002,
                CohesionId = 21116001,
                Notes = "Bulk created lithology 3",
                LithologyDescriptions = new List<LithologyDescription>
                {
                    new LithologyDescription
                    {
                        IsFirst = true,
                        ColorPrimaryId = 100000077,
                        ComponentConParticleCodelistIds = new List<int> { 100000186, 100000181 },
                        ComponentConMineralCodelistIds = new List<int> { 100000260 },
                        ComponentUnconDebrisCodelistIds = new List<int> { 9102 },
                    },
                },
            },
        };

        var response = await controller.BulkCreateAsync(lithologies);

        ActionResultAssert.IsOk(response.Result);
        var okResult = response.Result as OkObjectResult;
        var createdLithologies = okResult.Value as IEnumerable<Lithology>;
        Assert.IsNotNull(createdLithologies);
        Assert.AreEqual(3, createdLithologies.Count());

        var getResponse = await controller.GetAsync(stratigraphyId);
        var retrievedLithologies = getResponse.Value.Where(l =>
            l.Notes == "Bulk created lithology 1" ||
            l.Notes == "Bulk created lithology 2" ||
            l.Notes == "Bulk created lithology 3");

        Assert.AreEqual(3, retrievedLithologies.Count());

        // Assert unconsolidated or consolidated values are saved.
        var consolidatedLithologyLithologicalDescription = retrievedLithologies.Single(l => l.Notes == "Bulk created lithology 2").LithologyDescriptions.Single();
        Assert.AreEqual(0, consolidatedLithologyLithologicalDescription.ComponentConParticleCodelistIds.Count);
        Assert.AreEqual(0, consolidatedLithologyLithologicalDescription.ComponentConMineralCodelistIds.Count);
        Assert.AreEqual(1, consolidatedLithologyLithologicalDescription.ComponentUnconDebrisCodelistIds.Count);

        var unConsolidatedLithologyLithologicalDescription = retrievedLithologies.Single(l => l.Notes == "Bulk created lithology 3").LithologyDescriptions.Single();
        Assert.AreEqual(2, unConsolidatedLithologyLithologicalDescription.ComponentConParticleCodelistIds.Count);
        Assert.AreEqual(1, unConsolidatedLithologyLithologicalDescription.ComponentConMineralCodelistIds.Count);
        Assert.AreEqual(0, unConsolidatedLithologyLithologicalDescription.ComponentUnconDebrisCodelistIds.Count);

        foreach (var lithology in retrievedLithologies)
        {
            await controller.DeleteAsync(lithology.Id);
        }
    }

    [TestMethod]
    public async Task BulkCreateAsyncWithEmptyListReturnsBadRequest()
    {
        var response = await controller.BulkCreateAsync(new List<Lithology>());
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task BulkCreateAsyncWithDifferentStratigraphyIdsReturnsBadRequest()
    {
        var lithologies = new List<Lithology>
        {
            new Lithology
            {
                StratigraphyId = context.StratigraphiesV2.First().Id,
                FromDepth = 10,
                ToDepth = 20,
                Notes = "Different stratigraphy 1",
                LithologyDescriptions = new List<LithologyDescription>
                {
                    new LithologyDescription { IsFirst = true },
                },
            },
            new Lithology
            {
                StratigraphyId = context.StratigraphiesV2.Skip(1).First().Id,
                FromDepth = 20,
                ToDepth = 30,
                Notes = "Different stratigraphy 2",
                LithologyDescriptions = new List<LithologyDescription>
                {
                    new LithologyDescription { IsFirst = true },
                },
            },
        };

        var response = await controller.BulkCreateAsync(lithologies);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task BulkCreateAsyncWithNonExistentStratigraphyIdReturnsNotFound()
    {
        var lithologies = new List<Lithology>
        {
            new Lithology
            {
                StratigraphyId = 9999999,
                FromDepth = 10,
                ToDepth = 20,
                Notes = "Non-existent stratigraphy",
                LithologyDescriptions = new List<LithologyDescription>
                {
                    new LithologyDescription { IsFirst = true },
                },
            },
        };

        var response = await controller.BulkCreateAsync(lithologies);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task BulkCreateAsyncReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var stratigraphyId = context.StratigraphiesV2.First().Id;
        var lithologies = new List<Lithology>
        {
            new Lithology
            {
                StratigraphyId = stratigraphyId,
                FromDepth = 10,
                ToDepth = 20,
                Notes = "No permission",
                LithologyDescriptions = new List<LithologyDescription>
                {
                    new LithologyDescription { IsFirst = true },
                },
            },
        };

        var unauthorizedResponse = await controller.BulkCreateAsync(lithologies);
        ActionResultAssert.IsUnauthorized(unauthorizedResponse.Result);
    }

    private static Lithology GetCompleteLithology(int stratigraphyId)
        => new Lithology
        {
            CreatedById = 2,
            UpdatedById = 2,
            Created = new DateTime(2022, 10, 4, 13, 19, 34, DateTimeKind.Utc),
            StratigraphyId = stratigraphyId,
            FromDepth = 25.5,
            ToDepth = 30.0,
            IsUnconsolidated = true,
            HasBedding = true,
            Share = 70,
            Notes = "Test lithology",
            AlterationDegreeId = 100000175,
            CompactnessId = 21102002,
            CohesionId = 21116001,
            HumidityId = 21105001,
            ConsistencyId = 21103010,
            PlasticityId = 21101002,
            UscsTypeCodelistIds = new List<int> { 23101004, 23101015 },
            UscsDeterminationId = 100000493,
            RockConditionCodelistIds = new List<int> { 100000167 },
            TextureMetaCodelistIds = new List<int> { 100000470, 100000477 },
            LithologyDescriptions = new List<LithologyDescription>
            {
                new LithologyDescription
                {
                    IsFirst = false,
                    ColorPrimaryId = 100000124,
                    ColorSecondaryId = 100000117,
                    LithologyUnconMainId = 100000033,
                    LithologyUncon2Id = 100000044,
                    LithologyUncon3Id = 100000041,
                    LithologyUncon4Id = 100000052,
                    LithologyUncon5Id = 100000037,
                    LithologyUncon6Id = 100000053,
                    ComponentUnconOrganicCodelistIds = new List<int> { 21108003, 21108006, 21108008 },
                    ComponentUnconDebrisCodelistIds = new List<int> { 9100, 9100 },
                    GrainShapeCodelistIds = new List<int> { 21110002, 21110003 },
                    GrainAngularityCodelistIds = new List<int> { 21115007, 21115001 },
                    LithologyUnconDebrisCodelistIds = new List<int> { 100000536, 100000556, 100000570 },
                    LithologyConId = 100000540,
                    ComponentConParticleCodelistIds = new List<int> { 100000183 },
                    ComponentConMineralCodelistIds = new List<int> { 100000251, 100000262 },
                    GrainAngularityId = 21115001,
                    GrainSizeId = 100000499,
                    GradationId = 100000494,
                    CementationId = 100000357,
                    StructureSynGenCodelistIds = new List<int> { 100000372, 100000391 },
                    StructurePostGenCodelistIds = new List<int> { 100000426, 100000463, 100000456 },
                },
                new LithologyDescription
                {
                    IsFirst = true,
                    ColorPrimaryId = 100000077,
                    ColorSecondaryId = 100000083,
                    LithologyUnconMainId = 100000022,
                    LithologyUncon2Id = 100000051,
                    LithologyUncon3Id = 100000054,
                    LithologyUncon4Id = 100000045,
                    LithologyUncon5Id = 100000039,
                    LithologyUncon6Id = 100000049,
                    ComponentUnconOrganicCodelistIds = new List<int> { 21108004, 21108008 },
                    ComponentUnconDebrisCodelistIds = new List<int> { 9102 },
                    GrainShapeCodelistIds = new List<int> { 21110002, 21110004, 21110003 },
                    GrainAngularityCodelistIds = new List<int> { 21115001 },
                    LithologyUnconDebrisCodelistIds = new List<int> { 100000503, 100000513 },
                    LithologyConId = 100000508,
                    ComponentConParticleCodelistIds = new List<int> { 100000186, 100000181 },
                    ComponentConMineralCodelistIds = new List<int> { 100000260 },
                    GrainAngularityId = 21115007,
                    GrainSizeId = 21109007,
                    GradationId = 30000015,
                    CementationId = 100000360,
                    StructureSynGenCodelistIds = new List<int> { 100000377, 100000365, 100000399 },
                    StructurePostGenCodelistIds = new List<int> { 100000428, 100000435 },
                },
            },
        };

    private async Task CreateLithology(List<int> lithologyIds, Lithology lithology)
    {
        var response = await controller.CreateAsync(lithology);
        if (response.Result is OkObjectResult && response.Value is IIdentifyable responseLithology)
        {
            lithologyIds.Add(responseLithology.Id);
        }
    }
}
