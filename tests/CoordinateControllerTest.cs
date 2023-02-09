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
public class CoordinateControllerTest
{
    private BdmsContext context;
    private CoordinateController controller;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<HttpMessageHandler> httpMessageHandler;
    private Mock<ILogger<CoordinateController>> loggerMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<CoordinateController>>();
        httpMessageHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);

        controller = new CoordinateController(context, httpClientFactoryMock.Object, loggerMock.Object);
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
        await AssertMigrateCoordinatesAsync(onlyMissing: false, 8097, () =>
        {
            AssertBohrungJacquelyn30();
            AssertUnchangedBohrungLuciaCrist();
            AssertBohrungJonathonAnderson60();
            AssertBohrungPaulaGulgowski();
        });
    }

    [TestMethod]
    public async Task MigrateCoordinatesWithMissingDestinationLocationOnly()
    {
        await AssertMigrateCoordinatesAsync(onlyMissing: true, 1527, () =>
        {
            AssertUnchangedBohrungLuciaCrist();
            AssertBohrungJonathonAnderson60();
            AssertUnchangedBohrungPaulaGulgowski();
        });
    }

    [TestMethod]
    public void GetDecimalPlaces()
    {
        Assert.AreEqual(3, CoordinateController.GetDecimalPlaces(1.123));
        Assert.AreEqual(6, CoordinateController.GetDecimalPlaces(100.123456));
        Assert.AreEqual(2, CoordinateController.GetDecimalPlaces(1.01));
        Assert.AreEqual(0, CoordinateController.GetDecimalPlaces(100));
    }

    private async Task AssertMigrateCoordinatesAsync(bool onlyMissing, int transformedCoordinatesCount, Action asserter = default)
    {
        Assert.AreEqual(10000, context.Boreholes.Count());

        var httpClient = new HttpClient(httpMessageHandler.Object);
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(httpClient).Verifiable();

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

    private void AssertBohrungJacquelyn30()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000006);
        Assert.AreEqual("Jacquelyn30", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(2562551.5183428312, bohrung.LocationX);
        Assert.AreEqual(1265907.3354597937, bohrung.LocationY);
        Assert.AreEqual("POINT (2562551.5183428312 1265907.3354597937)", bohrung.Geometry.ToString());
        Assert.AreEqual(9876.5435435435, bohrung.LocationXLV03);
        Assert.AreEqual(1234.5623562356, bohrung.LocationYLV03);
    }

    private void AssertUnchangedBohrungLuciaCrist()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000014);
        Assert.AreEqual("Lucia_Crist", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(2525078.5292495643, bohrung.LocationX);
        Assert.AreEqual(null, bohrung.LocationY);
        Assert.AreEqual("POINT (2761165 1074306)", bohrung.Geometry.ToString());
        Assert.AreEqual(706310.53521463671, bohrung.LocationXLV03);
        Assert.AreEqual(null, bohrung.LocationYLV03);
    }

    private void AssertBohrungJonathonAnderson60()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000005);
        Assert.AreEqual("Jonathon.Anderson60", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(2655485.6419794895, bohrung.LocationX);
        Assert.AreEqual(1098169.2770996222, bohrung.LocationY);
        Assert.AreEqual("POINT (2655485.6419794895 1098169.2770996222)", bohrung.Geometry.ToString());
        Assert.AreEqual(9876.5435435435, bohrung.LocationXLV03);
        Assert.AreEqual(1234.5623562356, bohrung.LocationYLV03);
    }

    private void AssertBohrungPaulaGulgowski()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000023);
        Assert.AreEqual("Paula.Gulgowski87", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV03, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(9877, bohrung.LocationX);
        Assert.AreEqual(1235, bohrung.LocationY);
        Assert.AreEqual("POINT (9877 1235)", bohrung.Geometry.ToString());
        Assert.AreEqual(812122, bohrung.LocationXLV03);
        Assert.AreEqual(213338, bohrung.LocationYLV03);
    }

    private void AssertUnchangedBohrungPaulaGulgowski()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000023);
        Assert.AreEqual("Paula.Gulgowski87", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV03, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(2747672, bohrung.LocationX);
        Assert.AreEqual(1189454, bohrung.LocationY);
        Assert.AreEqual("POINT (2824917 1089615)", bohrung.Geometry.ToString());
        Assert.AreEqual(812122, bohrung.LocationXLV03);
        Assert.AreEqual(213338, bohrung.LocationYLV03);
    }
}
