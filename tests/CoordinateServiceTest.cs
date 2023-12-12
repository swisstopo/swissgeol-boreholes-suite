using BDMS.Models;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace BDMS;

[TestClass]
public class CoordinateServiceTest
{
    private const int LV95BoreholeWithAllCoordinatesSetId = 2_000_000;
    private const int LV03BoreholeWithMissingDestCoordinatesId = 2_000_001;
    private const int LV03BoreholeWithMissingSourceCoordinatesId = 2_000_002;

    private BdmsContext context;
    private CoordinateService service;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<ILogger<CoordinateService>> loggerMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<CoordinateService>>(MockBehavior.Strict);

        service = new CoordinateService(loggerMock.Object, httpClientFactoryMock.Object);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
        httpClientFactoryMock.Verify();
        loggerMock.Verify();
    }

    [TestMethod]
    public void GetDecimalPlaces()
    {
        Assert.AreEqual(3, CoordinateService.GetDecimalPlaces(1234567.123));
        Assert.AreEqual(6, CoordinateService.GetDecimalPlaces(100000.123456));
        Assert.AreEqual(2, CoordinateService.GetDecimalPlaces(10000000.01));
        Assert.AreEqual(0, CoordinateService.GetDecimalPlaces(1000000));
    }

    [TestMethod]
    public async Task MigrateCoordinatesOfLV95BoreholeWithAllCoordinatesSet()
    {
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(new HttpClient()).Verifiable();

        var borehole = new Borehole
        {
            Id = LV95BoreholeWithAllCoordinatesSetId,
            LocationX = 2626103.1988343936,
            LocationY = 1125366.3469565178,
            LocationXLV03 = 765875.1615463407,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            AlternateName = "Laurence.Padberg3",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        await service.MigrateCoordinatesOfBorehole(borehole, false);
        context.SaveChanges();

        var result = context.Boreholes.FirstOrDefault(b => b.Id == LV95BoreholeWithAllCoordinatesSetId);
        Assert.AreEqual(ReferenceSystem.LV95, result.OriginalReferenceSystem);
        Assert.AreEqual(2626103.1988343936, result.LocationX);
        Assert.AreEqual(1125366.3469565178, result.LocationY);
        Assert.AreEqual(626103.56923180178, result.LocationXLV03);
        Assert.AreEqual(125366.57802526229, result.LocationYLV03);
    }

    [TestMethod]
    public async Task DoesNotMigrateCoordinatesOfLV95BoreholeWithAllCoordinatesSet()
    {
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(new HttpClient()).Verifiable();

        var borehole = new Borehole
        {
            Id = LV95BoreholeWithAllCoordinatesSetId,
            LocationX = 2626103.1988343936,
            LocationY = 1125366.3469565178,
            LocationXLV03 = 765875.1615463407,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            AlternateName = "Laurence.Padberg3",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        // Only calculate missing values.
        await service.MigrateCoordinatesOfBorehole(borehole, true);
        context.SaveChanges();

        var result = context.Boreholes.FirstOrDefault(b => b.Id == LV95BoreholeWithAllCoordinatesSetId);
        Assert.AreEqual(ReferenceSystem.LV95, result.OriginalReferenceSystem);
        Assert.AreEqual(2626103.1988343936, result.LocationX);
        Assert.AreEqual(1125366.3469565178, result.LocationY);
        Assert.AreEqual(765875.1615463407, result.LocationXLV03);
        Assert.AreEqual(78390.10392298926, result.LocationYLV03);
    }

    [TestMethod]
    public async Task MigrateCoordinatesOfLV03BoreholeWithMissingDestCoordinates()
    {
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(new HttpClient()).Verifiable();

        var borehole = new Borehole
        {
            Id = LV03BoreholeWithMissingDestCoordinatesId,
            LocationX = null,
            LocationY = 1253325,
            LocationXLV03 = 655269,
            LocationYLV03 = 297874,
            OriginalReferenceSystem = ReferenceSystem.LV03,
            AlternateName = "Floyd29",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        await service.MigrateCoordinatesOfBorehole(borehole, false);
        context.SaveChanges();

        var result = context.Boreholes.FirstOrDefault(b => b.Id == LV03BoreholeWithMissingDestCoordinatesId);
        Assert.AreEqual(ReferenceSystem.LV03, result.OriginalReferenceSystem);
        Assert.AreEqual(2655270, result.LocationX);
        Assert.AreEqual(1297874, result.LocationY);
        Assert.AreEqual(655269, result.LocationXLV03);
        Assert.AreEqual(297874, result.LocationYLV03);
    }

    [TestMethod]
    public async Task DoesNotMigrateCoordinatesOfLV03BoreholeWithMissingSourceCoordinates()
    {
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(new HttpClient()).Verifiable();

        var borehole = new Borehole
        {
            Id = LV03BoreholeWithMissingSourceCoordinatesId,
            LocationX = 2622479.1608037096,
            LocationY = 1099464.3374982823,
            LocationXLV03 = null,
            LocationYLV03 = 224735.18581408318,
            OriginalReferenceSystem = ReferenceSystem.LV03,
            AlternateName = "Brendan.Trantow38",
        };
        context.Boreholes.Add(borehole);
        context.SaveChanges();

        await service.MigrateCoordinatesOfBorehole(borehole, false);
        context.SaveChanges();

        var result = context.Boreholes.FirstOrDefault(b => b.Id == LV03BoreholeWithMissingSourceCoordinatesId);
        Assert.AreEqual(ReferenceSystem.LV03, result.OriginalReferenceSystem);
        Assert.AreEqual(2622479.1608037096, result.LocationX);
        Assert.AreEqual(1099464.3374982823, result.LocationY);
        Assert.AreEqual(null, result.LocationXLV03);
        Assert.AreEqual(224735.18581408318, result.LocationYLV03);
    }
}
