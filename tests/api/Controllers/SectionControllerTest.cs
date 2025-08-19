using BDMS.Authentication;
using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class SectionControllerTest
{
    private const int BoreholeId = 1_000_058;

    private BdmsContext context;
    private SectionController controller;
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
        controller = new SectionController(context, new Mock<ILogger<SectionController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAsync()
    {
        IEnumerable<Section>? sections = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(sections);
        Assert.AreEqual(500, sections.Count());
    }

    [TestMethod]
    public async Task GetAsyncFiltersSectionsBasedOnWorkgroupPermissions()
    {
        // Add a new borehole with section and workgroup that is not default
        var newBorehole = new Borehole()
        {
            Name = "Test Borehole",
            WorkgroupId = 4,
        };
        await context.Boreholes.AddAsync(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var section = new Section()
        {
            BoreholeId = newBorehole.Id,
            Name = "Test Section",
        };
        await context.Sections.AddAsync(section);
        await context.SaveChangesAsync().ConfigureAwait(false);

        IEnumerable<Section>? sectionsForAdmin = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(sectionsForAdmin);
        Assert.AreEqual(501, sectionsForAdmin.Count());

        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);

        IEnumerable<Section>? sectionsForEditor = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(sectionsForEditor);
        Assert.AreEqual(500, sectionsForEditor.Count());
    }

    [TestMethod]
    public async Task GetAsyncFilterByBoreholeId()
    {
        // Precondition: Find a group of two sections with the same borehole id.
        var boreholes = await context.Sections.ToListAsync();
        var boreholeId = boreholes
            .GroupBy(i => i.BoreholeId)
            .Where(g => g.Count() == 5)
            .First().Key;

        IEnumerable<Section>? sections = await controller.GetAsync(boreholeId).ConfigureAwait(false);
        Assert.IsNotNull(sections);
        Assert.AreEqual(5, sections.Count());
    }

    [TestMethod]
    public async Task GetByIdAsync()
    {
        var sectionId = context.Sections.First().Id;

        var response = await controller.GetByIdAsync(sectionId).ConfigureAwait(false);
        var section = ActionResultAssert.IsOkObjectResult<Section>(response.Result);
        Assert.AreEqual(sectionId, section.Id);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var sectionId = context.Sections.First().Id;

        var response = await controller.GetByIdAsync(sectionId);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task CreateWithoutElementAsync()
    {
        var section = new Section()
        {
            BoreholeId = BoreholeId,
            Name = "THYPOE",
        };

        var response = await controller.CreateAsync(section);
        ActionResultAssert.IsInternalServerError(response.Result, "At least one section element must be defined.");
    }

    [TestMethod]
    public async Task CreateAsync()
    {
        var section = new Section()
        {
            BoreholeId = BoreholeId,
            Name = "THYPOE",
            SectionElements = new List<SectionElement>()
            {
                new SectionElement()
                {
                    FromDepth = 3,
                    ToDepth = 42,
                    Order = 0,
                    DrillingMethodId = context.Codelists.First().Id,
                    DrillingStartDate = new DateOnly(2023, 1, 1),
                    DrillingEndDate = new DateOnly(2023, 1, 2),
                    CuttingsId = context.Codelists.Skip(1).First().Id,
                    DrillingDiameter = 12.76,
                    DrillingCoreDiameter = 9.564,
                    DrillingMudTypeId = context.Codelists.Skip(2).First().Id,
                    DrillingMudSubtypeId = context.Codelists.Skip(3).First().Id,
                },
            },
        };

        var response = await controller.CreateAsync(section);
        ActionResultAssert.IsOkObjectResult<Section>(response.Result);

        section = await context.Sections
            .Include(c => c.SectionElements)
            .AsNoTracking()
            .SingleOrDefaultAsync(c => c.Id == section.Id);

        Assert.IsNotNull(section);
        Assert.AreEqual(BoreholeId, section.BoreholeId);
        Assert.AreEqual("THYPOE", section.Name);
        var sectionElement = section.SectionElements.Single();
        Assert.AreEqual(3, sectionElement.FromDepth);
        Assert.AreEqual(42, sectionElement.ToDepth);
        Assert.AreEqual(0, sectionElement.Order);
        Assert.AreEqual(context.Codelists.First().Id, sectionElement.DrillingMethodId);
        Assert.AreEqual(new DateOnly(2023, 1, 1), sectionElement.DrillingStartDate);
        Assert.AreEqual(new DateOnly(2023, 1, 2), sectionElement.DrillingEndDate);
        Assert.AreEqual(context.Codelists.Skip(1).First().Id, sectionElement.CuttingsId);
        Assert.AreEqual(12.76, sectionElement.DrillingDiameter);
        Assert.AreEqual(9.564, sectionElement.DrillingCoreDiameter);
        Assert.AreEqual(context.Codelists.Skip(2).First().Id, sectionElement.DrillingMudTypeId);
        Assert.AreEqual(context.Codelists.Skip(3).First().Id, sectionElement.DrillingMudSubtypeId);
    }

    [TestMethod]
    public async Task EditAsync()
    {
        var section = await context.Sections
            .Include(s => s.SectionElements)
            .AsNoTracking()
            .FirstAsync(s => s.SectionElements.Count > 0);
        var boreholeId = section.BoreholeId;

        section.Name = "ABLART";
        section.SectionElements.First().DrillingDiameter = 453.463;

        var response = await controller.EditAsync(section);
        ActionResultAssert.IsOkObjectResult<Section>(response.Result);

        section = await context.Sections.FindAsync(section.Id);
        Assert.IsNotNull(section);
        Assert.AreEqual(boreholeId, section.BoreholeId);
        Assert.AreEqual("ABLART", section.Name);
        Assert.AreEqual(453.463, section.SectionElements.First().DrillingDiameter);
    }

    [TestMethod]
    public async Task DeleteSection()
    {
        var section = context.Sections
            .Include(s => s.SectionElements)
            .AsNoTracking()
            .First(s => s.SectionElements.Count == 2);

        var sectionCount = context.Sections.Count();
        var sectionElementCount = context.SectionElements.Count();

        var response = await controller.DeleteAsync(section.Id);
        ActionResultAssert.IsOk(response);
        Assert.AreEqual(sectionCount - 1, context.Sections.Count());
        Assert.AreEqual(sectionElementCount - 2, context.SectionElements.Count());
    }
}
