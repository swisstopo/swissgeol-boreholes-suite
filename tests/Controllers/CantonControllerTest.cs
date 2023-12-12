using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS.Controllers;

[TestClass]
public class CantonControllerTest
{
    private const string TestCanton = "Z283$gVa2%ym8sf3h#X5grPB$^M";

    private BdmsContext context;
    private CantonController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        controller = new CantonController(context);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAllAsync()
    {
        var initialAvailableCantons = (await controller.GetAllAsync()).ToList();
        CollectionAssert.AllItemsAreNotNull(initialAvailableCantons);
        CollectionAssert.AllItemsAreUnique(initialAvailableCantons);
        CollectionAssert.DoesNotContain(initialAvailableCantons, TestCanton);

        var borehole1 = new Borehole() { Canton = TestCanton };
        var borehole2 = new Borehole() { Canton = TestCanton };
        context.Boreholes.Add(borehole1);
        context.Boreholes.Add(borehole2);
        context.SaveChanges();

        var updatedCantons = (await controller.GetAllAsync()).ToList();
        CollectionAssert.AllItemsAreNotNull(updatedCantons);
        CollectionAssert.AllItemsAreUnique(updatedCantons);
        CollectionAssert.Contains(updatedCantons, TestCanton);
    }
}
