﻿using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;
using File = System.IO.File;

namespace BDMS;

[TestClass]
public class UploadControllerTest
{
    private BdmsContext context;
    private UploadController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new UploadController(ContextFactory.CreateContext(), new Mock<ILogger<UploadController>>().Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        // Remove boreholes that were uploaded.
        var addedBoreholes = context.Boreholes.Where(b => b.OriginalName.Contains("Unit_Test_"));
        var addedWorkflows = context.Workflows.Where(w => addedBoreholes.Select(b => b.Id).Contains(w.BoreholeId));
        context.Boreholes.RemoveRange(addedBoreholes);
        context.Workflows.RemoveRange(addedWorkflows);
        context.SaveChanges();
        await context.DisposeAsync();
    }

    [TestMethod]
    [DeploymentItem("testdata.csv")]
    public async Task UploadShouldSaveDataToDatabaseAsync()
    {
        var csvFile = "testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(6, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Include(b => b.BoreholeCodelists).ToList().Find(b => b.OriginalName == "Unit_Test_6");
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual("Unit_Test_6_a", borehole.AlternateName);
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual(null, borehole.IsPublic);
        Assert.AreEqual(new DateOnly(2024, 06, 15), borehole.RestrictionUntil);
        Assert.AreEqual(2474.472693, borehole.TotalDepth);
        Assert.AreEqual(2474.472693, borehole.TotalDepth);
        Assert.AreEqual("Projekt 6", borehole.ProjectName);
        Assert.AreEqual(3, borehole.BoreholeCodelists.Count);
        Assert.AreEqual("Id_16", borehole.BoreholeCodelists.First().Value);
        Assert.AreEqual(100000003, borehole.BoreholeCodelists.First().CodelistId);

        // Assert workflow was created for borehole.
        var workflow = context.Workflows.SingleOrDefault(w => w.BoreholeId == borehole.Id);
        Assert.IsNotNull(workflow);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(Role.Editor, workflow.Role);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(null, workflow.Finished);
    }
}
