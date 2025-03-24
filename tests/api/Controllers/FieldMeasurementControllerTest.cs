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
        var boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        controller = new FieldMeasurementController(context, new Mock<ILogger<FieldMeasurementController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
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
        var response = await controller.GetAsync(1000007).ConfigureAwait(false);
        IEnumerable<FieldMeasurement>? fieldMeasurements = response;
        Assert.IsNotNull(fieldMeasurements);
        Assert.AreEqual(1, fieldMeasurements.Count());
        var fieldMeasurement = fieldMeasurements.Single();

        Assert.AreEqual(fieldMeasurement.Id, 12000026);
        Assert.AreEqual(fieldMeasurement.Type, ObservationType.FieldMeasurement);
        Assert.AreEqual(fieldMeasurement.Duration, 1599.4371401101523);
        Assert.AreEqual(fieldMeasurement.FromDepthM, 2996.1644909140491);
        Assert.AreEqual(fieldMeasurement.ToDepthM, 165.66614438531275);
        Assert.AreEqual(fieldMeasurement.FromDepthMasl, 3911.2065223484328);
        Assert.AreEqual(fieldMeasurement.ToDepthMasl, 541.12298960104727);
        Assert.AreEqual(fieldMeasurement.IsOpenBorehole, true);
        Assert.AreEqual(fieldMeasurement.Comment, "Similique voluptatem harum eaque.");
        Assert.AreEqual(fieldMeasurement.ReliabilityId, 15203156);
        Assert.AreEqual(fieldMeasurement.FieldMeasurementResults.Count, 9);
        Assert.AreEqual(fieldMeasurement.FieldMeasurementResults.First().Id, 14000109);
        Assert.AreEqual(fieldMeasurement.FieldMeasurementResults.First().FieldMeasurementId, 12000026);
        Assert.AreEqual(fieldMeasurement.FieldMeasurementResults.First().SampleTypeId, 15203211);
        Assert.AreEqual(fieldMeasurement.FieldMeasurementResults.First().ParameterId, 15203221);
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
            IsOpenBorehole = true,
            Comment = "Test comment",
            BoreholeId = 1001104,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 4).Id,
            FieldMeasurementResults = new List<FieldMeasurementResult>
            {
                new()
                {
                    FieldMeasurementId = 1,
                    SampleTypeId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Single(c => c.Geolcode == 3).Id,
                    ParameterId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Single(c => c.Geolcode == 2).Id,
                    Value = 25435.22,
                },
                new()
                {
                    FieldMeasurementId = 1,
                    SampleTypeId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Single(c => c.Geolcode == 1).Id,
                    ParameterId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Single(c => c.Geolcode == 4).Id,
                    Value = 0.8478,
                },
            },
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
            IsOpenBorehole = true,
            Comment = "Updated test comment",
            BoreholeId = 1001105,
            ReliabilityId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Single(c => c.Geolcode == 2).Id,
            FieldMeasurementResults = new List<FieldMeasurementResult>
            {
                new()
                {
                    FieldMeasurementId = 1,
                    SampleTypeId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Single(c => c.Geolcode == 1).Id,
                    ParameterId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Single(c => c.Geolcode == 1).Id,
                    Value = 0.0,
                },
            },
        };

        context.FieldMeasurements.Add(originalFieldMeasurement);
        await context.SaveChangesAsync();

        var response = await controller.EditAsync(updatedFieldMeasurement);

        Assert.IsNotNull(response);
        ActionResultAssert.IsOk(response.Result);

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
        Assert.AreEqual(updatedFieldMeasurement.IsOpenBorehole, editedFieldMeasurement.IsOpenBorehole);
        Assert.AreEqual(updatedFieldMeasurement.Comment, editedFieldMeasurement.Comment);
        Assert.AreEqual(updatedFieldMeasurement.BoreholeId, editedFieldMeasurement.BoreholeId);
        Assert.AreEqual(updatedFieldMeasurement.ReliabilityId, editedFieldMeasurement.ReliabilityId);
        Assert.AreEqual(updatedFieldMeasurement.FieldMeasurementResults.Count, editedFieldMeasurement.FieldMeasurementResults.Count);
        Assert.AreEqual(updatedFieldMeasurement.FieldMeasurementResults.First().Id, editedFieldMeasurement.FieldMeasurementResults.First().Id);
        Assert.AreEqual(updatedFieldMeasurement.FieldMeasurementResults.First().FieldMeasurementId, editedFieldMeasurement.FieldMeasurementResults.First().FieldMeasurementId);
        Assert.AreEqual(updatedFieldMeasurement.FieldMeasurementResults.First().SampleTypeId, editedFieldMeasurement.FieldMeasurementResults.First().SampleTypeId);
        Assert.AreEqual(updatedFieldMeasurement.FieldMeasurementResults.First().ParameterId, editedFieldMeasurement.FieldMeasurementResults.First().ParameterId);
        Assert.AreEqual(updatedFieldMeasurement.FieldMeasurementResults.First().Value, editedFieldMeasurement.FieldMeasurementResults.First().Value);
    }

    [TestMethod]
    public async Task EditAsyncInvalidEntityReturnsNotFound()
    {
        var nonExistentFieldMeasurement = new FieldMeasurement { Id = 2964237 };

        var response = await controller.EditAsync(nonExistentFieldMeasurement);
        ActionResultAssert.IsNotFound(response.Result);
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
            IsOpenBorehole = false,
            Comment = "New test comment",
            BoreholeId = 1001493,
            ReliabilityId = context.Codelists.Where(c => c.Schema == "observation_reliability").Single(c => c.Geolcode == 3).Id,
            FieldMeasurementResults = new List<FieldMeasurementResult>
            {
                new()
                {
                    SampleTypeId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Single(c => c.Geolcode == 3).Id,
                    ParameterId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Single(c => c.Geolcode == 2).Id,
                    Value = 25435.22,
                },
                new()
                {
                    SampleTypeId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Single(c => c.Geolcode == 1).Id,
                    ParameterId = context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Single(c => c.Geolcode == 4).Id,
                    Value = 0.8478,
                },
            },
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
        Assert.AreEqual(newFieldMeasurement.IsOpenBorehole, false);
        Assert.AreEqual(newFieldMeasurement.Comment, "New test comment");
        Assert.AreEqual(newFieldMeasurement.BoreholeId, 1001493);
        Assert.AreEqual(newFieldMeasurement.ReliabilityId, 15203158);
        Assert.AreEqual(newFieldMeasurement.FieldMeasurementResults.Count, 2);
        Assert.AreEqual(newFieldMeasurement.FieldMeasurementResults.First().SampleTypeId, 15203211);
        Assert.AreEqual(newFieldMeasurement.FieldMeasurementResults.First().ParameterId, 15203215);
        Assert.AreEqual(newFieldMeasurement.FieldMeasurementResults.First().Value, 25435.22);
        Assert.AreEqual(newFieldMeasurement.FieldMeasurementResults.Last().SampleTypeId, 15203209);
        Assert.AreEqual(newFieldMeasurement.FieldMeasurementResults.Last().ParameterId, 15203217);
        Assert.AreEqual(newFieldMeasurement.FieldMeasurementResults.Last().Value, 0.8478);

        var deleteResponse = await controller.DeleteAsync(newFieldMeasurement.Id);
        ActionResultAssert.IsOk(deleteResponse);

        deleteResponse = await controller.DeleteAsync(newFieldMeasurement.Id);
        ActionResultAssert.IsNotFound(deleteResponse);
    }
}
