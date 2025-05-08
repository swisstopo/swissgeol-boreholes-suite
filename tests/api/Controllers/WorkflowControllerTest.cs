using Azure.Core;
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
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<bool?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        controller = new WorkflowController(context, boreholePermissionServiceMock.Object, loggerMock.Object) { ControllerContext = GetControllerContextAdmin() };
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
        Assert.IsNotNull(workflow.ReviewedTabs);
        Assert.IsNotNull(workflow.PublishedTabs);
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
        Assert.IsNotNull(workflowChange.CreatedBy);
        Assert.AreEqual("c. user", workflowChange.CreatedBy.Name);
        Assert.IsNotNull(workflowChange.Created);
        Assert.AreEqual(2000029, workflowChange.WorkflowId);
        Assert.IsNotNull(workflowChange.Workflow);
        Assert.IsNull(workflowChange.AssigneeId);
        Assert.IsNull(workflowChange.Assignee);
    }

    [TestMethod]
    public async Task UpdatesWorkflowAndCreatesChange()
    {
        int boreholeId = 1000029;
        var newStatus = WorkflowStatus.InReview;
        var newAssigneeId = 2;
        var comment = "Changing to InReview status.";

        var request = new WorkflowChangeRequest
        {
            BoreholeId = boreholeId,
            NewStatus = newStatus,
            NewAssigneeId = newAssigneeId,
            Comment = comment,
        };

        var response = await controller.ApplyWorkflowChangeAsync(request).ConfigureAwait(false);

        var result = ActionResultAssert.IsOkObjectResult<WorkflowV2>(response);
        Assert.AreEqual(newStatus, result.Status);
        Assert.AreEqual(newAssigneeId, result.AssigneeId);

        // Assert workflow change created
        var updatedWorkflow = await context.WorkflowsV2
            .Include(w => w.Changes)
            .FirstAsync(w => w.BoreholeId == boreholeId);

        var latestChange = updatedWorkflow.Changes
            .OrderByDescending(c => c.Created)
            .FirstOrDefault();

        Assert.IsNotNull(latestChange);
        Assert.AreEqual(WorkflowStatus.Draft, latestChange.FromStatus);
        Assert.AreEqual(newStatus, latestChange.ToStatus);
        Assert.AreEqual(comment, latestChange.Comment);
        Assert.AreEqual(newAssigneeId, latestChange.AssigneeId);
        Assert.AreEqual("a. user", latestChange.CreatedBy.Name.ToLowerInvariant());
        Assert.AreEqual("e. user", latestChange.Assignee.Name.ToLowerInvariant());
    }

    [TestMethod]
    public async Task WorkflowChangeRequestForInexistentBoreholeId()
    {
        var request = new WorkflowChangeRequest
        {
            BoreholeId = 800097871,
        };

        var response = await controller.ApplyWorkflowChangeAsync(request).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response);
        var notFoundResponse = response as NotFoundObjectResult;
        Assert.AreEqual("Workflow for borehole with 800097871 not found.", notFoundResponse.Value);
    }

    [TestMethod]
    public async Task WorkflowChangeRequestForInexistentUserId()
    {
        var request = new WorkflowChangeRequest
        {
            BoreholeId = 1000029,
            NewAssigneeId = 75500871,
        };

        var response = await controller.ApplyWorkflowChangeAsync(request).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response);
        var notFoundResponse = response as NotFoundObjectResult;
        Assert.AreEqual("New assingee with id 75500871 not found.", notFoundResponse.Value);
    }
}
