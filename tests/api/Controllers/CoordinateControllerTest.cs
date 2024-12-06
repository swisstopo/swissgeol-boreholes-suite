using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;

namespace BDMS.Controllers;

[TestClass]
public class CoordinateControllerTest
{
    private const int LV95BoreholeWithAllCoordinatesSetId = 2_000_000;
    private const int LV95BoreholeWithMissingDestCoordinatesId = 2_000_001;
    private const int LV03BoreholeWithAllCoordinatesSetId = 2_000_002;
    private const int LV03BoreholeWithMissingSourceCoordinatesId = 2_000_003;

    private BdmsContext context;
    private CoordinateController controller;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<HttpMessageHandler> httpMessageHandler;
    private Mock<ILogger<CoordinateController>> loggerMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<CoordinateController>>();
        httpMessageHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);

        var loggerCoordinateServiceMock = new Mock<ILogger<CoordinateService>>(MockBehavior.Strict);
        var coordinateService = new CoordinateService(loggerCoordinateServiceMock.Object, httpClientFactoryMock.Object);

        controller = new CoordinateController(context, loggerMock.Object, coordinateService);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
        httpClientFactoryMock.Verify();
        loggerMock.Verify();
    }

    [TestMethod]
    public async Task MigrateCoordinates()
    {
        Borehole? lV95BoreholeWithAllCoordinatesSet = null;
        Borehole? lV95BoreholeWithMissingDestCoordinates = null;
        Borehole? lV03BoreholeWithAllCoordinatesSet = null;
        Borehole? lV03BoreholeWithMissingSourceCoordinates = null;

        lV95BoreholeWithAllCoordinatesSet = CreateLV95BoreholeWithAllCoordinatesSet();
        lV95BoreholeWithMissingDestCoordinates = CreateLV95BoreholeWithMissingDestCoordinates();
        lV03BoreholeWithAllCoordinatesSet = CreateLV03BoreholeWithAllCoordinatesSet();
        lV03BoreholeWithMissingSourceCoordinates = CreateLV03BoreholeWithMissingSourceCoordinates();

        // Count all boreholes with set source location
        var boreholesWithSetSourceCoordinates = context.Boreholes.Where(b =>
            (b.OriginalReferenceSystem == ReferenceSystem.LV95 && b.LocationX != null && b.LocationY != null) ||
            (b.OriginalReferenceSystem == ReferenceSystem.LV03 && b.LocationXLV03 != null && b.LocationYLV03 != null)).Count();

        await AssertMigrateCoordinatesAsync(onlyMissing: false, boreholesWithSetSourceCoordinates, 3004, () =>
        {
            AssertLV95BoreholeWithAllCoordinatesSet(lV95BoreholeWithAllCoordinatesSet);
            AssertLV95BoreholeWithMissingDestCoordinates(lV95BoreholeWithMissingDestCoordinates);
            AssertLV03BoreholeWithAllCoordinatesSet(lV03BoreholeWithAllCoordinatesSet);
            AssertUnchanged(lV03BoreholeWithMissingSourceCoordinates);
        });
    }

    [TestMethod]
    public async Task MigrateCoordinatesWithMissingDestinationLocationOnly()
    {
        Borehole? lV95BoreholeWithAllCoordinatesSet = null;
        Borehole? lV95BoreholeWithMissingDestCoordinates = null;
        Borehole? lV03BoreholeWithAllCoordinatesSet = null;
        Borehole? lV03BoreholeWithMissingSourceCoordinates = null;

        lV95BoreholeWithAllCoordinatesSet = CreateLV95BoreholeWithAllCoordinatesSet();
        lV95BoreholeWithMissingDestCoordinates = CreateLV95BoreholeWithMissingDestCoordinates();
        lV03BoreholeWithAllCoordinatesSet = CreateLV03BoreholeWithAllCoordinatesSet();
        lV03BoreholeWithMissingSourceCoordinates = CreateLV03BoreholeWithMissingSourceCoordinates();

        // Count all boreholes with set source location and missing destination location
        var boreholesWithMissingSourceCoordinates = context.Boreholes.Where(b =>
            (b.OriginalReferenceSystem == ReferenceSystem.LV95 &&
                b.LocationX != null && b.LocationY != null &&
                (b.LocationXLV03 == null || b.LocationYLV03 == null))
                ||
            (b.OriginalReferenceSystem == ReferenceSystem.LV03 &&
                b.LocationXLV03 != null && b.LocationYLV03 != null &&
                (b.LocationX == null || b.LocationY == null)))
            .Count();

        await AssertMigrateCoordinatesAsync(onlyMissing: true, boreholesWithMissingSourceCoordinates, 3004, () =>
        {
            AssertUnchanged(lV95BoreholeWithAllCoordinatesSet);
            AssertLV95BoreholeWithMissingDestCoordinates(lV95BoreholeWithMissingDestCoordinates);
            AssertUnchanged(lV03BoreholeWithAllCoordinatesSet);
            AssertUnchanged(lV03BoreholeWithMissingSourceCoordinates);
        });
    }

    private async Task AssertMigrateCoordinatesAsync(bool onlyMissing, int transformedCoordinatesCount, int expectedTotalBoreholeCount, Action asserter = default)
    {
        Assert.AreEqual(expectedTotalBoreholeCount, context.Boreholes.Count());

        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(() => new HttpClient(httpMessageHandler.Object)).Verifiable();

        var jsonContent = () => JsonContent.Create(new { easting = "9876.543543543543543", northing = "1234.56235623562356235623" });
        httpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(m => Regex.IsMatch(m.RequestUri.AbsoluteUri, "easting=\\d{1,}\\.?\\d*&northing=\\d{1,}\\.?\\d*&format=json$")),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK) { Content = jsonContent() })
            .Verifiable();

        var result = await controller.MigrateAsync(dryRun: true, onlyMissing: onlyMissing).ConfigureAwait(false) as JsonResult;

        asserter?.Invoke();
        Assert.AreEqual($"{{ transformedCoordinates = {transformedCoordinatesCount}, onlyMissing = {onlyMissing}, dryRun = True, success = True }}", result.Value.ToString());

        // Verify API calls count.
        httpMessageHandler.Protected()
            .Verify("SendAsync", Times.Exactly(transformedCoordinatesCount), ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>());
    }

    private Borehole CreateLV95BoreholeWithAllCoordinatesSet()
    {
        var borehole = new Borehole
        {
            Id = LV95BoreholeWithAllCoordinatesSetId,
            LocationX = 2626103.1988343936,
            LocationY = 1125366.3469565178,
            LocationXLV03 = 765875.1615463407,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            Name = "Laurence.Padberg3",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        return borehole;
    }

    private Borehole CreateLV03BoreholeWithAllCoordinatesSet()
    {
        var borehole = new Borehole
        {
            Id = LV95BoreholeWithMissingDestCoordinatesId,
            LocationX = 2662527,
            LocationY = 1253325,
            LocationXLV03 = 655269,
            LocationYLV03 = 297874,
            OriginalReferenceSystem = ReferenceSystem.LV03,
            Name = "Floyd29",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        return borehole;
    }

    private Borehole CreateLV03BoreholeWithMissingSourceCoordinates()
    {
        var borehole = new Borehole
        {
            Id = LV03BoreholeWithAllCoordinatesSetId,
            LocationX = 2622479.1608037096,
            LocationY = 1099464.3374982823,
            LocationXLV03 = null,
            LocationYLV03 = 224735.18581408318,
            OriginalReferenceSystem = ReferenceSystem.LV03,
            Name = "Brendan.Trantow38",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        return borehole;
    }

    private Borehole CreateLV95BoreholeWithMissingDestCoordinates()
    {
        var borehole = new Borehole
        {
            Id = LV03BoreholeWithMissingSourceCoordinatesId,
            LocationX = 2582431.203588229,
            LocationY = 1189604.098138797,
            LocationXLV03 = 523204.9377711746,
            LocationYLV03 = null,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            Name = "Sherri.Goodwin99",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        return borehole;
    }

    private void AssertUnchanged(Borehole initialBohrung)
    {
        var editierteBohrung = context.Boreholes.Single(b => b.Id == initialBohrung.Id);
        Assert.AreEqual(initialBohrung.Name, editierteBohrung.Name);
        Assert.AreEqual(initialBohrung.OriginalReferenceSystem, editierteBohrung.OriginalReferenceSystem);
        Assert.AreEqual(initialBohrung.LocationX, editierteBohrung.LocationX);
        Assert.AreEqual(initialBohrung.LocationY, editierteBohrung.LocationY);

        if (initialBohrung.Geometry == null)
        {
            Assert.IsNull(editierteBohrung.Geometry);
        }
        else
        {
            Assert.AreEqual(initialBohrung.Geometry.ToString(), editierteBohrung.Geometry.ToString());
        }

        Assert.AreEqual(initialBohrung.LocationXLV03, editierteBohrung.LocationXLV03);
        Assert.AreEqual(initialBohrung.LocationYLV03, editierteBohrung.LocationYLV03);
    }

    private void AssertLV95BoreholeWithAllCoordinatesSet(Borehole initialBohrung)
    {
        var editierteBohrung = context.Boreholes.Single(b => b.Id == initialBohrung.Id);
        Assert.AreEqual("Laurence.Padberg3", editierteBohrung.Name);
        Assert.AreEqual(ReferenceSystem.LV95, editierteBohrung.OriginalReferenceSystem);
        Assert.AreEqual(2626103.1988343936, editierteBohrung.LocationX);
        Assert.AreEqual(1125366.3469565178, editierteBohrung.LocationY);
        Assert.AreEqual("POINT (2626103.1988343936 1125366.3469565178)", editierteBohrung.Geometry.ToString());
        Assert.AreEqual(9876.5435435435, editierteBohrung.LocationXLV03);
        Assert.AreEqual(1234.5623562356, editierteBohrung.LocationYLV03);
    }

    private void AssertLV03BoreholeWithAllCoordinatesSet(Borehole initialBohrung)
    {
        var editierteBohrung = context.Boreholes.Single(b => b.Id == initialBohrung.Id);
        Assert.AreEqual("Floyd29", editierteBohrung.Name);
        Assert.AreEqual(ReferenceSystem.LV03, editierteBohrung.OriginalReferenceSystem);
        Assert.AreEqual(9877, editierteBohrung.LocationX);
        Assert.AreEqual(1235, editierteBohrung.LocationY);
        Assert.AreEqual("POINT (9877 1235)", editierteBohrung.Geometry.ToString());
        Assert.AreEqual(655269, editierteBohrung.LocationXLV03);
        Assert.AreEqual(297874, editierteBohrung.LocationYLV03);
    }

    private void AssertLV95BoreholeWithMissingDestCoordinates(Borehole initialBohrung)
    {
        var editierteBohrung = context.Boreholes.Single(b => b.Id == initialBohrung.Id);
        Assert.AreEqual("Sherri.Goodwin99", editierteBohrung.Name);
        Assert.AreEqual(ReferenceSystem.LV95, editierteBohrung.OriginalReferenceSystem);
        Assert.AreEqual(2582431.203588229, editierteBohrung.LocationX);
        Assert.AreEqual(1189604.098138797, editierteBohrung.LocationY);
        Assert.AreEqual("POINT (2582431.203588229 1189604.098138797)", editierteBohrung.Geometry.ToString());
        Assert.AreEqual(9876.543543544, editierteBohrung.LocationXLV03);
        Assert.AreEqual(1234.562356236, editierteBohrung.LocationYLV03);
    }
}
