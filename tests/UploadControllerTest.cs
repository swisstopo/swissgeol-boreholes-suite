using BDMS.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class UploadControllerTest
{
    private BdmsContext context;
    private UploadController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new UploadController(ContextFactory.CreateContext(), new Mock<ILogger<UploadController>>().Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    [DeploymentItem("testdata.csv")]
    public async Task UploadShouldSaveDataToDatabaseAsync()
    {
        var csvFile = "testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(6, okResult.Value);

        // assert imported values
        var lastAddedBorehole = context.Boreholes.Include(b => b.BoreholeCodelists).OrderBy(b => b.Created).Last();
        Assert.AreEqual(1, lastAddedBorehole.WorkgroupId);
        Assert.AreEqual("Unit_Test_6", lastAddedBorehole.OriginalName);
        Assert.AreEqual(1, lastAddedBorehole.WorkgroupId);
        Assert.AreEqual(null, lastAddedBorehole.IsPublic);
        Assert.AreEqual(new DateOnly(2024, 06, 15), lastAddedBorehole.RestrictionUntil);
        Assert.AreEqual(2474.472693, lastAddedBorehole.TotalDepth);
        Assert.AreEqual(2474.472693, lastAddedBorehole.TotalDepth);
        Assert.AreEqual("Projekt 6", lastAddedBorehole.ProjectName);
        Assert.AreEqual(3, lastAddedBorehole.BoreholeCodelists.Count);
        Assert.AreEqual("Id_16", lastAddedBorehole.BoreholeCodelists.First().Value);
        Assert.AreEqual(100000003, lastAddedBorehole.BoreholeCodelists.First().CodelistId);

        // remove boreholes
        var addedBoreholes = context.Boreholes.OrderBy(b => b.Created).ToList().TakeLast(6);
        context.Boreholes.RemoveRange(addedBoreholes);
        context.SaveChanges();
    }
}
