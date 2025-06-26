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
    private readonly int boreholeTestId = 1000029;
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
        Assert.AreEqual(boreholeTestId, workflow.BoreholeId);
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
        var newStatus = WorkflowStatus.InReview;
        var newAssigneeId = 2;
        var comment = "Changing to InReview status.";

        var request = new WorkflowChangeRequest
        {
            BoreholeId = boreholeTestId,
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
            .FirstAsync(w => w.BoreholeId == boreholeTestId);

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
            BoreholeId = boreholeTestId,
            NewAssigneeId = 75500871,
        };

        var response = await controller.ApplyWorkflowChangeAsync(request).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(response);
        var notFoundResponse = response as NotFoundObjectResult;
        Assert.AreEqual("New assignee with id 75500871 not found.", notFoundResponse.Value);
    }

    [TestMethod]
    public async Task WorkflowChangeRequestByUserWithoutEditPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<bool?>()))
            .ReturnsAsync(false);

        var request = new WorkflowChangeRequest
        {
            BoreholeId = boreholeTestId,
            NewStatus = WorkflowStatus.InReview,
            NewAssigneeId = 2,
            Comment = "Unauthorized change attempt",
        };

        var response = await controller.ApplyWorkflowChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task WorkflowChangeRequestToPublishWithoutPublisherRights()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<bool?>()))
            .ReturnsAsync(true);

        // User does not have publisher rights
        boreholePermissionServiceMock
            .Setup(x => x.HasUserRoleOnWorkgroupAsync(It.IsAny<string?>(), It.IsAny<int>(), Role.Publisher))
            .ReturnsAsync(false);

        var request = new WorkflowChangeRequest
        {
            BoreholeId = boreholeTestId,
            NewStatus = WorkflowStatus.Published,
            NewAssigneeId = 2,
            Comment = "Trying to publish without publisher role",
        };

        var response = await controller.ApplyWorkflowChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task WorkflowChangeRequestWithoutStatsChange()
    {
        var existingWorkflow = await context.WorkflowsV2.FirstAsync(w => w.BoreholeId == boreholeTestId);
        var originalStatus = existingWorkflow.Status;

        var request = new WorkflowChangeRequest
        {
            BoreholeId = boreholeTestId,
            NewAssigneeId = 2,
            Comment = "No status change",
        };

        var response = await controller.ApplyWorkflowChangeAsync(request).ConfigureAwait(false);

        var result = ActionResultAssert.IsOkObjectResult<WorkflowV2>(response);
        Assert.AreEqual(originalStatus, result.Status);
        Assert.AreEqual(2, result.AssigneeId);
    }

    [TestMethod]
    public async Task SuccessfullyUpdatesTabStatus()
    {
        async Task TestTabStatus(TabType tabType, Func<WorkflowV2, TabStatus> getTabStatus, string field, bool newStatus)
        {
            var request = new TabStatusChangeRequest
            {
                BoreholeId = boreholeTestId,
                Tab = tabType,
                Field = field,
                NewStatus = newStatus,
            };

            var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);
            var result = ActionResultAssert.IsOkObjectResult<WorkflowV2>(response);
            var actual = (bool?)typeof(TabStatus).GetProperty(field)?.GetValue(getTabStatus(result)) ?? !newStatus;
            if (newStatus == true)
                Assert.IsTrue(actual);
            else
                Assert.IsFalse(actual);
        }

        // Test ReviewedTabs: set to true, then false
        await TestTabStatus(TabType.Reviewed, w => w.ReviewedTabs, "Lithology", true);
        await TestTabStatus(TabType.Reviewed, w => w.ReviewedTabs, "Lithology", false);

        // Test PublishedTabs: set to true, then false
        await TestTabStatus(TabType.Published, w => w.PublishedTabs, "Lithology", true);
        await TestTabStatus(TabType.Published, w => w.PublishedTabs, "Lithology", false);
    }

    [TestMethod]
    public async Task TabStatusChangeWithInvalidFieldReturnsBadRequest()
    {
        var request = new TabStatusChangeRequest
        {
            BoreholeId = boreholeTestId,
            Tab = TabType.Reviewed,
            Field = "NonExistentField",
            NewStatus = true,
        };

        var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task TabStatusChangeWithInvalidTabReturnsBadRequest()
    {
        var request = new TabStatusChangeRequest
        {
            BoreholeId = boreholeTestId,
            Tab = (TabType)999, // Invalid tab type
            Field = "Chronostratigraphy",
            NewStatus = true,
        };

        var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task TabStatusChangeWithNonexistentBoreholeReturnsNotFound()
    {
        var request = new TabStatusChangeRequest
        {
            BoreholeId = 9999999, // Non-existent borehole
            Tab = TabType.Reviewed,
            Field = "Chronostratigraphy",
            NewStatus = true,
        };

        var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task TabStatusChangeUserWithoutEditPermissionReturnsUnauthorized()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>(), It.IsAny<bool?>()))
            .ReturnsAsync(false);

        var request = new TabStatusChangeRequest
        {
            BoreholeId = boreholeTestId,
            Tab = TabType.Reviewed,
            Field = "Chronostratigraphy",
            NewStatus = true,
        };

        var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response);
    }
}
