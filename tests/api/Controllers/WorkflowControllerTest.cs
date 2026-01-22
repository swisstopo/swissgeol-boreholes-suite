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
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new WorkflowController(context, boreholePermissionServiceMock.Object, loggerMock.Object) { ControllerContext = GetControllerContextAdmin() };
        boreholePermissionServiceMock
            .Setup(x => x.CanChangeBoreholeStatusAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(true);
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
        var workflow = ActionResultAssert.IsOkObjectResult<Workflow>(response.Result);
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

        var result = ActionResultAssert.IsOkObjectResult<Workflow>(response);
        Assert.AreEqual(newStatus, result.Status);
        Assert.AreEqual(newAssigneeId, result.AssigneeId);

        // Assert workflow change created
        var updatedWorkflow = await context.Workflows
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
    public async Task CanUpdateWorkflowWithoutSupplyingAssignee()
    {
        var request = new WorkflowChangeRequest
        {
            BoreholeId = boreholeTestId,
            NewAssigneeId = null,
        };

        var response = await controller.ApplyWorkflowChangeAsync(request).ConfigureAwait(false);
        var result = ActionResultAssert.IsOkObjectResult<Workflow>(response);
        Assert.AreEqual(null, result.AssigneeId);
    }

    [TestMethod]
    public async Task WorkflowChangeRequestByUserWithoutEditPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanChangeBoreholeStatusAsync(It.IsAny<string?>(), It.IsAny<int?>()))
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
            .Setup(x => x.CanChangeBoreholeStatusAsync(It.IsAny<string?>(), It.IsAny<int?>()))
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
    public async Task WorkflowChangeRequestWithoutStatusChange()
    {
        var existingWorkflow = await context.Workflows.FirstAsync(w => w.BoreholeId == boreholeTestId);
        var originalStatus = existingWorkflow.Status;

        var request = new WorkflowChangeRequest
        {
            BoreholeId = boreholeTestId,
            NewAssigneeId = 2,
            Comment = "No status change",
        };

        var response = await controller.ApplyWorkflowChangeAsync(request).ConfigureAwait(false);

        var result = ActionResultAssert.IsOkObjectResult<Workflow>(response);
        Assert.AreEqual(originalStatus, result.Status);
        Assert.AreEqual(2, result.AssigneeId);
    }

    [TestMethod]
    public async Task SuccessfullyUpdatesTabStatus()
    {
        async Task TestTabStatus(WorkflowTabType tabType, Func<Workflow, TabStatus> getTabStatus, string field, bool newStatus)
        {
            var request = new WorkflowTabStatusChangeRequest
            {
                BoreholeId = boreholeTestId,
                Tab = tabType,
                Changes = new Dictionary<string, bool> { { field, newStatus } },
            };

            var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);
            var result = ActionResultAssert.IsOkObjectResult<Workflow>(response);
            var actual = (bool?)typeof(TabStatus).GetProperty(field.ToString())?.GetValue(getTabStatus(result)) ?? !newStatus;
            if (newStatus)
                Assert.IsTrue(actual);
            else
                Assert.IsFalse(actual);
        }

        var fieldToUpdate = "Lithology";

        // Test ReviewedTabs: set to true, then false
        await TestTabStatus(WorkflowTabType.Reviewed, w => w.ReviewedTabs, fieldToUpdate, true);
        await TestTabStatus(WorkflowTabType.Reviewed, w => w.ReviewedTabs, fieldToUpdate, false);

        // Test PublishedTabs: set to true, then false
        await TestTabStatus(WorkflowTabType.Published, w => w.PublishedTabs, fieldToUpdate, true);
        await TestTabStatus(WorkflowTabType.Published, w => w.PublishedTabs, fieldToUpdate, false);
    }

    [TestMethod]
    public async Task SuccessfullyUpdatesMultipleTabStatus()
    {
        async Task TestTabStatusAsync(Dictionary<string, bool> changesDict)
        {
            var request = new WorkflowTabStatusChangeRequest
            {
                BoreholeId = boreholeTestId,
                Tab = WorkflowTabType.Reviewed,
                Changes = changesDict,
            };

            var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);
            var result = ActionResultAssert.IsOkObjectResult<Workflow>(response);
            var reviewedTabs = result.ReviewedTabs;

            foreach (var change in changesDict)
            {
                var property = typeof(TabStatus).GetProperty(change.Key);
                Assert.IsNotNull(property, $"Property '{change.Key}' not found on TabStatus.");
                var actual = (bool)property.GetValue(reviewedTabs)!;
                Assert.AreEqual(change.Value, actual, $"Field '{change.Key}' should be '{change.Value}'");
            }
        }

        await TestTabStatusAsync(new Dictionary<string, bool>
        {
            { "Instrumentation", true },
            { "Casing", true },
            { "Geometry", true },
        });

        await TestTabStatusAsync(new Dictionary<string, bool>
        {
            { "Instrumentation", false },
            { "Casing", true },
            { "Geometry", false },
        });

        await TestTabStatusAsync(new Dictionary<string, bool>
        {
            { "Instrumentation", true },
        });
    }

    [TestMethod]
    public async Task TabStatusChangeWithInvalidFieldReturnsBadRequest()
    {
        var request = new WorkflowTabStatusChangeRequest
        {
            BoreholeId = boreholeTestId,
            Tab = WorkflowTabType.Reviewed,
            Changes = new Dictionary<string, bool> { { "Undefined field", true } },
        };

        var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task TabStatusChangeWithInvalidTabReturnsBadRequest()
    {
        var request = new WorkflowTabStatusChangeRequest
        {
            BoreholeId = boreholeTestId,
            Tab = (WorkflowTabType)999, // Invalid tab type
            Changes = new Dictionary<string, bool> { { "Chronostratigraphy", true } },
        };

        var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task TabStatusChangeWithNonexistentBoreholeReturnsNotFound()
    {
        var request = new WorkflowTabStatusChangeRequest
        {
            BoreholeId = 9999999, // Non-existent borehole
            Tab = WorkflowTabType.Reviewed,
            Changes = new Dictionary<string, bool> { { "Chronostratigraphy", true } },
        };

        var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task TabStatusChangeUserWithoutEditPermissionReturnsUnauthorized()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanChangeBoreholeStatusAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(false);

        var request = new WorkflowTabStatusChangeRequest
        {
            BoreholeId = boreholeTestId,
            Tab = WorkflowTabType.Reviewed,
            Changes = new Dictionary<string, bool> { { "Chronostratigraphy", true } },
        };

        var response = await controller.ApplyTabStatusChangeAsync(request).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public void WorkflowStatusFieldEnumMatchesTabStatus()
    {
        var tabStatusProps = typeof(TabStatus)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.PropertyType == typeof(bool))
            .Select(p => p.Name)
            .OrderBy(n => n)
            .ToList();

        var enumNames = Enum.GetNames(typeof(WorkflowStatusField))
            .Where(name => name != "Unknown")
            .OrderBy(n => n)
            .ToList();

        CollectionAssert.AreEqual(tabStatusProps, enumNames, "WorkflowStatusField enum and TabStatus properties are out of sync.");
    }
}
