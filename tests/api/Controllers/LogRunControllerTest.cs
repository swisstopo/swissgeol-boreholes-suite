using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class LogRunControllerTest
{
    private BdmsContext context;
    private LogRunController controller;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;
    private static int testBoreholeId = 1000085;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();
        controller = new LogRunController(context, new Mock<ILogger<LogRunController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var response = await controller.GetAsync(context.Boreholes.First().Id).ConfigureAwait(false);

        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        var notFoundResponse = await controller.GetAsync(94578122).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(notFoundResponse.Result);
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeId()
    {
        var boreholeId = testBoreholeId;
        var response = await controller.GetAsync(boreholeId).ConfigureAwait(false);
        var logRuns = response.Value;

        Assert.IsNotNull(logRuns);
        Assert.IsTrue(logRuns.All(lr => lr.BoreholeId == boreholeId));
        Assert.AreEqual(10, logRuns.Count());

        var firstLogRun = logRuns.OrderBy(lr => lr.Id).First();
        Assert.AreEqual(3, firstLogRun.CreatedById);
        Assert.AreEqual(4, firstLogRun.UpdatedById);
        Assert.AreEqual(24000849, firstLogRun.Id);
        Assert.AreEqual("driver", firstLogRun.ServiceCo);
        Assert.AreEqual("R80", firstLogRun.RunNumber);
        Assert.AreEqual(0, firstLogRun.FromDepth);
        Assert.AreEqual(10, firstLogRun.ToDepth);
        Assert.AreEqual(1000085, firstLogRun.BoreholeId);
        Assert.AreEqual(5.8903691782105572, firstLogRun.BitSize);
        Assert.AreEqual(new DateOnly(2021, 4, 1), firstLogRun.RunDate);
        Assert.AreEqual("Odit enim vero ab eaque qui est ducimus reiciendis eligendi.", firstLogRun.Comment);
        Assert.AreEqual(100003002, firstLogRun.ConveyanceMethod.Id);
        Assert.AreEqual(100003005, firstLogRun.BoreholeStatus.Id);
        Assert.AreEqual(4, firstLogRun.LogFiles.Count);

        var logFile = firstLogRun.LogFiles!.OrderBy(f => f.Id).First();
        Assert.AreEqual(25002122, logFile.Id);
        Assert.AreEqual(24000849, logFile.LogRunId);
        Assert.AreEqual(1, logFile.CreatedById);
        Assert.AreEqual(3, logFile.UpdatedById);
        Assert.AreEqual("png.ecelp4800", logFile.Name);
        Assert.AreEqual(100003013, logFile.DataPackageId);
        Assert.AreEqual(100003027, logFile.DepthTypeId);
        Assert.AreEqual(100003026, logFile.PassTypeId);
        Assert.AreEqual(new DateOnly(2021, 6, 6), logFile.DeliveryDate);
        Assert.AreEqual("0d9b13e0-5ff0-5351-8a35-af2b6a8f9da5", logFile.NameUuid);
        Assert.AreEqual(true, logFile.Public);
        Assert.AreEqual("Total", logFile.FileType);
        Assert.AreEqual(3, logFile.Pass);
        Assert.AreEqual(1, logFile.ToolTypeCodelistIds.Count);
        Assert.AreEqual(100003032, logFile.ToolTypeCodelistIds.First());
    }

    [TestMethod]
    public async Task CreateLogRun()
    {
        var logRun = new LogRun
        {
            BoreholeId = testBoreholeId,
            RunNumber = "RUN-001",
            FromDepth = 10,
            ToDepth = 20,
            BitSize = 80.97,
            RunDate = new DateOnly(2023, 5, 30),
            Comment = "Test log run",
            ConveyanceMethodId = 100003000,
            BoreholeStatusId = 100003005,
        };

        var response = await controller.CreateAsync(logRun);
        ActionResultAssert.IsOk(response.Result);

        var updatedLogRun = context.LogRunsWithIncludes.SingleOrDefault(x => x.Id == logRun.Id);
        Assert.IsNotNull(updatedLogRun);
        Assert.AreEqual("RUN-001", updatedLogRun.RunNumber);
        Assert.AreEqual(10, updatedLogRun.FromDepth);
        Assert.AreEqual(20, updatedLogRun.ToDepth);
        Assert.AreEqual(80.97, updatedLogRun.BitSize);
        Assert.AreEqual(100003000, updatedLogRun.ConveyanceMethod.Id);
        Assert.AreEqual(100003005, updatedLogRun.BoreholeStatus.Id);
        Assert.AreEqual(new DateOnly(2023, 5, 30), updatedLogRun.RunDate);
    }

    [TestMethod]
    public async Task CreateFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var response = await controller.CreateAsync(new LogRun { BoreholeId = testBoreholeId });
        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        var objectResult = (ObjectResult)response.Result;
        var problemDetails = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problemDetails.Detail, "The borehole is locked by another user or you are missing permissions.");
    }

    [TestMethod]
    public async Task DeleteLogRun()
    {
        var logRunId = await CreateCompleteLogRunAsync();

        var response = await controller.DeleteAsync(logRunId);
        ActionResultAssert.IsOk(response);

        response = await controller.DeleteAsync(logRunId);
        ActionResultAssert.IsNotFound(response);

        Assert.AreEqual(null, context.LogRuns.SingleOrDefault(x => x.Id == logRunId));
    }

    [TestMethod]
    public async Task DeleteFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var logRunId = await CreateCompleteLogRunAsync();
        var response = await controller.DeleteAsync(logRunId);
        Assert.IsInstanceOfType(response, typeof(ObjectResult));
        ObjectResult objectResult = (ObjectResult)response;
        ProblemDetails problemDetails = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problemDetails.Detail, "The borehole is locked by another user or you are missing permissions.");
    }

    [TestMethod]
    public async Task DeleteWithInexistentId()
    {
        var response = await controller.DeleteAsync(9815784);
        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task EditLogRun()
    {
        var logRunId = await CreateCompleteLogRunAsync();

        var changedLogRun = new LogRun
        {
            Id = logRunId,
            BoreholeId = testBoreholeId,
            RunNumber = "RUN-002",
            FromDepth = 30,
            ToDepth = 40,
            BitSize = 100,
            RunDate = new DateOnly(2022, 4, 29),
            Comment = "Updated test log run",
            ConveyanceMethodId = 100003001,
            BoreholeStatusId = 100003006,
        };

        var response = await controller.EditAsync(changedLogRun);
        ActionResultAssert.IsOk(response.Result);

        var updatedLogRun = context.LogRuns.SingleOrDefault(x => x.Id == logRunId);
        Assert.IsNotNull(updatedLogRun);
        Assert.AreEqual("RUN-002", updatedLogRun.RunNumber);
        Assert.AreEqual(30, updatedLogRun.FromDepth);
        Assert.AreEqual(40, updatedLogRun.ToDepth);
        Assert.AreEqual(100, updatedLogRun.BitSize);
        Assert.AreEqual(new DateOnly(2022, 4, 29), updatedLogRun.RunDate);
        Assert.AreEqual("Updated test log run", updatedLogRun.Comment);
        Assert.AreEqual(100003001, updatedLogRun.ConveyanceMethodId);
        Assert.AreEqual(100003006, updatedLogRun.BoreholeStatusId);
    }

    [TestMethod]
    public async Task EditWithInexistentId()
    {
        var id = 9815784;
        var logRun = new LogRun
        {
            Id = id,
            BoreholeId = testBoreholeId,
        };

        var response = await controller.EditAsync(logRun);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutContentReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task EditFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var response = await controller.EditAsync(new LogRun { Id = 561227, BoreholeId = testBoreholeId });
        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        var objectResult = (ObjectResult)response.Result;
        var problemDetails = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problemDetails.Detail, "The borehole is locked by another user or you are missing permissions.");
    }

    private async Task<int> CreateCompleteLogRunAsync()
    {
        var logRun = new LogRun
        {
            BoreholeId = testBoreholeId,
            RunNumber = "RUN-001",
            FromDepth = 10,
            ToDepth = 20,
            BitSize = 80.97,
            RunDate = new DateOnly(2023, 5, 30),
            Comment = "Test log run",
            ConveyanceMethodId = 100003000,
            BoreholeStatusId = 100003005,
        };
        context.Add(logRun);
        await context.SaveChangesAsync();
        return logRun.Id;
    }
}
