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
        Assert.AreEqual(57.82043183203776, geometry.GetDepthTVD(58));
        Assert.AreEqual(84.57174007064822, geometry.GetDepthTVD(86));
        Assert.AreEqual(109.22588694252808, geometry.GetDepthTVD(114));

        Assert.AreEqual(169.07893873661956, geometry.GetDepthTVD(197.5));
        Assert.AreEqual(201.50022214239743, geometry.GetDepthTVD(253));
        Assert.AreEqual(223.1634311280656, geometry.GetDepthTVD(308.5));

        Assert.AreEqual(228.76601477156717, geometry.GetDepthTVD(383.75));
        Assert.AreEqual(222.85613683273613, geometry.GetDepthTVD(403.5));
        Assert.AreEqual(213.34662044030796, geometry.GetDepthTVD(423.25));

        Assert.AreEqual(176.3913714462913, geometry.GetDepthTVD(477.5));
        Assert.AreEqual(171.26212197960706, geometry.GetDepthTVD(485));
        Assert.AreEqual(166.2535226150152, geometry.GetDepthTVD(492.5));
    }

    [TestMethod]
    public void GetDepthTVDArcSegmentOnlyXYZ()
    {
        Assert.AreEqual(57.82046285759562, geometryOnlyMDXYZ.GetDepthTVD(58));
        Assert.AreEqual(84.5718012263034, geometryOnlyMDXYZ.GetDepthTVD(86));
        Assert.AreEqual(109.22594677197365, geometryOnlyMDXYZ.GetDepthTVD(114));

        Assert.AreEqual(177.93301210073565, geometryOnlyMDXYZ.GetDepthTVD(197.5));
        Assert.AreEqual(213.4650694797625, geometryOnlyMDXYZ.GetDepthTVD(253));
        Assert.AreEqual(232.01961003350274, geometryOnlyMDXYZ.GetDepthTVD(308.5));

        Assert.AreEqual(227.91152874352522, geometryOnlyMDXYZ.GetDepthTVD(383.75));
        Assert.AreEqual(221.71181168632785, geometryOnlyMDXYZ.GetDepthTVD(403.5));
        Assert.AreEqual(212.49211307095248, geometryOnlyMDXYZ.GetDepthTVD(423.25));

        Assert.AreEqual(176.39137144538128, geometryOnlyMDXYZ.GetDepthTVD(477.5));
        Assert.AreEqual(171.26212197836804, geometryOnlyMDXYZ.GetDepthTVD(485));
        Assert.AreEqual(166.253522614067, geometryOnlyMDXYZ.GetDepthTVD(492.5));
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
}
