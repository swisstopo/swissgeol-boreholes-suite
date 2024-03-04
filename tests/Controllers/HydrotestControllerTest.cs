﻿using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class HydrotestControllerTests
{
    private BdmsContext context;
    private HydrotestController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(false);
        controller = new HydrotestController(context, new Mock<ILogger<Hydrotest>>().Object, boreholeLockServiceMock.Object)
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
        Assert.AreEqual(93, result.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        IEnumerable<Hydrotest>? hydrotests = await controller.GetAsync(94578122).ConfigureAwait(false);
        Assert.IsNotNull(hydrotests);
        Assert.AreEqual(0, hydrotests.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeId()
    {
        IEnumerable<Hydrotest>? hydrotests = await controller.GetAsync(1002658).ConfigureAwait(false);
        Assert.IsNotNull(hydrotests);
        Assert.AreEqual(1, hydrotests.Count());
        var hydrotest = hydrotests.Single();

        Assert.AreEqual(hydrotest.Id, 12000441);
        Assert.AreEqual(hydrotest.Type, ObservationType.Hydrotest);
        Assert.AreEqual(hydrotest.Duration, 2594.3739538995428);
        Assert.AreEqual(hydrotest.FromDepthM, 4707.9754194244624);
        Assert.AreEqual(hydrotest.ToDepthM, 324.16204650148848);
        Assert.AreEqual(hydrotest.FromDepthMasl, 2627.3088318190112);
        Assert.AreEqual(hydrotest.ToDepthMasl, 523.60024264808749);
        Assert.AreEqual(hydrotest.CompletionFinished, false);
        Assert.AreEqual(hydrotest.Comment, "Inventore velit vitae laboriosam.");
        Assert.AreEqual(hydrotest.ReliabilityId, 15203157);

        // Assert hydrotestresult
        Assert.AreEqual(hydrotest.HydrotestResults.Count, 11);
        var testResult = hydrotest.HydrotestResults.Single(r => r.Id == 13000009);
        Assert.AreEqual(testResult.ParameterId, 15203199);
        Assert.AreEqual(testResult.Value, 2434.3317137124632);
        Assert.AreEqual(testResult.MaxValue, 2884.2150221547181);
        Assert.AreEqual(testResult.MinValue, 4675.6807535866656);
        Assert.AreEqual(testResult.HydrotestId, 12000441);
    }

    [TestMethod]
    public async Task EditAsyncValidEntityUpdatesEntity()
    {
        var originalHydrotest = new Hydrotest
        {
            // Id can be provided manually to the postgres db, as long as it does not generate conflicts with the auto-generated primary keys used in the primary key sequence.
            Id = 1,
            Type = ObservationType.Hydrotest,
            StartTime = new DateTime(2006, 8, 21, 11, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2015, 11, 13, 14, 00, 00).ToUniversalTime(),
            Duration = 7909,
            FromDepthM = 67.789,
            ToDepthM = 78.15634,
            FromDepthMasl = 67.112,
            ToDepthMasl = 78.0043,
            CompletionFinished = true,
            Comment = "Test comment",
            BoreholeId = 1002431,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 4).Id,
            CodelistIds = new List<int> { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 1).Id }, // test kind
        };

        var updatedHydrotest = new Hydrotest
        {
            Id = 1,
            Type = ObservationType.Hydrotest,
            StartTime = new DateTime(2021, 12, 30, 21, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2023, 1, 1, 13, 00, 00).ToUniversalTime(),
            Duration = 168,
            FromDepthM = 517.532,
            ToDepthM = 7602.12,
            FromDepthMasl = 828.774,
            ToDepthMasl = 27603.2,
            CompletionFinished = true,
            Comment = "Updated test comment",
            BoreholeId = 1002431,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 2).Id,
            CodelistIds = new List<int> { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 3).Id, 15203187, 15203189 },
        };

        context.Hydrotests.Add(originalHydrotest);
        await context.SaveChangesAsync();

        var result = await controller.EditHydrotestAsync(updatedHydrotest);

        Assert.IsNotNull(result);
        ActionResultAssert.IsOk(result);

        var editedHydrotest = context.Hydrotests.Single(w => w.Id == 1);
        Assert.AreEqual(updatedHydrotest.Id, editedHydrotest.Id);
        Assert.AreEqual(updatedHydrotest.Type, editedHydrotest.Type);
        Assert.AreEqual(updatedHydrotest.StartTime, editedHydrotest.StartTime);
        Assert.AreEqual(updatedHydrotest.EndTime, editedHydrotest.EndTime);
        Assert.AreEqual(updatedHydrotest.Duration, editedHydrotest.Duration);
        Assert.AreEqual(updatedHydrotest.FromDepthM, editedHydrotest.FromDepthM);
        Assert.AreEqual(updatedHydrotest.ToDepthM, editedHydrotest.ToDepthM);
        Assert.AreEqual(updatedHydrotest.FromDepthMasl, editedHydrotest.FromDepthMasl);
        Assert.AreEqual(updatedHydrotest.ToDepthMasl, editedHydrotest.ToDepthMasl);
        Assert.AreEqual(updatedHydrotest.CompletionFinished, editedHydrotest.CompletionFinished);
        Assert.AreEqual(updatedHydrotest.Comment, editedHydrotest.Comment);
        Assert.AreEqual(updatedHydrotest.BoreholeId, editedHydrotest.BoreholeId);
        Assert.AreEqual(updatedHydrotest.ReliabilityId, editedHydrotest.ReliabilityId);
        CollectionAssert.AreEqual(updatedHydrotest.CodelistIds!.ToList(), editedHydrotest.Codelists!.Select(c => c.Id).ToList());
        Assert.AreEqual("Entnahme", editedHydrotest.Codelists!.Single(c => c.Schema == HydrogeologySchemas.FlowdirectionSchema).De);
        Assert.AreEqual("stationär", editedHydrotest.Codelists!.Single(c => c.Schema == HydrogeologySchemas.EvaluationMethodSchema).De);
    }

    [TestMethod]
    public async Task EditAsyncInvalidEntityReturnsNotFound()
    {
        var nonExistentHydrotest = new Hydrotest { Id = 678135 };

        var result = await controller.EditHydrotestAsync(nonExistentHydrotest);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task CreateAndDeleteHydrotestAsync()
    {
        var newHydrotest = new Hydrotest
        {
            Type = ObservationType.Hydrotest,
            StartTime = new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime(),
            EndTime = new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime(),
            Duration = 118,
            FromDepthM = 17.532,
            ToDepthM = 702.12,
            FromDepthMasl = 82.714,
            ToDepthMasl = 2633.2,
            CompletionFinished = false,
            Comment = "New test comment",
            BoreholeId = 1002431,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 3).Id,
            CodelistIds = new List<int>() { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).Id },
            HydrotestResults = new List<HydrotestResult>() { new HydrotestResult { ParameterId = 15203194 } },
        };

        var okObjectResult = (OkObjectResult)await controller.CreateAsync(newHydrotest);
        ActionResultAssert.IsOk(okObjectResult);
        var addedHydrotest = (Hydrotest)okObjectResult.Value!;

        newHydrotest = await context.Hydrotests.FindAsync(newHydrotest.Id);
        Assert.IsNotNull(newHydrotest);
        Assert.AreEqual(newHydrotest.Type, ObservationType.Hydrotest);
        Assert.AreEqual(newHydrotest.StartTime, new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime());
        Assert.AreEqual(newHydrotest.EndTime, new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime());
        Assert.AreEqual(newHydrotest.Duration, 118);
        Assert.AreEqual(newHydrotest.FromDepthM, 17.532);
        Assert.AreEqual(newHydrotest.ToDepthM, 702.12);
        Assert.AreEqual(newHydrotest.FromDepthMasl, 82.714);
        Assert.AreEqual(newHydrotest.ToDepthMasl, 2633.2);
        Assert.AreEqual(newHydrotest.CompletionFinished, false);
        Assert.AreEqual(newHydrotest.Comment, "New test comment");
        Assert.AreEqual(newHydrotest.BoreholeId, 1002431);
        Assert.AreEqual(newHydrotest.ReliabilityId, 15203158);
        CollectionAssert.Contains((System.Collections.ICollection)newHydrotest.CodelistIds!, 15203171); // Test kind Id

        var deleteResponse = await controller.DeleteAsync(newHydrotest.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(newHydrotest.Id);
        ActionResultAssert.IsNotFound(deleteResponse);
    }

    [TestMethod]
    public async Task CreateHydrotestWithSeveralTestKinds()
    {
        var newHydrotest = new Hydrotest
        {
            Type = ObservationType.Hydrotest,
            BoreholeId = 1002431,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 2).Id,
            CodelistIds = new List<int>()
            {
                context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).Id,
                context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 1).Id,
                context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 4).Id,
            },
        };

        var okObjectResult = (ObjectResult)await controller.CreateAsync(newHydrotest);
        ActionResultAssert.IsOk(okObjectResult);
        var addedHydrotest = (Hydrotest)okObjectResult.Value!;

        var savedHydrotest = context.Hydrotests.SingleOrDefault(w => w.Id == addedHydrotest.Id);

        Assert.AreEqual(savedHydrotest.Codelists.Count, 3);
        Assert.AreEqual(savedHydrotest.Codelists.Single(c => c.Geolcode == 2).De, context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).De);
    }

    [TestMethod]
    public async Task CreateHydrotestWithIncompatibleCodelists()
    {
        var newHydrotest = new Hydrotest
        {
            Type = ObservationType.Hydrotest,
            CodelistIds = new List<int>() { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).Id, 23, 45 },
        };

        var createResponse = await controller.CreateAsync(newHydrotest);
        ActionResultAssert.IsBadRequest(createResponse);
    }

    [TestMethod]
    public async Task CreateHydrotestWithIncompatibleHydrotestResults()
    {
        var newHydrotest = new Hydrotest
        {
            Type = ObservationType.Hydrotest,
            CodelistIds = new List<int>() { context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Single(c => c.Geolcode == 2).Id },

            HydrotestResults = new List<HydrotestResult>() { new HydrotestResult { ParameterId = 73825 } },
        };

        var createResponse = await controller.CreateAsync(newHydrotest);
        ActionResultAssert.IsBadRequest(createResponse);
    }
}
