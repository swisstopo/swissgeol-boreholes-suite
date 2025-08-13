using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[DeploymentItem("TestData")]
[TestClass]
public class BoreholeGeometryControllerTest
{
    private BdmsContext context;
    private BoreholeGeometryController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;
    private int boreholeIdWithoutGeometry;
    private int boreholeIdWithGeometry;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        controller = new BoreholeGeometryController(context, new Mock<ILogger<BoreholeGeometryElement>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };

        boreholeIdWithoutGeometry = context.Boreholes
            .Include(b => b.BoreholeGeometry)
            .Where(b => !b.BoreholeGeometry.Any())
            .Select(b => b.Id)
            .First();

        boreholeIdWithGeometry = context.Boreholes
            .Include(b => b.BoreholeGeometry)
            .Where(b => b.BoreholeGeometry.Count > 1)
            .Select(b => b.Id)
            .First();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        context.BoreholeGeometry.RemoveRange(context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeIdWithoutGeometry));
        await context.SaveChangesAsync();

        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAsyncBoreholeGeometryByBoreholeId()
    {
        var response = await controller.GetAsync(boreholeIdWithGeometry).ConfigureAwait(false);
        Assert.IsInstanceOfType(response, typeof(OkObjectResult));
        var okResult = response as OkObjectResult;
        var geometries = okResult?.Value as IEnumerable<BoreholeGeometryElement>;

        Assert.IsNotNull(geometries);
        Assert.IsTrue(geometries.Count() > 1);
    }

    [TestMethod]
    public void GetGeometryFormats()
    {
        IActionResult response = controller.GeometryFormats();
        ActionResultAssert.IsOk(response);
    }

    [TestMethod]
    public async Task UploadXYZ()
    {
        var xyzData = GetFormFileByExistingFile("geometry_xyz.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithoutGeometry, xyzData, "XYZ").ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        var geometries = context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeIdWithoutGeometry).OrderBy(g => g.Id).ToList();
        Assert.AreEqual(20, geometries.Count());
        Assert.AreEqual(1000, geometries.Last().Z, 1e-6);
        Assert.AreEqual(null, geometries.Last().DEVI);
    }

    [TestMethod]
    public async Task UploadXYZWithAzimuthInclination()
    {
        var xyzData = GetFormFileByExistingFile("geometry_xyz_hazi_devi.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithoutGeometry, xyzData, "XYZ").ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        var geometries = context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeIdWithoutGeometry).OrderBy(g => g.Id).ToList();
        Assert.AreEqual(20, geometries.Count());
        Assert.AreEqual(1000, geometries.Last().Z, 1e-6);
        Assert.AreEqual(90, geometries.Last().DEVI.Value, 1e-6);
    }

    [TestMethod]
    public async Task UploadAzimutzInclination()
    {
        var xyzData = GetFormFileByExistingFile("geometry_azimuth_inclination.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithoutGeometry, xyzData, "AzInc").ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        var geometries = context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeIdWithoutGeometry).OrderBy(g => g.Id).ToList();
        Assert.AreEqual(20, geometries.Count());
        Assert.AreEqual(1500, geometries.Last().Z, 1e-6);
    }

    [TestMethod]
    public async Task UploadPitchRoll()
    {
        var xyzData = GetFormFileByExistingFile("geometry_pitch_roll.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithoutGeometry, xyzData, "PitchRoll").ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        var geometries = context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeIdWithoutGeometry).OrderBy(g => g.Id).ToList();
        Assert.AreEqual(20, geometries.Count());
        Assert.AreEqual(2000, geometries.Last().Z, 1e-6);
    }

    [TestMethod]
    public async Task UploadReplacesGeometry()
    {
        var xyzData = GetFormFileByExistingFile("geometry_xyz.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithGeometry, xyzData, "XYZ").ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        var geometries = context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeIdWithGeometry).OrderBy(g => g.Id).ToList();
        Assert.AreEqual(20, geometries.Count());
        Assert.AreEqual(1000, geometries.Last().Z, 1e-6);
    }

    [TestMethod]
    public async Task UploadOnlyHeaderRow()
    {
        var xyzData = GetFormFileByExistingFile("geometry_xyz_only_header.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithoutGeometry, xyzData, "XYZ").ConfigureAwait(false);
        ActionResultAssert.IsOk(response);
    }

    [TestMethod]
    public async Task UploadMissingHeaderRow()
    {
        var xyzData = GetFormFileByExistingFile("geometry_xyz_missing_header.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithoutGeometry, xyzData, "XYZ").ConfigureAwait(false);

        Assert.IsInstanceOfType(response, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsBadRequest(result);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        StringAssert.StartsWith(
            problemDetails.Detail,
            string.Join(
                Environment.NewLine,
                "Header with name 'MD_m'[0] was not found.",
                "Header with name 'X_m'[0] was not found.",
                "Header with name 'Y_m'[0] was not found.",
                "Header with name 'Z_m'[0] was not found."));
    }

    [TestMethod]
    public async Task UploadInvalidField()
    {
        var xyzData = GetFormFileByExistingFile("geometry_xyz_invalid_data.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithoutGeometry, xyzData, "XYZ").ConfigureAwait(false);

        Assert.IsInstanceOfType(response, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsBadRequest(result);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        StringAssert.StartsWith(
            problemDetails.Detail,
            string.Join(
                Environment.NewLine,
                "The conversion cannot be performed.",
                "    Text: 'NOT A DOUBLE'",
                "    MemberName: Y"));
    }

    [TestMethod]
    public async Task UploadInvalidGeometryFormat()
    {
        var xyzData = GetFormFileByExistingFile("geometry_xyz.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithGeometry, xyzData, "UNKNOWN_FORMAT").ConfigureAwait(false);
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsBadRequest(result);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        StringAssert.StartsWith(problemDetails.Detail, "Invalid geometry format.");
    }

    [TestMethod]
    public async Task UploadGeometryToLockedBorehole()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(false);

        var xyzData = GetFormFileByExistingFile("geometry_xyz.csv");
        IActionResult response = await controller.UploadBoreholeGeometry(boreholeIdWithGeometry, xyzData, "XYZ").ConfigureAwait(false);
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsBadRequest(result);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        StringAssert.StartsWith(problemDetails.Detail, "The borehole is locked by another user or you are missing permissions.");
    }

    [TestMethod]
    public async Task DeleteGeometryOnLockedBorehole()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(false);

        IActionResult response = await controller.DeleteAsync(boreholeIdWithGeometry).ConfigureAwait(false);
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsBadRequest(result);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        StringAssert.StartsWith(problemDetails.Detail, "The borehole is locked by another user or you are missing permissions.");
    }

    [TestMethod]
    public async Task DeleteBoreholeGeometry()
    {
        IActionResult response = await controller.DeleteAsync(boreholeIdWithGeometry).ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        var geometries = context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeIdWithGeometry).OrderBy(g => g.Id).ToList();
        Assert.AreEqual(0, geometries.Count());
    }

    [TestMethod]
    public async Task GetDepthTVDWithNegativeDepthMD()
    {
        IActionResult response = await controller.GetDepthTVD(boreholeIdWithGeometry, -42);
        ActionResultAssert.IsOk(response);
    }

    [TestMethod]
    public async Task GetDepthTVDNoGeometry()
    {
        IActionResult response = await controller.GetDepthTVD(boreholeIdWithoutGeometry, 805.86);
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsOk(result);

        Assert.AreEqual(805.86, result.Value);
    }

    [TestMethod]
    public async Task GetDepthTVDWithDepthMDLargerThanBorehole()
    {
        IActionResult response = await controller.GetDepthTVD(boreholeIdWithGeometry, double.MaxValue);
        ActionResultAssert.IsOk(response);
    }

    [TestMethod]
    public async Task GetDepthTVDWithDepthMDOfZero()
    {
        IActionResult response = await controller.GetDepthTVD(boreholeIdWithGeometry, 0);
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsOk(result);

        Assert.AreEqual(0.0, result.Value);
    }

    [TestMethod]
    public async Task GetDepthInMaslWithGeometryAndPositiveDepthMD()
    {
        var borehole = await context.Boreholes.FindAsync(boreholeIdWithGeometry).ConfigureAwait(false);
        IActionResult response = await controller.GetDepthInMasl(boreholeIdWithGeometry, 102);
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsOk(result);

        var depthInMasl = result.Value as double?;
        Assert.IsNotNull(depthInMasl.Value);
        Assert.IsTrue(depthInMasl.Value < borehole.ReferenceElevation, "Returned depth should be below borehole elevation.");
    }

    [TestMethod]
    public async Task GetDepthInMaslWithGeometryAndNegativeDepthMD()
    {
        IActionResult response = await controller.GetDepthInMasl(boreholeIdWithGeometry, -102);
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsOk(result);
        Assert.IsNull(result.Value);
    }

    [TestMethod]
    public async Task GetDepthInMaslWithNoGeometryAndNegativeDepthMD()
    {
        IActionResult response = await controller.GetDepthInMasl(boreholeIdWithoutGeometry, -102);
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsOk(result);
        Assert.IsNull(result.Value);
    }

    [TestMethod]
    public async Task GetDepthInMaslWithNoGeometryAndPositiveDepthMD()
    {
        // Get borehole without geometry and ensure it has a reference elevation
        var borehole = await context.Boreholes.FindAsync(boreholeIdWithoutGeometry).ConfigureAwait(false);
        borehole.ReferenceElevation = 5000;
        await context.SaveChangesAsync().ConfigureAwait(false);

        IActionResult response = await controller.GetDepthInMasl(boreholeIdWithoutGeometry, 355);
        ObjectResult result = (ObjectResult)response;
        ActionResultAssert.IsOk(result);

        var depthInMasl = result.Value as double?;
        Assert.IsNotNull(depthInMasl.Value);
        Assert.IsTrue(depthInMasl.Value < borehole.ReferenceElevation, "Returned depth should be below borehole elevation.");
    }

    [TestMethod]
    public async Task GetDepthMDFromMaslWithoutPermission()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(false);

        IActionResult response = await controller.GetDepthMDFromMasl(boreholeIdWithGeometry, 102).ConfigureAwait(false);
        Assert.IsInstanceOfType(response, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task GetDepthMDFromMaslWithValidInputs()
    {
        var borehole = await context.Boreholes.FindAsync(boreholeIdWithoutGeometry).ConfigureAwait(false);
        borehole.ReferenceElevation = 500.0;
        await context.SaveChangesAsync().ConfigureAwait(false);

        IActionResult response = await controller.GetDepthMDFromMasl(boreholeIdWithoutGeometry, 450.0).ConfigureAwait(false);

        Assert.IsInstanceOfType(response, typeof(OkObjectResult));
        var result = response as OkObjectResult;
        var depthMD = result?.Value as double?;

        Assert.IsNotNull(depthMD);
        Assert.IsTrue(depthMD > 0, "Measured depth should be positive.");
    }

    [TestMethod]
    public async Task GetDepthMDFromMaslWithNoReferenceElevation()
    {
        var borehole = await context.Boreholes.FindAsync(boreholeIdWithoutGeometry).ConfigureAwait(false);
        borehole.ReferenceElevation = null;
        await context.SaveChangesAsync().ConfigureAwait(false);

        IActionResult response = await controller.GetDepthMDFromMasl(boreholeIdWithoutGeometry, 450.0).ConfigureAwait(false);

        Assert.IsInstanceOfType(response, typeof(OkObjectResult));
        var result = response as OkObjectResult;

        Assert.IsNull(result?.Value, "Result should be null when reference elevation is not set.");
    }

    [TestMethod]
    public async Task GetDepthMDFromMaslWithInvalidDepthMasl()
    {
        var borehole = await context.Boreholes.FindAsync(boreholeIdWithGeometry).ConfigureAwait(false);
        borehole.ReferenceElevation = 500.0;
        await context.SaveChangesAsync().ConfigureAwait(false);

        IActionResult response = await controller.GetDepthMDFromMasl(boreholeIdWithGeometry, 600.0).ConfigureAwait(false);

        Assert.IsInstanceOfType(response, typeof(OkObjectResult));
        var result = response as OkObjectResult;

        Assert.IsNull(result?.Value, "Result should be null when depthMasl is greater than reference elevation.");
    }
}
