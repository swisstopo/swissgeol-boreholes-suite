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
public class WaterIngressControllerTests
{
    private BdmsContext context;
    private WaterIngressController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
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
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAsyncReturnsAllEntities()
    {
        var result = await controller.GetAsync();
        Assert.IsNotNull(result);
        Assert.AreEqual(100, result.Count());
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
        var response = await controller.GetAsync(1006310).ConfigureAwait(false);
        IEnumerable<WaterIngress>? waterIngresses = response;
        Assert.IsNotNull(waterIngresses);
        Assert.AreEqual(1, waterIngresses.Count());
        var waterIngress = waterIngresses.Single();

        Assert.AreEqual(waterIngress.Id, 12000006);
        Assert.AreEqual(waterIngress.Type, ObservationType.WaterIngress);
        Assert.AreEqual(waterIngress.Duration, 1431.030546674519);
        Assert.AreEqual(waterIngress.FromDepthM, 624.9687835159566);
        Assert.AreEqual(waterIngress.ToDepthM, 3289.9314021146538);
        Assert.AreEqual(waterIngress.FromDepthMasl, 238.88833875948953);
        Assert.AreEqual(waterIngress.ToDepthMasl, 2469.2927605385394);
        Assert.AreEqual(waterIngress.CompletionFinished, true);
        Assert.AreEqual(waterIngress.Comment, "Sunt provident tempora rerum voluptatum tempora architecto est magni.");
        Assert.AreEqual(waterIngress.ReliabilityId, 15203158);
        Assert.AreEqual(waterIngress.QuantityId, 15203161);
        Assert.AreEqual(waterIngress.ConditionsId, 15203167);
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
            ReliabilityId = context.Codelists.Where(c => c.Schema == "observ101").Single(c => c.Geolcode == 4).Id,
            QuantityId = context.Codelists.Where(c => c.Schema == "waing101").Single(c => c.Geolcode == 1).Id,
            ConditionsId = context.Codelists.Where(c => c.Schema == "waing102").Single(c => c.Geolcode == 1).Id,
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
            ReliabilityId = context.Codelists.Where(c => c.Schema == "observ101").Single(c => c.Geolcode == 2).Id,
            QuantityId = context.Codelists.Where(c => c.Schema == "waing101").Single(c => c.Geolcode == 3).Id,
            ConditionsId = context.Codelists.Where(c => c.Schema == "waing102").Single(c => c.Geolcode == 2).Id,
        };

        try
        {
            context.WaterIngresses.Add(originalWaterIngress);
            await context.SaveChangesAsync();

            var result = await controller.EditAsync(updatedWaterIngress) as OkObjectResult;

            Assert.IsNotNull(result);
            Assert.AreEqual(StatusCodes.Status200OK, result.StatusCode);
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
        finally
        {
            var addedWaterIngress = context.WaterIngresses.Single(w => w.Id == 1);
            context.WaterIngresses.Remove(addedWaterIngress);
            await context.SaveChangesAsync();
        }
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
            Id = 3,
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
            ReliabilityId = context.Codelists.Where(c => c.Schema == "observ101").Single(c => c.Geolcode == 3).Id,
            QuantityId = context.Codelists.Where(c => c.Schema == "waing101").Single(c => c.Geolcode == 2).Id,
            ConditionsId = context.Codelists.Where(c => c.Schema == "waing102").Single(c => c.Geolcode == 3).Id,
        };

        try
        {
            var createResponse = await controller.CreateAsync(newWaterIngress);
            Assert.IsInstanceOfType(createResponse, typeof(OkObjectResult));

            newWaterIngress = await context.WaterIngresses.FindAsync(newWaterIngress.Id);
            Assert.IsNotNull(newWaterIngress);
            Assert.AreEqual(newWaterIngress.Id, 3);
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
        finally
        {
            var addedWaterIngress = context.WaterIngresses.SingleOrDefault(w => w.Id == 3);
            if (addedWaterIngress != null)
            {
                context.WaterIngresses.Remove(addedWaterIngress);
                await context.SaveChangesAsync();
            }
        }
    }
}
