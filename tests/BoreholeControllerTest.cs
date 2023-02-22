using BDMS.Authentication;
using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class BoreholeControllerTest
{
    private const int BoreholeId = 1_007_108;
    private const int DefaultWorkgroupId = 1;

    private BdmsContext context;
    private BoreholeController controller;

    private int boreholeCount;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new BoreholeController(context, new Mock<ILogger<BoreholeController>>().Object) { ControllerContext = GetControllerContextAdmin() };

        boreholeCount = context.Boreholes.Count();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Assert.AreEqual(boreholeCount, context.Boreholes.Count(), "Tests need to remove boreholes, they created.");

        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task Copy()
    {
        Borehole? copiedBorehole = null;

        try
        {
            var originalBorehole = GetBorehole(BoreholeId);
            Assert.IsNotNull(originalBorehole?.Stratigraphies?.First()?.Layers, "Precondition: Borehole has Stratigraphy Layers");
            Assert.IsTrue(originalBorehole?.Stratigraphies.First().Layers.Any(x => x.LayerCodelists?.Any() ?? false), "Precondition: Borehole has layers with multiple codelist values");
            Assert.IsNotNull(originalBorehole?.Stratigraphies?.First()?.LithologicalDescriptions, "Precondition: Borehole has Stratigraphy LithologicalDescriptions");
            Assert.IsNotNull(originalBorehole?.Stratigraphies?.First()?.FaciesDescriptions, "Precondition: Borehole has Stratigraphy FaciesDescriptions");
            Assert.IsNotNull(originalBorehole?.BoreholeFiles?.First()?.File, "Precondition: Borehole has Files");
            Assert.IsNotNull(originalBorehole?.Canton, "Precondition: Borehole has Canton assigned");

            var result = await controller.CopyAsync(BoreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));

            var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
            Assert.IsNotNull(copiedBoreholeId);
            Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
            copiedBorehole = GetBorehole((int)copiedBoreholeId);

            Assert.AreEqual("Samanta Cummings (Copy)", copiedBorehole.OriginalName);
            Assert.AreEqual("controller", copiedBorehole.CreatedBy.Name);
            Assert.AreEqual("admin", copiedBorehole.UpdatedBy.Name);
            Assert.AreEqual(DefaultWorkgroupId, copiedBorehole.Workgroup.Id);
            Assert.AreEqual(1, copiedBorehole.Workflows.Count);
            Assert.AreEqual(Role.Editor, copiedBorehole.Workflows.First().Role);
            Assert.AreSame(originalBorehole.Kind, copiedBorehole.Kind);
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
            Assert.AreEqual("Buckinghamshire withdrawal", copiedstratigraphy.Layers.First().Casing);

            Assert.AreNotSame(originalStratigraphy.LithologicalDescriptions, copiedstratigraphy.LithologicalDescriptions);
            Assert.AreNotEqual(originalStratigraphy.LithologicalDescriptions.First().Id, copiedstratigraphy.LithologicalDescriptions.First().Id);
            Assert.AreEqual("Buckinghamshire withdrawal collaborative", copiedstratigraphy.LithologicalDescriptions.First().Description);

            Assert.AreNotSame(originalStratigraphy.FaciesDescriptions, copiedstratigraphy.FaciesDescriptions);
            Assert.AreNotEqual(originalStratigraphy.FaciesDescriptions.First().Id, copiedstratigraphy.FaciesDescriptions.First().Id);
            Assert.AreEqual("Buckinghamshire withdrawal collaborative", copiedstratigraphy.FaciesDescriptions.First().Description);

            Assert.AreNotSame(originalBorehole.BoreholeFiles, copiedBorehole.BoreholeFiles);
            Assert.AreNotEqual(originalBorehole.BoreholeFiles.First().BoreholeId, copiedBorehole.BoreholeFiles.First().BoreholeId);
            Assert.AreEqual(originalBorehole.BoreholeFiles.First().FileId, copiedBorehole.BoreholeFiles.First().FileId);
            Assert.AreEqual(null, copiedBorehole.BoreholeFiles.First().Description);

            Assert.AreNotSame(originalStratigraphy.Layers.First().LayerCodelists, copiedstratigraphy.Layers.First().LayerCodelists);
            Assert.AreEqual(originalStratigraphy.Layers.First().LayerCodelists.Count, copiedstratigraphy.Layers.First().LayerCodelists.Count);
        }
        finally
        {
            // Delete borehole copy
            if (copiedBorehole != null)
            {
                var stratigraphiesToRemove = copiedBorehole.Stratigraphies;
                var layersToRemove = stratigraphiesToRemove.SelectMany(s => s.Layers);
                var lithologicalDescriptionsToRemove = stratigraphiesToRemove.SelectMany(s => s.LithologicalDescriptions);
                var faciesDescriptionsToRemove = stratigraphiesToRemove.SelectMany(s => s.FaciesDescriptions);
                context.Layers.RemoveRange(layersToRemove);
                context.LithologicalDescriptions.RemoveRange(lithologicalDescriptionsToRemove);
                context.FaciesDescriptions.RemoveRange(faciesDescriptionsToRemove);
                context.Stratigraphies.RemoveRange(stratigraphiesToRemove);
                context.Boreholes.Remove(copiedBorehole);
                context.SaveChanges();
            }
        }
    }

    private Borehole GetBorehole(int id)
    {
        return context.Boreholes
            .Include(b => b.BoreholeFiles)
            .Include(b => b.Files)
            .Include(b => b.Workflows)
            .Include(b => b.Workgroup)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerCodelists)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.LithologicalDescriptions)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.FaciesDescriptions)
            .Include(b => b.CreatedBy)
            .Include(b => b.UpdatedBy)
            .Include(b => b.LockedBy)
            .Include(b => b.Kind)
            .Single(b => b.Id == id);
    }

    [TestMethod]
    public async Task CopyInvalidBoreholeId()
    {
        var result = await controller.CopyAsync(0, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task CopyInvalidWorkgroupId()
    {
        var result = await controller.CopyAsync(BoreholeId, workgroupId: 0).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task CopyMissingWorkgroupPermission()
    {
        var result = await controller.CopyAsync(BoreholeId, workgroupId: 2).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task CopyWithUnknownUser()
    {
        controller.HttpContext.SetClaimsPrincipal("NON-EXISTENT-NAME", PolicyNames.Admin);
        var result = await controller.CopyAsync(BoreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task CopyWithUserNotSet()
    {
        controller.ControllerContext.HttpContext.User = null;
        await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () =>
        {
            await controller.CopyAsync(BoreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        });
    }

    [TestMethod]
    public async Task CopyWithNonAdminUser()
    {
        controller.HttpContext.SetClaimsPrincipal("editor", PolicyNames.Viewer);
        var result = await controller.CopyAsync(BoreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));

        // delete borehole copy
        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
        var copiedBorehole = context.Boreholes.Single(b => b.Id == (int)copiedBoreholeId);
        var stratigraphiesToRemove = copiedBorehole.Stratigraphies;
        var layersToRemove = stratigraphiesToRemove.SelectMany(s => s.Layers);
        var lithologicalDescriptionsToRemove = stratigraphiesToRemove.SelectMany(s => s.LithologicalDescriptions);
        var faciesDescriptionsToRemove = stratigraphiesToRemove.SelectMany(s => s.FaciesDescriptions);
        context.Layers.RemoveRange(layersToRemove);
        context.LithologicalDescriptions.RemoveRange(lithologicalDescriptionsToRemove);
        context.FaciesDescriptions.RemoveRange(faciesDescriptionsToRemove);
        context.Stratigraphies.RemoveRange(stratigraphiesToRemove);
        context.Boreholes.Remove(copiedBorehole);
        context.SaveChanges();
    }
}
