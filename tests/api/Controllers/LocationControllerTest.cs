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
public class LocationControllerTest
{
    private const int BoreholeWithAllLocationAttributesId = 2_000_000;

    private BdmsContext context;
    private LocationController controller;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<ILogger<LocationController>> loggerMock;
    private Mock<ILogger<LocationService>> loggerLocationServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<LocationController>>();
        loggerLocationServiceMock = new Mock<ILogger<LocationService>>(MockBehavior.Strict);
        var service = new LocationService(loggerLocationServiceMock.Object, httpClientFactoryMock.Object);

        controller = new LocationController(context, loggerMock.Object, service);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
        httpClientFactoryMock.Verify();
        loggerMock.Verify();
    }

    [TestMethod]
    public async Task MigrateLocations()
    {
        Borehole? boreholeWithAllLocationAttributes = null;
        Borehole? boreholeWithMissingLocationAttributes = null;
        Borehole? boreholeWithMissingSourceCoordinates = null;

        boreholeWithAllLocationAttributes = CreateBoreholeWithAllLocationAttributes();
        boreholeWithMissingLocationAttributes = CreateBoreholeWithMissingLocationAttributes();
        boreholeWithMissingSourceCoordinates = CreateBoreholeWithMissingSourceCoordinates();

        // Count all boreholes with set source location
        var boreholesWithSetSourceCoordinates = context.Boreholes.Where(b =>
            (b.OriginalReferenceSystem == ReferenceSystem.LV95 && b.LocationX != null && b.LocationY != null) ||
            (b.OriginalReferenceSystem == ReferenceSystem.LV03 && b.LocationXLV03 != null && b.LocationYLV03 != null)).Count();

        await AssertMigrateLocationAsync(onlyMissing: false, boreholesWithSetSourceCoordinates, 3003, () =>
        {
            AssertBoreholeWithAllLocationAttributes(boreholeWithAllLocationAttributes);
            AssertBoreholeWithMissingLocationAttributes(boreholeWithMissingLocationAttributes);
            AssertUnchanged(boreholeWithMissingSourceCoordinates);
        });
    }

    [TestMethod]
    public async Task MigrateLocationsWithMissingLocationsOnly()
    {
        Borehole? boreholeWithAllLocationAttributes = null;
        Borehole? boreholeWithMissingLocationAttributes = null;
        Borehole? boreholeWithMissingSourceCoordinates = null;

        boreholeWithAllLocationAttributes = CreateBoreholeWithAllLocationAttributes();
        boreholeWithMissingLocationAttributes = CreateBoreholeWithMissingLocationAttributes();
        boreholeWithMissingSourceCoordinates = CreateBoreholeWithMissingSourceCoordinates();

        // Count all boreholes with set source coordinates and missing location attributes
        var boreholesWithMissingLocationAttributes = context.Boreholes.Where(b =>
            ((b.OriginalReferenceSystem == ReferenceSystem.LV95 && b.LocationX != null && b.LocationY != null) ||
            (b.OriginalReferenceSystem == ReferenceSystem.LV03 && b.LocationXLV03 != null && b.LocationYLV03 != null))
            &&
            (string.IsNullOrWhiteSpace(b.Country) || string.IsNullOrWhiteSpace(b.Canton) || string.IsNullOrWhiteSpace(b.Municipality)))
            .Count();

        await AssertMigrateLocationAsync(onlyMissing: true, boreholesWithMissingLocationAttributes, 3003, () =>
        {
            AssertUnchanged(boreholeWithAllLocationAttributes);
            AssertBoreholeWithMissingLocationAttributes(boreholeWithMissingLocationAttributes);
            AssertUnchanged(boreholeWithMissingSourceCoordinates);
        });
    }

    private async Task AssertMigrateLocationAsync(bool onlyMissing, int updatedBoreholesCount, int expectedTotalBoreholeCount, Action asserter = default)
    {
        Assert.AreEqual(expectedTotalBoreholeCount, context.Boreholes.Count());

        var jsonResponse = () => JsonContent.Create(new
        {
            results = new[]
                {
                new { layerBodId = "ch.swisstopo.swissboundaries3d-land-flaeche.fill", attributes = new { bez = "RAGETRINITY", name = string.Empty, gemname = string.Empty } },
                new { layerBodId = "ch.swisstopo.swissboundaries3d-kanton-flaeche.fill", attributes = new { bez = string.Empty, name = "SLEEPYMONKEY", gemname = string.Empty } },
                new { layerBodId = "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill", attributes = new { bez = string.Empty, name = string.Empty, gemname = "REDSOURCE" } },
                },
        });

        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(() =>
        {
            var httpMessageHandler = new Mock<HttpMessageHandler>();
            httpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(m => Regex.IsMatch(m.RequestUri.AbsoluteUri, "\\d{1,}\\.?\\d*,\\d{1,}\\.?\\d*.*&sr=\\d{4,}$")),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK) { Content = jsonResponse() })
                .Verifiable();
            return new HttpClient(httpMessageHandler.Object);
        }).Verifiable();

        var result = await controller.MigrateAsync(dryRun: true, onlyMissing: onlyMissing).ConfigureAwait(false) as JsonResult;

        asserter?.Invoke();
        Assert.AreEqual($"{{ updatedBoreholes = {updatedBoreholesCount}, onlyMissing = {onlyMissing}, dryRun = True, success = True }}", result.Value.ToString());
    }

    private Borehole CreateBoreholeWithAllLocationAttributes()
    {
        var borehole = new Borehole
        {
            Id = BoreholeWithAllLocationAttributesId,
            LocationX = 2626103.1988343936,
            LocationY = 1125366.3469565178,
            LocationXLV03 = null,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            AlternateName = "Byron_West",
            Country = "Northern Mariana Islands",
            Canton = "South Dakota",
            Municipality = "Lake Chayamouth",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        return borehole;
    }

    private Borehole CreateBoreholeWithMissingLocationAttributes()
    {
        var borehole = new Borehole
        {
            Id = 2_000_001,
            LocationX = 2626103.1988343936,
            LocationY = 1125366.3469565178,
            LocationXLV03 = 741929.5530394556,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            AlternateName = "Andy.Lang",
            Country = null,
            Canton = "South Dakota",
            Municipality = "Lake Chayamouth",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        return borehole;
    }

    private Borehole CreateBoreholeWithMissingSourceCoordinates()
    {
        var borehole = new Borehole
        {
            Id = 2_000_002,
            LocationX = null,
            LocationY = 1125366.3469565178,
            LocationXLV03 = 741929.5530394556,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            AlternateName = "Tasha.Walsh",
            Country = "British Indian Ocean Territory (Chagos Archipelago)",
            Canton = "South Dakota",
            Municipality = "Lake Chayamouth",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        return borehole;
    }

    private void AssertUnchanged(Borehole initialBohrung)
    {
        var editierteBohrung = context.Boreholes.Single(b => b.Id == initialBohrung.Id);
        Assert.AreEqual(initialBohrung.AlternateName, editierteBohrung.AlternateName);
        Assert.AreEqual(initialBohrung.OriginalReferenceSystem, editierteBohrung.OriginalReferenceSystem);
        Assert.AreEqual(initialBohrung.LocationX, editierteBohrung.LocationX);
        Assert.AreEqual(initialBohrung.LocationY, editierteBohrung.LocationY);
        Assert.AreEqual(initialBohrung.LocationXLV03, editierteBohrung.LocationXLV03);
        Assert.AreEqual(initialBohrung.Country, editierteBohrung.Country);
        Assert.AreEqual(initialBohrung.Canton, editierteBohrung.Canton);
        Assert.AreEqual(initialBohrung.Municipality, editierteBohrung.Municipality);
    }

    private void AssertBoreholeWithAllLocationAttributes(Borehole initialBohrung)
    {
        var editierteBohrung = context.Boreholes.Single(b => b.Id == initialBohrung.Id);
        Assert.AreEqual("Byron_West", editierteBohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, editierteBohrung.OriginalReferenceSystem);
        Assert.AreEqual("RAGETRINITY", editierteBohrung.Country);
        Assert.AreEqual("SLEEPYMONKEY", editierteBohrung.Canton);
        Assert.AreEqual("REDSOURCE", editierteBohrung.Municipality);
    }

    private void AssertBoreholeWithMissingLocationAttributes(Borehole initialBohrung)
    {
        var editierteBohrung = context.Boreholes.Single(b => b.Id == initialBohrung.Id);
        Assert.AreEqual("Andy.Lang", editierteBohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, editierteBohrung.OriginalReferenceSystem);
        Assert.AreEqual("RAGETRINITY", editierteBohrung.Country);
        Assert.AreEqual("SLEEPYMONKEY", editierteBohrung.Canton);
        Assert.AreEqual("REDSOURCE", editierteBohrung.Municipality);
    }
}
