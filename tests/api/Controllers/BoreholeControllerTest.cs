using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class BoreholeControllerTest
{
    private const int DefaultWorkgroupId = 1;
    private int boreholeId;

    private BdmsContext context;
    private BoreholeController controller;
    private static int testBoreholeId = 1000068;
    private static int noPermissionWorkgroupId = 91350978;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        controller = GetTestController(context);
    }

    private BoreholeController GetTestController(BdmsContext testContext)
    {
        boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.HasUserRoleOnWorkgroupAsync(It.IsAny<string?>(), noPermissionWorkgroupId, It.IsAny<Role>()))
            .ReturnsAsync(false);
        boreholePermissionServiceMock
            .Setup(x => x.HasUserRoleOnWorkgroupAsync(It.IsAny<string?>(), It.IsNotIn(noPermissionWorkgroupId), It.IsAny<Role>()))
            .ReturnsAsync(true);
        return new BoreholeController(testContext, new Mock<ILogger<BoreholeController>>().Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [ClassCleanup]
    public static async Task ClassCleanup()
    {
        using var cleanupContext = ContextFactory.CreateContext();

        var testBoreholeWithIdentifiers = await cleanupContext.Boreholes
            .Include(b => b.BoreholeCodelists)
            .SingleOrDefaultAsync(b => b.Id == testBoreholeId);

        if (testBoreholeWithIdentifiers != null)
        {
            cleanupContext.BoreholeCodelists.RemoveRange(testBoreholeWithIdentifiers.BoreholeCodelists);
            await cleanupContext.SaveChangesAsync();
        }

        await cleanupContext.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAsyncFiltersBoreholesBasedOnWorkgroupPermissions()
    {
        // Add a new borehole with workgroup that is not default
        var newBorehole = new Borehole()
        {
            Name = "Test Borehole",
            WorkgroupId = 4,
        };
        await context.Boreholes.AddAsync(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var response = await controller.GetAllAsync([newBorehole.Id], 1, 100);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        PaginatedBoreholeResponse paginatedResponse = (PaginatedBoreholeResponse)okResult.Value!;
        Assert.IsNotNull(paginatedResponse.Boreholes);
        Assert.AreEqual(1, paginatedResponse.Boreholes.Count());

        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);

        var responseForEditor = await controller.GetAllAsync([newBorehole.Id], 1, 100);

        ActionResultAssert.IsOk(responseForEditor.Result);
        OkObjectResult okResultForEditor = (OkObjectResult)responseForEditor.Result!;
        PaginatedBoreholeResponse paginatedResponseForEditor = (PaginatedBoreholeResponse)okResultForEditor.Value!;
        Assert.IsNotNull(paginatedResponseForEditor.Boreholes);
        Assert.AreEqual(0, paginatedResponseForEditor.Boreholes.Count());
    }

    [TestMethod]
    public async Task GetAllAsyncWithFilterIds()
    {
        var ids = new List<int> { 1_000_100, 1_000_200, 1_000_300, 1_000_400 };
        var pageNumber = 1;
        var pageSize = 3;

        var response = await controller.GetAllAsync(ids, pageNumber, pageSize);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        PaginatedBoreholeResponse paginatedResponse = (PaginatedBoreholeResponse)okResult.Value!;
        Assert.AreEqual(3, paginatedResponse.Boreholes.Count());
        Assert.AreEqual(100, paginatedResponse.MaxPageSize);
        Assert.AreEqual(1, paginatedResponse.PageNumber);
        Assert.AreEqual(3, paginatedResponse.PageSize);
        Assert.AreEqual(4, paginatedResponse.TotalCount);

        foreach (var item in paginatedResponse.Boreholes)
        {
            Assert.IsTrue(ids.Contains(item.Id), $"Borehole.Id {item.Id} is not in the provided list of ids.");
        }
    }

    [TestMethod]
    public async Task EditBoreholeWithCompleteBorehole()
    {
        var id = 1_000_257;

        var newBorehole = GetBoreholeToAdd();
        newBorehole.Id = id;

        var boreholeToEdit = GetBorehole(id);
        Assert.AreEqual(2, boreholeToEdit.Stratigraphies.Count);
        Assert.AreEqual(0, boreholeToEdit.BoreholeFiles.Count);
        Assert.AreEqual(0, boreholeToEdit.BoreholeGeometry.Count);
        Assert.AreEqual(0, boreholeToEdit.Completions.Count);
        Assert.AreEqual(0, boreholeToEdit.Observations.Count); // Hydrogeology observations
        Assert.AreEqual(0, boreholeToEdit.Sections.Count);

        Assert.AreEqual(2, boreholeToEdit.CreatedById);
        Assert.AreEqual(5, boreholeToEdit.UpdatedById);

        // Update Borehole
        var response = await controller.EditAsync(newBorehole);
        ActionResultAssert.IsOk(response.Result);

        // Assert Updates and unchanged values
        var updatedBorehole = ActionResultAssert.IsOkObjectResult<Borehole>(response.Result);

        Assert.AreEqual(4, updatedBorehole.CreatedById);
        Assert.AreEqual(1, updatedBorehole.UpdatedById); // updatedById should be overwritten by the test user id.
        Assert.AreEqual(newBorehole.WorkgroupId, updatedBorehole.WorkgroupId);
        Assert.AreEqual(newBorehole.IsPublic, updatedBorehole.IsPublic);
        Assert.AreEqual(newBorehole.TypeId, updatedBorehole.TypeId);
        Assert.AreEqual(newBorehole.LocationX, updatedBorehole.LocationX);
        Assert.AreEqual(newBorehole.PrecisionLocationX, updatedBorehole.PrecisionLocationX);
        Assert.AreEqual(newBorehole.LocationY, updatedBorehole.LocationY);
        Assert.AreEqual(newBorehole.PrecisionLocationY, updatedBorehole.PrecisionLocationY);
        Assert.AreEqual("POINT (2600000 1200000)", updatedBorehole.Geometry.ToString());
        Assert.AreEqual("a. user", updatedBorehole.UpdatedBy.Name.ToLower());
        Assert.AreEqual(newBorehole.LocationXLV03, updatedBorehole.LocationXLV03);
        Assert.AreEqual(newBorehole.PrecisionLocationXLV03, updatedBorehole.PrecisionLocationXLV03);
        Assert.AreEqual(newBorehole.LocationYLV03, updatedBorehole.LocationYLV03);
        Assert.AreEqual(newBorehole.PrecisionLocationYLV03, updatedBorehole.PrecisionLocationYLV03);
        Assert.AreEqual(newBorehole.ElevationZ, updatedBorehole.ElevationZ);
        Assert.AreEqual(newBorehole.HrsId, updatedBorehole.HrsId);
        Assert.AreEqual(newBorehole.TotalDepth, updatedBorehole.TotalDepth);
        Assert.AreEqual(newBorehole.RestrictionId, updatedBorehole.RestrictionId);
        Assert.AreEqual(newBorehole.RestrictionUntil.ToString(), updatedBorehole.RestrictionUntil.ToString());
        Assert.AreEqual(newBorehole.NationalInterest, updatedBorehole.NationalInterest);
        Assert.AreEqual(newBorehole.OriginalName, updatedBorehole.OriginalName);
        Assert.AreEqual(newBorehole.Name, updatedBorehole.Name);
        Assert.AreEqual(newBorehole.LocationPrecisionId, updatedBorehole.LocationPrecisionId);
        Assert.AreEqual(newBorehole.ElevationPrecisionId, updatedBorehole.ElevationPrecisionId);
        Assert.AreEqual(newBorehole.ProjectName, updatedBorehole.ProjectName);
        Assert.AreEqual(newBorehole.Country, updatedBorehole.Country);
        Assert.AreEqual(newBorehole.Canton, updatedBorehole.Canton);
        Assert.AreEqual(newBorehole.Municipality, updatedBorehole.Municipality);
        Assert.AreEqual(newBorehole.PurposeId, updatedBorehole.PurposeId);
        Assert.AreEqual(newBorehole.StatusId, updatedBorehole.StatusId);
        Assert.AreEqual(newBorehole.DepthPrecisionId, updatedBorehole.DepthPrecisionId);
        Assert.AreEqual(newBorehole.TopBedrockFreshMd, updatedBorehole.TopBedrockFreshMd);
        Assert.AreEqual(newBorehole.TopBedrockWeatheredMd, updatedBorehole.TopBedrockWeatheredMd);
        Assert.AreEqual(newBorehole.HasGroundwater, updatedBorehole.HasGroundwater);
        Assert.AreEqual(newBorehole.Remarks, updatedBorehole.Remarks);
        Assert.AreEqual(newBorehole.LithologyTopBedrockId, updatedBorehole.LithologyTopBedrockId);
        Assert.AreEqual(newBorehole.LithostratigraphyTopBedrockId, updatedBorehole.LithostratigraphyTopBedrockId);
        Assert.AreEqual(newBorehole.ChronostratigraphyTopBedrockId, updatedBorehole.ChronostratigraphyTopBedrockId);
        Assert.AreEqual(newBorehole.ReferenceElevation, updatedBorehole.ReferenceElevation);
        Assert.AreEqual(newBorehole.ReferenceElevationPrecisionId, updatedBorehole.ReferenceElevationPrecisionId);
        Assert.AreEqual(newBorehole.ReferenceElevationTypeId, updatedBorehole.ReferenceElevationTypeId);

        // Stratigraphies remain unchanged
        Assert.AreEqual(2, updatedBorehole.Stratigraphies.Count);
        Assert.AreEqual(0, updatedBorehole.BoreholeFiles.Count);
        Assert.AreEqual(0, updatedBorehole.BoreholeGeometry.Count);
        Assert.AreEqual(0, updatedBorehole.Completions.Count);
        Assert.AreEqual(0, updatedBorehole.Observations.Count);
        Assert.AreEqual(0, updatedBorehole.Sections.Count);
    }

    [TestMethod]
    public async Task AddEditAndDeleteBoreholeIdentifiers()
    {
        using var initialContext = ContextFactory.CreateContext();

        var boreholeToEdit = await initialContext.Boreholes.SingleAsync(c => c.Id == testBoreholeId);
        Assert.AreEqual(0, boreholeToEdit.BoreholeCodelists.Count);

        boreholeToEdit.BoreholeCodelists.Add(new BoreholeCodelist
        {
            BoreholeId = testBoreholeId,
            CodelistId = 100000010,
            Value = "ID GeoDIN value",
        });

        await initialContext.SaveChangesAsync();
        Assert.AreEqual(1, boreholeToEdit.BoreholeCodelists.Count);

        using var updateContext = ContextFactory.CreateContext();
        var updateController = GetTestController(updateContext);

        var boreholeWithNewIdentifiers = new Borehole
        {
            Id = testBoreholeId,
            BoreholeCodelists = new List<BoreholeCodelist>
            {
                new BoreholeCodelist
                {
                    BoreholeId = testBoreholeId,
                    CodelistId = 100000010,
                    Value = "ID GeoDIN value",
                },
                new BoreholeCodelist
                {
                    BoreholeId = testBoreholeId,
                    CodelistId = 100000000,
                    Value = "ID Original value",
                },
            },
        };

        var updatedResponse = await updateController.EditAsync(boreholeWithNewIdentifiers);
        ActionResultAssert.IsOk(updatedResponse.Result);

        var updatedBorehole = ActionResultAssert.IsOkObjectResult<Borehole>(updatedResponse.Result);
        Assert.AreEqual(2, updatedBorehole.BoreholeCodelists.Count);

        using var deleteContext = ContextFactory.CreateContext();
        var deleteController = GetTestController(deleteContext);

        var boreholeWithNoMoreIdentifiers = new Borehole
        {
            Id = testBoreholeId,
            BoreholeCodelists = new List<BoreholeCodelist>(),
        };

        var deletedIdentifiersResponse = await deleteController.EditAsync(boreholeWithNoMoreIdentifiers);
        ActionResultAssert.IsOk(deletedIdentifiersResponse.Result);

        var boreholeWithDeletedIdentifiers = ActionResultAssert.IsOkObjectResult<Borehole>(deletedIdentifiersResponse.Result);
        Assert.AreEqual(0, boreholeWithDeletedIdentifiers.BoreholeCodelists.Count);
    }

    [TestMethod]
    public async Task GetByIdReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var response = await controller.GetByIdAsync(testBoreholeId);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task AddBoreholeWithOnlyWorkgroupId()
    {
        var borehole = new Borehole
        {
            WorkgroupId = DefaultWorkgroupId,
        };

        var result = await controller.CreateAsync(borehole);

        Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult);

        var createdBorehole = okResult.Value as Borehole;
        Assert.IsNotNull(createdBorehole);
        Assert.IsTrue(createdBorehole.Id > 0, "Borehole Id should be set by the database.");
        Assert.AreEqual(DefaultWorkgroupId, createdBorehole.WorkgroupId);
    }

    [TestMethod]
    public async Task AddBoreholeToWorkgroupWithoutPermissionsReturnsUnauthorized()
    {
        var borehole = new Borehole
        {
            WorkgroupId = noPermissionWorkgroupId,
        };

        var result = await controller.CreateAsync(borehole);

        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task AddBoreholeWithDefinedIdReturnsProblem()
    {
        var borehole = new Borehole
        {
            Id = 123,
            WorkgroupId = DefaultWorkgroupId,
        };

        var response = await controller.CreateAsync(borehole);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ActionResultAssert.IsInternalServerError(response.Result, "You cannot create a new borehole with a defined Id.");
    }

    [TestMethod]
    public async Task EditWithInexistentIdReturnsNotFound()
    {
        var id = 9111794;
        var borehole = new Borehole
        {
            Id = id,
        };

        // Upate Borehole
        var response = await controller.EditAsync(borehole);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutBoreholeReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task EditWithWrongCodelistCodesReturnsInternalServerError()
    {
        var borehole = new Borehole
        {
            Id = 1_000_256,
            PurposeId = 99999, // Id violating constraint
        };

        var response = await controller.EditAsync(borehole);
        ActionResultAssert.IsInternalServerError(response.Result);
    }

    [TestMethod]
    public async Task CopyBoreholeWithHydrotests()
    {
        var newBorehole = GetBoreholeToAdd();

        var fieldMeasurementResult = new FieldMeasurementResult
        {
            ParameterId = (await context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).FirstAsync().ConfigureAwait(false)).Id,
            SampleTypeId = (await context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).FirstAsync().ConfigureAwait(false)).Id,
            Value = 10.0,
        };

        var fieldMeasurement = new FieldMeasurement
        {
            Borehole = newBorehole,
            StartTime = new DateTime(2021, 01, 01, 01, 01, 01, DateTimeKind.Utc),
            EndTime = new DateTime(2021, 01, 01, 13, 01, 01, DateTimeKind.Utc),
            Type = ObservationType.FieldMeasurement,
            Comment = "Field measurement observation for testing",
            FieldMeasurementResults = new List<FieldMeasurementResult> { fieldMeasurementResult },
        };

        var groundwaterLevelMeasurement = new GroundwaterLevelMeasurement
        {
            Borehole = newBorehole,
            StartTime = new DateTime(2021, 01, 01, 01, 01, 01, DateTimeKind.Utc),
            EndTime = new DateTime(2021, 01, 01, 13, 01, 01, DateTimeKind.Utc),
            Type = ObservationType.GroundwaterLevelMeasurement,
            Comment = "Groundwater level measurement observation for testing",
            LevelM = 10.0,
            LevelMasl = 11.0,
            KindId = (await context.Codelists.Where(c => c.Schema == HydrogeologySchemas.GroundwaterLevelMeasurementKindSchema).FirstAsync().ConfigureAwait(false)).Id,
        };

        var waterIngress = new WaterIngress
        {
            Borehole = newBorehole,
            IsOpenBorehole = true,
            Type = ObservationType.WaterIngress,
            Comment = "Water ingress observation for testing",
            QuantityId = (await context.Codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressQualitySchema).FirstAsync().ConfigureAwait(false)).Id,
            ConditionsId = (await context.Codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressConditionsSchema).FirstAsync().ConfigureAwait(false)).Id,
        };

        var hydroTestResult = new HydrotestResult
        {
            ParameterId = 15203191,
            Value = 10.0,
            MaxValue = 15.0,
            MinValue = 5.0,
        };

        var kindCodelistIds = await context.Codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Take(2).Select(c => c.Id).ToListAsync().ConfigureAwait(false);
        var flowDirectionCodelistIds = await context.Codelists.Where(c => c.Schema == HydrogeologySchemas.FlowdirectionSchema).Take(2).Select(c => c.Id).ToListAsync().ConfigureAwait(false);
        var evaluationMethodCodelistIds = await context.Codelists.Where(c => c.Schema == HydrogeologySchemas.EvaluationMethodSchema).Take(2).Select(c => c.Id).ToListAsync().ConfigureAwait(false);

        var kindCodelists = await GetCodelists(context, kindCodelistIds).ConfigureAwait(false);
        var flowDirectionCodelists = await GetCodelists(context, flowDirectionCodelistIds).ConfigureAwait(false);
        var evaluationMethodCodelists = await GetCodelists(context, evaluationMethodCodelistIds).ConfigureAwait(false);

        var hydroTest = new Hydrotest
        {
            Borehole = newBorehole,
            StartTime = new DateTime(2021, 01, 01, 01, 01, 01, DateTimeKind.Utc),
            EndTime = new DateTime(2021, 01, 01, 13, 01, 01, DateTimeKind.Utc),
            Type = ObservationType.Hydrotest,
            Comment = "Hydrotest observation for testing",
            HydrotestResults = new List<HydrotestResult>() { hydroTestResult },
            HydrotestFlowDirectionCodes = new List<HydrotestFlowDirectionCode> { new() { CodelistId = flowDirectionCodelists[0].Id }, new() { CodelistId = flowDirectionCodelists[1].Id } },
            HydrotestKindCodes = new List<HydrotestKindCode> { new() { CodelistId = kindCodelists[0].Id }, new() { CodelistId = kindCodelists[1].Id } },
            HydrotestEvaluationMethodCodes = new List<HydrotestEvaluationMethodCode> { new() { CodelistId = evaluationMethodCodelists[0].Id }, new() { CodelistId = evaluationMethodCodelists[1].Id } },
        };

        newBorehole.Observations = new List<Observation> { hydroTest, fieldMeasurement, groundwaterLevelMeasurement, waterIngress };

        context.Add(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var result = await controller.CopyAsync(newBorehole.Id, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));

        var response = await controller.GetByIdAsync((int)copiedBoreholeId).ConfigureAwait(false);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Borehole copiedBorehole = (Borehole)okResult.Value!;
        Assert.IsNotNull(copiedBorehole);

        var copiedHydrotest = copiedBorehole.Observations.OfType<Hydrotest>().First();
        Assert.IsNotNull(copiedHydrotest);
        Assert.AreEqual(hydroTest.StartTime, copiedHydrotest.StartTime);
        Assert.AreEqual(hydroTest.EndTime, copiedHydrotest.EndTime);
        Assert.AreEqual(hydroTest.Comment, copiedHydrotest.Comment);
        CollectionAssert.AreEquivalent(kindCodelistIds, copiedHydrotest.HydrotestKindCodes?.Select(x => x.CodelistId).ToList());
        CollectionAssert.AreEquivalent(flowDirectionCodelistIds, copiedHydrotest.HydrotestFlowDirectionCodes?.Select(x => x.CodelistId).ToList());
        CollectionAssert.AreEquivalent(evaluationMethodCodelistIds, copiedHydrotest.HydrotestEvaluationMethodCodes?.Select(x => x.CodelistId).ToList());

        var copiedHydroTestResult = hydroTest.HydrotestResults.First();
        Assert.AreEqual(hydroTestResult.ParameterId, copiedHydroTestResult.ParameterId);
        Assert.AreEqual(hydroTestResult.Value, copiedHydroTestResult.Value);
        Assert.AreEqual(hydroTestResult.MaxValue, copiedHydroTestResult.MaxValue);
        Assert.AreEqual(hydroTestResult.MinValue, copiedHydroTestResult.MinValue);

        var copiedFieldMeasurement = copiedBorehole.Observations.OfType<FieldMeasurement>().First();
        Assert.IsNotNull(copiedFieldMeasurement);
        Assert.AreEqual(fieldMeasurement.StartTime, copiedFieldMeasurement.StartTime);
        Assert.AreEqual(fieldMeasurement.EndTime, copiedFieldMeasurement.EndTime);
        Assert.AreEqual(fieldMeasurement.Comment, copiedFieldMeasurement.Comment);
        var copiedFieldMeasurementResult = copiedFieldMeasurement.FieldMeasurementResults.First();
        Assert.AreEqual(copiedFieldMeasurementResult.ParameterId, fieldMeasurementResult.ParameterId);
        Assert.AreEqual(copiedFieldMeasurementResult.SampleTypeId, fieldMeasurementResult.SampleTypeId);
        Assert.AreEqual(copiedFieldMeasurementResult.Value, fieldMeasurementResult.Value);

        var copiedGroundwaterLevelMeasurement = copiedBorehole.Observations.OfType<GroundwaterLevelMeasurement>().First();
        Assert.IsNotNull(copiedGroundwaterLevelMeasurement);
        Assert.AreEqual(groundwaterLevelMeasurement.StartTime, copiedGroundwaterLevelMeasurement.StartTime);
        Assert.AreEqual(groundwaterLevelMeasurement.EndTime, copiedGroundwaterLevelMeasurement.EndTime);
        Assert.AreEqual(groundwaterLevelMeasurement.Comment, copiedGroundwaterLevelMeasurement.Comment);
        Assert.AreEqual(groundwaterLevelMeasurement.LevelM, copiedGroundwaterLevelMeasurement.LevelM);
        Assert.AreEqual(groundwaterLevelMeasurement.LevelMasl, copiedGroundwaterLevelMeasurement.LevelMasl);
        Assert.AreEqual(groundwaterLevelMeasurement.KindId, copiedGroundwaterLevelMeasurement.KindId);

        var copiedWaterIngress = copiedBorehole.Observations.OfType<WaterIngress>().First();
        Assert.IsNotNull(copiedWaterIngress);
        Assert.AreEqual(waterIngress.IsOpenBorehole, copiedWaterIngress.IsOpenBorehole);
        Assert.AreEqual(waterIngress.Comment, copiedWaterIngress.Comment);
        Assert.AreEqual(waterIngress.QuantityId, copiedWaterIngress.QuantityId);
        Assert.AreEqual(waterIngress.ConditionsId, copiedWaterIngress.ConditionsId);

        Assert.IsTrue(copiedBorehole.ValidateCasingReferences(), "Invalid casing reference in copied borehole");
    }

    [TestMethod]
    public async Task CopyWithBackfill()
    {
        var newBorehole = GetBoreholeToAdd();

        var kindCodelistId = await context.Codelists.Where(c => c.Schema == CompletionSchemas.CompletionKindSchema).Select(c => c.Id).FirstAsync().ConfigureAwait(false);
        var casingTypeCodelistId = await context.Codelists.Where(c => c.Schema == CompletionSchemas.CasingTypeSchema).Select(c => c.Id).FirstAsync().ConfigureAwait(false);
        var backfillTypeCodeListId = await context.Codelists.Where(c => c.Schema == CompletionSchemas.BackfillTypeSchema).Select(c => c.Id).FirstAsync().ConfigureAwait(false);
        var backfillMaterialCodeListId = await context.Codelists.Where(c => c.Schema == CompletionSchemas.BackfillMaterialSchema).Select(c => c.Id).FirstAsync().ConfigureAwait(false);

        var kindCodelists = await GetCodelists(context, new List<int> { kindCodelistId }).ConfigureAwait(false);
        var casingTypeCodelists = await GetCodelists(context, new List<int> { casingTypeCodelistId }).ConfigureAwait(false);
        var backfillTypeCodelists = await GetCodelists(context, new List<int> { backfillTypeCodeListId }).ConfigureAwait(false);
        var backfillMaterialCodelists = await GetCodelists(context, new List<int> { backfillMaterialCodeListId }).ConfigureAwait(false);

        var completion = new Completion
        {
            Borehole = newBorehole,
            Name = "Test Completion",
            Kind = kindCodelists.First(),
            IsPrimary = true,
        };
        newBorehole.Completions = new List<Completion> { completion };

        var casing = new Casing
        {
            Completion = completion,
            Name = "Test Casing",
            CasingElements = new List<CasingElement>
            {
                new CasingElement
                {
                    FromDepth = 0,
                    ToDepth = 10,
                    Kind = casingTypeCodelists.First(),
                },
            },
        };
        completion.Casings = new List<Casing> { casing };

        var backfill = new Backfill
        {
            Completion = completion,
            Casing = casing,
            FromDepth = 0,
            ToDepth = 5,
            Kind = backfillTypeCodelists.First(),
            Material = backfillMaterialCodelists.First(),
        };
        completion.Backfills = new List<Backfill> { backfill };

        context.Add(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        Assert.IsTrue(newBorehole.ValidateCasingReferences(), "Invalid casing reference in borehole");

        var result = await controller.CopyAsync(newBorehole.Id, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));

        var response = await controller.GetByIdAsync((int)copiedBoreholeId).ConfigureAwait(false);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Borehole copiedBorehole = (Borehole)okResult.Value!;
        Assert.IsNotNull(copiedBorehole);

        Assert.IsTrue(copiedBorehole.ValidateCasingReferences(), "Invalid casing reference in copied borehole");
    }

    [TestMethod]
    public async Task Copy()
    {
        var boreholeId = 1000030;
        var originalBorehole = GetBorehole(boreholeId);

        Assert.IsTrue(originalBorehole.ValidateCasingReferences(), "Precondition: Borehole has invalid casing reference");

        var result = await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
        var copiedBorehole = GetBorehole((int)copiedBoreholeId);

        Assert.AreEqual($"{originalBorehole.OriginalName} (Copy)", copiedBorehole.OriginalName);
        Assert.AreEqual($"{originalBorehole.Name} (Copy)", copiedBorehole.Name);
        Assert.AreEqual(originalBorehole.CreatedBy?.SubjectId, copiedBorehole.CreatedBy?.SubjectId);
        Assert.AreEqual(originalBorehole.UpdatedBy?.SubjectId, copiedBorehole.UpdatedBy?.SubjectId);
        Assert.AreEqual(DefaultWorkgroupId, copiedBorehole.Workgroup.Id);
        Assert.AreSame(originalBorehole.Type, copiedBorehole.Type);
        Assert.AreEqual(originalBorehole.Country, copiedBorehole.Country);
        Assert.AreEqual(originalBorehole.Canton, copiedBorehole.Canton);
        Assert.AreEqual(originalBorehole.Municipality, copiedBorehole.Municipality);

        var originalStratigraphy = originalBorehole.Stratigraphies.First();
        var copiedstratigraphy = copiedBorehole.Stratigraphies.First();
        Assert.AreNotEqual(originalBorehole.Id, copiedBorehole.Id);
        Assert.AreNotSame(originalBorehole.Stratigraphies, copiedBorehole.Stratigraphies);
        Assert.AreNotEqual(originalStratigraphy.Id, copiedstratigraphy.Id);
        Assert.AreNotSame(originalStratigraphy.Lithologies, copiedstratigraphy.Lithologies);
        Assert.AreNotEqual(originalStratigraphy.Lithologies.First().Id, copiedstratigraphy.Lithologies.First().Id);

        Assert.AreEqual(originalStratigraphy.LithologicalDescriptions.Count, copiedstratigraphy.LithologicalDescriptions.Count);
        for (int i = 0; i < originalStratigraphy.LithologicalDescriptions.Count; i++)
        {
            var originalDescription = originalStratigraphy.LithologicalDescriptions.ElementAt(i);
            var copiedDescription = copiedstratigraphy.LithologicalDescriptions.Single(d => d.Description == originalDescription.Description);

            Assert.AreNotEqual(originalDescription.Id, copiedDescription.Id);
            Assert.AreEqual(originalDescription.Description, copiedDescription.Description);
            Assert.AreEqual(originalDescription.CreatedBy?.SubjectId, copiedDescription.CreatedBy?.SubjectId);
            Assert.AreEqual(originalDescription.UpdatedBy?.SubjectId, copiedDescription.UpdatedBy?.SubjectId);
            Assert.AreEqual(originalDescription.Created, copiedDescription.Created);
            Assert.AreEqual(originalDescription.Updated, copiedDescription.Updated);
        }

        Assert.AreEqual(originalStratigraphy.FaciesDescriptions.Count, copiedstratigraphy.FaciesDescriptions.Count);
        for (int i = 0; i < originalStratigraphy.FaciesDescriptions.Count; i++)
        {
            var originalDescription = originalStratigraphy.FaciesDescriptions.ElementAt(i);
            var copiedDescription = copiedstratigraphy.FaciesDescriptions.Single(d => d.Description == originalDescription.Description);

            Assert.AreNotEqual(originalDescription.Id, copiedDescription.Id);
            Assert.AreEqual(originalDescription.Description, copiedDescription.Description);
            Assert.AreEqual(originalDescription.CreatedBy?.SubjectId, copiedDescription.CreatedBy?.SubjectId);
            Assert.AreEqual(originalDescription.UpdatedBy?.SubjectId, copiedDescription.UpdatedBy?.SubjectId);
            Assert.AreEqual(originalDescription.Created, copiedDescription.Created);
            Assert.AreEqual(originalDescription.Updated, copiedDescription.Updated);
        }

        Assert.AreNotSame(originalStratigraphy.ChronostratigraphyLayers, copiedstratigraphy.ChronostratigraphyLayers);
        Assert.AreNotEqual(originalStratigraphy.ChronostratigraphyLayers.First().Id, copiedstratigraphy.ChronostratigraphyLayers.First().Id);
        Assert.AreEqual(originalStratigraphy.ChronostratigraphyLayers.OrderBy(c => c.Id).First().ChronostratigraphyId, copiedstratigraphy.ChronostratigraphyLayers.OrderBy(c => c.Id).First().ChronostratigraphyId);

        Assert.AreNotSame(originalStratigraphy.LithostratigraphyLayers, copiedstratigraphy.LithostratigraphyLayers);
        Assert.AreNotEqual(originalStratigraphy.LithostratigraphyLayers.First().Id, copiedstratigraphy.LithostratigraphyLayers.First().Id);
        Assert.AreEqual(originalStratigraphy.LithostratigraphyLayers.OrderBy(l => l.Id).First().LithostratigraphyId, copiedstratigraphy.LithostratigraphyLayers.OrderBy(l => l.Id).First().LithostratigraphyId);

        // Borehole attachments are not copied
        Assert.AreNotSame(originalBorehole.BoreholeFiles, copiedBorehole.BoreholeFiles);
        Assert.AreNotEqual(0, originalBorehole.BoreholeFiles.Count);
        Assert.AreEqual(0, copiedBorehole.BoreholeFiles.Count);

        Assert.AreNotSame(originalStratigraphy.Lithologies.First().LithologyRockConditionCodes, copiedstratigraphy.Lithologies.First().LithologyRockConditionCodes);
        Assert.AreEqual(originalStratigraphy.Lithologies.First().LithologyRockConditionCodes.Count, copiedstratigraphy.Lithologies.First().LithologyRockConditionCodes.Count);

        Assert.AreNotSame(originalStratigraphy.Lithologies.First().LithologyUscsTypeCodes, copiedstratigraphy.Lithologies.First().LithologyUscsTypeCodes);
        Assert.AreEqual(originalStratigraphy.Lithologies.First().LithologyUscsTypeCodes.Count, copiedstratigraphy.Lithologies.First().LithologyUscsTypeCodes.Count);

        Assert.AreNotSame(originalStratigraphy.Lithologies.First().LithologyTextureMetaCodes, copiedstratigraphy.Lithologies.First().LithologyTextureMetaCodes);
        Assert.AreEqual(originalStratigraphy.Lithologies.First().LithologyTextureMetaCodes.Count, copiedstratigraphy.Lithologies.First().LithologyTextureMetaCodes.Count);

        var originalCompletion = originalBorehole.Completions.First();
        var copiedCompletion = copiedBorehole.Completions.First();

        Assert.AreNotEqual(originalCompletion.Id, copiedCompletion.Id);
        Assert.AreNotSame(originalCompletion.Casings, copiedCompletion.Casings);
        Assert.AreNotEqual(originalCompletion.Casings.First().Id, copiedCompletion.Casings.First().Id);
        Assert.AreEqual(originalCompletion.Casings.First().Notes, copiedCompletion.Casings.First().Notes);

        Assert.AreNotSame(originalCompletion.Backfills, copiedCompletion.Backfills);
        Assert.AreNotEqual(originalCompletion.Backfills.First().Id, copiedCompletion.Backfills.First().Id);
        Assert.AreEqual(originalCompletion.Backfills.First().Created, copiedCompletion.Backfills.First().Created);

        Assert.AreNotSame(originalCompletion.Instrumentations, copiedCompletion.Instrumentations);
        Assert.AreNotEqual(originalCompletion.Instrumentations.First().Id, copiedCompletion.Instrumentations.First().Id);
        Assert.AreEqual(originalCompletion.Instrumentations.First().Status, copiedCompletion.Instrumentations.First().Status);

        Assert.AreNotEqual(originalCompletion.Casings.First().CasingElements.First().Id, copiedCompletion.Casings.First().CasingElements.First().Id);
        Assert.AreEqual(originalCompletion.Casings.First().CasingElements.OrderBy(c => c.Id).First().OuterDiameter, copiedCompletion.Casings.First().CasingElements.OrderBy(c => c.Id).First().OuterDiameter);

        var originalWaterIngress = originalBorehole.Observations.OfType<WaterIngress>().First();
        var copiedWaterIngress = copiedBorehole.Observations.OfType<WaterIngress>().First();

        Assert.AreNotEqual(originalWaterIngress.Id, copiedWaterIngress.Id);
        Assert.AreEqual(originalWaterIngress.IsOpenBorehole, copiedWaterIngress.IsOpenBorehole);

        var originalFieldMeasurement = originalBorehole.Observations.OfType<FieldMeasurement>().First();
        var copiedFieldMeasurement = copiedBorehole.Observations.OfType<FieldMeasurement>().First();

        Assert.AreNotEqual(originalFieldMeasurement.Id, copiedFieldMeasurement.Id);
        Assert.AreNotSame(originalFieldMeasurement.FieldMeasurementResults, copiedFieldMeasurement.FieldMeasurementResults);

        var originalFieldMeasurementResult = originalFieldMeasurement.FieldMeasurementResults.OrderByDescending(x => x.Id).First();
        var copiedFieldMeasurementResult = copiedFieldMeasurement.FieldMeasurementResults.OrderByDescending(x => x.Id).First();
        Assert.AreNotEqual(originalFieldMeasurementResult.Id, copiedFieldMeasurementResult.Id);
        Assert.AreEqual(originalFieldMeasurementResult.Value, copiedFieldMeasurementResult.Value);

        var originalSection = originalBorehole.Sections.First();
        var copiedSection = copiedBorehole.Sections.First();

        Assert.AreNotEqual(originalSection.Id, copiedSection.Id);
        Assert.AreNotSame(originalSection.SectionElements, copiedSection.SectionElements);
        Assert.AreNotEqual(originalSection.SectionElements.First().Id, copiedSection.SectionElements.First().Id);
        Assert.AreEqual(originalSection.SectionElements.First().FromDepth, copiedSection.SectionElements.First().FromDepth);

        var originalBoreholeGeometry = originalBorehole.BoreholeGeometry.Last();
        var copiedBoreholeGeometry = copiedBorehole.BoreholeGeometry.Last();

        Assert.AreNotEqual(originalBoreholeGeometry.Id, copiedBoreholeGeometry.Id);
        Assert.AreEqual(originalBoreholeGeometry.X, copiedBoreholeGeometry.X);

        Assert.IsTrue(copiedBorehole.ValidateCasingReferences(), "Invalid casing reference in copied borehole");
    }

    private Borehole GetBorehole(int id)
    {
        return context.BoreholesWithIncludes.AsNoTracking().Single(b => b.Id == id);
    }

    private Borehole GetBoreholeToAdd()
    {
        return new Borehole
        {
            CreatedById = 4,
            UpdatedById = 4,
            Locked = null,
            LockedById = null,
            WorkgroupId = 1,
            IsPublic = true,
            TypeId = 20101003,
            LocationX = 2600000.0,
            PrecisionLocationX = 5,
            LocationY = 1200000.0,
            PrecisionLocationY = 5,
            LocationXLV03 = 600000.0,
            PrecisionLocationXLV03 = 5,
            LocationYLV03 = 200000.0,
            PrecisionLocationYLV03 = 5,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            ElevationZ = 450.5,
            HrsId = 20106001,
            TotalDepth = 100.0,
            RestrictionId = 20111003,
            RestrictionUntil = DateTime.UtcNow.AddYears(1),
            NationalInterest = false,
            OriginalName = "BH-257",
            Name = "Borehole 257",
            LocationPrecisionId = 20113002,
            ElevationPrecisionId = null,
            ProjectName = "Project Alpha",
            Country = "CH",
            Canton = "ZH",
            Municipality = "Zurich",
            PurposeId = 22103002,
            StatusId = 22104001,
            DepthPrecisionId = 22108005,
            TopBedrockFreshMd = 10.5,
            TopBedrockWeatheredMd = 8.0,
            HasGroundwater = true,
            Geometry = null,
            Remarks = "Test borehole for project",
            LithologyTopBedrockId = 15104934,
            LithostratigraphyTopBedrockId = 15300259,
            ChronostratigraphyTopBedrockId = 15001141,
            ReferenceElevation = 500.0,
            ReferenceElevationPrecisionId = 20114002,
            ReferenceElevationTypeId = 20117003,
        };
    }

    [TestMethod]
    public async Task CopyInvalidBoreholeId()
    {
        var result = await controller.CopyAsync(0, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task CopyInvalidWorkgroupId()
    {
        boreholeId = testBoreholeId;
        var result = await controller.CopyAsync(boreholeId, workgroupId: 0).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyMissingWorkgroupPermission()
    {
        boreholeId = testBoreholeId;
        var result = await controller.CopyAsync(boreholeId, workgroupId: 2).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyWithUnknownUser()
    {
        boreholeId = testBoreholeId;
        controller.HttpContext.SetClaimsPrincipal("NON-EXISTENT-NAME", PolicyNames.Admin);
        var result = await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyWithUserNotSet()
    {
        boreholeId = testBoreholeId;
        controller.ControllerContext.HttpContext.User = null;
        await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () =>
        {
            await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        });
    }

    [TestMethod]
    public async Task CopyWithNonAdminUser()
    {
        boreholeId = testBoreholeId;
        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);
        var result = await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);
        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
    }
}
