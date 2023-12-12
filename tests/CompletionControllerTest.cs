using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace BDMS;

[TestClass]
public class CompletionControllerTest
{
    private BdmsContext context;
    private CompletionController controller;

    private int boreholeCount;
    private int completionCount;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new CompletionController(context, new Mock<ILogger<Completion>>().Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();

        boreholeCount = context.Boreholes.Count();
        completionCount = context.Completions.Count();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Assert.AreEqual(boreholeCount, context.Boreholes.Count(), "Tests need to remove boreholes they created.");
        Assert.AreEqual(completionCount, context.Completions.Count(), "Tests need to remove completions they created.");
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

        try
        {
            var response = await controller.GetAsync(borehole.Id).ConfigureAwait(false);

            IEnumerable<Completion>? completions = response?.Value;
            Assert.IsNotNull(completions);
            Assert.AreEqual(2, completions.Count());
        }
        finally
        {
            if (borehole != null)
            {
                var boreholeToDelete = context.Boreholes.SingleOrDefault(x => x.Id == borehole.Id);
                if (boreholeToDelete != null)
                {
                    context.Remove(boreholeToDelete);
                    await context.SaveChangesAsync();
                }
            }
        }
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

        try
        {
            var response = await controller.GetByIdAsync(completion.Id).ConfigureAwait(false);
            var okResult = response.Result as OkObjectResult;
            var completionResult = okResult.Value as Completion;
            Assert.IsNotNull(completionResult);
            Assert.AreEqual(completion.Id, completionResult.Id);
            Assert.AreEqual(completion.Name, completionResult.Name);
            Assert.AreEqual(completion.KindId, completionResult.KindId);
        }
        finally
        {
            if (borehole != null)
            {
                var boreholeToDelete = context.Boreholes.SingleOrDefault(x => x.Id == borehole.Id);
                if (boreholeToDelete != null)
                {
                    context.Remove(boreholeToDelete);
                    await context.SaveChangesAsync();
                }
            }
        }
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

        try
        {
            var response = await controller.CreateAsync(completion).ConfigureAwait(false);
            Assert.IsInstanceOfType(response, typeof(OkObjectResult));

            completion = await context.Completions.FindAsync(completion.Id);
            Assert.IsNotNull(completion);
            Assert.AreEqual("AUTOTHUNDER", completion.Name);
            Assert.AreEqual(borehole.Id, completion.BoreholeId);
        }
        finally
        {
            if (borehole != null)
            {
                var boreholeToDelete = context.Boreholes.SingleOrDefault(x => x.Id == borehole.Id);
                if (boreholeToDelete != null)
                {
                    context.Remove(boreholeToDelete);
                    await context.SaveChangesAsync();
                }
            }
        }
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

        try
        {
            completion.Name = "ENDUETRUCK";
            completion.AbandonDate = new DateTime(2023, 01, 01).ToUniversalTime();
            var response = await controller.EditAsync(completion).ConfigureAwait(false);
            Assert.IsInstanceOfType(response, typeof(OkObjectResult));

            completion = await context.Completions.FindAsync(completion.Id);
            Assert.IsNotNull(completion);
            Assert.AreEqual("ENDUETRUCK", completion.Name);
            Assert.AreEqual(borehole.Id, completion.BoreholeId);
            Assert.AreEqual(new DateTime(2023, 01, 01).ToUniversalTime(), completion.AbandonDate);
        }
        finally
        {
            if (borehole != null)
            {
                var boreholeToDelete = context.Boreholes.SingleOrDefault(x => x.Id == borehole.Id);
                if (boreholeToDelete != null)
                {
                    context.Remove(boreholeToDelete);
                    await context.SaveChangesAsync();
                }
            }
        }
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

        try
        {
            var response = await controller.DeleteAsync(completion.Id).ConfigureAwait(false);
            Assert.IsInstanceOfType(response, typeof(OkResult));

            completion = await context.Completions.FindAsync(completion.Id);
            Assert.IsNull(completion);
        }
        finally
        {
            if (borehole != null)
            {
                var boreholeToDelete = context.Boreholes.SingleOrDefault(x => x.Id == borehole.Id);
                if (boreholeToDelete != null)
                {
                    context.Remove(boreholeToDelete);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
