using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace BDMS.Controllers;

[TestClass]
public class CompletionControllerTest
{
    private BdmsContext context;
    private CompletionController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        controller = new CompletionController(context, new Mock<ILogger<Completion>>().Object);
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
        var response = await controller.GetAsync().ConfigureAwait(false);
        IEnumerable<Completion>? completions = response?.Value;
        Assert.IsNotNull(completions);
        Assert.AreEqual(500, completions.Count());
    }

    [TestMethod]
    public async Task GetAsyncFilterByBoreholeId()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion1 = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == "completion_kind").Id,
        };
        var completion2 = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "EINSTEINVIEW",
            KindId = context.Codelists.First(c => c.Schema == "completion_kind").Id,
        };

        context.Completions.Add(completion1);
        context.Completions.Add(completion2);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var response = await controller.GetAsync(borehole.Id).ConfigureAwait(false);

        IEnumerable<Completion>? completions = response?.Value;
        Assert.IsNotNull(completions);
        Assert.AreEqual(2, completions.Count());
    }

    [TestMethod]
    public async Task GetByIdAsync()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == "completion_kind").Id,
        };

        context.Completions.Add(completion);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var response = await controller.GetByIdAsync(completion.Id).ConfigureAwait(false);
        var okResult = response.Result as OkObjectResult;
        var completionResult = okResult.Value as Completion;
        Assert.IsNotNull(completionResult);
        Assert.AreEqual(completion.Id, completionResult.Id);
        Assert.AreEqual(completion.Name, completionResult.Name);
        Assert.AreEqual(completion.KindId, completionResult.KindId);
    }

    [TestMethod]
    public async Task CreateCompletion()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == "completion_kind").Id,
        };

        var response = await controller.CreateAsync(completion).ConfigureAwait(false);
        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));

        completion = await context.Completions.FindAsync(completion.Id);
        Assert.IsNotNull(completion);
        Assert.AreEqual("AUTOTHUNDER", completion.Name);
        Assert.AreEqual(borehole.Id, completion.BoreholeId);
    }

    [TestMethod]
    public async Task EditCompletion()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == "completion_kind").Id,
        };

        context.Completions.Add(completion);
        await context.SaveChangesAsync().ConfigureAwait(false);

        completion.Name = "ENDUETRUCK";
        completion.AbandonDate = new DateTime(2023, 01, 01).ToUniversalTime();
        var response = await controller.EditAsync(completion).ConfigureAwait(false);
        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));

        completion = await context.Completions.FindAsync(completion.Id);
        Assert.IsNotNull(completion);
        Assert.AreEqual("ENDUETRUCK", completion.Name);
        Assert.AreEqual(borehole.Id, completion.BoreholeId);
        Assert.AreEqual(new DateTime(2023, 01, 01).ToUniversalTime(), completion.AbandonDate);
}

    [TestMethod]
    public async Task DeleteCompletion()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var completion = new Completion
        {
            BoreholeId = borehole.Id,
            Name = "AUTOTHUNDER",
            KindId = context.Codelists.First(c => c.Schema == "completion_kind").Id,
        };

        context.Completions.Add(completion);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var response = await controller.DeleteAsync(completion.Id).ConfigureAwait(false);
        Assert.IsInstanceOfType(response, typeof(OkResult));

        completion = await context.Completions.FindAsync(completion.Id);
        Assert.IsNull(completion);
    }
}
