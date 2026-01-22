using BDMS.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS;

[TestClass]
public class BoreholeGeometryExtensionsTest
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
        Assert.AreEqual(57.820431832038, geometry.GetDepthTVD(58), 1e-12);
        Assert.AreEqual(84.571740070648, geometry.GetDepthTVD(86), 1e-12);
        Assert.AreEqual(109.225886942528, geometry.GetDepthTVD(114), 1e-12);

        Assert.AreEqual(169.07893873662, geometry.GetDepthTVD(197.5), 1e-12);
        Assert.AreEqual(201.500222142397, geometry.GetDepthTVD(253), 1e-12);
        Assert.AreEqual(223.163431128066, geometry.GetDepthTVD(308.5), 1e-12);

        Assert.AreEqual(228.766014771567, geometry.GetDepthTVD(383.75), 1e-12);
        Assert.AreEqual(222.856136832736, geometry.GetDepthTVD(403.5), 1e-12);
        Assert.AreEqual(213.346620440308, geometry.GetDepthTVD(423.25), 1e-12);

        Assert.AreEqual(176.391371446291, geometry.GetDepthTVD(477.5), 1e-12);
        Assert.AreEqual(171.262121979607, geometry.GetDepthTVD(485), 1e-12);
        Assert.AreEqual(166.253522615015, geometry.GetDepthTVD(492.5), 1e-12);
    }

    [TestMethod]
    public void GetDepthTVDArcSegmentOnlyXYZ()
    {
        Assert.AreEqual(57.820462857596, geometryOnlyMDXYZ.GetDepthTVD(58), 1e-12);
        Assert.AreEqual(84.571801226303, geometryOnlyMDXYZ.GetDepthTVD(86), 1e-12);
        Assert.AreEqual(109.225946771974, geometryOnlyMDXYZ.GetDepthTVD(114), 1e-12);

        Assert.AreEqual(177.933012100736, geometryOnlyMDXYZ.GetDepthTVD(197.5), 1e-12);
        Assert.AreEqual(213.465069479762, geometryOnlyMDXYZ.GetDepthTVD(253), 1e-12);
        Assert.AreEqual(232.019610033503, geometryOnlyMDXYZ.GetDepthTVD(308.5), 1e-12);

        Assert.AreEqual(227.911528743525, geometryOnlyMDXYZ.GetDepthTVD(383.75), 1e-12);
        Assert.AreEqual(221.711811686328, geometryOnlyMDXYZ.GetDepthTVD(403.5), 1e-12);
        Assert.AreEqual(212.492113070952, geometryOnlyMDXYZ.GetDepthTVD(423.25), 1e-12);

        Assert.AreEqual(176.391371445381, geometryOnlyMDXYZ.GetDepthTVD(477.5), 1e-12);
        Assert.AreEqual(171.262121978368, geometryOnlyMDXYZ.GetDepthTVD(485), 1e-12);
        Assert.AreEqual(166.253522614067, geometryOnlyMDXYZ.GetDepthTVD(492.5), 1e-12);
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
        Assert.AreEqual(512.932835, geometryXYZ.GetDepthTVD(541.75), 1e-12);

        var deltaMD = Math.Abs(geometryXYZ[3].MD - geometryXYZ[2].MD);
        var distance = (geometryXYZ[3].ToVector3D() - geometryXYZ[2].ToVector3D()).Length();
        Assert.IsTrue(distance > deltaMD);
    }

    [TestMethod]
    public void GetDepthTVDTooLow()
    {
        Assert.ThrowsExactly<ArgumentOutOfRangeException>(() => geometry.GetDepthTVD(-42));
    }

    [TestMethod]
    public void GetDepthTVDTooHigh()
    {
        Assert.ThrowsExactly<ArgumentOutOfRangeException>(() => geometry.GetDepthTVD(double.MaxValue));
    }

    [TestMethod]
    public void GetDepthMDSimpleArcSegment()
    {
        var arc90DegGeometry = new List<BoreholeGeometryElement>
        {
            new BoreholeGeometryElement { MD = 0, X = 42, Y = 0, Z = 100, HAZI = 0, DEVI = 0 },
            new BoreholeGeometryElement { MD = (100 * Math.PI) / 2, X = 42, Y = 100, Z = 200, HAZI = 0, DEVI = 90 },
        };

        Assert.ThrowsExactly<ArgumentOutOfRangeException>(() => arc90DegGeometry.GetDepthMD(100 - 1e-12));
        AssertRoundtrip(arc90DegGeometry, 100, 0);
        AssertRoundtrip(arc90DegGeometry, 125, 25.268025514208);
        AssertRoundtrip(arc90DegGeometry, 150, 52.35987755983);
        AssertRoundtrip(arc90DegGeometry, 175, 84.806207898148);
        AssertRoundtrip(arc90DegGeometry, 200, 157.07963267949);
        Assert.ThrowsExactly<ArgumentOutOfRangeException>(() => arc90DegGeometry.GetDepthMD(200 + 1e-12));
    }

    [TestMethod]
    public void GetDepthMDWrongMD()
    {
        // The measured depth of the second data point is shorter than the length of the arc segment.
        var arc90DegGeometry = new List<BoreholeGeometryElement>
        {
            new BoreholeGeometryElement { MD = 0, X = 42, Y = 0, Z = 100, HAZI = 0, DEVI = 0 },
            new BoreholeGeometryElement { MD = 100, X = 42, Y = 100, Z = 200, HAZI = 0, DEVI = 90 },
        };

        AssertRoundtrip(arc90DegGeometry, 100, 0);
        AssertRoundtrip(arc90DegGeometry, 125, 16.086124651033);
        AssertRoundtrip(arc90DegGeometry, 150, 33.333333333333);
        AssertRoundtrip(arc90DegGeometry, 175, 53.989308767477);
        AssertRoundtrip(arc90DegGeometry, 200, 100);
    }

    [TestMethod]
    public void MdToTvdAndBack()
    {
        AssertRoundtrip(geometry, 140, 154.978898149935);
        AssertRoundtrip(geometry, 229, 337.356883642718);
        AssertRoundtrip(geometry, 230.5, 353.598364997125);
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
        Assert.AreEqual(58, geometry.GetDepthMD(57.820431832038), 1e-12);
        Assert.AreEqual(86, geometry.GetDepthMD(84.571740070648), 1e-12);
        Assert.AreEqual(114, geometry.GetDepthMD(109.225886942528), 1e-12);
    }

    [TestMethod]
    public void GetDepthMDMultipleIntersections()
    {
        Assert.AreEqual(297.780222690658, geometry.GetDepthMD(220), 1e-12);
    }

    [TestMethod]
    public void GetDepthMDTooLow()
    {
        Assert.ThrowsExactly<ArgumentOutOfRangeException>(() => geometry.GetDepthMD(-42));
    }

    [TestMethod]
    public void GetDepthMDTooHigh()
    {
        Assert.ThrowsExactly<ArgumentOutOfRangeException>(() => geometry.GetDepthMD(double.MaxValue));
    }

    [TestMethod]
    public void GetDepthMDEmptyGeometry()
    {
        Assert.ThrowsExactly<ArgumentOutOfRangeException>(() => new List<BoreholeGeometryElement>().GetDepthMD(10));
    }

    private static void AssertRoundtrip(List<BoreholeGeometryElement> geometry, double inputTVD, double expectedMD)
    {
        var actualMD = geometry.GetDepthMD(inputTVD);
        Assert.AreEqual(expectedMD, actualMD, 1e-12);
        var actualTVD = geometry.GetDepthTVD(actualMD);
        Assert.AreEqual(inputTVD, actualTVD, 1e-12);
    }
}
