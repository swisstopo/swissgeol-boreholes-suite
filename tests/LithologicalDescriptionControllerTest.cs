﻿using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class LithologicalDescriptionControllerTest
{
    private BdmsContext context;
    private LithologicalDescriptionController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new LithologicalDescriptionController(ContextFactory.CreateContext(), new Mock<ILogger<LithologicalDescription>>().Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAllEntriesAsync()
    {
        var response = await controller.GetAsync().ConfigureAwait(false);
        IEnumerable<LithologicalDescription>? lithologicalDescriptions = response?.Value;
        Assert.IsNotNull(lithologicalDescriptions);
        Assert.AreEqual(100_000, lithologicalDescriptions.Count());
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyIdForInexistantId()
    {
        var response = await controller.GetAsync(94578122).ConfigureAwait(false);
        IEnumerable<LithologicalDescription>? lithologicalDescriptions = response?.Value;
        Assert.IsNotNull(lithologicalDescriptions);
        Assert.AreEqual(0, lithologicalDescriptions.Count());
    }

    [TestMethod]
    public async Task GetEntriesByStratigraphyId()
    {
        var response = await controller.GetAsync(6_000_095).ConfigureAwait(false);
        IEnumerable<LithologicalDescription>? lithologicalDescriptions = response?.Value;
        Assert.IsNotNull(lithologicalDescriptions);
        Assert.AreEqual(10, lithologicalDescriptions.Count());
    }

    [TestMethod]
    public async Task GetLithologicalDescriptionByInexistantId()
    {
        var response = await controller.GetByIdAsync(9483157).ConfigureAwait(false);
        Assert.IsInstanceOfType(response.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task GetLithologicalDescriptionById()
    {
        var response = await controller.GetByIdAsync(9_000_015).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var lithologicalDescription = okResult.Value as LithologicalDescription;
        Assert.AreEqual(9_000_015, lithologicalDescription.Id);
        Assert.AreEqual(50, lithologicalDescription.FromDepth);
        Assert.AreEqual(60, lithologicalDescription.ToDepth);
        Assert.AreEqual("Metrics Mountains Practical", lithologicalDescription.Description);
        Assert.AreEqual(9000, lithologicalDescription.QtDescriptionId);
        Assert.AreEqual(6_000_001, lithologicalDescription.StratigraphyId);
    }

    [TestMethod]
    public async Task EditLithologicalDescriptionWithCompleteLithologicalDescription()
    {
        var id = 9_000_069;
        var originalLithologicalDescription = new LithologicalDescription
        {
            CreatedBy = null,
            CreatedById = 1,
            Created = new DateTime(2021, 11, 30, 12, 10, 33).ToUniversalTime(),
            Description = "Libyan Dinar 1080p leading edge",
            FromDepth = 90,
            ToDepth = 100,
            Id = 9_000_069,
            IsLast = true,
            QtDescription = null,
            QtDescriptionId = 9001,
            Updated = new DateTime(2021, 3, 31, 16, 55, 02).ToUniversalTime(),
            UpdatedBy = null,
            UpdatedById = 5,
            StratigraphyId = 6_000_006,
        };

        var newLithologicalDescription = new LithologicalDescription
        {
            Id = id,
            CreatedById = 4,
            UpdatedById = 4,
            Created = new DateTime(2021, 2, 14, 8, 55, 34).ToUniversalTime(),
            StratigraphyId = 6_000_010,
            Description = "Freddy ate more cucumber than Maria.",
            QtDescriptionId = 9003,
        };

        var lithologicalDescriptionToEdit = context.LithologicalDescriptions.Single(c => c.Id == id);
        Assert.AreEqual(1, lithologicalDescriptionToEdit.CreatedById);
        Assert.AreEqual(5, lithologicalDescriptionToEdit.UpdatedById);
        Assert.AreEqual(6_000_006, lithologicalDescriptionToEdit.StratigraphyId);
        Assert.AreEqual("Libyan Dinar 1080p leading edge", lithologicalDescriptionToEdit.Description);

        // Update LithologicalDescription
        var response = await controller.EditAsync(newLithologicalDescription);
        var okResult = response as OkObjectResult;
        Assert.AreEqual(200, okResult.StatusCode);

        // Assert Updates and unchanged values
        var updatedContext = ContextFactory.CreateContext();
        var updatedLithologicalDescription = updatedContext.LithologicalDescriptions.Single(c => c.Id == id);

        Assert.AreEqual(4, updatedLithologicalDescription.CreatedById);
        Assert.AreEqual(1, updatedLithologicalDescription.UpdatedById);
        Assert.AreEqual(6_000_010, updatedLithologicalDescription.StratigraphyId);
        Assert.AreEqual("Freddy ate more cucumber than Maria.", updatedLithologicalDescription.Description);
        Assert.AreEqual(9003, updatedLithologicalDescription.QtDescriptionId);

        // Reset edits
        var cleanupContext = ContextFactory.CreateContext();
        cleanupContext.Update(originalLithologicalDescription);
        await cleanupContext.SaveChangesAsync();
    }

    [TestMethod]
    public async Task EditWithInexistantId()
    {
        var id = 9487794;
        var lithologicalDescription = new LithologicalDescription
        {
            Id = id,
        };

        // Upate LithologicalDescription
        var response = await controller.EditAsync(lithologicalDescription);
        var notFoundResult = response as NotFoundResult;
        Assert.AreEqual(404, notFoundResult.StatusCode);
    }

    [TestMethod]
    public async Task EditWithoutLithologicalDescriptionReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        var badRequestResult = response as BadRequestObjectResult;
        Assert.AreEqual(400, badRequestResult.StatusCode);
    }

    [TestMethod]
    public async Task CreateAndDeleteAsync()
    {
        var lithologicalDescription = new LithologicalDescription
        {
            CreatedById = 1,
            UpdatedById = 1,
            Created = new DateTime(2022, 11, 3, 14, 20, 09).ToUniversalTime(),
            StratigraphyId = 6_000_010,
            Description = "SPOLYP",
            QtDescriptionId = 9003,
        };

        var response = await controller.CreateAsync(lithologicalDescription);
        Assert.IsInstanceOfType(response, typeof(CreatedAtActionResult));
        lithologicalDescription = await context.LithologicalDescriptions.FindAsync(lithologicalDescription.Id);
        Assert.IsNotNull(lithologicalDescription);
        Assert.AreEqual("SPOLYP", lithologicalDescription.Description);

        response = await controller.DeleteAsync(lithologicalDescription.Id);
        Assert.IsInstanceOfType(response, typeof(OkResult));

        response = await controller.DeleteAsync(lithologicalDescription.Id);
        Assert.IsInstanceOfType(response, typeof(NotFoundResult));

        var getResponse = await controller.GetByIdAsync(lithologicalDescription.Id);
        Assert.IsInstanceOfType(getResponse.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task CreateAsyncWithExistingId()
    {
        var lithologicalDescription = new LithologicalDescription
        {
            Id = 9_000_010,
            Description = "RANHEN",
        };

        var getResponse = await controller.GetByIdAsync(lithologicalDescription.Id);
        Assert.IsInstanceOfType(getResponse.Result, typeof(OkObjectResult));

        var response = await controller.CreateAsync(lithologicalDescription);
        var result = response as ObjectResult;
        Assert.IsInstanceOfType(result.Value, typeof(ProblemDetails));
    }
}
