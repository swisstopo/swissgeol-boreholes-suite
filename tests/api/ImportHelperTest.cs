using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BDMS.ImportHelpers;

namespace BDMS;

[TestClass]
public class ImportHelperTest
{
    [TestMethod]
    public void CompareValueWithTolerance()
    {
        Assert.IsTrue(CompareValuesWithTolerance(null, null, 0));
        Assert.IsTrue(CompareValuesWithTolerance(2100000, 2099998, 2));
        Assert.IsFalse(CompareValuesWithTolerance(2100000, 2000098, 1.99));
        Assert.IsFalse(CompareValuesWithTolerance(2100002, 2000000, 1.99));
        Assert.IsFalse(CompareValuesWithTolerance(21000020, 2000000, 20));
        Assert.IsFalse(CompareValuesWithTolerance(null, 2000000, 0));
        Assert.IsFalse(CompareValuesWithTolerance(2000000, null, 2));
    }
}
