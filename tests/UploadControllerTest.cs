using BDMS.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
    }
}
