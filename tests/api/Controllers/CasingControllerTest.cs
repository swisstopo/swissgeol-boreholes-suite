using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class CasingControllerTest
{
    private const int CompletionId = 14_000_003;

    private BdmsContext context;
    private CasingController controller;
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
        controller = new CasingController(context, new Mock<ILogger<CasingController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAsync()
    {
        IEnumerable<Casing>? casings = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(casings);
        Assert.AreEqual(500, casings.Count());
    }

    [TestMethod]
    public async Task GetAsyncFilterByCompletionId()
    {
        // Precondition: Find a group of two casings with the same completion id.
        var completions = await context.Casings.ToListAsync();
        var completionId = completions
            .GroupBy(i => i.CompletionId)
            .Where(g => g.Count() == 2)
            .First().Key;

        IEnumerable<Casing>? casings = await controller.GetAsync(completionId).ConfigureAwait(false);
        Assert.IsNotNull(casings);
        Assert.AreEqual(2, casings.Count());
    }

    [TestMethod]
    public async Task GetByIdAsync()
    {
        var casingId = context.Casings.First().Id;

        var response = await controller.GetByIdAsync(casingId).ConfigureAwait(false);
        var casing = ActionResultAssert.IsOkObjectResult<Casing>(response.Result);
        Assert.AreEqual(casingId, casing.Id);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var casingId = context.Casings.First().Id;

        var response = await controller.GetByIdAsync(casingId);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task CreateWithoutElementAsync()
    {
        var casing = new Casing()
        {
            CompletionId = CompletionId,
            Name = "COLLAR",
            DateStart = new DateOnly(2021, 1, 1),
            DateFinish = new DateOnly(2021, 1, 2),
            Notes = "ARGONSHIP",
        };

        var response = await controller.CreateAsync(casing);
        ActionResultAssert.IsInternalServerError(response.Result, "At least one casing element must be defined.");
    }

    [TestMethod]
    public async Task CreateAsync()
    {
        var casing = new Casing()
        {
            CompletionId = CompletionId,
            Name = "COLLAR",
            DateStart = new DateOnly(2021, 1, 1),
            DateFinish = new DateOnly(2021, 1, 2),
            Notes = "ARGONSHIP",
            CasingElements = new List<CasingElement>()
            {
                new CasingElement()
                {
                    FromDepth = 0,
                    ToDepth = 100,
                    MaterialId = context.Codelists.First(c => c.Schema == CompletionSchemas.CasingMaterialSchema).Id,
                    KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.CasingTypeSchema).Id,
                    InnerDiameter = 3,
                    OuterDiameter = 4,
                },
            },
        };

        var response = await controller.CreateAsync(casing);
        ActionResultAssert.IsOkObjectResult<Casing>(response.Result);

        casing = await context.Casings
            .Include(c => c.CasingElements)
            .AsNoTracking()
            .SingleOrDefaultAsync(c => c.Id == casing.Id);

        Assert.IsNotNull(casing);
        Assert.AreEqual(CompletionId, casing.CompletionId);
        Assert.AreEqual("ARGONSHIP", casing.Notes);
        Assert.AreEqual(new DateOnly(2021, 1, 1), casing.DateStart);
        Assert.AreEqual(new DateOnly(2021, 1, 2), casing.DateFinish);
        Assert.AreEqual(1, casing.CasingElements.Count);
        var casingElement = casing.CasingElements.First();
        Assert.AreEqual(0, casingElement.FromDepth);
        Assert.AreEqual(100, casingElement.ToDepth);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.CasingMaterialSchema).Id, casingElement.MaterialId);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.CasingTypeSchema).Id, casingElement.KindId);
        Assert.AreEqual(3, casingElement.InnerDiameter);
        Assert.AreEqual(4, casingElement.OuterDiameter);
    }

    [TestMethod]
    public async Task EditAsync()
    {
        var casing = await context.Casings
            .Include(c => c.CasingElements)
            .AsNoTracking()
            .FirstAsync(c => c.CasingElements.Count > 0);
        var completionId = casing.CompletionId;

        casing.Notes = "COLLAR";

        var response = await controller.EditAsync(casing);
        ActionResultAssert.IsOkObjectResult<Casing>(response.Result);

        casing = await context.Casings.FindAsync(casing.Id);
        Assert.IsNotNull(casing);
        Assert.AreEqual(completionId, casing.CompletionId);
        Assert.AreEqual("COLLAR", casing.Notes);
    }

    [TestMethod]
    public async Task DeleteCasing()
    {
        var casing = context.Casings
            .Include(c => c.Instrumentations)
            .Include(c => c.Observations)
            .AsNoTracking()
            .First(c => c.Instrumentations.Count > 0 && c.Observations.Count > 0);
        var instrumentationId = casing.Instrumentations.First().Id;
        var observationId = casing.Observations.First().Id;

        var casingCount = context.Casings.Count();
        var instrumentationCount = context.Instrumentations.Count();
        var observationCount = context.Observations.Count();

        var response = await controller.DeleteAsync(casing.Id);
        ActionResultAssert.IsOk(response);
        Assert.AreEqual(casingCount - 1, context.Casings.Count());

        Assert.AreEqual(instrumentationCount, context.Instrumentations.Count());
        var instrumentation = await context.Instrumentations
            .Include(i => i.Casing)
            .AsNoTracking()
            .SingleOrDefaultAsync(i => i.Id == instrumentationId);
        Assert.IsNotNull(instrumentation);
        Assert.IsNull(instrumentation.Casing);
        Assert.IsNull(instrumentation.CasingId);

        Assert.AreEqual(observationCount, context.Observations.Count());
        var observation = await context.Observations
            .Include(o => o.Casing)
            .AsNoTracking()
            .SingleOrDefaultAsync(o => o.Id == observationId);
        Assert.IsNotNull(observation);
        Assert.IsNull(observation.Casing);
        Assert.IsNull(observation.CasingId);
    }
}
