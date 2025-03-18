using BDMS.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS.BoreholeGeometry;

[TestClass]
public class HelperTest
{
    private static readonly List<BoreholeGeometryElement> geometry = new List<BoreholeGeometryElement>
    {
        // Straight down section
        new BoreholeGeometryElement { MD = 0, X = 0, Y = 0, Z = 0, HAZI = 0, DEVI = 0 },
        new BoreholeGeometryElement { MD = 10, X = 0, Y = 0, Z = 10, HAZI = 0, DEVI = 0 },
        new BoreholeGeometryElement { MD = 20, X = 0, Y = 0, Z = 20, HAZI = 0, DEVI = 0 },
        new BoreholeGeometryElement { MD = 30, X = 0, Y = 0, Z = 30, HAZI = 0, DEVI = 0 },

        // Arcs
        new BoreholeGeometryElement { MD = 142, X = 36.1716308363097, Y = 20.883700800371177, Z = 130.83542740959587, HAZI = 60, DEVI = 45 },
        new BoreholeGeometryElement { MD = 364, X = 52.053181040446169, Y = 193.24627113072842, Z = 230.77053850303469, HAZI = 330, DEVI = 90 },

        // Duplicate value
        new BoreholeGeometryElement { MD = 443, X = 4.7944823332390314, Y = 245.05958917392837, Z = 200.72938928576232, HAZI = 300, DEVI = 135 },
        new BoreholeGeometryElement { MD = 443, X = 4.7944823332390314, Y = 245.05958917392837, Z = 200.72938928576232, HAZI = 300, DEVI = 135 },

        // Straight segment
        new BoreholeGeometryElement { MD = 470, X = -11.739573430547424, Y = 254.60553071994676, Z = 181.63750619372553, HAZI = 300, DEVI = 135 },

        // Almost straight segment
        new BoreholeGeometryElement { MD = 500, X = -31.358445652955155, Y = 264.77495204832314, Z = 161.3692496178067, HAZI = 295, DEVI = 130 },

        // Last segment is an arc
        new BoreholeGeometryElement { MD = 600, X = -103.01243364944339, Y = 238.99044298089785, Z = 179.57135812693264, HAZI = 180, DEVI = 35 },
    };

    private static readonly List<BoreholeGeometryElement> geometryOnlyMDXYZ = geometry
        .Select(e => new BoreholeGeometryElement { MD = e.MD, X = e.X, Y = e.Y, Z = e.Z })
        .ToList();

    [TestMethod]
    public void GetDepthTVDOnDataPoint()
    {
        Assert.AreEqual(10, geometry.GetDepthTVD(10));
    }

    [TestMethod]
    public void GetDepthTVDOnDuplicateDataPoint()
    {
        Assert.AreEqual(200.72938928576232, geometry.GetDepthTVD(443));
    }

    [TestMethod]
    public void GetDepthTVDStraightSegment()
    {
        Assert.AreEqual(15, geometry.GetDepthTVD(15));
        Assert.AreEqual(191.18344773974394, geometry.GetDepthTVD(456.5));
    }

    [TestMethod]
    public void GetDepthTVDStraightSegmentOnlyXYZ()
    {
        Assert.AreEqual(15, geometryOnlyMDXYZ.GetDepthTVD(15));
        Assert.AreEqual(191.18344773974394, geometryOnlyMDXYZ.GetDepthTVD(456.5));
    }

    [TestMethod]
    public void GetDepthTVDArcSegment()
    {
        Assert.AreEqual(57.820431832038, Math.Round(geometry.GetDepthTVD(58), 12));
        Assert.AreEqual(84.571740070648, Math.Round(geometry.GetDepthTVD(86), 12));
        Assert.AreEqual(109.225886942528, Math.Round(geometry.GetDepthTVD(114), 12));

        Assert.AreEqual(169.07893873662, Math.Round(geometry.GetDepthTVD(197.5), 12));
        Assert.AreEqual(201.500222142397, Math.Round(geometry.GetDepthTVD(253), 12));
        Assert.AreEqual(223.163431128066, Math.Round(geometry.GetDepthTVD(308.5), 12));

        Assert.AreEqual(228.766014771567, Math.Round(geometry.GetDepthTVD(383.75), 12));
        Assert.AreEqual(222.856136832736, Math.Round(geometry.GetDepthTVD(403.5), 12));
        Assert.AreEqual(213.346620440308, Math.Round(geometry.GetDepthTVD(423.25), 12));

        Assert.AreEqual(176.391371446291, Math.Round(geometry.GetDepthTVD(477.5), 12));
        Assert.AreEqual(171.262121979607, Math.Round(geometry.GetDepthTVD(485), 12));
        Assert.AreEqual(166.253522615015, Math.Round(geometry.GetDepthTVD(492.5), 12));
    }

    [TestMethod]
    public void GetDepthTVDArcSegmentOnlyXYZ()
    {
        Assert.AreEqual(57.820462857596, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(58), 12));
        Assert.AreEqual(84.571801226303, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(86), 12));
        Assert.AreEqual(109.225946771974, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(114), 12));

        Assert.AreEqual(177.933012100736, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(197.5), 12));
        Assert.AreEqual(213.465069479762, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(253), 12));
        Assert.AreEqual(232.019610033503, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(308.5), 12));

        Assert.AreEqual(227.911528743525, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(383.75), 12));
        Assert.AreEqual(221.711811686328, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(403.5), 12));
        Assert.AreEqual(212.492113070952, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(423.25), 12));

        Assert.AreEqual(176.391371445381, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(477.5), 12));
        Assert.AreEqual(171.262121978368, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(485), 12));
        Assert.AreEqual(166.253522614067, Math.Round(geometryOnlyMDXYZ.GetDepthTVD(492.5), 12));
    }

    [TestMethod]
    public void GetDepthTVDDistanceLargerThanMD()
    {
        var geometryXYZ = new List<BoreholeGeometryElement>
        {
            // Almost vertical segment
            new BoreholeGeometryElement { MD = 0, X = 0, Y = 0, Z = 0 },
            new BoreholeGeometryElement { MD = 0.5, X = -0.00004, Y = -0.000054, Z = 0.5 },

            // Segment after curve
            new BoreholeGeometryElement { MD = 541.5, X = 131.460350, Y = -20.340839, Z = 512.722770 },
            new BoreholeGeometryElement { MD = 542.0, X = 131.728330, Y = -20.381867, Z = 513.142900 },
        };

        Assert.AreEqual(0.25, geometryXYZ.GetDepthTVD(0.25));
        Assert.AreEqual(512.932835, Math.Round(geometryXYZ.GetDepthTVD(541.75), 12));

        var deltaMD = Math.Abs(geometryXYZ[3].MD - geometryXYZ[2].MD);
        var distance = (geometryXYZ[3].ToVector3D() - geometryXYZ[2].ToVector3D()).Length();
        Assert.IsTrue(distance > deltaMD);
    }

    [TestMethod]
    public void GetDepthTVDTooLow()
    {
        Assert.ThrowsException<ArgumentOutOfRangeException>(() => geometry.GetDepthTVD(-42));
    }

    [TestMethod]
    public void GetDepthTVDTooHigh()
    {
        Assert.ThrowsException<ArgumentOutOfRangeException>(() => geometry.GetDepthTVD(double.MaxValue));
    }

    [TestMethod]
    public void GetDepthMDOnDataPoint()
    {
        Assert.AreEqual(142, geometry.GetDepthMD(130.83542740959587));
    }

    [TestMethod]
    public void GetDepthMDStraightSegment()
    {
        Assert.AreEqual(15, geometry.GetDepthMD(15));
    }

    [TestMethod]
    public void GetDepthMDArcSegment()
    {
        Assert.AreEqual(60.90073047969, Math.Round(geometry.GetDepthMD(57.820431832038), 12));
        Assert.AreEqual(90.613963216374, Math.Round(geometry.GetDepthMD(84.571740070648), 12));
        Assert.AreEqual(117.997835339355, Math.Round(geometry.GetDepthMD(109.225886942528), 12));
    }

    [TestMethod]
    public void GetDepthMDMultipleIntersections()
    {
        Assert.AreEqual(340.073879125045, Math.Round(geometry.GetDepthMD(220), 12));
    }

    [TestMethod]
    public void GetDepthMDTooLow()
    {
        Assert.ThrowsException<ArgumentOutOfRangeException>(() => geometry.GetDepthMD(-42));
    }

    [TestMethod]
    public void GetDepthMDTooHigh()
    {
        Assert.ThrowsException<ArgumentOutOfRangeException>(() => geometry.GetDepthMD(double.MaxValue));
    }

    [TestMethod]
    public void GetDepthMDEmptyGeometry()
    {
        Assert.ThrowsException<ArgumentOutOfRangeException>(() => new List<BoreholeGeometryElement>().GetDepthMD(10));
    }
}
