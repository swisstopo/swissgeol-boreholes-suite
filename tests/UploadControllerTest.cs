using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Net;
using static BDMS.Helpers;
using File = System.IO.File;

namespace BDMS;

[DeploymentItem("TestData")]
[TestClass]
public class UploadControllerTest
{
    private const int MaxBoreholeSeedId = 1009999;
    private BdmsContext context;
    private UploadController controller;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<ILogger<UploadController>> loggerMock;
    private Mock<ILogger<LocationService>> loggerLocationServiceMock;
    private Mock<ILogger<CoordinateService>> loggerCoordinateServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<UploadController>>();
        loggerLocationServiceMock = new Mock<ILogger<LocationService>>(MockBehavior.Strict);
        loggerCoordinateServiceMock = new Mock<ILogger<CoordinateService>>(MockBehavior.Strict);
        var locationService = new LocationService(loggerLocationServiceMock.Object, httpClientFactoryMock.Object);
        var coordinateService = new CoordinateService(loggerCoordinateServiceMock.Object, httpClientFactoryMock.Object);

        controller = new UploadController(ContextFactory.CreateContext(), loggerMock.Object, locationService, coordinateService) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        // Remove boreholes that were uploaded.
        var addedBoreholes = context.Boreholes.Where(b => b.Id > MaxBoreholeSeedId);
        var addedWorkflows = context.Workflows.Where(w => addedBoreholes.Select(b => b.Id).Contains(w.BoreholeId));
        context.Boreholes.RemoveRange(addedBoreholes);
        context.Workflows.RemoveRange(addedWorkflows);
        context.SaveChanges();

        await context.DisposeAsync();
        httpClientFactoryMock.Verify();
        loggerMock.Verify();
    }

    [TestMethod]
    public async Task UploadShouldSaveDataToDatabaseAsync()
    {
        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var csvFile = "testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(6, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Include(b => b.BoreholeCodelists).ToList().Find(b => b.OriginalName == "Unit_Test_6");
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual("Unit_Test_6_a", borehole.AlternateName);
        Assert.AreEqual(null, borehole.IsPublic);
        Assert.AreEqual(new DateTime(2024, 06, 15), borehole.RestrictionUntil);
        Assert.AreEqual(2474.472693, borehole.TotalDepth);
        Assert.AreEqual("Projekt 6", borehole.ProjectName);
        Assert.AreEqual(4, borehole.BoreholeCodelists.Count);
        Assert.AreEqual("Id_16", borehole.BoreholeCodelists.Single(x => x.CodelistId == 100000003).Value);
        Assert.AreEqual("AUTOSTEED", borehole.BoreholeCodelists.Single(x => x.CodelistId == 100000011).Value);
        Assert.AreEqual("Bern", borehole.Canton);
        Assert.AreEqual("Schweiz", borehole.Country);
        Assert.AreEqual("Thun", borehole.Municipality);
        Assert.AreEqual("POINT (2613116 1179127)", borehole.Geometry.ToString());

        // Assert workflow was created for borehole.
        var workflow = context.Workflows.SingleOrDefault(w => w.BoreholeId == borehole.Id);
        Assert.IsNotNull(workflow);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(Role.Editor, workflow.Role);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(null, workflow.Finished);
    }

    [TestMethod]
    public async Task UploadShouldSaveMinimalDatasetAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var csvFile = "minimal_testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(6, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Include(b => b.BoreholeCodelists).ToList().Find(b => b.OriginalName == "Unit_Test_2");
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual(null, borehole.AlternateName);
        Assert.AreEqual(null, borehole.IsPublic);
        Assert.AreEqual(null, borehole.RestrictionUntil);
        Assert.AreEqual(null, borehole.TotalDepth);
        Assert.AreEqual(null, borehole.ProjectName);
        Assert.AreEqual(0, borehole.BoreholeCodelists.Count);
        Assert.AreEqual(null, borehole.Canton);
        Assert.AreEqual(null, borehole.Country);
        Assert.AreEqual(null, borehole.Municipality);
        Assert.AreEqual("POINT (2000010 1000010)", borehole.Geometry.ToString());

        // Assert workflow was created for borehole.
        var workflow = context.Workflows.SingleOrDefault(w => w.BoreholeId == borehole.Id);
        Assert.IsNotNull(workflow);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(Role.Editor, workflow.Role);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(null, workflow.Finished);
    }

    [TestMethod]
    public async Task UploadShouldSaveSpecialCharsDatasetAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var csvFile = "special_chars_testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.OrderByDescending(b => b.Id).FirstOrDefault();
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual("Unit_Test_special_chars_1", borehole.OriginalName);
        Assert.AreEqual("„ÖÄÜöäü-*#%&7{}[]()='~^><\\@¦+Š", borehole.ProjectName);
        Assert.AreEqual("POINT (2000000 1000000)", borehole.Geometry.ToString());
    }

    [TestMethod]
    public async Task UploadWithMissingCoordinatesAsync()
    {
        var csvFile = "no_coordinates_provided_testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(1, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { "Field 'location_x' is required.", "Field 'location_y' is required." }, problemDetails.Errors["Row0"]);
    }

    [TestMethod]
    public async Task UploadBoreholeWithLV95CoordinatesAsync()
    {
        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var csvFile = "lv95_coordinates_provided_testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Single(b => b.OriginalName != null && b.OriginalName.Contains("LV95 - All coordinates set"));
        Assert.AreEqual(ReferenceSystem.LV95, borehole.OriginalReferenceSystem);
        Assert.AreEqual(2631690, borehole.LocationX);
        Assert.AreEqual(1170516, borehole.LocationY);
        Assert.AreEqual(631690, borehole.LocationXLV03);
        Assert.AreEqual(170516, borehole.LocationYLV03);
        Assert.AreEqual("POINT (2631690 1170516)", borehole.Geometry.ToString());
        Assert.AreEqual("Bern", borehole.Canton);
        Assert.AreEqual("Schweiz", borehole.Country);
        Assert.AreEqual("Interlaken", borehole.Municipality);
    }

    [TestMethod]
    public async Task UploadBoreholeWithLV03CoordinatesAsync()
    {
        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var csvFile = "lv03_coordinates_provided_testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Single(b => b.OriginalName != null && b.OriginalName.Contains("LV03 - All coordinates set"));
        Assert.AreEqual(ReferenceSystem.LV03, borehole.OriginalReferenceSystem);
        Assert.AreEqual(2649258.1270818082, borehole.LocationX);
        Assert.AreEqual(1131551.4611465326, borehole.LocationY);
        Assert.AreEqual(649258.36125645251, borehole.LocationXLV03);
        Assert.AreEqual(131551.85893587855, borehole.LocationYLV03);
        Assert.AreEqual("POINT (2649258.1270818082 1131551.4611465326)", borehole.Geometry.ToString());
        Assert.AreEqual("Valais", borehole.Canton);
        Assert.AreEqual("Schweiz", borehole.Country);
        Assert.AreEqual("Mörel-Filet", borehole.Municipality);
    }

    [TestMethod]
    public async Task UploadBoreholeWithLV03OutOfRangeCoordinatesAsync()
    {
        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var csvFile = "lv03_out_of_range_coordinates_provided_testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Single(b => b.OriginalName != null && b.OriginalName.Contains("LV03 - LV03 x out of range"));
        Assert.AreEqual(ReferenceSystem.LV03, borehole.OriginalReferenceSystem);
        Assert.AreEqual(2999999, borehole.LocationX);
        Assert.AreEqual(1, borehole.LocationY);
        Assert.AreEqual(999999, borehole.LocationXLV03);
        Assert.AreEqual(-999999, borehole.LocationYLV03);
        Assert.AreEqual("POINT (2999999 1)", borehole.Geometry.ToString());
        Assert.IsNull(borehole.Canton);
        Assert.IsNull(borehole.Country);
        Assert.IsNull(borehole.Municipality);
    }

    [TestMethod]
    public async Task UploadEmptyFileShouldReturnError()
    {
        var file = new FormFile(null, 0, 0, "nonexistant_file.csv", "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(BadRequestObjectResult));
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("No file uploaded.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadNoFileShouldReturnError()
    {
        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, null);

        Assert.IsInstanceOfType(response.Result, typeof(BadRequestObjectResult));
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("No file uploaded.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadNoDataButRequiredHeadersSetShouldUploadNoBorehole()
    {
        var csvFile = "no_data_but_required_headers.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(0, okResult.Value);
    }

    [TestMethod]
    public async Task UploadMulitpleRowsMissingRequiredFieldsShouldReturnError()
    {
        var csvFile = "multiple_rows_missing_required_attributes_testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { "Field 'location_y' is required." }, problemDetails.Errors["Row1"]);
        CollectionAssert.AreEquivalent(new[]
        {
            "Field 'original_name' is required.",
            "Field 'location_x' is required.",
            "Field 'location_y' is required.",
        },
        problemDetails.Errors["Row2"]);
    }

    [TestMethod]
    public async Task UploadRequiredHeadersMissingShouldReturnError()
    {
        var csvFile = "missing_required_headers_testdata.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        StringAssert.Contains(problemDetails.Detail, "Header with name 'Location_x'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'Location_y'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'OriginalName'[0] was not found.");
    }

    [TestMethod]
    public async Task UploadDuplicateBoreholesInFileShouldReturnError()
    {
        var csvFile = "duplicateBoreholesInFile.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[]
        {
            $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provied multiple times.",
        },
        problemDetails.Errors["Row0"]);
        CollectionAssert.AreEquivalent(new[]
        {
            $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provied multiple times.",
        },
        problemDetails.Errors["Row1"]);
    }

    [TestMethod]
    public async Task UploadDuplicateBoreholesInDbShouldReturnError()
    {
        // Create Boreholes with same LocationX, LocationY and TotalDepth as in provided csv.
        context.Boreholes.Add(new Borehole
        {
            Id = 2100000,
            LocationX = 2100000,
            LocationY = 1100000,
            TotalDepth = 855,
        });
        context.Boreholes.Add(new Borehole
        {
            Id = 2100001,
            LocationX = 2500000,
            LocationY = 1500000,
            TotalDepth = null,
        });
        context.SaveChanges();

        var csvFile = "duplicateBoreholesInDb.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[]
        {
            $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.",
        },
        problemDetails.Errors["Row0"]);
        CollectionAssert.AreEquivalent(new[]
        {
            $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.",
        },
        problemDetails.Errors["Row1"]);
    }

    [TestMethod]
    public void CompareValueWithTolerance()
    {
        Assert.AreEqual(true, UploadController.CompareValuesWithTolerance(null, null, 0));
        Assert.AreEqual(true, UploadController.CompareValuesWithTolerance(2100000, 2099998, 2));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(2100000, 2000098, 1.99));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(2100002, 2000000, 1.99));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(21000020, 2000000, 20));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(null, 2000000, 0));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(2000000, null, 2));
    }

    [TestMethod]
    public async Task UploadShouldIgnoreLocationFields()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var csvFile = "borehole_and_location_data.csv";

        byte[] fileBytes = File.ReadAllBytes(csvFile);
        using var stream = new MemoryStream(fileBytes);

        var file = new FormFile(stream, 0, fileBytes.Length, csvFile, "text/csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, file);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Single(b => b.OriginalName == "ACORNFLEA");
        Assert.AreEqual(null, borehole.Canton);
        Assert.AreEqual(null, borehole.Country);
        Assert.AreEqual(null, borehole.Municipality);
        Assert.AreEqual("POINT (2000000 1000000)", borehole.Geometry.ToString());
    }
}
