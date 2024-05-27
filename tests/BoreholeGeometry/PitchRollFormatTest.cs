using Microsoft.VisualStudio.TestTools.UnitTesting;
using Degrees = NetTopologySuite.Utilities.Degrees;

namespace BDMS.BoreholeGeometry;

[TestClass]
public class PitchRollFormatTest
{
    [TestMethod]
    public void ConvertRollPitchYawToAzIncStraightDown()
    {
        var data = new List<PitchRollFormat.Geometry>
        {
            new PitchRollFormat.Geometry
            {
                MeasuredDepth = 1200,
                RollRad = Degrees.ToRadians(0),
                PitchRad = Degrees.ToRadians(0),
                YawRad = Degrees.ToRadians(0),
            },
        };

        var azIncData = PitchRollFormat.ConvertToAzInc(data);

        Assert.AreEqual(1, azIncData.Count);
        Assert.AreEqual(1200, azIncData[0].MeasuredDepth);
        Assert.AreEqual(0, azIncData[0].Azimuth);
        Assert.AreEqual(0, azIncData[0].Inclination);
    }

    [TestMethod]
    public void ConvertRollPitchYawToAzInc()
    {
        var data = new List<PitchRollFormat.Geometry>
        {
            new PitchRollFormat.Geometry
            {
                MeasuredDepth = 0,
                RollRad = Degrees.ToRadians(-6.3),
                PitchRad = Degrees.ToRadians(8.5),
                YawRad = Degrees.ToRadians(99.4),
            },
        };

        var azIncData = PitchRollFormat.ConvertToAzInc(data);

        Assert.AreEqual(1, azIncData.Count);
        Assert.AreEqual(0, azIncData[0].MeasuredDepth);
        Assert.AreEqual(Degrees.ToRadians(136.16), azIncData[0].AzimuthRad, 1e-4);
        Assert.AreEqual(Degrees.ToRadians(10.57), azIncData[0].InclinationRad, 1e-4);
        Assert.AreEqual(136.16, azIncData[0].Azimuth, 1e-2);
        Assert.AreEqual(10.57, azIncData[0].Inclination, 1e-2);
    }
}
