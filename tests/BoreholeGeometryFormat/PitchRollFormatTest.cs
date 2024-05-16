using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS.BoreholeGeometryFormat;

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
                Roll = ToRadians(0),
                Pitch = ToRadians(0),
                MagneticRotation = ToRadians(0),
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
                Roll = ToRadians(-6.3),
                Pitch = ToRadians(8.5),
                MagneticRotation = ToRadians(99.4),
            },
        };

        var azIncData = PitchRollFormat.ConvertToAzInc(data);

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
