using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;

namespace BDMS;

[TestClass]
public class LocationControllerTest
{
    private BdmsContext context;
    private LocationController controller;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<HttpMessageHandler> httpMessageHandler;
    private Mock<ILogger<LocationController>> loggerMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<LocationController>>();
        httpMessageHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);

        controller = new LocationController(context, httpClientFactoryMock.Object, loggerMock.Object);
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
        await AssertMigrateLocationAsync(onlyMissing: false, 8098, () =>
        {
            AssertBohrungAndyLang();
            AssertBohrungByronWest();
            AssertUnchangedBohrungTashaWalsh();
        });
    }

    [TestMethod]
    public async Task MigrateLocationsWithMissingLocationsOnly()
    {
        await AssertMigrateLocationAsync(onlyMissing: true, 254, () =>
        {
            AssertBohrungAndyLang();
            AssertUnchangedBohrungByronWest();
            AssertUnchangedBohrungTashaWalsh();
        });
    }

    [TestMethod]
    [DataRow(646355.97, 249020.14, "Schweiz", "Aargau", "Aarau")]
    [DataRow(585183.81, 220181.50, "Schweiz", "Bern", "Biel/Bienne")]
    [DataRow(758089.38, 223290.24, "Liechtenstein", null, "Vaduz")]
    [DataRow(685479.15, 240780.15, "Schweiz", "Zürich", "Zürichsee (ZH)")]
    [DataRow(655739.04, 297103.97, null, null, null)] // Schluchsee DE
    [DataRow(0, 0, null, null, null)]
    [DataRow(-1, -2, null, null, null)]
    public async Task IdentifyLv03(double east, double north, string country, string canton, string municipal)
    {
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(new HttpClient()).Verifiable();

        var locationInfo = await controller.IdentifyAsync(east, north, 21781);
        Assert.AreEqual(country, locationInfo.Country);
        Assert.AreEqual(canton, locationInfo.Canton);
        Assert.AreEqual(municipal, locationInfo.Municipality);
    }

    [TestMethod]
    [DataRow(2646356.69, 1249020.29, "Schweiz", "Aargau", "Aarau")]
    [DataRow(2585184.00, 1220182.00, "Schweiz", "Bern", "Biel/Bienne")]
    [DataRow(2758089.99, 1223289.99, "Liechtenstein", null, "Vaduz")]
    [DataRow(2685480.00, 1240779.99, "Schweiz", "Zürich", "Zürichsee (ZH)")]
    [DataRow(2655740.00, 1297103.99, null, null, null)] // Schluchsee DE
    [DataRow(0, 0, null, null, null)]
    [DataRow(-1, -2, null, null, null)]
    public async Task IdentifyLv95(double east, double north, string country, string canton, string municipal)
    {
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(new HttpClient()).Verifiable();

        var locationInfo = await controller.IdentifyAsync(east, north);
        Assert.AreEqual(country, locationInfo.Country);
        Assert.AreEqual(canton, locationInfo.Canton);
        Assert.AreEqual(municipal, locationInfo.Municipality);
    }

    private async Task AssertMigrateLocationAsync(bool onlyMissing, int updatedBoreholesCount, Action asserter = default)
    {
        Assert.AreEqual(10000, context.Boreholes.Count());

        var httpClient = new HttpClient(httpMessageHandler.Object);
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(httpClient).Verifiable();

        var jsonResponse = () => JsonContent.Create(new
        {
            results = new[]
            {
                new { layerBodId = "ch.swisstopo.swissboundaries3d-land-flaeche.fill", attributes = new { bez = "RAGETRINITY", name = string.Empty, gemname = string.Empty } },
                new { layerBodId = "ch.swisstopo.swissboundaries3d-kanton-flaeche.fill", attributes = new { bez = string.Empty, name = "SLEEPYMONKEY", gemname = string.Empty } },
                new { layerBodId = "ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill", attributes = new { bez = string.Empty, name = string.Empty, gemname = "REDSOURCE" } },
            },
        });

        httpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(m => Regex.IsMatch(m.RequestUri.AbsoluteUri, "\\d{1,}\\.?\\d*,\\d{1,}\\.?\\d*.*&sr=\\d{4,}$")),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK) { Content = jsonResponse() })
            .Verifiable();

        var result = await controller.MigrateAsync(dryRun: true, onlyMissing: onlyMissing).ConfigureAwait(false) as JsonResult;

        asserter?.Invoke();
        Assert.AreEqual($"{{ updatedBoreholes = {updatedBoreholesCount}, onlyMissing = {onlyMissing}, dryRun = True, success = True }}", result.Value.ToString());

        // Verify API calls count.
        httpMessageHandler.Protected()
            .Verify("SendAsync", Times.Exactly(updatedBoreholesCount), ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>());
    }

    private void AssertBohrungByronWest()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000039);
        Assert.AreEqual("Byron_West", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual("RAGETRINITY", bohrung.Country);
        Assert.AreEqual("SLEEPYMONKEY", bohrung.Canton);
        Assert.AreEqual("REDSOURCE", bohrung.Municipality);
    }

    private void AssertUnchangedBohrungByronWest()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000039);
        Assert.AreEqual("Byron_West", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual("Northern Mariana Islands", bohrung.Country);
        Assert.AreEqual("South Dakota", bohrung.Canton);
        Assert.AreEqual("Lake Chayamouth", bohrung.Municipality);
    }

    private void AssertUnchangedBohrungTashaWalsh()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000029);
        Assert.AreEqual("Tasha.Walsh", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual("British Indian Ocean Territory (Chagos Archipelago)", bohrung.Country);
        Assert.AreEqual("North Carolina", bohrung.Canton);
        Assert.AreEqual("New Nathen", bohrung.Municipality);
    }

    private void AssertBohrungAndyLang()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000115);
        Assert.AreEqual("Andy.Lang", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual("RAGETRINITY", bohrung.Country);
        Assert.AreEqual("SLEEPYMONKEY", bohrung.Canton);
        Assert.AreEqual("REDSOURCE", bohrung.Municipality);
    }
}
