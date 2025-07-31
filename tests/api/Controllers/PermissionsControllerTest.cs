using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class PermissionsControllerTest
{
    private PermissionsController controller;

    [TestInitialize]
    public void TestInitialize()
    {

        var boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>(), It.IsAny<bool?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(true);

        controller = new PermissionsController(boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestMethod]
    public async Task CheckPermissionsForInexistentBorehole()
    {
        var response = await controller.CanEditAsync(0).ConfigureAwait(false);
        Assert.AreEqual(response, false);
    }

    [TestMethod]
    public async Task CheckPermissionsForExistingBorehole()
    {
        var response = await controller.CanEditAsync(1003010).ConfigureAwait(false);
        Assert.AreEqual(response, true);
    }
}
