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
public class StratigraphyControllerTest
{
    private const int StratigraphyId = 6_000_003;

    private BdmsContext context;
    private StratigraphyController controller;

    private int stratigraphyCount;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new StratigraphyController(context, new Mock<ILogger<StratigraphyController>>().Object) { ControllerContext = GetControllerContextAdmin() };

        stratigraphyCount = context.Stratigraphies.Count();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Assert.AreEqual(stratigraphyCount, context.Stratigraphies.Count(), "Tests need to remove stratigraphies, they created.");

        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task Copy()
    {
        Stratigraphy? copiedStratigraphy = null;

        try
        {
            var originalStratigraphy = GetStratigraphy(StratigraphyId);
            Assert.IsNotNull(originalStratigraphy?.Layers, "Precondition: Stratigraphy has Layers");
            Assert.IsTrue(originalStratigraphy?.Layers.Any(x => x.LayerCodelists?.Any() ?? false), "Precondition: Stratigraphy has layers with multiple codelist values");
            Assert.IsNotNull(originalStratigraphy?.LithologicalDescriptions, "Precondition: Stratigraphy has LithologicalDescriptions");
            Assert.IsNotNull(originalStratigraphy?.FaciesDescriptions, "Precondition: Stratigraphy has FaciesDescriptions");

            var result = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));

            var copiedStratigraphyId = ((OkObjectResult?)result.Result)?.Value;
            Assert.IsNotNull(copiedStratigraphyId);
            Assert.IsInstanceOfType(copiedStratigraphyId, typeof(int));
            copiedStratigraphy = GetStratigraphy((int)copiedStratigraphyId);

            Assert.AreEqual("Earnest Little (Clone)", copiedStratigraphy.Name);
            Assert.AreEqual("admin", copiedStratigraphy.CreatedBy.Name);
            Assert.AreEqual("controller", copiedStratigraphy.UpdatedBy.Name);
            Assert.AreSame(originalStratigraphy.Kind, copiedStratigraphy.Kind);
            Assert.AreEqual(originalStratigraphy.FillCasing.Kind, copiedStratigraphy.FillCasing.Kind);

            Assert.AreNotEqual(originalStratigraphy.Id, copiedStratigraphy.Id);
            Assert.AreNotSame(originalStratigraphy.Layers, copiedStratigraphy.Layers);
            Assert.AreNotEqual(originalStratigraphy.Layers.First().Id, copiedStratigraphy.Layers.First().Id);
            Assert.AreEqual("Drives olive", copiedStratigraphy.Layers.First().Casing);

            Assert.AreNotSame(originalStratigraphy.LithologicalDescriptions, copiedStratigraphy.LithologicalDescriptions);
            Assert.AreNotEqual(originalStratigraphy.LithologicalDescriptions.First().Id, copiedStratigraphy.LithologicalDescriptions.First().Id);
            Assert.AreEqual("Drives olive mobile", copiedStratigraphy.LithologicalDescriptions.First().Description);

            Assert.AreNotSame(originalStratigraphy.FaciesDescriptions, copiedStratigraphy.FaciesDescriptions);
            Assert.AreNotEqual(originalStratigraphy.FaciesDescriptions.First().Id, copiedStratigraphy.FaciesDescriptions.First().Id);
            Assert.AreEqual("Drives olive mobile", copiedStratigraphy.FaciesDescriptions.First().Description);

            Assert.AreNotSame(originalStratigraphy.Layers.First().LayerCodelists, copiedStratigraphy.Layers.First().LayerCodelists);
            Assert.AreEqual(originalStratigraphy.Layers.First().LayerCodelists.Count, copiedStratigraphy.Layers.First().LayerCodelists.Count);
        }
        finally
        {
            // Delete stratigraphy copy
            if (copiedStratigraphy != null)
            {
                context.Stratigraphies.Remove(copiedStratigraphy);
                context.SaveChanges();
            }
        }
    }

    private Stratigraphy GetStratigraphy(int id)
    {
        return context.Stratigraphies
            .Include(s => s.CreatedBy)
            .Include(s => s.UpdatedBy)
            .Include(s => s.Kind)
            .Include(s => s.FillCasing)
            .Include(s => s.Layers).ThenInclude(l => l.LayerCodelists)
            .Include(s => s.LithologicalDescriptions)
            .Include(s => s.FaciesDescriptions)
            .Single(s => s.Id == id);
    }

    [TestMethod]
    public async Task CopyInvalidStratigraphyId()
    {
        var result = await controller.CopyAsync(0).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task CopyWithUnknownUser()
    {
        controller.HttpContext.SetClaimsPrincipal("NON-EXISTENT-NAME", PolicyNames.Admin);
        var result = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task CopyWithUserNotSet()
    {
        controller.ControllerContext.HttpContext.User = null;
        await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () =>
        {
            await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        });
    }

    [TestMethod]
    public async Task CopyWithNonAdminUser()
    {
        controller.HttpContext.SetClaimsPrincipal("editor", PolicyNames.Viewer);
        var result = await controller.CopyAsync(StratigraphyId).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));

        // delete stratigraphy copy
        var copiedStratigraphyId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedStratigraphyId);
        Assert.IsInstanceOfType(copiedStratigraphyId, typeof(int));
        var copiedStratigraphy = context.Stratigraphies.Single(s => s.Id == (int)copiedStratigraphyId);
        context.Layers.RemoveRange(copiedStratigraphy.Layers);
        context.LithologicalDescriptions.RemoveRange(copiedStratigraphy.LithologicalDescriptions);
        context.FaciesDescriptions.RemoveRange(copiedStratigraphy.FaciesDescriptions);
        context.Stratigraphies.Remove(copiedStratigraphy);
        context.SaveChanges();
    }
}
