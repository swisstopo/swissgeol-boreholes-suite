using BDMS.Authentication;
using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;

namespace BDMS;

[TestClass]
public class BoreholeControllerTest
{
    private const int BoreholeId = 1001;
    private const int DefaultWorkgroupId = 1;

    private BdmsContext context;
    private BoreholeController controller;

    private int boreholeCount;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new BoreholeController(context, new Mock<ILogger<BoreholeController>>().Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
        SetAdminClaimsPrincipal();

        boreholeCount = context.Boreholes.Count();
    }

    private void SetAdminClaimsPrincipal()
    {
        SetClaimsPrincipal("admin", PolicyNames.Admin);
    }

    private void SetClaimsPrincipal(string name, string role)
    {
        var adminClaims = new List<Claim>()
        {
           new Claim(ClaimTypes.Name, name),
           new Claim(ClaimTypes.Role, role),
        };

        var userIdentity = new ClaimsIdentity(adminClaims, "TestAuthType");
        var userClaimsPrincipal = new ClaimsPrincipal(userIdentity);

        controller.ControllerContext.HttpContext.User = userClaimsPrincipal;
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
        var originalBorehole = GetBorehole(BoreholeId);
        Assert.IsNotNull(originalBorehole?.Stratigraphies?.First()?.Layers, "Precondition: Boreholes has Stratigraphy Layers");
        Assert.IsNotNull(originalBorehole?.BoreholeFiles?.First()?.File, "Precondition: Borehole has Files");
        Assert.IsNotNull(originalBorehole?.Canton, "Precondition: Borehole has Canton assigned");
        Assert.AreNotEqual(DefaultWorkgroupId, originalBorehole.Workgroup.Id, "Precondition: Target Workgroup is different");

        var result = await controller.CopyAsync(BoreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));

        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
        var copiedBorehole = GetBorehole((int)copiedBoreholeId);

        Assert.AreEqual("Monique Schneider (Copy)", copiedBorehole.OriginalName);
        Assert.AreEqual("validator", copiedBorehole.CreatedBy.Name);
        Assert.AreEqual(DefaultWorkgroupId, copiedBorehole.Workgroup.Id);
        Assert.AreEqual(1, copiedBorehole.Workflows.Count);
        Assert.AreEqual(Role.Editor, copiedBorehole.Workflows.First().Role);
        Assert.AreSame(originalBorehole.Kind, copiedBorehole.Kind);
        Assert.AreSame(originalBorehole.Canton, copiedBorehole.Canton);

        Assert.AreNotEqual(originalBorehole.Id, copiedBorehole.Id);
        Assert.AreNotSame(originalBorehole.Stratigraphies, copiedBorehole.Stratigraphies);
        Assert.AreNotEqual(originalBorehole.Stratigraphies.First().Id, copiedBorehole.Stratigraphies.First());
        Assert.AreNotSame(originalBorehole.Stratigraphies.First().Layers, copiedBorehole.Stratigraphies.First().Layers);
        Assert.AreNotEqual(originalBorehole.Stratigraphies.First().Layers.First().Id, copiedBorehole.Stratigraphies.First().Layers.First().Id);
        Assert.AreEqual("virtual frictionless", copiedBorehole.Stratigraphies.First().Layers.First().Casing);

        Assert.AreNotSame(originalBorehole.BoreholeFiles, copiedBorehole.BoreholeFiles);
        Assert.AreNotEqual(originalBorehole.BoreholeFiles.First().BoreholeId, copiedBorehole.BoreholeFiles.First().BoreholeId);
        Assert.AreEqual(originalBorehole.BoreholeFiles.First().FileId, copiedBorehole.BoreholeFiles.First().FileId);
        Assert.AreEqual("Tactics 24/365 Intelligent Concrete Chicken", copiedBorehole.BoreholeFiles.First().Description);

        // delete borehole copy
        var stratigraphiesToRemove = copiedBorehole.Stratigraphies;
        var layersToRemove = stratigraphiesToRemove.SelectMany(s => s.Layers);
        context.Layers.RemoveRange(layersToRemove);
        context.Stratigraphies.RemoveRange(stratigraphiesToRemove);
        context.Boreholes.Remove(copiedBorehole);
        context.SaveChanges();
    }

    private Borehole GetBorehole(int id)
    {
        return context.Boreholes
            .Include(b => b.BoreholeFiles)
            .Include(b => b.Files)
            .Include(b => b.Workflows)
            .Include(b => b.Workgroup)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers)
            .Include(b => b.CreatedBy)
            .Include(b => b.UpdatedBy)
            .Include(b => b.LockedBy)
            .Include(b => b.Kind)
            .Include(b => b.Canton)
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
        SetClaimsPrincipal("NON-EXISTENT-NAME", PolicyNames.Admin);
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
        SetClaimsPrincipal("editor", PolicyNames.Viewer);
        var result = await controller.CopyAsync(BoreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));

        // delete borehole copy
        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
        var copiedBorehole = context.Boreholes.Single(b => b.Id == (int)copiedBoreholeId);
        var stratigraphiesToRemove = copiedBorehole.Stratigraphies;
        var layersToRemove = stratigraphiesToRemove.SelectMany(s => s.Layers);
        context.Layers.RemoveRange(layersToRemove);
        context.Stratigraphies.RemoveRange(stratigraphiesToRemove);
        context.Boreholes.Remove(copiedBorehole);
        context.SaveChanges();
    }
}
