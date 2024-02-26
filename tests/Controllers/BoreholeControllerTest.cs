using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class BoreholeControllerTest
{
    private const int DefaultWorkgroupId = 1;
    private int boreholeId;

    private BdmsContext context;
    private BoreholeController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        controller = new BoreholeController(context, new Mock<ILogger<BoreholeController>>().Object) { ControllerContext = GetControllerContextAdmin() };
        boreholeId = GetBoreholeIdToCopy();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task Copy()
    {
        var originalBorehole = GetBorehole(boreholeId);

        var result = await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
        var copiedBorehole = GetBorehole((int)copiedBoreholeId);

        Assert.AreEqual($"{originalBorehole.OriginalName} (Copy)", copiedBorehole.OriginalName);
        Assert.AreEqual(originalBorehole.CreatedBy.SubjectId, copiedBorehole.CreatedBy.SubjectId);
        Assert.AreEqual(originalBorehole.UpdatedBy.SubjectId, copiedBorehole.UpdatedBy.SubjectId);
        Assert.AreEqual(DefaultWorkgroupId, copiedBorehole.Workgroup.Id);
        Assert.AreEqual(1, copiedBorehole.Workflows.Count);
        Assert.AreEqual(Role.Editor, copiedBorehole.Workflows.First().Role);
        Assert.AreSame(originalBorehole.Type, copiedBorehole.Type);
        Assert.AreEqual(originalBorehole.Country, copiedBorehole.Country);
        Assert.AreEqual(originalBorehole.Canton, copiedBorehole.Canton);
        Assert.AreEqual(originalBorehole.Municipality, copiedBorehole.Municipality);

        var originalStratigraphy = originalBorehole.Stratigraphies.First();
        var copiedstratigraphy = copiedBorehole.Stratigraphies.First();
        Assert.AreNotEqual(originalBorehole.Id, copiedBorehole.Id);
        Assert.AreNotSame(originalBorehole.Stratigraphies, copiedBorehole.Stratigraphies);
        Assert.AreNotEqual(originalStratigraphy.Id, copiedstratigraphy.Id);
        Assert.AreNotSame(originalStratigraphy.Layers, copiedstratigraphy.Layers);
        Assert.AreNotEqual(originalStratigraphy.Layers.First().Id, copiedstratigraphy.Layers.First().Id);

        Assert.AreNotSame(originalStratigraphy.LithologicalDescriptions, copiedstratigraphy.LithologicalDescriptions);
        Assert.AreNotEqual(originalStratigraphy.LithologicalDescriptions.First().Id, copiedstratigraphy.LithologicalDescriptions.First().Id);
        Assert.AreEqual(originalStratigraphy.LithologicalDescriptions.First().Description, copiedstratigraphy.LithologicalDescriptions.First().Description);

        Assert.AreNotSame(originalStratigraphy.FaciesDescriptions, copiedstratigraphy.FaciesDescriptions);
        Assert.AreNotEqual(originalStratigraphy.FaciesDescriptions.First().Id, copiedstratigraphy.FaciesDescriptions.First().Id);
        Assert.AreEqual(originalStratigraphy.FaciesDescriptions.First().Description, copiedstratigraphy.FaciesDescriptions.First().Description);

        Assert.AreNotSame(originalStratigraphy.ChronostratigraphyLayers, copiedstratigraphy.ChronostratigraphyLayers);
        Assert.AreNotEqual(originalStratigraphy.ChronostratigraphyLayers.First().Id, copiedstratigraphy.ChronostratigraphyLayers.First().Id);
        Assert.AreEqual(originalStratigraphy.ChronostratigraphyLayers.First().ChronostratigraphyId, copiedstratigraphy.ChronostratigraphyLayers.First().ChronostratigraphyId);

        Assert.AreNotSame(originalStratigraphy.LithostratigraphyLayers, copiedstratigraphy.LithostratigraphyLayers);
        Assert.AreNotEqual(originalStratigraphy.LithostratigraphyLayers.First().Id, copiedstratigraphy.LithostratigraphyLayers.First().Id);
        Assert.AreEqual(originalStratigraphy.LithostratigraphyLayers.First().LithostratigraphyId, copiedstratigraphy.LithostratigraphyLayers.First().LithostratigraphyId);

        Assert.AreNotSame(originalBorehole.BoreholeFiles, copiedBorehole.BoreholeFiles);
        Assert.AreNotEqual(originalBorehole.BoreholeFiles.First().BoreholeId, copiedBorehole.BoreholeFiles.First().BoreholeId);
        Assert.AreEqual(originalBorehole.BoreholeFiles.First().FileId, copiedBorehole.BoreholeFiles.First().FileId);
        Assert.AreEqual(originalBorehole.BoreholeFiles.First().Description, copiedBorehole.BoreholeFiles.First().Description);

        Assert.AreNotSame(originalStratigraphy.Layers.First().LayerColorCodes, copiedstratigraphy.Layers.First().LayerColorCodes);
        Assert.AreEqual(originalStratigraphy.Layers.First().LayerColorCodes.Count, copiedstratigraphy.Layers.First().LayerColorCodes.Count);

        Assert.AreNotSame(originalStratigraphy.Layers.First().LayerGrainShapeCodes, copiedstratigraphy.Layers.First().LayerGrainShapeCodes);
        Assert.AreEqual(originalStratigraphy.Layers.First().LayerGrainShapeCodes.Count, copiedstratigraphy.Layers.First().LayerGrainShapeCodes.Count);

        Assert.AreNotSame(originalStratigraphy.Layers.First().LayerUscs3Codes, copiedstratigraphy.Layers.First().LayerUscs3Codes);
        Assert.AreEqual(originalStratigraphy.Layers.First().LayerUscs3Codes.Count, copiedstratigraphy.Layers.First().LayerUscs3Codes.Count);
    }

    private Borehole GetBorehole(int id)
    {
        return GetBoreholesWithIncludes(context.Boreholes).Single(b => b.Id == id);
    }

    // Get the id of a borehole with certain conditions.
    private int GetBoreholeIdToCopy()
    {
        var borehole = GetBoreholesWithIncludes(context.Boreholes)
            .Where(b =>
                b.Stratigraphies.First().Layers != null &&
                b.Stratigraphies.First().Layers.Any(x => x.LayerColorCodes != null && x.LayerColorCodes.Any()) &&
                b.Stratigraphies.First().Layers.Any(x => x.LayerGrainShapeCodes != null && x.LayerGrainShapeCodes.Any()) &&
                b.Stratigraphies.First().Layers.Any(x => x.LayerUscs3Codes != null && x.LayerUscs3Codes.Any()) &&
                b.Stratigraphies.First().LithologicalDescriptions != null &&
                b.Stratigraphies.First().FaciesDescriptions != null &&
                b.Stratigraphies.First().ChronostratigraphyLayers != null &&
                b.Stratigraphies.First().LithostratigraphyLayers != null &&
                b.BoreholeFiles.First().File != null &&
                b.Canton != null &&
                b.Stratigraphies.First().ChronostratigraphyLayers.First().ChronostratigraphyId != null)
            .FirstOrDefault();

        Assert.IsNotNull(borehole != null, "Precondition: No borehole for conditions found.");

        return borehole.Id;
    }

    [TestMethod]
    public async Task CopyInvalidBoreholeId()
    {
        var result = await controller.CopyAsync(0, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task CopyInvalidWorkgroupId()
    {
        var result = await controller.CopyAsync(boreholeId, workgroupId: 0).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyMissingWorkgroupPermission()
    {
        var result = await controller.CopyAsync(boreholeId, workgroupId: 2).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyWithUnknownUser()
    {
        controller.HttpContext.SetClaimsPrincipal("NON-EXISTENT-NAME", PolicyNames.Admin);
        var result = await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyWithUserNotSet()
    {
        controller.ControllerContext.HttpContext.User = null;
        await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () =>
        {
            await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        });
    }

    [TestMethod]
    public async Task CopyWithNonAdminUser()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);
        var result = await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);
        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
    }
}
