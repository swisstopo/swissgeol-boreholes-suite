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
public class CoordinateControllerTest
{
    private BdmsContext context;
    private CoordinateController controller;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<HttpMessageHandler> httpMessageHandler;
    private Mock<ILogger<CoordinateController>> loggerMock;

    private int boreholeCount;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<CoordinateController>>();
        httpMessageHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);

        controller = new CoordinateController(context, httpClientFactoryMock.Object, loggerMock.Object);

        boreholeCount = context.Boreholes.Count();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Assert.AreEqual(boreholeCount, context.Boreholes.Count(), "Tests need to remove boreholes, they created.");

        await context.DisposeAsync();
        httpClientFactoryMock.Verify();
        loggerMock.Verify();
    }

    [TestMethod]
    public async Task MigrateCoordinates()
    {
        Borehole? boreholeLV95BoreholeWithAllCoordinatesSet = null;
        Borehole? boreholeLV95BoreholeWithMissingDestCoordinates = null;
        Borehole? boreholeLV03BoreholeWithAllCoordinatesSet = null;
        Borehole? boreholeLV03BoreholeWithMissingSourceCoordinates = null;

        try
        {
            EnsureContextHasNoChanges();
            boreholeLV95BoreholeWithAllCoordinatesSet = CreateLV95BoreholeWithAllCoordinatesSet();
            boreholeLV95BoreholeWithMissingDestCoordinates = CreateLV95BoreholeWithMissingDestCoordinates();
            boreholeLV03BoreholeWithAllCoordinatesSet = CreateLV03BoreholeWithAllCoordinatesSett();
            boreholeLV03BoreholeWithMissingSourceCoordinates = CreateLV03BoreholeWithMissingSourceCoordinates();

            // Count all boreholes with set source location
            var boreholesWithSetSourceCoordinates = context.Boreholes.Where(b =>
                (b.OriginalReferenceSystem == ReferenceSystem.LV95 && (b.LocationX != null && b.LocationY != null)) ||
                (b.OriginalReferenceSystem == ReferenceSystem.LV03 && (b.LocationXLV03 != null && b.LocationYLV03 != null))).Count();

            await AssertMigrateCoordinatesAsync(onlyMissing: false, boreholesWithSetSourceCoordinates, 10004, () =>
            {
                AssertLV95BoreholeWithAllCoordinatesSet(boreholeLV95BoreholeWithAllCoordinatesSet);
                AssertLV95BoreholeWithMissingDestCoordinates(boreholeLV95BoreholeWithMissingDestCoordinates);
                AssertLV03BoreholeWithAllCoordinatesSet(boreholeLV03BoreholeWithAllCoordinatesSet);
                AssertUnchanged(boreholeLV03BoreholeWithMissingSourceCoordinates);
            });
        }
        finally
        {
            EnsureContextHasNoChanges();
            context.RemoveBoreholeFromContext(boreholeLV95BoreholeWithAllCoordinatesSet);
            context.RemoveBoreholeFromContext(boreholeLV95BoreholeWithMissingDestCoordinates);
            context.RemoveBoreholeFromContext(boreholeLV03BoreholeWithAllCoordinatesSet);
            context.RemoveBoreholeFromContext(boreholeLV03BoreholeWithMissingSourceCoordinates);
        }
    }

    [TestMethod]
    public async Task MigrateCoordinatesWithMissingDestinationLocationOnly()
    {
        Borehole? boreholeLV95BoreholeWithAllCoordinatesSet = null;
        Borehole? boreholeLV95BoreholeWithMissingDestCoordinates = null;
        Borehole? boreholeLV03BoreholeWithAllCoordinatesSet = null;
        Borehole? boreholeLV03BoreholeWithMissingSourceCoordinates = null;

        try
        {
            context.ResetChangesInContext();
            boreholeLV95BoreholeWithAllCoordinatesSet = CreateLV95BoreholeWithAllCoordinatesSet();
            boreholeLV95BoreholeWithMissingDestCoordinates = CreateLV95BoreholeWithMissingDestCoordinates();
            boreholeLV03BoreholeWithAllCoordinatesSet = CreateLV03BoreholeWithAllCoordinatesSett();
            boreholeLV03BoreholeWithMissingSourceCoordinates = CreateLV03BoreholeWithMissingSourceCoordinates();

            // Count all boreholes with set source location and missing destination location
            var boreholesWithMissingSourceCoordinates = context.Boreholes.Where(b =>
                (b.OriginalReferenceSystem == ReferenceSystem.LV95 &&
                    (b.LocationX != null && b.LocationY != null) &&
                    (b.LocationXLV03 == null || b.LocationYLV03 == null))
                    ||
                (b.OriginalReferenceSystem == ReferenceSystem.LV03 &&
                    (b.LocationXLV03 != null && b.LocationYLV03 != null) &&
                    (b.LocationX == null || b.LocationY == null)))
                .Count();

            await AssertMigrateCoordinatesAsync(onlyMissing: true, boreholesWithMissingSourceCoordinates, 10004, () =>
            {
                AssertUnchanged(boreholeLV95BoreholeWithAllCoordinatesSet);
                AssertLV95BoreholeWithMissingDestCoordinates(boreholeLV95BoreholeWithMissingDestCoordinates);
                AssertUnchanged(boreholeLV03BoreholeWithAllCoordinatesSet);
                AssertUnchanged(boreholeLV03BoreholeWithMissingSourceCoordinates);
            });
        }
        finally
        {
            context.ResetChangesInContext();
            context.RemoveBoreholeFromContext(boreholeLV95BoreholeWithAllCoordinatesSet);
            context.RemoveBoreholeFromContext(boreholeLV95BoreholeWithMissingDestCoordinates);
            context.RemoveBoreholeFromContext(boreholeLV03BoreholeWithAllCoordinatesSet);
            context.RemoveBoreholeFromContext(boreholeLV03BoreholeWithMissingSourceCoordinates);
        }
    }

    [TestMethod]
    public void GetDecimalPlaces()
    {
        Assert.AreEqual(3, CoordinateController.GetDecimalPlaces(1.123));
        Assert.AreEqual(6, CoordinateController.GetDecimalPlaces(100.123456));
        Assert.AreEqual(2, CoordinateController.GetDecimalPlaces(1.01));
        Assert.AreEqual(0, CoordinateController.GetDecimalPlaces(100));
    }

    private void EnsureContextHasNoChanges()
    {
        var changedEntries = context.ChangeTracker.Entries()
                .Where(x => x.State != EntityState.Unchanged).ToList();

        foreach (var entry in changedEntries)
        {
            switch (entry.State)
            {
                case EntityState.Modified:
                    entry.CurrentValues.SetValues(entry.OriginalValues);
                    entry.State = EntityState.Unchanged;
                    break;
                case EntityState.Added:
                    entry.State = EntityState.Detached;
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Unchanged;
                    break;
            }
        }
    }

    private async Task AssertMigrateCoordinatesAsync(bool onlyMissing, int transformedCoordinatesCount, int expectedTotalBoreholeCount, Action asserter = default)
    {
        Assert.AreEqual(expectedTotalBoreholeCount, context.Boreholes.Count());

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

    private Borehole CreateLV95BoreholeWithAllCoordinatesSet()
    {
        return context.AddNewBoreholeToContext(new Borehole()
        {
            Id = 2_000_000,
            LocationX = 2626103.1988343936,
            LocationY = 1125366.3469565178,
            LocationXLV03 = 765875.1615463407,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            AlternateName = "Laurence.Padberg3",
        });
    }

    private Borehole CreateLV03BoreholeWithAllCoordinatesSett()
    {
        return context.AddNewBoreholeToContext(new Borehole()
        {
            Id = 2_000_001,
            LocationX = 2662527,
            LocationY = 1253325,
            LocationXLV03 = 655269,
            LocationYLV03 = 297874,
            OriginalReferenceSystem = ReferenceSystem.LV03,
            AlternateName = "Floyd29",
        });
    }

    private Borehole CreateLV03BoreholeWithMissingSourceCoordinates()
    {
        return context.AddNewBoreholeToContext(new Borehole()
        {
            Id = 2_000_002,
            LocationX = 2622479.1608037096,
            LocationY = 1099464.3374982823,
            LocationXLV03 = null,
            LocationYLV03 = 224735.18581408318,
            OriginalReferenceSystem = ReferenceSystem.LV03,
            AlternateName = "Brendan.Trantow38",
        });
    }

    private Borehole CreateLV95BoreholeWithMissingDestCoordinates()
    {
        return context.AddNewBoreholeToContext(new Borehole()
        {
            Id = 2_000_003,
            LocationX = 2582431.203588229,
            LocationY = 1189604.098138797,
            LocationXLV03 = 523204.9377711746,
            LocationYLV03 = null,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            AlternateName = "Sherri.Goodwin99",
        });
    }

    private void AssertUnchanged(Borehole initialBohrung)
    {
        var editierteBohrung = context.Boreholes.Single(b => b.Id == initialBohrung.Id);
        Assert.AreEqual(initialBohrung.AlternateName, editierteBohrung.AlternateName);
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
        Assert.AreEqual("Laurence.Padberg3", editierteBohrung.AlternateName);
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
        Assert.AreEqual("Floyd29", editierteBohrung.AlternateName);
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
        Assert.AreEqual("Sherri.Goodwin99", editierteBohrung.AlternateName);
        Assert.AreEqual(ReferenceSystem.LV95, editierteBohrung.OriginalReferenceSystem);
        Assert.AreEqual(2582431.203588229, editierteBohrung.LocationX);
        Assert.AreEqual(1189604.098138797, editierteBohrung.LocationY);
        Assert.AreEqual("POINT (2582431.2035882291 1189604.0981387971)", editierteBohrung.Geometry.ToString());
        Assert.AreEqual(9876.543543544, editierteBohrung.LocationXLV03);
        Assert.AreEqual(1234.562356236, editierteBohrung.LocationYLV03);
    }
}
