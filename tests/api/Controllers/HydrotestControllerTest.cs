using BDMS.Authentication;
using BDMS.Models;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class HydrotestControllerTest
{
    private BdmsContext context;
    private HydrotestController controller;
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
        controller = new HydrotestController(context, new Mock<ILogger<HydrotestController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAsyncReturnsAllEntities()
    {
        var result = await controller.GetAsync();
        Assert.IsNotNull(result);
        Assert.AreEqual(93, result.Count());
    }

    [TestMethod]
    public async Task GetAsyncFiltersHydrotestsBasedOnWorkgroupPermissions()
    {
        // Add a new borehole with hydrotest and workgroup that is not default
        var newBorehole = new Borehole()
        {
            Name = "Test Borehole",
            WorkgroupId = 4,
        };
        await context.Boreholes.AddAsync(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var newHydrotest = new Hydrotest()
        {
            BoreholeId = newBorehole.Id,
            Type = ObservationType.Hydrotest,
        };
        await context.Hydrotests.AddAsync(newHydrotest);
        await context.SaveChangesAsync().ConfigureAwait(false);

        IEnumerable<Hydrotest>? hydrotestsForAdmin = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(hydrotestsForAdmin);
        Assert.AreEqual(94, hydrotestsForAdmin.Count());

        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);

        IEnumerable<Hydrotest>? hydrotestsForEditor = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(hydrotestsForEditor);
        Assert.AreEqual(92, hydrotestsForEditor.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        IEnumerable<Hydrotest>? hydrotests = await controller.GetAsync(94578122).ConfigureAwait(false);
        Assert.IsNotNull(hydrotests);
        Assert.AreEqual(0, hydrotests.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeId()
    {
        IEnumerable<Hydrotest>? hydrotests = await controller.GetAsync(1000067).ConfigureAwait(false);
        Assert.IsNotNull(hydrotests);
        Assert.AreEqual(3, hydrotests.Count());
        var hydrotest = hydrotests.First();

        Assert.AreEqual(hydrotest.Id, 12000075);
        Assert.AreEqual(hydrotest.Type, ObservationType.Hydrotest);
        Assert.AreEqual(hydrotest.Duration, 4511.5332940274538);
        Assert.AreEqual(hydrotest.FromDepthM, 3306.693974039375);
        Assert.AreEqual(hydrotest.ToDepthM, 509.6162629484275);
        Assert.AreEqual(hydrotest.FromDepthMasl, 4410.0860721413446);
        Assert.AreEqual(hydrotest.ToDepthMasl, 1815.9070508041918);
        Assert.AreEqual(hydrotest.IsOpenBorehole, false);
        Assert.AreEqual(hydrotest.Comment, "Accusamus fuga incidunt quam nisi rerum labore dolorum.");
        Assert.AreEqual(hydrotest.ReliabilityId, 15203159);

        // Assert hydrotestresult
        Assert.AreEqual(hydrotest.HydrotestResults.Count, 10);
        var testResult = hydrotest.HydrotestResults.Single(r => r.Id == 13000158);
        Assert.AreEqual(testResult.ParameterId, 15203197);
        Assert.AreEqual(testResult.Value, 1031.4824442861054);
        Assert.AreEqual(testResult.MaxValue, 1899.3953116542639);
        Assert.AreEqual(testResult.MinValue, 422.58444880441965);
        Assert.AreEqual(testResult.HydrotestId, 12000075);
    }

    [TestMethod]
    public async Task EditAsyncValidEntityUpdatesEntity()
    {
        var originalHydrotest = new Hydrotest
        {
            // Id can be provided manually to the postgres db, as long as it does not generate conflicts with the auto-generated primary keys used in the primary key sequence.
            Id = 1,
            Type = ObservationType.Hydrotest,
            StartTime = new DateTime(2006, 8, 21, 11, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2015, 11, 13, 14, 00, 00).ToUniversalTime(),
            Duration = 7909,
            FromDepthM = 67.789,
            ToDepthM = 78.15634,
            FromDepthMasl = 67.112,
            ToDepthMasl = 78.0043,
            IsOpenBorehole = true,
            Comment = "Test comment",
            BoreholeId = 1002431,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 4).Id,
            KindCodelistIds = new List<int> { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 1).Id },
        };

        var updatedHydrotest = new Hydrotest
        {
            Id = 1,
            Type = ObservationType.Hydrotest,
            StartTime = new DateTime(2021, 12, 30, 21, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2023, 1, 1, 13, 00, 00).ToUniversalTime(),
            Duration = 168,
            FromDepthM = 517.532,
            ToDepthM = 7602.12,
            FromDepthMasl = 828.774,
            ToDepthMasl = 27603.2,
            IsOpenBorehole = true,
            Comment = "Updated test comment",
            BoreholeId = 1002431,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 2).Id,
            KindCodelistIds = new List<int> { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 3).Id },
            FlowDirectionCodelistIds = new List<int> { 15203187 },
            EvaluationMethodCodelistIds = new List<int> { 15203189 },
        };

        context.Hydrotests.Add(originalHydrotest);
        await context.SaveChangesAsync();

        var response = await controller.EditAsync(updatedHydrotest);

        Assert.IsNotNull(response);
        ActionResultAssert.IsOk(response.Result);

        var editedHydrotest = context.Hydrotests.Single(w => w.Id == 1);
        Assert.AreEqual(updatedHydrotest.Id, editedHydrotest.Id);
        Assert.AreEqual(updatedHydrotest.Type, editedHydrotest.Type);
        Assert.AreEqual(updatedHydrotest.StartTime, editedHydrotest.StartTime);
        Assert.AreEqual(updatedHydrotest.EndTime, editedHydrotest.EndTime);
        Assert.AreEqual(updatedHydrotest.Duration, editedHydrotest.Duration);
        Assert.AreEqual(updatedHydrotest.FromDepthM, editedHydrotest.FromDepthM);
        Assert.AreEqual(updatedHydrotest.ToDepthM, editedHydrotest.ToDepthM);
        Assert.AreEqual(updatedHydrotest.FromDepthMasl, editedHydrotest.FromDepthMasl);
        Assert.AreEqual(updatedHydrotest.ToDepthMasl, editedHydrotest.ToDepthMasl);
        Assert.AreEqual(updatedHydrotest.IsOpenBorehole, editedHydrotest.IsOpenBorehole);
        Assert.AreEqual(updatedHydrotest.Comment, editedHydrotest.Comment);
        Assert.AreEqual(updatedHydrotest.BoreholeId, editedHydrotest.BoreholeId);
        Assert.AreEqual(updatedHydrotest.ReliabilityId, editedHydrotest.ReliabilityId);

        Assert.AreEqual("Pump-/Injektionsversuch, variable Rate", editedHydrotest.KindCodelists!.Single().De);
        Assert.AreEqual("Entnahme", editedHydrotest.FlowDirectionCodelists!.Single().De);
        Assert.AreEqual("stationär", editedHydrotest.EvaluationMethodCodelists!.Single().De);
    }

    [TestMethod]
    public async Task EditAsyncInvalidEntityReturnsNotFound()
    {
        var nonExistentHydrotest = new Hydrotest { Id = 678135 };

        var response = await controller.EditAsync(nonExistentHydrotest);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task CreateAndDeleteHydrotestAsync()
    {
        var newHydrotest = new Hydrotest
        {
            Type = ObservationType.Hydrotest,
            StartTime = new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime(),
            EndTime = new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime(),
            Duration = 118,
            FromDepthM = 17.532,
            ToDepthM = 702.12,
            FromDepthMasl = 82.714,
            ToDepthMasl = 2633.2,
            IsOpenBorehole = false,
            Comment = "New test comment",
            BoreholeId = 1002431,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 3).Id,
            KindCodelistIds = new List<int>() { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).Id },
            HydrotestResults = new List<HydrotestResult>() { new HydrotestResult { ParameterId = 15203194 } },
        };

        var response = await controller.CreateAsync(newHydrotest);
        ActionResultAssert.IsOkObjectResult<Hydrotest>(response.Result);

        newHydrotest = await context.Hydrotests.FindAsync(newHydrotest.Id);
        Assert.IsNotNull(newHydrotest);
        Assert.AreEqual(newHydrotest.Type, ObservationType.Hydrotest);
        Assert.AreEqual(newHydrotest.StartTime, new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime());
        Assert.AreEqual(newHydrotest.EndTime, new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime());
        Assert.AreEqual(newHydrotest.Duration, 118);
        Assert.AreEqual(newHydrotest.FromDepthM, 17.532);
        Assert.AreEqual(newHydrotest.ToDepthM, 702.12);
        Assert.AreEqual(newHydrotest.FromDepthMasl, 82.714);
        Assert.AreEqual(newHydrotest.ToDepthMasl, 2633.2);
        Assert.AreEqual(newHydrotest.IsOpenBorehole, false);
        Assert.AreEqual(newHydrotest.Comment, "New test comment");
        Assert.AreEqual(newHydrotest.BoreholeId, 1002431);
        Assert.AreEqual(newHydrotest.ReliabilityId, 15203158);
        CollectionAssert.Contains((System.Collections.ICollection)newHydrotest.KindCodelistIds!, 15203171);

        var deleteResponse = await controller.DeleteAsync(newHydrotest.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(newHydrotest.Id);
        ActionResultAssert.IsNotFound(deleteResponse);
    }

    [TestMethod]
    public async Task CreateHydrotestWithSeveralTestKinds()
    {
        var newHydrotest = new Hydrotest
        {
            Type = ObservationType.Hydrotest,
            BoreholeId = 1002431,
            KindCodelistIds = new List<int>()
            {
                context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).Id,
                context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 1).Id,
                context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 4).Id,
            },
        };

        var response = await controller.CreateAsync(newHydrotest);
        ActionResultAssert.IsOkObjectResult<Hydrotest>(response.Result);

        var savedHydrotest = context.Hydrotests.SingleOrDefault(w => w.Id == newHydrotest.Id);

        Assert.AreEqual(savedHydrotest.KindCodelists.Count, 3);
        Assert.AreEqual(savedHydrotest.KindCodelists.Single(c => c.Geolcode == 2).De, context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).De);
    }

    [TestMethod]
    public async Task CreateHydrotestWithIncompatibleFlowDirectionAndEvaluationMethod()
    {
        var newHydrotest = new Hydrotest
        {
            Type = ObservationType.Hydrotest,
            KindCodelistIds = new List<int>() { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).Id },
            FlowDirectionCodelistIds = new List<int>() { 23, 24 },
            EvaluationMethodCodelistIds = new List<int>() { 74 },
        };

        var createResponse = await controller.CreateAsync(newHydrotest);
        ActionResultAssert.IsBadRequest(createResponse.Result);
    }

    [TestMethod]
    public async Task CreateHydrotestWithIncompatibleTestKind()
    {
        var newHydrotest = new Hydrotest
        {
            Type = ObservationType.Hydrotest,
            KindCodelistIds = new List<int>() { 52 },
        };

        var createResponse = await controller.CreateAsync(newHydrotest);
        ActionResultAssert.IsBadRequest(createResponse.Result);
    }

    [TestMethod]
    public async Task CreateHydrotestWithIncompatibleHydrotestResults()
    {
        var newHydrotest = new Hydrotest
        {
            Type = ObservationType.Hydrotest,
            KindCodelistIds = new List<int>() { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).Id },

            HydrotestResults = new List<HydrotestResult>() { new HydrotestResult { ParameterId = 73825 } },
        };

        var createResponse = await controller.CreateAsync(newHydrotest);
        ActionResultAssert.IsBadRequest(createResponse.Result);
    }
}
