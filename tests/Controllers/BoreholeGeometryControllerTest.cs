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
    private Mock<IBoreholeLockService> boreholeLockServiceMock;
    private int boreholeIdWithoutGeometry;
    private int boreholeIdWithGeometry;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(false);
        controller = new BoreholeGeometryController(context, new Mock<ILogger<BoreholeGeometry>>().Object, boreholeLockServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };

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
        var geometries = await controller.GetAsync(boreholeIdWithGeometry).ConfigureAwait(false);
        Assert.IsNotNull(geometries);
        Assert.IsTrue(geometries.Count() > 1);
    }

    [TestMethod]
    public void GetGeometryFormats()
    {
        var actualFormats = controller.GeometryFormats();
        Assert.AreEqual(3, actualFormats.Count());
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
        StringAssert.StartsWith(problemDetails.Detail, string.Join(Environment.NewLine,
            [
                "Header with name 'X'[0] was not found.",
                "Header with name 'Y'[0] was not found.",
                "Header with name 'Z'[0] was not found.",
            ]));
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
        StringAssert.StartsWith(problemDetails.Detail, string.Join(Environment.NewLine,
            [
                "The conversion cannot be performed.",
                "    Text: 'NOT A DOUBLE'",
                "    MemberName: Y"
            ]));
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
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(true);

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
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(true);

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
    public void ConvertAzIncToXYZ()
    {
        var azimuthInclinationData = new List<BoreholeGeometryController.AzInc.Geometry>
        {
            new BoreholeGeometryController.AzInc.Geometry
            {
                MeasuredDepth = 3500,
                Azimuth = ToRadians(20),
                Inclination = ToRadians(15),
            },
            new BoreholeGeometryController.AzInc.Geometry
            {
                MeasuredDepth = 3600,
                Azimuth = ToRadians(45),
                Inclination = ToRadians(25),
            },
        };

        var xyzData = BoreholeGeometryController.AzInc.ConvertToXYZ(azimuthInclinationData);

        Assert.AreEqual(2, xyzData.Count);
        Assert.AreEqual(0, xyzData[0].X);
        Assert.AreEqual(0, xyzData[0].Y);
        Assert.AreEqual(0, xyzData[0].Z);
        Assert.AreEqual(19.451, xyzData[1].X, 0.01);
        Assert.AreEqual(27.218, xyzData[1].Y, 0.01);
        Assert.AreEqual(94.012, xyzData[1].Z, 0.01);
    }

    [TestMethod]
    public void ConvertAzIncToXYZDuplicateEntry()
    {
        var azimuthInclinationData = new List<BoreholeGeometryController.AzInc.Geometry>
        {
            new BoreholeGeometryController.AzInc.Geometry
            {
                MeasuredDepth = 3500,
                Azimuth = ToRadians(20),
                Inclination = ToRadians(15),
            },
            new BoreholeGeometryController.AzInc.Geometry
            {
                MeasuredDepth = 3500,
                Azimuth = ToRadians(20),
                Inclination = ToRadians(15),
            },
        };

        var xyzData = BoreholeGeometryController.AzInc.ConvertToXYZ(azimuthInclinationData);

        Assert.AreEqual(2, xyzData.Count);
        Assert.AreEqual(0, xyzData[0].X);
        Assert.AreEqual(0, xyzData[0].Y);
        Assert.AreEqual(0, xyzData[0].Z);
        Assert.AreEqual(0, xyzData[1].X, 0.01);
        Assert.AreEqual(0, xyzData[1].Y, 0.01);
        Assert.AreEqual(0, xyzData[1].Z, 0.01);
    }

    [TestMethod]
    public void ConvertRollPitchYawToAzIncStraightDown()
    {
        var data = new List<BoreholeGeometryController.PitchRoll.Geometry>
        {
            new BoreholeGeometryController.PitchRoll.Geometry
            {
                MeasuredDepth = 1200,
                Roll = ToRadians(0),
                Pitch = ToRadians(0),
                MagneticRotation = ToRadians(0),
            },
        };

        var azIncData = BoreholeGeometryController.PitchRoll.ConvertToAzInc(data);

        Assert.AreEqual(1, azIncData.Count);
        Assert.AreEqual(1200, azIncData[0].MeasuredDepth);
        Assert.AreEqual(0, azIncData[0].Azimuth);
        Assert.AreEqual(0, azIncData[0].Inclination);
    }

    [TestMethod]
    public void ConvertRollPitchYawToAzInc()
    {
        var data = new List<BoreholeGeometryController.PitchRoll.Geometry>
        {
            new BoreholeGeometryController.PitchRoll.Geometry
            {
                MeasuredDepth = 0,
                Roll = ToRadians(-6.3),
                Pitch = ToRadians(8.5),
                MagneticRotation = ToRadians(99.4),
            },
        };

        var azIncData = BoreholeGeometryController.PitchRoll.ConvertToAzInc(data);

        Assert.AreEqual(1, azIncData.Count);
        Assert.AreEqual(0, azIncData[0].MeasuredDepth);
        Assert.AreEqual(ToRadians(136.16), azIncData[0].Azimuth, 1e-4);
        Assert.AreEqual(ToRadians(10.57), azIncData[0].Inclination, 1e-4);
    }

    private double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
}
