using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;

namespace BDMS.Controllers;

[TestClass]
public class WaterIngressControllerTests
{
    private BdmsContext context;
    private WaterIngressController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        controller = new WaterIngressController(context, new Mock<ILogger<WaterIngress>>().Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "TestUser") })),
                },
            },
        };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAsyncReturnsAllEntities()
    {
        var result = await controller.GetAsync();
        Assert.IsNotNull(result);
        Assert.AreEqual(95, result.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        var response = await controller.GetAsync(94578122).ConfigureAwait(false);
        IEnumerable<WaterIngress>? waterIngresses = response;
        Assert.IsNotNull(waterIngresses);
        Assert.AreEqual(0, waterIngresses.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeId()
    {
        var response = await controller.GetAsync(1007656).ConfigureAwait(false);
        IEnumerable<WaterIngress>? waterIngresses = response;
        Assert.IsNotNull(waterIngresses);
        Assert.AreEqual(1, waterIngresses.Count());
        var waterIngress = waterIngresses.Single();

        Assert.AreEqual(waterIngress.Id, 12000012);
        Assert.AreEqual(waterIngress.Type, ObservationType.WaterIngress);
        Assert.AreEqual(waterIngress.Duration, 1481.5525247052092);
        Assert.AreEqual(waterIngress.FromDepthM, 4335.7274957353839);
        Assert.AreEqual(waterIngress.ToDepthM, 4352.2518247958515);
        Assert.AreEqual(waterIngress.FromDepthMasl, 2340.3837938361726);
        Assert.AreEqual(waterIngress.ToDepthMasl, 891.04182925729162);
        Assert.AreEqual(waterIngress.CompletionFinished, false);
        Assert.AreEqual(waterIngress.Comment, "Assumenda minima placeat ea quidem unde accusamus neque qui omnis.");
        Assert.AreEqual(waterIngress.ReliabilityId, 15203157);
        Assert.AreEqual(waterIngress.QuantityId, 15203163);
        Assert.AreEqual(waterIngress.ConditionsId, 15203168);
    }

    [TestMethod]
    public async Task EditAsyncValidEntityUpdatesEntity()
    {
        var originalWaterIngress = new WaterIngress
        {
            Id = 1,
            Type = ObservationType.WaterIngress,
            StartTime = new DateTime(2006, 8, 21, 11, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2015, 11, 13, 14, 00, 00).ToUniversalTime(),
            Duration = 7909,
            FromDepthM = 67.789,
            ToDepthM = 78.15634,
            FromDepthMasl = 67.112,
            ToDepthMasl = 78.0043,
            CompletionFinished = true,
            Comment = "Test comment",
            BoreholeId = 1008104,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 4).Id,
            QuantityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressQualitySchema).Single(c => c.Geolcode == 1).Id,
            ConditionsId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressConditionsSchema).Single(c => c.Geolcode == 1).Id,
        };

        var updatedWaterIngress = new WaterIngress
        {
            Id = 1,
            Type = ObservationType.WaterIngress,
            StartTime = new DateTime(2021, 12, 30, 21, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2023, 1, 1, 13, 00, 00).ToUniversalTime(),
            Duration = 168,
            FromDepthM = 517.532,
            ToDepthM = 7602.12,
            FromDepthMasl = 828.774,
            ToDepthMasl = 27603.2,
            CompletionFinished = true,
            Comment = "Updated test comment",
            BoreholeId = 1008105,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 2).Id,
            QuantityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressQualitySchema).Single(c => c.Geolcode == 3).Id,
            ConditionsId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressConditionsSchema).Single(c => c.Geolcode == 2).Id,
        };

        context.WaterIngresses.Add(originalWaterIngress);
        await context.SaveChangesAsync();

        var result = await controller.EditAsync(updatedWaterIngress);

        Assert.IsNotNull(result);
        ActionResultAssert.IsOk(result);

        var editedWaterIngress = context.WaterIngresses.Include(w => w.Quantity).Single(w => w.Id == 1);
        Assert.AreEqual(updatedWaterIngress.Id, editedWaterIngress.Id);
        Assert.AreEqual(updatedWaterIngress.Type, editedWaterIngress.Type);
        Assert.AreEqual(updatedWaterIngress.StartTime, editedWaterIngress.StartTime);
        Assert.AreEqual(updatedWaterIngress.EndTime, editedWaterIngress.EndTime);
        Assert.AreEqual(updatedWaterIngress.Duration, editedWaterIngress.Duration);
        Assert.AreEqual(updatedWaterIngress.FromDepthM, editedWaterIngress.FromDepthM);
        Assert.AreEqual(updatedWaterIngress.ToDepthM, editedWaterIngress.ToDepthM);
        Assert.AreEqual(updatedWaterIngress.FromDepthMasl, editedWaterIngress.FromDepthMasl);
        Assert.AreEqual(updatedWaterIngress.ToDepthMasl, editedWaterIngress.ToDepthMasl);
        Assert.AreEqual(updatedWaterIngress.CompletionFinished, editedWaterIngress.CompletionFinished);
        Assert.AreEqual(updatedWaterIngress.Comment, editedWaterIngress.Comment);
        Assert.AreEqual(updatedWaterIngress.BoreholeId, editedWaterIngress.BoreholeId);
        Assert.AreEqual(updatedWaterIngress.ReliabilityId, editedWaterIngress.ReliabilityId);
        Assert.AreEqual(updatedWaterIngress.QuantityId, editedWaterIngress.QuantityId);
        Assert.AreEqual(updatedWaterIngress.ConditionsId, editedWaterIngress.ConditionsId);
    }

    [TestMethod]
    public async Task EditAsyncInvalidEntityReturnsNotFound()
    {
        var nonExistentWaterIngress = new WaterIngress { Id = 999 };

        var result = await controller.EditAsync(nonExistentWaterIngress) as NotFoundResult;

        Assert.IsNotNull(result);
        Assert.AreEqual(StatusCodes.Status404NotFound, result.StatusCode);
    }

    [TestMethod]
    public async Task CreateAndDeleteWaterIngressAsync()
    {
        var newWaterIngress = new WaterIngress
        {
            Type = ObservationType.WaterIngress,
            StartTime = new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime(),
            EndTime = new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime(),
            Duration = 118,
            FromDepthM = 17.532,
            ToDepthM = 702.12,
            FromDepthMasl = 82.714,
            ToDepthMasl = 2633.2,
            CompletionFinished = false,
            Comment = "New test comment",
            BoreholeId = 1006493,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 3).Id,
            QuantityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressQualitySchema).Single(c => c.Geolcode == 2).Id,
            ConditionsId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressConditionsSchema).Single(c => c.Geolcode == 3).Id,
        };

        var createResponse = await controller.CreateAsync(newWaterIngress);
        Assert.IsInstanceOfType(createResponse, typeof(OkObjectResult));

        newWaterIngress = await context.WaterIngresses.FindAsync(newWaterIngress.Id);
        Assert.IsNotNull(newWaterIngress);
        Assert.AreEqual(newWaterIngress.Type, ObservationType.WaterIngress);
        Assert.AreEqual(newWaterIngress.StartTime, new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime());
        Assert.AreEqual(newWaterIngress.EndTime, new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime());
        Assert.AreEqual(newWaterIngress.Duration, 118);
        Assert.AreEqual(newWaterIngress.FromDepthM, 17.532);
        Assert.AreEqual(newWaterIngress.ToDepthM, 702.12);
        Assert.AreEqual(newWaterIngress.FromDepthMasl, 82.714);
        Assert.AreEqual(newWaterIngress.ToDepthMasl, 2633.2);
        Assert.AreEqual(newWaterIngress.CompletionFinished, false);
        Assert.AreEqual(newWaterIngress.Comment, "New test comment");
        Assert.AreEqual(newWaterIngress.BoreholeId, 1006493);
        Assert.AreEqual(newWaterIngress.ReliabilityId, 15203158);
        Assert.AreEqual(newWaterIngress.QuantityId, 15203161);
        Assert.AreEqual(newWaterIngress.ConditionsId, 15203167);

        var deleteResponse = await controller.DeleteAsync(newWaterIngress.Id);
        Assert.IsInstanceOfType(deleteResponse, typeof(OkResult));

        deleteResponse = await controller.DeleteAsync(newWaterIngress.Id);
        Assert.IsInstanceOfType(deleteResponse, typeof(NotFoundResult));
    }
}
