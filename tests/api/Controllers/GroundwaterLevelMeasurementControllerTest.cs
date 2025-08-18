using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class GroundwaterLevelMeasurementControllerTest
{
    private BdmsContext context;
    private GroundwaterLevelMeasurementController controller;
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
        controller = new GroundwaterLevelMeasurementController(context, new Mock<ILogger<GroundwaterLevelMeasurementController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAsyncReturnsAllEntities()
    {
        var result = await controller.GetAsync();
        Assert.IsNotNull(result);
        Assert.AreEqual(111, result.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        var response = await controller.GetAsync(94578122).ConfigureAwait(false);
        IEnumerable<GroundwaterLevelMeasurement>? groundwaterLevelMeasurements = response;
        Assert.IsNotNull(groundwaterLevelMeasurements);
        Assert.AreEqual(0, groundwaterLevelMeasurements.Count());
    }

    [TestMethod]
    public async Task GetAsyncFiltersGroundwaterMeasurementBasedOnWorkgroupPermissions()
    {
        // Add a new borehole with groundwatermeasurement and workgroup that is not default
        var newBorehole = new Borehole()
        {
            Name = "Test Borehole",
            WorkgroupId = 4,
        };
        await context.Boreholes.AddAsync(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var newGroundwaterlevelMeasurement = new GroundwaterLevelMeasurement()
        {
            BoreholeId = newBorehole.Id,
            Type = ObservationType.GroundwaterLevelMeasurement,
            KindId = (await context.Codelists.Where(c => c.Schema == HydrogeologySchemas.GroundwaterLevelMeasurementKindSchema).FirstAsync().ConfigureAwait(false)).Id,
        };
        await context.GroundwaterLevelMeasurements.AddAsync(newGroundwaterlevelMeasurement);
        await context.SaveChangesAsync().ConfigureAwait(false);

        IEnumerable<GroundwaterLevelMeasurement>? groundwaterlevelMeasurementForAdmin = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(groundwaterlevelMeasurementForAdmin);
        Assert.AreEqual(112, groundwaterlevelMeasurementForAdmin.Count());

        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);

        IEnumerable<GroundwaterLevelMeasurement>? groundwaterlevelMeasurementForEditor = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(groundwaterlevelMeasurementForEditor);
        Assert.AreEqual(110, groundwaterlevelMeasurementForEditor.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeId()
    {
        var response = await controller.GetAsync(1000098).ConfigureAwait(false);
        IEnumerable<GroundwaterLevelMeasurement>? groundwaterLevelMeasurements = response;
        Assert.IsNotNull(groundwaterLevelMeasurements);
        Assert.AreEqual(2, groundwaterLevelMeasurements.Count());
        var groundwaterLevelMeasurement = groundwaterLevelMeasurements.OrderBy(m => m.Id).First();

        Assert.AreEqual(groundwaterLevelMeasurement.Id, 12000022);
        Assert.AreEqual(groundwaterLevelMeasurement.Type, ObservationType.GroundwaterLevelMeasurement);
        Assert.AreEqual(groundwaterLevelMeasurement.Duration, 1565.7558214230257);
        Assert.AreEqual(groundwaterLevelMeasurement.FromDepthM, 522.32534943443045);
        Assert.AreEqual(groundwaterLevelMeasurement.ToDepthM, 2790.1191959311809);
        Assert.AreEqual(groundwaterLevelMeasurement.FromDepthMasl, 4176.5428856306444);
        Assert.AreEqual(groundwaterLevelMeasurement.ToDepthMasl, 4925.9569437885457);
        Assert.AreEqual(groundwaterLevelMeasurement.IsOpenBorehole, true);
        Assert.AreEqual(groundwaterLevelMeasurement.Comment, "Assumenda cupiditate tenetur natus.");
        Assert.AreEqual(groundwaterLevelMeasurement.ReliabilityId, 15203159);
        Assert.AreEqual(groundwaterLevelMeasurement.KindId, 15203208);
        Assert.AreEqual(groundwaterLevelMeasurement.LevelM, 3418.3947060282317);
        Assert.AreEqual(groundwaterLevelMeasurement.LevelMasl, 158.41585615902014);
    }

    [TestMethod]
    public async Task EditAsyncValidEntityUpdatesEntity()
    {
        var originalGroundwaterLevelMeasurement = new GroundwaterLevelMeasurement
        {
            Id = 1,
            Type = ObservationType.GroundwaterLevelMeasurement,
            StartTime = new DateTime(2006, 8, 21, 11, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2015, 11, 13, 14, 00, 00).ToUniversalTime(),
            Duration = 7909,
            FromDepthM = 67.789,
            ToDepthM = 78.15634,
            FromDepthMasl = 67.112,
            ToDepthMasl = 78.0043,
            IsOpenBorehole = true,
            Comment = "Test comment",
            BoreholeId = 1000595,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 4).Id,
            KindId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.GroundwaterLevelMeasurementKindSchema).Single(c => c.Geolcode == 3).Id,
            LevelM = 0.0,
            LevelMasl = 0.0,
        };

        var updatedGroundwaterLevelMeasurement = new GroundwaterLevelMeasurement
        {
            Id = 1,
            Type = ObservationType.GroundwaterLevelMeasurement,
            StartTime = new DateTime(2021, 12, 30, 21, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2023, 1, 1, 13, 00, 00).ToUniversalTime(),
            Duration = 168,
            FromDepthM = 517.532,
            ToDepthM = 7602.12,
            FromDepthMasl = 828.774,
            ToDepthMasl = 27603.2,
            IsOpenBorehole = true,
            Comment = "Updated test comment",
            BoreholeId = 1000595,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 2).Id,
            KindId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.GroundwaterLevelMeasurementKindSchema).Single(c => c.Geolcode == 1).Id,
            LevelM = 1.1,
            LevelMasl = 1.1,
        };

        context.GroundwaterLevelMeasurements.Add(originalGroundwaterLevelMeasurement);
        await context.SaveChangesAsync();

        var result = await controller.EditAsync(updatedGroundwaterLevelMeasurement);

        Assert.IsNotNull(result);
        ActionResultAssert.IsOk(result.Result);

        var editedGroundwaterLevelMeasurement = context.GroundwaterLevelMeasurements.Single(w => w.Id == 1);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.Id, editedGroundwaterLevelMeasurement.Id);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.Type, editedGroundwaterLevelMeasurement.Type);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.StartTime, editedGroundwaterLevelMeasurement.StartTime);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.EndTime, editedGroundwaterLevelMeasurement.EndTime);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.Duration, editedGroundwaterLevelMeasurement.Duration);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.FromDepthM, editedGroundwaterLevelMeasurement.FromDepthM);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.ToDepthM, editedGroundwaterLevelMeasurement.ToDepthM);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.FromDepthMasl, editedGroundwaterLevelMeasurement.FromDepthMasl);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.ToDepthMasl, editedGroundwaterLevelMeasurement.ToDepthMasl);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.IsOpenBorehole, editedGroundwaterLevelMeasurement.IsOpenBorehole);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.Comment, editedGroundwaterLevelMeasurement.Comment);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.BoreholeId, editedGroundwaterLevelMeasurement.BoreholeId);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.ReliabilityId, editedGroundwaterLevelMeasurement.ReliabilityId);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.KindId, editedGroundwaterLevelMeasurement.KindId);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.LevelM, editedGroundwaterLevelMeasurement.LevelM);
        Assert.AreEqual(updatedGroundwaterLevelMeasurement.LevelMasl, editedGroundwaterLevelMeasurement.LevelMasl);
    }

    [TestMethod]
    public async Task EditAsyncInvalidEntityReturnsNotFound()
    {
        var nonExistentGroundwaterLevelMeasurement = new GroundwaterLevelMeasurement { Id = 2964237 };

        var result = await controller.EditAsync(nonExistentGroundwaterLevelMeasurement);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task CreateAndDeleteGroundwaterLevelMeasurementAsync()
    {
        var newGroundwaterLevelMeasurement = new GroundwaterLevelMeasurement
        {
            Type = ObservationType.GroundwaterLevelMeasurement,
            StartTime = new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime(),
            EndTime = new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime(),
            Duration = 118,
            FromDepthM = 17.532,
            ToDepthM = 702.12,
            FromDepthMasl = 82.714,
            ToDepthMasl = 2633.2,
            IsOpenBorehole = false,
            Comment = "New test comment",
            BoreholeId = 1000595,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 3).Id,
            KindId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.GroundwaterLevelMeasurementKindSchema).Single(c => c.Geolcode == 2).Id,
            LevelM = 348.4563,
            LevelMasl = 9945.15,
        };

        var createResponse = await controller.CreateAsync(newGroundwaterLevelMeasurement);
        ActionResultAssert.IsOk(createResponse.Result);

        newGroundwaterLevelMeasurement = await context.GroundwaterLevelMeasurements.FindAsync(newGroundwaterLevelMeasurement.Id);
        Assert.IsNotNull(newGroundwaterLevelMeasurement);
        Assert.AreEqual(newGroundwaterLevelMeasurement.Type, ObservationType.GroundwaterLevelMeasurement);
        Assert.AreEqual(newGroundwaterLevelMeasurement.StartTime, new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime());
        Assert.AreEqual(newGroundwaterLevelMeasurement.EndTime, new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime());
        Assert.AreEqual(newGroundwaterLevelMeasurement.Duration, 118);
        Assert.AreEqual(newGroundwaterLevelMeasurement.FromDepthM, 17.532);
        Assert.AreEqual(newGroundwaterLevelMeasurement.ToDepthM, 702.12);
        Assert.AreEqual(newGroundwaterLevelMeasurement.FromDepthMasl, 82.714);
        Assert.AreEqual(newGroundwaterLevelMeasurement.ToDepthMasl, 2633.2);
        Assert.AreEqual(newGroundwaterLevelMeasurement.IsOpenBorehole, false);
        Assert.AreEqual(newGroundwaterLevelMeasurement.Comment, "New test comment");
        Assert.AreEqual(newGroundwaterLevelMeasurement.BoreholeId, 1000595);
        Assert.AreEqual(newGroundwaterLevelMeasurement.ReliabilityId, 15203158);
        Assert.AreEqual(newGroundwaterLevelMeasurement.KindId, 15203204);
        Assert.AreEqual(newGroundwaterLevelMeasurement.LevelM, 348.4563);
        Assert.AreEqual(newGroundwaterLevelMeasurement.LevelMasl, 9945.15);

        var deleteResponse = await controller.DeleteAsync(newGroundwaterLevelMeasurement.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(newGroundwaterLevelMeasurement.Id);
        ActionResultAssert.IsNotFound(deleteResponse);
    }
}
