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
    private BdmsContext context;
    private BoreholeController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new BoreholeController(ContextFactory.CreateContext(), new Mock<ILogger<BoreholeController>>().Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
        SetAdminClaimsPrincipal();
    }

    private void SetAdminClaimsPrincipal()
    {
        var adminClaims = new List<Claim>()
        {
           new Claim(ClaimTypes.Name, "admin"),
           new Claim(ClaimTypes.Role, PolicyNames.Admin),
        };

        var adminIdentity = new ClaimsIdentity(adminClaims, "TestAuthType");
        var adminClaimsPrincipal = new ClaimsPrincipal(adminIdentity);

        controller.ControllerContext.HttpContext.User = adminClaimsPrincipal;
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task Copy()
    {
        const int BOREHOLE_ID = 1001;
        const int WORKGROUP_ID = 1;

        var originalBorehole = GetBorehole(BOREHOLE_ID);
        Assert.IsNotNull(originalBorehole?.Stratigraphies?.First()?.Layers, "Precondition: Boreholes has Stratigraphy Layers");
        Assert.IsNotNull(originalBorehole?.BoreholeFiles?.First()?.File, "Precondition: Borehole has Files");
        Assert.IsNotNull(originalBorehole?.Canton, "Precondition: Borehole has Canton assigned");
        Assert.AreNotEqual(WORKGROUP_ID, originalBorehole.Workgroup.Id, "Precondition: Target Workgroup is different");

        var result = await controller.CopyAsync(BOREHOLE_ID, workgroupId: WORKGROUP_ID).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));

        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
        var copiedBorehole = GetBorehole((int)copiedBoreholeId);

        Assert.AreEqual("Alfred Franecki (Copy)", copiedBorehole.OriginalName);
        Assert.AreEqual("admin", copiedBorehole.CreatedBy.Name);
        Assert.AreEqual(WORKGROUP_ID, copiedBorehole.Workgroup.Id);
        Assert.AreEqual(1, copiedBorehole.Workflows.Count);
        Assert.AreEqual(Role.Editor, copiedBorehole.Workflows.First().Role);

        Assert.AreNotSame(originalBorehole, copiedBorehole);
        Assert.AreNotSame(originalBorehole.Stratigraphies, copiedBorehole.Stratigraphies);
        Assert.AreNotSame(originalBorehole.Stratigraphies.First(), copiedBorehole.Stratigraphies.First());
        Assert.AreNotSame(originalBorehole.Stratigraphies.First().Layers, copiedBorehole.Stratigraphies.First().Layers);
        Assert.AreNotSame(originalBorehole.Stratigraphies.First().Layers.First(), copiedBorehole.Stratigraphies.First().Layers.First());
        Assert.AreNotSame(originalBorehole.BoreholeFiles, copiedBorehole.BoreholeFiles);
        Assert.AreNotSame(originalBorehole.BoreholeFiles.First(), copiedBorehole.BoreholeFiles.First());
        Assert.AreSame(originalBorehole.BoreholeFiles.First().File, copiedBorehole.BoreholeFiles.First().File);
        Assert.AreSame(originalBorehole.Kind, copiedBorehole.Kind);
        Assert.AreSame(originalBorehole.Canton, copiedBorehole.Canton);
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
        var result = await controller.CopyAsync(0, workgroupId: 1).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task CopyInvalidWorkgroupId()
    {
        var result = await controller.CopyAsync(1000, workgroupId: 0).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task CopyMissingWorkgroupPermission()
    {
        var result = await controller.CopyAsync(1000, workgroupId: 2).ConfigureAwait(false);
        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
    }
}
