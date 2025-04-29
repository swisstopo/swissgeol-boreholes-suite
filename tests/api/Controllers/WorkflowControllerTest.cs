using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class WorkflowControllerTest
{
    private readonly Mock<ILogger<WorkflowController>> loggerMock = new();
    private BdmsContext context;
    private WorkflowController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        controller = new WorkflowController(context, new Mock<ILogger<WorkflowV2>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetByInexistentId()
    {
        var response = await controller.GetByIdAsync(6784).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task GetById()
    {
        var response = await controller.GetByIdAsync(1000029).ConfigureAwait(false);
        var workflow = ActionResultAssert.IsOkObjectResult<WorkflowV2>(response.Result);
        Assert.IsNotNull(workflow);
        Assert.AreEqual(WorkflowStatus.Draft, workflow.Status);
        Assert.AreEqual(1000029, workflow.BoreholeId);
        Assert.AreEqual(2000029, workflow.Id);
        Assert.IsNull(workflow.AssigneeId);
        Assert.IsNull(workflow.Assignee);
        Assert.AreEqual(3000058, workflow.ReviewedTabsId);
        Assert.AreEqual(3000059, workflow.PublishedTabsId);
        Assert.IsNull(workflow.ReviewedTabs);
        Assert.IsNull(workflow.PublishedTabs);
        Assert.IsFalse(workflow.HasRequestedChanges);
        Assert.IsNotNull(workflow.Changes);
        Assert.AreEqual(3, workflow.Changes.Count);

        var workflowChange = workflow.Changes.Single(wc => wc.Id == 15000163);
        Assert.IsNotNull(workflowChange);
        Assert.AreEqual(15000163, workflowChange.Id);
        Assert.AreEqual(WorkflowStatus.Reviewed, workflowChange.FromStatus);
        Assert.AreEqual(WorkflowStatus.Published, workflowChange.ToStatus);
        Assert.AreEqual("Voluptates natus nemo saepe odit ea quaerat.", workflowChange.Comment);
        Assert.AreEqual(3, workflowChange.CreatedById);
        Assert.IsNull(workflowChange.CreatedBy);

        Assert.IsNotNull(workflowChange.Created);

        var expectedDate = new DateTime(2021, 6, 7, 0, 58, 59).ToUniversalTime();
        Assert.AreEqual(expectedDate.ToString(), workflowChange.Created.ToString());

        Assert.AreEqual(2000029, workflowChange.WorkflowId);
        Assert.IsNotNull(workflowChange.Workflow);

        Assert.IsNull(workflowChange.AssigneeId);
        Assert.IsNull(workflowChange.Assignee);
    }
}
