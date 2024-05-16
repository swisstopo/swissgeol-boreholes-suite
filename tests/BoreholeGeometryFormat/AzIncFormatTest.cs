using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS.BoreholeGeometryFormat;

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
                Azimuth = Helper.ToRadians(20),
                Inclination = Helper.ToRadians(15),
            },
            new AzIncFormat.Geometry
            {
                MeasuredDepth = 3600,
                Azimuth = Helper.ToRadians(45),
                Inclination = Helper.ToRadians(25),
            },
        };

        var xyzData = AzIncFormat.ConvertToXYZ(azimuthInclinationData);

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
        var azimuthInclinationData = new List<AzIncFormat.Geometry>
        {
            new AzIncFormat.Geometry
            {
                MeasuredDepth = 3500,
                Azimuth = Helper.ToRadians(20),
                Inclination = Helper.ToRadians(15),
            },
            new AzIncFormat.Geometry
            {
                MeasuredDepth = 3500,
                Azimuth = Helper.ToRadians(20),
                Inclination = Helper.ToRadians(15),
            },
        };

        var xyzData = AzIncFormat.ConvertToXYZ(azimuthInclinationData);

        Assert.AreEqual(2, xyzData.Count);
        Assert.AreEqual(0, xyzData[0].X);
        Assert.AreEqual(0, xyzData[0].Y);
        Assert.AreEqual(0, xyzData[0].Z);
        Assert.AreEqual(0, xyzData[1].X, 0.01);
        Assert.AreEqual(0, xyzData[1].Y, 0.01);
        Assert.AreEqual(0, xyzData[1].Z, 0.01);
    }
}
