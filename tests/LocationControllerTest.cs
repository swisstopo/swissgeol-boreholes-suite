using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS;

[TestClass]
public class LocationControllerTest
{
    private LocationController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        controller = new LocationController(new HttpClient());
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
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
        var response = await controller.IdentifyAsync(east, north, 21781);
        var okResult = response.Result as OkObjectResult;
        var result = okResult.Value as LocationInfo;
        Assert.IsNotNull(result);
        Assert.AreEqual(country, result.Country);
        Assert.AreEqual(canton, result.Canton);
        Assert.AreEqual(municipal, result.Municipality);
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
        var response = await controller.IdentifyAsync(east, north);
        var okResult = response.Result as OkObjectResult;
        var result = okResult.Value as LocationInfo;
        Assert.IsNotNull(result);
        Assert.AreEqual(country, result.Country);
        Assert.AreEqual(canton, result.Canton);
        Assert.AreEqual(municipal, result.Municipality);
    }
}
