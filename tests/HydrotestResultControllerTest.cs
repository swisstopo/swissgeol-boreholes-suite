using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;

namespace BDMS;

[TestClass]
public class HydrotestResultControllerTests
{
    private BdmsContext context;
    private HydrotestResultController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new HydrotestResultController(context, new Mock<ILogger<HydrotestResult>>().Object)
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
        Assert.AreEqual(1000, result.Count());
    }

    [TestMethod]
    public async Task GetEntriesByHydrotestIdForInexistentId()
    {
        var response = await controller.GetAsync(78194522).ConfigureAwait(false);
        IEnumerable<HydrotestResult>? hydrotestresults = response;
        Assert.IsNotNull(hydrotestresults);
        Assert.AreEqual(0, hydrotestresults.Count());
    }

    [TestMethod]
    public async Task GetEntriesByHydrotestId()
    {
        var response = await controller.GetAsync(12000224).ConfigureAwait(false);
        IEnumerable<HydrotestResult>? hydrotestresults = response;
        Assert.IsNotNull(hydrotestresults);
        Assert.AreEqual(10, hydrotestresults.Count());
        var hydrotestresult = hydrotestresults.Single(r => r.Id == 13000750);

        Assert.AreEqual(hydrotestresult.ParameterId, 15203199);
        Assert.AreEqual(hydrotestresult.Value, 4549.886689249839);
        Assert.AreEqual(hydrotestresult.MaxValue, 3690.1116296658811);
        Assert.AreEqual(hydrotestresult.MinValue, 4426.2353720856991);
        Assert.AreEqual(hydrotestresult.HydrotestId, 12000224);
    }

    [TestMethod]
    public async Task EditAsyncValidEntityUpdatesEntity()
    {
        var originalHydrotestResult = new HydrotestResult
        {
            Id = 1,
            ParameterId = 15203199,
            Value = 131.308,
            MaxValue = 729.9095590039667,
            MinValue = 400.90625233105675,
            HydrotestId = 12000239,
        };

        var updatedHydrotestResult = new HydrotestResult
        {
            Id = 1,
            ParameterId = 15203197,
            Value = 670.5039,
            MaxValue = 1538.702,
            MinValue = 729.9095590,
            HydrotestId = 12000465,
        };

        try
        {
            context.HydrotestResults.Add(originalHydrotestResult);
            await context.SaveChangesAsync();

            var result = await controller.EditAsync(updatedHydrotestResult) as OkObjectResult;

            Assert.IsNotNull(result);
            Assert.AreEqual(StatusCodes.Status200OK, result.StatusCode);
            var editedHydrotestResult = context.HydrotestResults.Single(w => w.Id == 1);

            Assert.AreEqual(editedHydrotestResult.ParameterId, updatedHydrotestResult.ParameterId);
            Assert.AreEqual(editedHydrotestResult.Value, updatedHydrotestResult.Value);
            Assert.AreEqual(editedHydrotestResult.MaxValue, updatedHydrotestResult.MaxValue);
            Assert.AreEqual(editedHydrotestResult.MinValue, updatedHydrotestResult.MinValue);
            Assert.AreEqual(editedHydrotestResult.HydrotestId, updatedHydrotestResult.HydrotestId);
        }
        finally
        {
            var addedHydrotestResult = context.HydrotestResults.Single(w => w.Id == 1);
            context.HydrotestResults.Remove(addedHydrotestResult);
            await context.SaveChangesAsync();
        }
    }

    [TestMethod]
    public async Task EditAsyncInvalidEntityReturnsNotFound()
    {
        var nonExistentHydrotestResult = new HydrotestResult { Id = 999 };

        var result = await controller.EditAsync(nonExistentHydrotestResult) as NotFoundResult;

        Assert.IsNotNull(result);
        Assert.AreEqual(StatusCodes.Status404NotFound, result.StatusCode);
    }

    [TestMethod]
    public async Task CreateAndDeleteHydrotestResultAsync()
    {
        var newHydrotestResult = new HydrotestResult
        {
            ParameterId = 15203202,
            Value = 945571.16489,
            MinValue = 9971.11289,
            MaxValue = 788.22481,
            HydrotestId = 12000300,
        };

        try
        {
            var createResponse = await controller.CreateAsync(newHydrotestResult);
            Assert.IsInstanceOfType(createResponse, typeof(OkObjectResult));

            newHydrotestResult = await context.HydrotestResults.FindAsync(newHydrotestResult.Id);
            Assert.IsNotNull(newHydrotestResult);
            Assert.AreEqual(newHydrotestResult.ParameterId, 15203202);
            Assert.AreEqual(newHydrotestResult.Value, 945571.16489);
            Assert.AreEqual(newHydrotestResult.MinValue, 9971.11289);
            Assert.AreEqual(newHydrotestResult.MaxValue, 788.22481);
            Assert.AreEqual(newHydrotestResult.HydrotestId, 12000300);

            var deleteResponse = await controller.DeleteAsync(newHydrotestResult.Id);
            Assert.IsInstanceOfType(deleteResponse, typeof(OkResult));

            deleteResponse = await controller.DeleteAsync(newHydrotestResult.Id);
            Assert.IsInstanceOfType(deleteResponse, typeof(NotFoundResult));
        }
        finally
        {
            var addedHydrotestResult = context.HydrotestResults.SingleOrDefault(w => w.Id == 3);
            if (addedHydrotestResult != null)
            {
                context.HydrotestResults.Remove(addedHydrotestResult);
                await context.SaveChangesAsync();
            }
        }
    }
}
