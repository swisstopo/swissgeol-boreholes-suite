using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http.Json;
using System.Text.RegularExpressions;

namespace BDMS;

[TestClass]
public class MigrateControllerTest
{
    private BdmsContext context;
    private MigrateController controller;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<HttpMessageHandler> httpMessageHandler;
    private Mock<ILogger<MigrateController>> loggerMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<MigrateController>>();
        httpMessageHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);

        controller = new MigrateController(context, httpClientFactoryMock.Object, loggerMock.Object);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
        httpClientFactoryMock.Verify();
        loggerMock.Verify();
    }

    [TestMethod]
    public async Task RecalculateCoordinates()
    {
        await AssertRecalculateCoordinatesAsync(onlyMissing: false, 8098, () =>
        {
            AssertBohrungJacquelyn30();
            AssertUnchangedBohrungLuciaCrist();
            AssertBohrungJonathonAnderson60();
            AssertBohrungPaulaGulgowski();
        });
    }

    [TestMethod]
    public async Task RecalculateCoordinatesWithMissingDestinationLocationOnly()
    {
        await AssertRecalculateCoordinatesAsync(onlyMissing: true, 1533, () =>
        {
            AssertUnchangedBohrungLuciaCrist();
            AssertBohrungJonathonAnderson60();
            AssertUnchangedBohrungPaulaGulgowski();
        });
    }

    [TestMethod]
    public void GetDecimalPlaces()
    {
        Assert.AreEqual(3, MigrateController.GetDecimalPlaces(1.123));
        Assert.AreEqual(6, MigrateController.GetDecimalPlaces(100.123456));
        Assert.AreEqual(2, MigrateController.GetDecimalPlaces(1.01));
        Assert.AreEqual(0, MigrateController.GetDecimalPlaces(100));
    }

    private async Task AssertRecalculateCoordinatesAsync(bool onlyMissing, int transformedCoordinatesCount, Action asserter = default)
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

        var result = await controller.RecalculateCoordinates(dryRun: true, onlyMissing: onlyMissing).ConfigureAwait(false) as JsonResult;

        asserter?.Invoke();
        Assert.AreEqual($"{{ transformedCoordinates = {transformedCoordinatesCount}, onlyMissing = {onlyMissing}, dryRun = True, success = True }}", result.Value.ToString());

        // Verify API calls count.
        httpMessageHandler.Protected()
            .Verify("SendAsync", Times.Exactly(transformedCoordinatesCount), ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>());
    }

    private void AssertBohrungJacquelyn30()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000006);
        Assert.AreEqual("Laurence.Padberg3", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(2626103.1988343936, bohrung.LocationX);
        Assert.AreEqual(1125366.3469565178, bohrung.LocationY);
        Assert.AreEqual("POINT (2626103.1988343936 1125366.3469565178)", bohrung.Geometry.ToString());
        Assert.AreEqual(9876.5435435435, bohrung.LocationXLV03);
        Assert.AreEqual(1234.5623562356, bohrung.LocationYLV03);
    }

    private void AssertUnchangedBohrungLuciaCrist()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000014);
        Assert.AreEqual("Brendan.Trantow38", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV03, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(2622479.1608037096, bohrung.LocationX);
        Assert.AreEqual(1099464.3374982823, bohrung.LocationY);
        Assert.AreEqual("POINT (2761165 1074306)", bohrung.Geometry.ToString());
        Assert.AreEqual(null, bohrung.LocationXLV03);
        Assert.AreEqual(224735.18581408318, bohrung.LocationYLV03);
    }

    private void AssertBohrungJonathonAnderson60()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000005);
        Assert.AreEqual("Sherri.Goodwin99", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(2582431.203588229, bohrung.LocationX);
        Assert.AreEqual(1189604.098138797, bohrung.LocationY);
        Assert.AreEqual("POINT (2582431.2035882291 1189604.0981387971)", bohrung.Geometry.ToString());
        Assert.AreEqual(9876.543543544, bohrung.LocationXLV03);
        Assert.AreEqual(1234.562356236, bohrung.LocationYLV03);
    }

    private void AssertBohrungPaulaGulgowski()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000023);
        Assert.AreEqual("Floyd29", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV03, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(9877, bohrung.LocationX);
        Assert.AreEqual(1235, bohrung.LocationY);
        Assert.AreEqual("POINT (9877 1235)", bohrung.Geometry.ToString());
        Assert.AreEqual(655269, bohrung.LocationXLV03);
        Assert.AreEqual(297874, bohrung.LocationYLV03);
    }

    private void AssertUnchangedBohrungPaulaGulgowski()
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000023);
        Assert.AreEqual("Floyd29", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV03, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(2662527, bohrung.LocationX);
        Assert.AreEqual(1253325, bohrung.LocationY);
        Assert.AreEqual("POINT (2593699 1100228)", bohrung.Geometry.ToString());
        Assert.AreEqual(655269, bohrung.LocationXLV03);
        Assert.AreEqual(297874, bohrung.LocationYLV03);
    }
}
