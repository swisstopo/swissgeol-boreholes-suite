using Microsoft.VisualStudio.TestTools.UnitTesting;
using Degrees = NetTopologySuite.Utilities.Degrees;

namespace BDMS.BoreholeGeometry;

[TestClass]
public class AzIncFormatTest
{
    [TestMethod]
    public void ConvertAzIncToXYZ()
    {
        var azimuthInclinationData = new List<AzIncFormat.Geometry>
        {
            new AzIncFormat.Geometry
            {
                MeasuredDepth = 3500,
                AzimuthRad = Degrees.ToRadians(20),
                InclinationRad = Degrees.ToRadians(15),
                Azimuth = 20,
                Inclination = 15,
            },
            new AzIncFormat.Geometry
            {
                MeasuredDepth = 3600,
                AzimuthRad = Degrees.ToRadians(45),
                InclinationRad = Degrees.ToRadians(25),
                Azimuth = 45,
                Inclination = 25,
            },
        };

        var xyzData = AzIncFormat.ConvertToXYZ(azimuthInclinationData);

        Assert.AreEqual(2, xyzData.Count);
        Assert.AreEqual(0, xyzData[0].X);
        Assert.AreEqual(0, xyzData[0].Y);
        Assert.AreEqual(0, xyzData[0].Z);
        Assert.AreEqual(3500, xyzData[0].MeasuredDepth);
        Assert.AreEqual(20, xyzData[0].Azimuth);
        Assert.AreEqual(15, xyzData[0].Inclination);

        Assert.AreEqual(19.451, xyzData[1].X, 0.01);
        Assert.AreEqual(27.218, xyzData[1].Y, 0.01);
        Assert.AreEqual(94.012, xyzData[1].Z, 0.01);
        Assert.AreEqual(3600, xyzData[1].MeasuredDepth);
        Assert.AreEqual(45, xyzData[1].Azimuth);
        Assert.AreEqual(25, xyzData[1].Inclination);
    }

    [TestMethod]
    public void ConvertAzIncToXYZDuplicateEntry()
    {
        var azimuthInclinationData = new List<AzIncFormat.Geometry>
        {
            new AzIncFormat.Geometry
            {
                MeasuredDepth = 3500,
                AzimuthRad = Degrees.ToRadians(20),
                InclinationRad = Degrees.ToRadians(15),
                Azimuth = 20,
                Inclination = 15,
            },
            new AzIncFormat.Geometry
            {
                MeasuredDepth = 3500,
                AzimuthRad = Degrees.ToRadians(20),
                InclinationRad = Degrees.ToRadians(15),
                Azimuth = 20,
                Inclination = 15,
            },
        };

        var xyzData = AzIncFormat.ConvertToXYZ(azimuthInclinationData);

        Assert.AreEqual(2, xyzData.Count);
        Assert.AreEqual(0, xyzData[0].X);
        Assert.AreEqual(0, xyzData[0].Y);
        Assert.AreEqual(0, xyzData[0].Z);
        Assert.AreEqual(0, xyzData[1].X);
        Assert.AreEqual(0, xyzData[1].Y);
        Assert.AreEqual(0, xyzData[1].Z);
    }

    [TestMethod]
    public void ConvertAzIncToXYZOneEntry()
    {
        var azimuthInclinationData = new List<AzIncFormat.Geometry>
        {
            new AzIncFormat.Geometry
            {
                MeasuredDepth = 420,
                AzimuthRad = Degrees.ToRadians(267.53),
                InclinationRad = Degrees.ToRadians(8.65),
                Azimuth = 267.53,
                Inclination = 8.65,
            },
        };

        var xyzData = AzIncFormat.ConvertToXYZ(azimuthInclinationData);

        Assert.AreEqual(1, xyzData.Count);
        Assert.AreEqual(0, xyzData[0].X);
        Assert.AreEqual(0, xyzData[0].Y);
        Assert.AreEqual(0, xyzData[0].Z);
        Assert.AreEqual(420, xyzData[0].MeasuredDepth);
        Assert.AreEqual(267.53, xyzData[0].Azimuth);
        Assert.AreEqual(8.65, xyzData[0].Inclination);
    }

    [TestMethod]
    public void ConvertAzIncToXYZNoEntry()
    {
        var xyzData = AzIncFormat.ConvertToXYZ(new List<AzIncFormat.Geometry>());
        Assert.AreEqual(0, xyzData.Count);
    }
}
