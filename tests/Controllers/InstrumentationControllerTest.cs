using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace BDMS.Controllers;

[TestClass]
public class InstrumentationControllerTest
{
    private BdmsContext context;
    private InstrumentationController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        controller = new InstrumentationController(context, new Mock<ILogger<Instrumentation>>().Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAsync()
    {
        IEnumerable<Instrumentation>? instrumentations = await controller.GetAsync().ConfigureAwait(false);
        Assert.IsNotNull(instrumentations);
        Assert.AreEqual(500, instrumentations.Count());
    }

    [TestMethod]
    public async Task GetAsyncFilterByCompletionId()
    {
        // Precondition: Find a group of two instrumentations with the same completion id.
        var completions = await context.Instrumentations.ToListAsync();
        var completionId = completions
            .GroupBy(i => i.CompletionId)
            .Where(g => g.Count() == 2)
            .First().Key;

        IEnumerable<Instrumentation>? instrumentations = await controller.GetAsync(completionId).ConfigureAwait(false);
        Assert.IsNotNull(instrumentations);
        Assert.AreEqual(2, instrumentations.Count());
    }

    [TestMethod]
    public async Task GetByIdAsync()
    {
        var instrumentationId = context.Instrumentations.First().Id;

        var response = await controller.GetByIdAsync(instrumentationId).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var instrumentation = okResult.Value as Instrumentation;
        Assert.IsNotNull(instrumentation);
        Assert.AreEqual(instrumentationId, instrumentation.Id);
    }

    [TestMethod]
    public async Task CreateAsync()
    {
        var completionId = context.Completions.First().Id;
        var instrumentation = new Instrumentation()
        {
            InstrumentationName = "REDWALK",
            CompletionId = completionId,
            StatusId = context.Codelists.First(c => c.Schema == CompletionSchemas.InstrumentationStatusSchema).Id,
            KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.InstrumentationKindSchema).Id,
            Notes = "ARGONSHIP",
            FromDepth = 0,
            ToDepth = 100,
        };

        var response = await controller.CreateAsync(instrumentation);
        var okResult = response.Result as OkObjectResult;
        instrumentation = okResult.Value as Instrumentation;
        Assert.IsNotNull(instrumentation);

        instrumentation = await context.Instrumentations.FindAsync(instrumentation.Id);
        Assert.IsNotNull(instrumentation);
        Assert.AreEqual(completionId, instrumentation.CompletionId);
        Assert.AreEqual("REDWALK", instrumentation.InstrumentationName);
        Assert.AreEqual("ARGONSHIP", instrumentation.Notes);
        Assert.AreEqual(0, instrumentation.FromDepth);
        Assert.AreEqual(100, instrumentation.ToDepth);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.InstrumentationStatusSchema).Id, instrumentation.StatusId);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.InstrumentationKindSchema).Id, instrumentation.KindId);
    }

    [TestMethod]
    public async Task EditAsync()
    {
        var instrumentation = context.Instrumentations.First();
        var completionId = instrumentation.CompletionId;

        instrumentation.InstrumentationName = "OCTAVEBOOK";
        instrumentation.StatusId = context.Codelists.First(c => c.Schema == CompletionSchemas.InstrumentationStatusSchema).Id;
        instrumentation.KindId = context.Codelists.First(c => c.Schema == CompletionSchemas.InstrumentationKindSchema).Id;
        instrumentation.Notes = "COLLAR";
        instrumentation.FromDepth = 50;
        instrumentation.ToDepth = 200;

        var response = await controller.EditAsync(instrumentation);
        var okResult = response.Result as OkObjectResult;
        instrumentation = okResult.Value as Instrumentation;
        Assert.IsNotNull(instrumentation);

        instrumentation = await context.Instrumentations.FindAsync(instrumentation.Id);
        Assert.IsNotNull(instrumentation);
        Assert.AreEqual(completionId, instrumentation.CompletionId);
        Assert.AreEqual("OCTAVEBOOK", instrumentation.InstrumentationName);
        Assert.AreEqual("COLLAR", instrumentation.Notes);
        Assert.AreEqual(50, instrumentation.FromDepth);
        Assert.AreEqual(200, instrumentation.ToDepth);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.InstrumentationStatusSchema).Id, instrumentation.StatusId);
        Assert.AreEqual(context.Codelists.First(c => c.Schema == CompletionSchemas.InstrumentationKindSchema).Id, instrumentation.KindId);
    }

    [TestMethod]
    public async Task DeleteInstrumentation()
    {
        var instrumentation = context.Instrumentations.First();

        var completionCount = context.Completions.Count();
        var instrumentationCount = context.Instrumentations.Count();

        var response = await controller.DeleteAsync(instrumentation.Id);
        Assert.IsInstanceOfType(response, typeof(OkResult));

        instrumentation = await context.Instrumentations.FindAsync(instrumentation.Id);
        Assert.IsNull(instrumentation);
        Assert.AreEqual(completionCount, context.Completions.Count());
        Assert.AreEqual(instrumentationCount - 1, context.Instrumentations.Count());
    }
}
