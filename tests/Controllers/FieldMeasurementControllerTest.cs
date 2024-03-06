using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class FieldMeasurementControllerTest
{
    private BdmsContext context;
    private FieldMeasurementController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(false);
        controller = new FieldMeasurementController(context, new Mock<ILogger<FieldMeasurement>>().Object, boreholeLockServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAsyncReturnsAllEntities()
    {
        var result = await controller.GetAsync();
        Assert.IsNotNull(result);
        Assert.AreEqual(102, result.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeIdForInexistentId()
    {
        var response = await controller.GetAsync(94578122).ConfigureAwait(false);
        IEnumerable<FieldMeasurement>? fieldMeasurements = response;
        Assert.IsNotNull(fieldMeasurements);
        Assert.AreEqual(0, fieldMeasurements.Count());
    }

    [TestMethod]
    public async Task GetEntriesByBoreholeId()
    {
        var response = await controller.GetAsync(1000325).ConfigureAwait(false);
        IEnumerable<FieldMeasurement>? fieldMeasurements = response;
        Assert.IsNotNull(fieldMeasurements);
        Assert.AreEqual(1, fieldMeasurements.Count());
        var fieldMeasurement = fieldMeasurements.Single();

        Assert.AreEqual(fieldMeasurement.Id, 12000005);
        Assert.AreEqual(fieldMeasurement.Type, ObservationType.FieldMeasurement);
        Assert.AreEqual(fieldMeasurement.Duration, 3922.1102170027375);
        Assert.AreEqual(fieldMeasurement.FromDepthM, 6.508998146052006);
        Assert.AreEqual(fieldMeasurement.ToDepthM, 1446.5446650011208);
        Assert.AreEqual(fieldMeasurement.FromDepthMasl, 1554.9724295800424);
        Assert.AreEqual(fieldMeasurement.ToDepthMasl, 3565.501249085414);
        Assert.AreEqual(fieldMeasurement.CompletionFinished, false);
        Assert.AreEqual(fieldMeasurement.Comment, "Accusamus voluptates aut sit ducimus.");
        Assert.AreEqual(fieldMeasurement.ReliabilityId, 15203159);
        Assert.AreEqual(fieldMeasurement.SampleTypeId, 15203209);
        Assert.AreEqual(fieldMeasurement.ParameterId, 15203220);
        Assert.AreEqual(fieldMeasurement.Value, 744.319461402632);
    }

    [TestMethod]
    public async Task EditAsyncValidEntityUpdatesEntity()
    {
        var originalFieldMeasurement = new FieldMeasurement
        {
            Id = 1,
            Type = ObservationType.FieldMeasurement,
            StartTime = new DateTime(2006, 8, 21, 11, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2015, 11, 13, 14, 00, 00).ToUniversalTime(),
            Duration = 7909,
            FromDepthM = 67.789,
            ToDepthM = 78.15634,
            FromDepthMasl = 67.112,
            ToDepthMasl = 78.0043,
            CompletionFinished = true,
            Comment = "Test comment",
            BoreholeId = 1001104,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 4).Id,
            SampleTypeId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Single(c => c.Geolcode == 3).Id,
            ParameterId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Single(c => c.Geolcode == 3).Id,
            Value = 0.0,
        };

        var updatedFieldMeasurement = new FieldMeasurement
        {
            Id = 1,
            Type = ObservationType.FieldMeasurement,
            StartTime = new DateTime(2021, 12, 30, 21, 00, 00).ToUniversalTime(),
            EndTime = new DateTime(2023, 1, 1, 13, 00, 00).ToUniversalTime(),
            Duration = 168,
            FromDepthM = 517.532,
            ToDepthM = 7602.12,
            FromDepthMasl = 828.774,
            ToDepthMasl = 27603.2,
            CompletionFinished = true,
            Comment = "Updated test comment",
            BoreholeId = 1001105,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 2).Id,
            SampleTypeId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Single(c => c.Geolcode == 1).Id,
            ParameterId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Single(c => c.Geolcode == 1).Id,
            Value = 6.1,
        };

        context.FieldMeasurements.Add(originalFieldMeasurement);
        await context.SaveChangesAsync();

        var result = await controller.EditAsync(updatedFieldMeasurement);

        Assert.IsNotNull(result);
        ActionResultAssert.IsOk(result.Result);

        var editedFieldMeasurement = context.FieldMeasurements.Single(w => w.Id == 1);
        Assert.AreEqual(updatedFieldMeasurement.Id, editedFieldMeasurement.Id);
        Assert.AreEqual(updatedFieldMeasurement.Type, editedFieldMeasurement.Type);
        Assert.AreEqual(updatedFieldMeasurement.StartTime, editedFieldMeasurement.StartTime);
        Assert.AreEqual(updatedFieldMeasurement.EndTime, editedFieldMeasurement.EndTime);
        Assert.AreEqual(updatedFieldMeasurement.Duration, editedFieldMeasurement.Duration);
        Assert.AreEqual(updatedFieldMeasurement.FromDepthM, editedFieldMeasurement.FromDepthM);
        Assert.AreEqual(updatedFieldMeasurement.ToDepthM, editedFieldMeasurement.ToDepthM);
        Assert.AreEqual(updatedFieldMeasurement.FromDepthMasl, editedFieldMeasurement.FromDepthMasl);
        Assert.AreEqual(updatedFieldMeasurement.ToDepthMasl, editedFieldMeasurement.ToDepthMasl);
        Assert.AreEqual(updatedFieldMeasurement.CompletionFinished, editedFieldMeasurement.CompletionFinished);
        Assert.AreEqual(updatedFieldMeasurement.Comment, editedFieldMeasurement.Comment);
        Assert.AreEqual(updatedFieldMeasurement.BoreholeId, editedFieldMeasurement.BoreholeId);
        Assert.AreEqual(updatedFieldMeasurement.ReliabilityId, editedFieldMeasurement.ReliabilityId);
        Assert.AreEqual(updatedFieldMeasurement.SampleTypeId, editedFieldMeasurement.SampleTypeId);
        Assert.AreEqual(updatedFieldMeasurement.ParameterId, editedFieldMeasurement.ParameterId);
        Assert.AreEqual(updatedFieldMeasurement.Value, editedFieldMeasurement.Value);
    }

    [TestMethod]
    public async Task EditAsyncInvalidEntityReturnsNotFound()
    {
        var nonExistentFieldMeasurement = new FieldMeasurement { Id = 2964237 };

        var result = await controller.EditAsync(nonExistentFieldMeasurement);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task CreateAndDeleteFieldMeasurementAsync()
    {
        var newFieldMeasurement = new FieldMeasurement
        {
            Type = ObservationType.FieldMeasurement,
            StartTime = new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime(),
            EndTime = new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime(),
            Duration = 118,
            FromDepthM = 17.532,
            ToDepthM = 702.12,
            FromDepthMasl = 82.714,
            ToDepthMasl = 2633.2,
            CompletionFinished = false,
            Comment = "New test comment",
            BoreholeId = 1001493,
            ReliabilityId = context.Codelists.Where(c => c.Schema == "observation_reliability").Single(c => c.Geolcode == 3).Id,
            SampleTypeId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Single(c => c.Geolcode == 1).Id,
            ParameterId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Single(c => c.Geolcode == 1).Id,
            Value = 9453.456,
        };

        var createResponse = await controller.CreateAsync(newFieldMeasurement);
        ActionResultAssert.IsOk(createResponse.Result);

        newFieldMeasurement = await context.FieldMeasurements.FindAsync(newFieldMeasurement.Id);
        Assert.IsNotNull(newFieldMeasurement);
        Assert.AreEqual(newFieldMeasurement.Type, ObservationType.FieldMeasurement);
        Assert.AreEqual(newFieldMeasurement.StartTime, new DateTime(2021, 1, 31, 1, 10, 00).ToUniversalTime());
        Assert.AreEqual(newFieldMeasurement.EndTime, new DateTime(2020, 6, 4, 3, 4, 00).ToUniversalTime());
        Assert.AreEqual(newFieldMeasurement.Duration, 118);
        Assert.AreEqual(newFieldMeasurement.FromDepthM, 17.532);
        Assert.AreEqual(newFieldMeasurement.ToDepthM, 702.12);
        Assert.AreEqual(newFieldMeasurement.FromDepthMasl, 82.714);
        Assert.AreEqual(newFieldMeasurement.ToDepthMasl, 2633.2);
        Assert.AreEqual(newFieldMeasurement.CompletionFinished, false);
        Assert.AreEqual(newFieldMeasurement.Comment, "New test comment");
        Assert.AreEqual(newFieldMeasurement.BoreholeId, 1001493);
        Assert.AreEqual(newFieldMeasurement.ReliabilityId, 15203158);
        Assert.AreEqual(newFieldMeasurement.SampleTypeId, 15203209);
        Assert.AreEqual(newFieldMeasurement.ParameterId, 15203214);
        Assert.AreEqual(newFieldMeasurement.Value, 9453.456);

        var deleteResponse = await controller.DeleteAsync(newFieldMeasurement.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(newFieldMeasurement.Id);
        ActionResultAssert.IsNotFound(deleteResponse);
    }
}
