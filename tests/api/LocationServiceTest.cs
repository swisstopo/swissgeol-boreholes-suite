using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace BDMS;

[TestClass]
public class LocationServiceTest
{
    private BdmsContext context;
    private LocationService service;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<ILogger<LocationService>> loggerMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<LocationService>>(MockBehavior.Strict);

        service = new LocationService(loggerMock.Object, httpClientFactoryMock.Object);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
        httpClientFactoryMock.Verify();
        loggerMock.Verify();
    }

    [TestMethod]
    [DataRow(646355.97, 249020.14, "Schweiz", "Aargau", "Aarau")]
    [DataRow(585183.81, 220181.50, "Schweiz", "Bern", "Biel (BE)")]
    [DataRow(758089.38, 223290.24, "Liechtenstein", null, "Vaduz")]
    [DataRow(685479.15, 240780.15, "Schweiz", "Zürich", "Zürichsee (ZH)")]
    [DataRow(655739.04, 297103.97, null, null, null)] // Schluchsee DE
    [DataRow(0, 0, null, null, null)]
    [DataRow(-1, -2, null, null, null)]
    public async Task IdentifyLv03(double east, double north, string country, string canton, string municipal)
    {
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(new HttpClient()).Verifiable();

        var locationInfo = await service.IdentifyAsync(east, north, 21781);
        Assert.AreEqual(country, locationInfo.Country);
        Assert.AreEqual(canton, locationInfo.Canton);
        Assert.AreEqual(municipal, locationInfo.Municipality);
    }

    [TestMethod]
    [DataRow(2646356.69, 1249020.29, "Schweiz", "Aargau", "Aarau")]
    [DataRow(2585184.00, 1220182.00, "Schweiz", "Bern", "Biel (BE)")]
    [DataRow(2758089.99, 1223289.99, "Liechtenstein", null, "Vaduz")]
    [DataRow(2685480.00, 1240779.99, "Schweiz", "Zürich", "Zürichsee (ZH)")]
    [DataRow(2655740.00, 1297103.99, null, null, null)] // Schluchsee DE
    [DataRow(0, 0, null, null, null)]
    [DataRow(-1, -2, null, null, null)]
    public async Task IdentifyLv95(double east, double north, string country, string canton, string municipal)
    {
        httpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>())).Returns(new HttpClient()).Verifiable();

        var locationInfo = await service.IdentifyAsync(east, north);
        Assert.AreEqual(country, locationInfo.Country);
        Assert.AreEqual(canton, locationInfo.Canton);
        Assert.AreEqual(municipal, locationInfo.Municipality);
    }
}
