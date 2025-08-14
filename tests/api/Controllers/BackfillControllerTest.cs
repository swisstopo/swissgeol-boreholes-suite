using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class BackfillControllerTest
{
    private BdmsContext context;
    private BackfillController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        controller = new BackfillController(context, new Mock<ILogger<BackfillController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAsync()
    {
        IEnumerable<Backfill>? backfills = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(backfills);
        Assert.AreEqual(500, backfills.Count());
    }

    [TestMethod]
    public async Task GetAsyncFilterByCompletionId()
    {
        // Precondition: Find a group of two backfills with the same completion id.
        var completions = await context.Backfills.ToListAsync();
        var completionId = completions
            .GroupBy(i => i.CompletionId)
            .Where(g => g.Count() == 2)
            .First().Key;

        IEnumerable<Backfill>? backfills = await controller.GetAsync(completionId).ConfigureAwait(false);
        Assert.IsNotNull(backfills);
        Assert.AreEqual(2, backfills.Count());
    }

    [TestMethod]
    public async Task GetAsyncFiltersBackfillsBasedOnWorkgroupPermissions()
    {
        // Add a new borehole with backfill and workgroup that is not default
        var newBorehole = new Borehole()
        {
            Name = "Test Borehole",
            WorkgroupId = 4,
        };
        await context.Boreholes.AddAsync(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var newCompletion = new Completion()
        {
            BoreholeId = newBorehole.Id,
            Name = "Test Completion",
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CompletionKindSchema).Id,
        };
        await context.Completions.AddAsync(newCompletion);
        await context.SaveChangesAsync().ConfigureAwait(false);

        await context.Backfills.AddAsync(new Backfill()
        {
            CompletionId = newCompletion.Id,
        });

        await context.SaveChangesAsync().ConfigureAwait(false);

        IEnumerable<Backfill>? backfillsForAdmin = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(backfillsForAdmin);
        Assert.AreEqual(501, backfillsForAdmin.Count());

        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);

        IEnumerable<Backfill>? backfillsForEditor = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(backfillsForEditor);
        Assert.AreEqual(496, backfillsForEditor.Count());
    }

    [TestMethod]
    public async Task GetByIdAsync()
    {
        var backfillId = context.Backfills.First().Id;

        var response = await controller.GetByIdAsync(backfillId).ConfigureAwait(false);
        var backfill = ActionResultAssert.IsOkObjectResult<Backfill>(response.Result);
        Assert.AreEqual(backfillId, backfill.Id);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var backfillId = context.Backfills.First().Id;

        var response = await controller.GetByIdAsync(backfillId);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task CreateAsync()
    {
        var completionId = context.Completions.First().Id;
        var backfill = new Backfill()
        {
            CompletionId = completionId,
            MaterialId = context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillMaterialSchema).Id,
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillTypeSchema).Id,
            Notes = "ARGONSHIP",
            FromDepth = 0,
            ToDepth = 100,
        };

        var response = await controller.CreateAsync(backfill);
        ActionResultAssert.IsOkObjectResult<Backfill>(response.Result);

        backfill = await context.Backfills.FindAsync(backfill.Id);
        Assert.IsNotNull(backfill);
        Assert.AreEqual(completionId, backfill.CompletionId);
        Assert.AreEqual("ARGONSHIP", backfill.Notes);
        Assert.AreEqual(0, backfill.FromDepth);
        Assert.AreEqual(100, backfill.ToDepth);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillMaterialSchema).Id, backfill.MaterialId);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillTypeSchema).Id, backfill.KindId);
    }

    [TestMethod]
    public async Task CreateWithOpenBoreholeAsync()
    {
        var completionId = context.Completions.First().Id;
        var backfill = new Backfill()
        {
            CompletionId = completionId,
            MaterialId = context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillMaterialSchema).Id,
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillTypeSchema).Id,
            CasingId = 1,
            IsOpenBorehole = true,
            Notes = "ARGONSHIP",
            FromDepth = 0,
            ToDepth = 100,
        };

        var response = await controller.CreateAsync(backfill);
        ActionResultAssert.IsOkObjectResult<Backfill>(response.Result);

        backfill = await context.Backfills.FindAsync(backfill.Id);
        Assert.IsNotNull(backfill);
        Assert.AreEqual(completionId, backfill.CompletionId);
        Assert.IsTrue(backfill.IsOpenBorehole);
        Assert.AreEqual(null, backfill.CasingId);
        Assert.AreEqual("ARGONSHIP", backfill.Notes);
        Assert.AreEqual(0, backfill.FromDepth);
        Assert.AreEqual(100, backfill.ToDepth);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillMaterialSchema).Id, backfill.MaterialId);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillTypeSchema).Id, backfill.KindId);
    }

    [TestMethod]
    public async Task EditAsync()
    {
        var backfill = context.Backfills.First();
        var completionId = backfill.CompletionId;

        backfill.MaterialId = context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillMaterialSchema).Id;
        backfill.KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillTypeSchema).Id;
        backfill.Notes = "COLLAR";
        backfill.FromDepth = 50;
        backfill.ToDepth = 200;

        var response = await controller.EditAsync(backfill);
        ActionResultAssert.IsOkObjectResult<Backfill>(response.Result);

        backfill = await context.Backfills.FindAsync(backfill.Id);
        Assert.IsNotNull(backfill);
        Assert.AreEqual(completionId, backfill.CompletionId);
        Assert.AreEqual("COLLAR", backfill.Notes);
        Assert.AreEqual(50, backfill.FromDepth);
        Assert.AreEqual(200, backfill.ToDepth);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillMaterialSchema).Id, backfill.MaterialId);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.BackfillTypeSchema).Id, backfill.KindId);
    }

    [TestMethod]
    public async Task DeleteBackfill()
    {
        var backfill = context.Backfills.First();

        var completionCount = context.Completions.Count();
        var backfillCount = context.Backfills.Count();

        var response = await controller.DeleteAsync(backfill.Id);
        ActionResultAssert.IsOk(response);

        backfill = await context.Backfills.FindAsync(backfill.Id);
        Assert.IsNull(backfill);
        Assert.AreEqual(completionCount, context.Completions.Count());
        Assert.AreEqual(backfillCount - 1, context.Backfills.Count());
    }
}
