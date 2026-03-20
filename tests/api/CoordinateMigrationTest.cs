using BDMS.Maintenance;
using BDMS.Models;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;

namespace BDMS;

[TestClass]
public class CoordinateMigrationTest : MaintenanceTaskTestBase
{
    /// <inheritdoc/>
    protected override void ConfigureServices(Mock<IServiceProvider> serviceProviderMock)
    {
        var loggerMock = new Mock<ILogger<CoordinateService>>(MockBehavior.Strict);
        var coordinateService = new CoordinateService(loggerMock.Object, HttpClientFactoryMock.Object);
        serviceProviderMock.Setup(sp => sp.GetService(typeof(CoordinateService))).Returns(coordinateService);
    }

    /// <inheritdoc/>
    protected override IEnumerable<IMaintenanceTask> CreateMaintenanceTasks()
        => [new CoordinateMigrationTask()];

    [TestMethod]
    public async Task MigrateCoordinates()
    {
        var lV95BoreholeWithAllCoordinatesSet = CreateLV95BoreholeWithAllCoordinatesSet();
        var lV95BoreholeWithMissingDestCoordinates = CreateLV95BoreholeWithMissingDestCoordinates();
        var lV03BoreholeWithAllCoordinatesSet = CreateLV03BoreholeWithAllCoordinatesSet();
        var lV03BoreholeWithMissingSourceCoordinates = CreateLV03BoreholeWithMissingSourceCoordinates();

        var boreholesWithSetSourceCoordinates = Context.Boreholes.Where(b =>
            (b.OriginalReferenceSystem == ReferenceSystem.LV95 && b.LocationX != null && b.LocationY != null) ||
            (b.OriginalReferenceSystem == ReferenceSystem.LV03 && b.LocationXLV03 != null && b.LocationYLV03 != null)).Count();

        Assert.AreEqual(3004, Context.Boreholes.Count());

        var httpMessageHandler = SetupCoordinateHttpMock();

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.CoordinateMigration, new MaintenanceTaskParameters { OnlyMissing = false, DryRun = true }, AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.CoordinateMigration).ConfigureAwait(false);

        var state = (await Service.GetTaskStatesAsync().ConfigureAwait(false)).Single(s => s.Type == MaintenanceTaskType.CoordinateMigration);
        Assert.AreEqual(MaintenanceTaskStatus.Completed, state.Status);
        Assert.AreEqual(boreholesWithSetSourceCoordinates, state.AffectedCount);

        AssertLV95BoreholeWithAllCoordinatesSet(lV95BoreholeWithAllCoordinatesSet);
        AssertLV95BoreholeWithMissingDestCoordinates(lV95BoreholeWithMissingDestCoordinates);
        AssertLV03BoreholeWithAllCoordinatesSet(lV03BoreholeWithAllCoordinatesSet);
        AssertCoordinateUnchanged(lV03BoreholeWithMissingSourceCoordinates);

        httpMessageHandler.Protected()
            .Verify("SendAsync", Times.Exactly(boreholesWithSetSourceCoordinates), ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>());
    }

    [TestMethod]
    public async Task MigrateCoordinatesWithMissingOnly()
    {
        var lV95BoreholeWithAllCoordinatesSet = CreateLV95BoreholeWithAllCoordinatesSet();
        var lV95BoreholeWithMissingDestCoordinates = CreateLV95BoreholeWithMissingDestCoordinates();
        var lV03BoreholeWithAllCoordinatesSet = CreateLV03BoreholeWithAllCoordinatesSet();
        var lV03BoreholeWithMissingSourceCoordinates = CreateLV03BoreholeWithMissingSourceCoordinates();

        var boreholesWithMissingCoordinates = Context.Boreholes.Where(b =>
            (b.OriginalReferenceSystem == ReferenceSystem.LV95 &&
                b.LocationX != null && b.LocationY != null &&
                (b.LocationXLV03 == null || b.LocationYLV03 == null))
                ||
            (b.OriginalReferenceSystem == ReferenceSystem.LV03 &&
                b.LocationXLV03 != null && b.LocationYLV03 != null &&
                (b.LocationX == null || b.LocationY == null)))
            .Count();

        Assert.AreEqual(3004, Context.Boreholes.Count());

        var httpMessageHandler = SetupCoordinateHttpMock();

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.CoordinateMigration, new MaintenanceTaskParameters { OnlyMissing = true, DryRun = true }, AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.CoordinateMigration).ConfigureAwait(false);

        var state = (await Service.GetTaskStatesAsync().ConfigureAwait(false)).Single(s => s.Type == MaintenanceTaskType.CoordinateMigration);
        Assert.AreEqual(MaintenanceTaskStatus.Completed, state.Status);
        Assert.AreEqual(boreholesWithMissingCoordinates, state.AffectedCount);

        AssertCoordinateUnchanged(lV95BoreholeWithAllCoordinatesSet);
        AssertLV95BoreholeWithMissingDestCoordinates(lV95BoreholeWithMissingDestCoordinates);
        AssertCoordinateUnchanged(lV03BoreholeWithAllCoordinatesSet);
        AssertCoordinateUnchanged(lV03BoreholeWithMissingSourceCoordinates);

        httpMessageHandler.Protected()
            .Verify("SendAsync", Times.Exactly(boreholesWithMissingCoordinates), ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>());
    }

    private Mock<HttpMessageHandler> SetupCoordinateHttpMock()
    {
        var httpMessageHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);
        httpMessageHandler.Protected().Setup("Dispose", ItExpr.IsAny<bool>());
        HttpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(() => new HttpClient(httpMessageHandler.Object)).Verifiable();

        var jsonContent = () => JsonContent.Create(new { easting = "9876.543543543543543", northing = "1234.56235623562356235623" });
        httpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(m => Regex.IsMatch(m.RequestUri!.AbsoluteUri, "easting=\\d{1,}\\.?\\d*&northing=\\d{1,}\\.?\\d*&format=json$")),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK) { Content = jsonContent() })
            .Verifiable();

        return httpMessageHandler;
    }

    private Borehole CreateLV95BoreholeWithAllCoordinatesSet()
    {
        var borehole = new Borehole
        {
            Id = 2_000_000,
            LocationX = 2626103.1988343936,
            LocationY = 1125366.3469565178,
            LocationXLV03 = 765875.1615463407,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            Name = "BLUEGIRAFFE",
        };
        Context.Boreholes.Add(borehole);
        Context.SaveChanges();
        return borehole;
    }

    private Borehole CreateLV03BoreholeWithAllCoordinatesSet()
    {
        var borehole = new Borehole
        {
            Id = 2_000_001,
            LocationX = 2662527,
            LocationY = 1253325,
            LocationXLV03 = 655269,
            LocationYLV03 = 297874,
            OriginalReferenceSystem = ReferenceSystem.LV03,
            Name = "MOONSCALLOP",
        };
        Context.Boreholes.Add(borehole);
        Context.SaveChanges();
        return borehole;
    }

    private Borehole CreateLV03BoreholeWithMissingSourceCoordinates()
    {
        var borehole = new Borehole
        {
            Id = 2_000_002,
            LocationX = 2622479.1608037096,
            LocationY = 1099464.3374982823,
            LocationXLV03 = null,
            LocationYLV03 = 224735.18581408318,
            OriginalReferenceSystem = ReferenceSystem.LV03,
            Name = "TEMPESTFLEA",
        };
        Context.Boreholes.Add(borehole);
        Context.SaveChanges();
        return borehole;
    }

    private Borehole CreateLV95BoreholeWithMissingDestCoordinates()
    {
        var borehole = new Borehole
        {
            Id = 2_000_003,
            LocationX = 2582431.203588229,
            LocationY = 1189604.098138797,
            LocationXLV03 = 523204.9377711746,
            LocationYLV03 = null,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            Name = "RONINFOCUS",
        };
        Context.Boreholes.Add(borehole);
        Context.SaveChanges();
        return borehole;
    }

    private void AssertCoordinateUnchanged(Borehole initialBorehole)
    {
        var borehole = Context.Boreholes.Single(b => b.Id == initialBorehole.Id);
        Assert.AreEqual(initialBorehole.LocationX, borehole.LocationX);
        Assert.AreEqual(initialBorehole.LocationY, borehole.LocationY);
        Assert.AreEqual(initialBorehole.LocationXLV03, borehole.LocationXLV03);
        Assert.AreEqual(initialBorehole.LocationYLV03, borehole.LocationYLV03);
        if (initialBorehole.Geometry == null)
        {
            Assert.IsNull(borehole.Geometry);
        }
        else
        {
            Assert.AreEqual(initialBorehole.Geometry.ToString(), borehole.Geometry!.ToString());
        }
    }

    private void AssertLV95BoreholeWithAllCoordinatesSet(Borehole initialBorehole)
    {
        var borehole = Context.Boreholes.Single(b => b.Id == initialBorehole.Id);
        Assert.AreEqual("BLUEGIRAFFE", borehole.Name);
        Assert.AreEqual(ReferenceSystem.LV95, borehole.OriginalReferenceSystem);
        Assert.AreEqual(2626103.1988343936, borehole.LocationX);
        Assert.AreEqual(1125366.3469565178, borehole.LocationY);
        Assert.AreEqual("POINT (2626103.1988343936 1125366.3469565178)", borehole.Geometry!.ToString());
        Assert.AreEqual(9876.5435435435, borehole.LocationXLV03);
        Assert.AreEqual(1234.5623562356, borehole.LocationYLV03);
    }

    private void AssertLV03BoreholeWithAllCoordinatesSet(Borehole initialBorehole)
    {
        var borehole = Context.Boreholes.Single(b => b.Id == initialBorehole.Id);
        Assert.AreEqual("MOONSCALLOP", borehole.Name);
        Assert.AreEqual(ReferenceSystem.LV03, borehole.OriginalReferenceSystem);
        Assert.AreEqual(9877, borehole.LocationX);
        Assert.AreEqual(1235, borehole.LocationY);
        Assert.AreEqual("POINT (9877 1235)", borehole.Geometry!.ToString());
        Assert.AreEqual(655269, borehole.LocationXLV03);
        Assert.AreEqual(297874, borehole.LocationYLV03);
    }

    private void AssertLV95BoreholeWithMissingDestCoordinates(Borehole initialBorehole)
    {
        var borehole = Context.Boreholes.Single(b => b.Id == initialBorehole.Id);
        Assert.AreEqual("RONINFOCUS", borehole.Name);
        Assert.AreEqual(ReferenceSystem.LV95, borehole.OriginalReferenceSystem);
        Assert.AreEqual(2582431.203588229, borehole.LocationX);
        Assert.AreEqual(1189604.098138797, borehole.LocationY);
        Assert.AreEqual("POINT (2582431.203588229 1189604.098138797)", borehole.Geometry!.ToString());
        Assert.AreEqual(9876.543543544, borehole.LocationXLV03);
        Assert.AreEqual(1234.562356236, borehole.LocationYLV03);
    }
}
