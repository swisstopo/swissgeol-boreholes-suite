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
public class CompletionControllerTest
{
    private const int CompletionId = 14_000_003;

    private BdmsContext context;
    private CompletionController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<bool?>()))
            .ReturnsAsync(true);
        controller = new CompletionController(context, new Mock<ILogger<CompletionController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAsync()
    {
        var completions = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(completions);
        Assert.AreEqual(500, completions.Count());
    }

    [TestMethod]
    public async Task GetAsyncFilterByBoreholeId()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion1 = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
        };
        var completion2 = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "EINSTEINVIEW",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
        };

        context.Completions.Add(completion1);
        context.Completions.Add(completion2);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completions = await controller.GetAsync(borehole.Id).ConfigureAwait(false);

        Assert.IsNotNull(completions);
        Assert.AreEqual(2, completions.Count());
    }

    [TestMethod]
    public async Task GetByInexistentBoreholeId()
    {
        var completions = await controller.GetAsync(81294572).ConfigureAwait(false);
        Assert.IsNotNull(completions);
        Assert.AreEqual(0, completions.Count());
    }

    [TestMethod]
    public async Task GetByIdAsync()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
        };

        context.Completions.Add(completion);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var response = await controller.GetByIdAsync(completion.Id).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var completionResult = okResult.Value as Completion;
        Assert.IsNotNull(completionResult);
        Assert.AreEqual(completion.Id, completionResult.Id);
        Assert.AreEqual(completion.Name, completionResult.Name);
        Assert.AreEqual(completion.KindId, completionResult.KindId);
    }

    [TestMethod]
    public async Task GetByUnknownId()
    {
        var completionResult = await controller.GetByIdAsync(int.MinValue);
        ActionResultAssert.IsNotFound(completionResult.Result);
    }

    [TestMethod]
    public async Task CreateCompletion()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
            IsPrimary = false,
        };

        var response = await controller.CreateAsync(completion).ConfigureAwait(false);
        ActionResultAssert.IsOk(response.Result);

        completion = await context.Completions.FindAsync(completion.Id);
        Assert.IsNotNull(completion);
        Assert.AreEqual("AUTOTHUNDER", completion.Name);
        Assert.AreEqual(borehole.Id, completion.BoreholeId);

        // Because the completion is the first one for the borehole, it is automatically the primary completion.
        Assert.AreEqual(true, completion.IsPrimary);

        var completionToAdd = new Completion
        {
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
            BoreholeId = borehole.Id,
            Name = "STORMSTEED",
            Notes = "GALAXYJEEP",
            IsPrimary = false,
        };

        response = await controller.CreateAsync(completionToAdd);
        ActionResultAssert.IsOk(response.Result);

        var secondCompletion = (Completion?)((OkObjectResult)response.Result!).Value;
        secondCompletion = GetCompletion(secondCompletion.Id);

        // Because the completion is the second one for the borehole, it is not automatically the primary completion.
        Assert.AreEqual(false, secondCompletion.IsPrimary);

        var primaryCompletionToAdd = new Completion
        {
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
            BoreholeId = borehole.Id,
            Name = "ENDUETRUCK",
            IsPrimary = true,
        };

        response = await controller.CreateAsync(primaryCompletionToAdd);
        ActionResultAssert.IsOk(response.Result);

        var thirdCompletion = (Completion?)((OkObjectResult)response.Result!).Value;
        thirdCompletion = GetCompletion(thirdCompletion.Id);

        // Because the completion was marked as primary, the first completion is no longer primary.
        Assert.AreEqual(true, thirdCompletion.IsPrimary);

        completion = GetCompletion(completion.Id);
        Assert.AreEqual(false, completion.IsPrimary);
    }

    [TestMethod]
    public async Task CreateWithNullCompletion()
    {
        var createResult = await controller.CreateAsync(null);
        ActionResultAssert.IsBadRequest(createResult.Result);
    }

    [TestMethod]
    public async Task CreateWithInvalidCompletion()
    {
        var inexistentBoreholeId = int.MinValue;
        var invalidCompletion = new Completion { BoreholeId = inexistentBoreholeId };
        var createResult = await controller.CreateAsync(invalidCompletion);
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
        ActionResultAssert.IsInternalServerError(createResult.Result);
    }

    [TestMethod]
    public async Task EditCompletion()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
        };

        context.Completions.Add(completion);
        await context.SaveChangesAsync().ConfigureAwait(false);

        completion.Name = "ENDUETRUCK";
        completion.AbandonDate = new DateOnly(2023, 01, 01);
        var response = await controller.EditAsync(completion).ConfigureAwait(false);
        ActionResultAssert.IsOk(response.Result);

        completion = await context.Completions.FindAsync(completion.Id);
        Assert.IsNotNull(completion);
        Assert.AreEqual("ENDUETRUCK", completion.Name);
        Assert.AreEqual(borehole.Id, completion.BoreholeId);
        Assert.AreEqual(new DateOnly(2023, 01, 01), completion.AbandonDate);
    }

    [TestMethod]
    public async Task EditSetMainCompletion()
    {
        // Precondition: Create two completions for the same borehole,
        // one of which is the main completion.
        var boreholeWithoutCompletion = await context
            .Boreholes
            .Include(b => b.Completions)
            .FirstAsync(b => b.Completions.Count == 0);

        var firstCompletion = new Completion
        {
            BoreholeId = boreholeWithoutCompletion.Id,
            Name = "FALLOUT-VII",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
        };

        var secondCompletion = new Completion
        {
            BoreholeId = boreholeWithoutCompletion.Id,
            Name = "KARMACANDID",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
        };

        firstCompletion = ActionResultAssert.IsOkObjectResult<Completion>((await controller.CreateAsync(firstCompletion)).Result);
        Assert.AreEqual(true, firstCompletion.IsPrimary);
        secondCompletion = ActionResultAssert.IsOkObjectResult<Completion>((await controller.CreateAsync(secondCompletion)).Result);

        // Setting the second completion as the main completion
        // should set the first completion as non-main.
        secondCompletion.IsPrimary = true;
        secondCompletion = ActionResultAssert.IsOkObjectResult<Completion>((await controller.EditAsync(secondCompletion)).Result);
        Assert.AreEqual(true, secondCompletion.IsPrimary);
        Assert.AreEqual("KARMACANDID", secondCompletion.Name);

        firstCompletion = GetCompletion(firstCompletion.Id);

        Assert.AreEqual(false, firstCompletion.IsPrimary);
        Assert.AreEqual("FALLOUT-VII", firstCompletion.Name);
    }

    [TestMethod]
    public async Task EditForLockedBorehole()
    {
        SetupControllerWithAlwaysLockedBorehole();

        var existingCompletion = await context.Completions.FirstAsync();
        var editResult = await controller.EditAsync(existingCompletion);
        ActionResultAssert.IsInternalServerError(editResult.Result, "locked");
    }

    [TestMethod]
    public async Task Copy()
    {
        var originalCompletion = GetCompletion(CompletionId);
        Assert.IsNotNull(originalCompletion?.Instrumentations, "Precondition: Completion has Instrumentations");
        Assert.IsNotNull(originalCompletion?.Backfills, "Precondition: Completion has Backfills");

        var result = await controller.CopyAsync(CompletionId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        var copiedCompletionId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedCompletionId);
        Assert.IsInstanceOfType(copiedCompletionId, typeof(int));
        var copiedCompletion = GetCompletion((int)copiedCompletionId);

        Assert.AreEqual("Games & Shoes (Clone)", copiedCompletion.Name);
        Assert.AreEqual("sub_validator", copiedCompletion.CreatedBy.SubjectId);
        Assert.AreEqual("sub_publisher", copiedCompletion.UpdatedBy.SubjectId);
        Assert.AreEqual(false, copiedCompletion.IsPrimary);
        Assert.AreSame(originalCompletion.Kind, copiedCompletion.Kind);
        Assert.AreNotEqual(originalCompletion.Id, copiedCompletion.Id);

        Assert.AreNotSame(originalCompletion.Instrumentations, copiedCompletion.Instrumentations);
        Assert.AreNotEqual(originalCompletion.Instrumentations.First().Id, copiedCompletion.Instrumentations.First().Id);
        Assert.AreEqual(originalCompletion.Instrumentations.Count, copiedCompletion.Instrumentations.Count);
        Assert.AreEqual(originalCompletion.Instrumentations.First().FromDepth, copiedCompletion.Instrumentations.First().FromDepth);
        Assert.AreEqual(originalCompletion.Instrumentations.First().ToDepth, copiedCompletion.Instrumentations.First().ToDepth);
        Assert.AreEqual(originalCompletion.Instrumentations.First().Name, copiedCompletion.Instrumentations.First().Name);
        Assert.AreEqual(originalCompletion.Instrumentations.First().KindId, copiedCompletion.Instrumentations.First().KindId);
        Assert.AreEqual(originalCompletion.Instrumentations.First().StatusId, copiedCompletion.Instrumentations.First().StatusId);
        Assert.AreEqual(originalCompletion.Instrumentations.First().Notes, copiedCompletion.Instrumentations.First().Notes);

        Assert.AreNotSame(originalCompletion.Backfills, copiedCompletion.Backfills);
        Assert.AreNotEqual(originalCompletion.Backfills.First().Id, copiedCompletion.Backfills.First().Id);
        Assert.AreEqual(originalCompletion.Backfills.Count, copiedCompletion.Backfills.Count);
        Assert.AreEqual(originalCompletion.Backfills.First().FromDepth, copiedCompletion.Backfills.First().FromDepth);
        Assert.AreEqual(originalCompletion.Backfills.First().ToDepth, copiedCompletion.Backfills.First().ToDepth);
        Assert.AreEqual(originalCompletion.Backfills.First().KindId, copiedCompletion.Backfills.First().KindId);
        Assert.AreEqual(originalCompletion.Backfills.First().MaterialId, copiedCompletion.Backfills.First().MaterialId);
        Assert.AreEqual(originalCompletion.Backfills.First().Notes, copiedCompletion.Backfills.First().Notes);

        Assert.AreNotSame(originalCompletion.Casings, copiedCompletion.Casings);
        Assert.AreNotEqual(originalCompletion.Casings.First().Id, copiedCompletion.Casings.First().Id);
        Assert.AreEqual(originalCompletion.Casings.Count, copiedCompletion.Casings.Count);
        Assert.AreEqual(originalCompletion.Casings.First().Name, copiedCompletion.Casings.First().Name);
        Assert.AreEqual(originalCompletion.Casings.First().DateStart, copiedCompletion.Casings.First().DateStart);
        Assert.AreEqual(originalCompletion.Casings.First().DateFinish, copiedCompletion.Casings.First().DateFinish);
        Assert.AreEqual(originalCompletion.Casings.First().Notes, copiedCompletion.Casings.First().Notes);
    }

    [TestMethod]
    public async Task CopyInvalidCompletionId()
    {
        var result = await controller.CopyAsync(0).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task CopyWithUserNotSet()
    {
        controller.ControllerContext.HttpContext.User = null;
        var result = await controller.CopyAsync(CompletionId).ConfigureAwait(false);
        ActionResultAssert.IsInternalServerError(result.Result);
    }

    [TestMethod]
    public async Task CopyWithNonAdminUser()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);
        var result = await controller.CopyAsync(CompletionId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        // delete completion copy
        var copiedCompletionId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedCompletionId);
        Assert.IsInstanceOfType(copiedCompletionId, typeof(int));
    }

    [TestMethod]
    public async Task DeleteCompletion()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
        };

        context.Completions.Add(completion);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var response = await controller.DeleteAsync(completion.Id).ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        completion = await context.Completions.FindAsync(completion.Id);
        Assert.IsNull(completion);
    }

    [TestMethod]
    public async Task DeleteMainCompletionSetsLatestCompletionAsPrimary()
    {
        // Precondition: Find a group of three completions with one main completion
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completionOne = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
            IsPrimary = false,
        };
        await controller.CreateAsync(completionOne).ConfigureAwait(false);

        var completionTwo = new Completion
        {
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
            BoreholeId = borehole.Id,
            Name = "STORMSTEED",
            Notes = "GALAXYJEEP",
            IsPrimary = true,
        };
        await controller.CreateAsync(completionTwo).ConfigureAwait(false);

        var completionThree = new Completion
        {
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
            BoreholeId = borehole.Id,
            Name = "ENDUETRUCK",
            IsPrimary = false,
        };
        await controller.CreateAsync(completionThree).ConfigureAwait(false);

        // Delete primary completion and assert that
        // the latest completion is now the main completion
        await controller.DeleteAsync(completionTwo.Id).ConfigureAwait(false);
        Assert.AreEqual(null, GetCompletion(completionTwo.Id));

        completionThree = GetCompletion(completionThree.Id);
        Assert.AreNotEqual(null, completionThree);
        Assert.AreEqual(true, completionThree.IsPrimary);
    }

    private Completion? GetCompletion(int id)
    {
        return context.Completions
        .Include(s => s.CreatedBy)
        .Include(s => s.UpdatedBy)
        .Include(c => c.Kind)
        .Include(c => c.Instrumentations)
        .Include(c => c.Backfills)
        .Include(c => c.Casings)
        .SingleOrDefault(c => c.Id == id);
    }

    private void SetupControllerWithAlwaysLockedBorehole()
    {
        var boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<bool?>()))
            .ReturnsAsync(false);

        controller = new CompletionController(context, new Mock<ILogger<CompletionController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }
}
