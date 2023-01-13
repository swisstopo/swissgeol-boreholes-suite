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
        await AssertRecalculateCoordinatesAsync(onlyMissing: false, 8097, context =>
        {
            AssertBohrungJonathonAnderson60(context);
            AssertBohrungPaulaGulgowski(context);
        });
    }

    [TestMethod]
    public async Task RecalculateCoordinatesWithMissingDestinationLocationOnly()
    {
        await AssertRecalculateCoordinatesAsync(onlyMissing: true, 1527, context =>
        {
            AssertBohrungJonathonAnderson60(context);
            AssertUnchangedBohrungPaulaGulgowski(context);
        });
    }

    private async Task AssertRecalculateCoordinatesAsync(bool onlyMissing, int transformedCoordinatesCount, Action<BdmsContext> asserter = default)
    {
        var context = ContextFactory.CreateContext();
        var boreholes = context.Boreholes.ToList();

        try
        {
            Assert.AreEqual(10000, context.Boreholes.Count());

            // Skip boreholes with null coordinates in source reference system for now, because the current code base cannot handle this.
            // This will be fixed at a later commit.
            var boreholesWithNullCoordinates = context.Boreholes
                .Where(b => (b.OriginalReferenceSystem == ReferenceSystem.LV95 && (b.LocationX == null || b.LocationY == null)) ||
                            (b.OriginalReferenceSystem == ReferenceSystem.LV03 && (b.LocationXLV03 == null || b.LocationYLV03 == null)));
            context.RemoveRange(boreholesWithNullCoordinates);
            context.SaveChanges();

            Assert.AreEqual(8097, context.Boreholes.Count());

            var httpClient = new HttpClient(httpMessageHandler.Object);
            httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(httpClient).Verifiable();

            var jsonContent = () => JsonContent.Create(new { easting = "9876.543", northing = "1234.5623" });
            httpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK) { Content = jsonContent() })
                .Verifiable();

            var result = await controller.RecalculateCoordinates(dryRun: false, onlyMissing: onlyMissing).ConfigureAwait(false) as JsonResult;

            asserter?.Invoke(ContextFactory.CreateContext());
            Assert.AreEqual($"{{ transformedCoordinates = {transformedCoordinatesCount}, onlyMissing = {onlyMissing}, dryRun = False, success = True }}", result.Value.ToString());

            // Verify API calls count.
            httpMessageHandler.Protected()
                .Verify("SendAsync", Times.Exactly(transformedCoordinatesCount), ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>());
        }
        finally
        {
            // Reset test data
            context.Database.ExecuteSqlRaw("TRUNCATE bdms.borehole CASCADE;");
            context.Boreholes.AddRange(boreholes);
            context.SaveChanges();
        }
    }

    private static void AssertBohrungJonathonAnderson60(BdmsContext context)
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000005);
        Assert.AreEqual("Jonathon.Anderson60", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(2655485.6419794895, bohrung.LocationX);
        Assert.AreEqual(1098169.2770996222, bohrung.LocationY);
        Assert.AreEqual("POINT (2638753 1181730)", bohrung.Geometry.ToString());
        Assert.AreEqual(9876.543, bohrung.LocationXLV03);
        Assert.AreEqual(1234.5623, bohrung.LocationYLV03);
    }

    private static void AssertBohrungPaulaGulgowski(BdmsContext context)
    {
        var bohrung = context.Boreholes.Single(b => b.Id == 1000023);
        Assert.AreEqual("Paula.Gulgowski87", bohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV03, bohrung.OriginalReferenceSystem);
        Assert.AreEqual(9876.543, bohrung.LocationX);
        Assert.AreEqual(1234.5623, bohrung.LocationY);
        Assert.AreEqual("POINT (9876.543 1234.5623)", bohrung.Geometry.ToString());
        Assert.AreEqual(812122, bohrung.LocationXLV03);
        Assert.AreEqual(213338, bohrung.LocationYLV03);
    }

    private static void AssertUnchangedBohrungPaulaGulgowski(BdmsContext context)
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
