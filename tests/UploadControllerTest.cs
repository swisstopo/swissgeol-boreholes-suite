using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Data.SqlTypes;
using System.Net;
using System.Security.Claims;
using System.Text.RegularExpressions;
using static BDMS.Helpers;

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
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

        context = ContextFactory.CreateContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<UploadController>>();

        loggerLocationServiceMock = new Mock<ILogger<LocationService>>(MockBehavior.Strict);
        var locationService = new LocationService(loggerLocationServiceMock.Object, httpClientFactoryMock.Object);

        loggerCoordinateServiceMock = new Mock<ILogger<CoordinateService>>(MockBehavior.Strict);
        var coordinateService = new CoordinateService(loggerCoordinateServiceMock.Object, httpClientFactoryMock.Object);

        var loggerBoreholeFileUploadService = new Mock<ILogger<BoreholeFileUploadService>>(MockBehavior.Strict);
        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, context.Users.FirstOrDefault().Name) }));
        var boreholeFileUploadService = new BoreholeFileUploadService(context, configuration, loggerBoreholeFileUploadService.Object, contextAccessorMock.Object);

        controller = new UploadController(ContextFactory.CreateContext(), loggerMock.Object, locationService, coordinateService, boreholeFileUploadService) { ControllerContext = GetControllerContextAdmin() };
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

        var boreholeCsvFile = GetFormFileByExistingFile("testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

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

        var boreholeCsvFile = GetFormFileByExistingFile("minimal_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

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
    public async Task UploadShouldSaveBoreholeWithAttachmentsAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFormFile = GetFormFileByExistingFile("borehole_with_attachments.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondPdfFormFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFormFile, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);
    }

    [TestMethod]
    public async Task UploadShouldSaveBoreholesWithNotAllHaveAttachmentsAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFormFile = GetFormFileByExistingFile("boreholes_not_all_have_attachments.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondPdfFormFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFormFile, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(3, okResult.Value);
    }

    [TestMethod]
    public async Task UploadShouldSaveBoreholeWithAttachmentFileNamesMixedCaseAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFormFile = GetFormFileByExistingFile("borehole_with_mixed_case_in_attachments_filenames.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondPdfFormFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFormFile, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);
    }

    [TestMethod]
    public async Task UploadShouldSaveSpecialCharsDatasetAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("special_chars_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

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
        var boreholeCsvFile = GetFormFileByExistingFile("no_coordinates_provided_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(1, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { "Field 'location_x' is required.", "Field 'location_y' is required." }, problemDetails.Errors["Row1"]);
    }

    [TestMethod]
    public async Task UploadBoreholeWithLV95CoordinatesAsync()
    {
        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("lv95_coordinates_provided_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

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

        var boreholeCsvFile = GetFormFileByExistingFile("lv03_coordinates_provided_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

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

        var boreholeCsvFile = GetFormFileByExistingFile("lv03_out_of_range_coordinates_provided_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

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
        var boreholeCsvFile = new FormFile(null, 0, 0, null, "non_existent_file.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        Assert.IsInstanceOfType(response.Result, typeof(BadRequestObjectResult));
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("No borehole csv file uploaded.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadInvalidFileTypeBoreholeCsvShouldReturnError()
    {
        var invalidFileTypeBoreholeFile = GetFormFileByContent(fileContent: "This is the content of the file.", fileName: "invalid_file_type.txt");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, invalidFileTypeBoreholeFile, null);

        Assert.IsInstanceOfType(response.Result, typeof(BadRequestObjectResult));
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("Invalid file type for borehole csv.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadBoreholeCsvFileWithoutAttachmentsButWithProvidedFilesShouldCreateBorehole()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByContent(fileContent: "import_id;original_name;location_x;location_y\r\n123;Frank Place;2000000;1000000", fileName: "boreholes.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondPdfFormFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);
    }

    [TestMethod]
    public async Task UploadBoreholeCsvFileWithAttachmentsLinkedPdfsShouldCreateBorehole()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var firstAttachmentFileName = "borehole_attachment_1.pdf";
        var secondAttachmentFileName = "borehole_attachment_2.pdf";

        var pdfContent = @"import_id;original_name;location_x;location_y;attachments
123;Frank Place;2000000;1000000;borehole_attachment_1.pdf,borehole_attachment_2.pdf";
        var boreholeCsvFile = GetFormFileByContent(fileContent: pdfContent, fileName: "boreholes.csv");
        var firstPdfFormFile = GetFormFileByExistingFile(firstAttachmentFileName);
        var secondPdfFormFile = GetFormFileByExistingFile(secondAttachmentFileName);

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Get latest borehole Ids
        var latestBoreholeId = context.Boreholes.OrderByDescending(b => b.Id).First().Id;

        var borehole = context.Boreholes
            .Include(b => b.BoreholeFiles)
            .ThenInclude(bf => bf.File)
            .Single(b => b.Id == latestBoreholeId);

        Assert.AreEqual(borehole.BoreholeFiles.First().File.Name, firstAttachmentFileName);
        Assert.AreEqual(borehole.BoreholeFiles.Last().File.Name, secondAttachmentFileName);
        Assert.AreEqual(borehole.BoreholeFiles.Count, 2);
    }

    [TestMethod]
    public async Task UploadInvalidFileTypePdfAttachmentShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByContent(fileContent: "This is the content of the file.", fileName: "boreholes.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondPdfFormFile = GetFormFileByExistingFile("borehole_attachment_with_wrong_extension.txt");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        Assert.IsInstanceOfType(response.Result, typeof(BadRequestObjectResult));
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("Invalid file type for pdf attachment.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadBoreholeCsvFileWithNotPresentAttachmentsShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("borehole_with_not_present_attachments.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondPdfFormFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(1, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[]
        {
            "Attachment file 'is_not_present_in_upload_files.pdf' not found.",
        },
        problemDetails.Errors["Row1"]);
    }

    [TestMethod]
    public async Task UploadBoreholeCsvFileWithWhiteSpaceInAttachmentFileNameShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("borehole_with_not_present_attachments.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var whiteSpacePdf = GetFormFileByExistingFile("white space.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, new List<IFormFile>() { firstPdfFormFile, whiteSpacePdf });

        Assert.IsInstanceOfType(response.Result, typeof(BadRequestObjectResult));
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("One or more file name(s) contain a whitespace.", badRequestResult.Value);
    }

    [TestMethod]
    public void IsCorrectFileType()
    {
        var validCsvFile = GetFormFileByContent(fileContent: "This is the content of the file.", fileName: "boreholes.csv");
        Assert.AreEqual(true, FileTypeChecker.IsCsv(validCsvFile));

        var emptyCsvFile = new FormFile(null, 0, 12, null, "boreholes.csv");
        Assert.AreEqual(true, FileTypeChecker.IsCsv(emptyCsvFile));

        var invalidCsvFile = GetFormFileByContent(fileContent: "This is the content of the file.", fileName: "boreholes.txt");
        Assert.AreEqual(false, FileTypeChecker.IsCsv(invalidCsvFile));

        var validPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        Assert.AreEqual(true, FileTypeChecker.IsPdf(validPdfFormFile));

        var zeroBytesFormFile = new FormFile(null, 0, 0, null, "attachment.pdf");
        Assert.AreEqual(false, FileTypeChecker.IsPdf(zeroBytesFormFile));

        var invalidExtensionPdfFormFile = GetFormFileByExistingFile("borehole_attachment_with_wrong_extension.txt");
        Assert.AreEqual(false, FileTypeChecker.IsPdf(invalidExtensionPdfFormFile));

        var invalidHeaderBytesPdfFormFile = GetFormFileByContent(fileContent: "This is not a PDF.", fileName: "attachment.pdf");
        Assert.AreEqual(false, FileTypeChecker.IsPdf(invalidHeaderBytesPdfFormFile));

        var emptyPdfFormFile = GetFormFileByExistingFile("empty_attachment.pdf");
        Assert.AreEqual(true, FileTypeChecker.IsPdf(emptyPdfFormFile));
    }

    [TestMethod]
    public async Task UploadNoFileShouldReturnError()
    {
        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, null, null);

        Assert.IsInstanceOfType(response.Result, typeof(BadRequestObjectResult));
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("No borehole csv file uploaded.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadNoDataButRequiredHeadersSetShouldUploadNoBorehole()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("no_data_but_required_headers.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(0, okResult.Value);
    }

    [TestMethod]
    public async Task UploadMultipleRowsMissingRequiredFieldsShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("multiple_rows_missing_required_attributes_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { "Field 'location_y' is required." }, problemDetails.Errors["Row2"]);
        CollectionAssert.AreEquivalent(new[]
        {
            "Field 'original_name' is required.",
            "Field 'location_x' is required.",
            "Field 'location_y' is required.",
        },
        problemDetails.Errors["Row3"]);
    }

    [TestMethod]
    public async Task UploadRequiredHeadersMissingShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("missing_required_headers_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        Assert.AreEqual(4, Regex.Matches(problemDetails.Detail!, "Header with name ").Count);
        StringAssert.Contains(problemDetails.Detail, "Header with name 'Location_x'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'Location_y'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'OriginalName'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'ImportId'[0] was not found.");
    }

    [TestMethod]
    public async Task UploadDuplicateBoreholesInFileShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("duplicateBoreholesInFile.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Row1"]);
        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Row2"]);
    }

    [TestMethod]
    public async Task UploadDuplicateBoreholesInDbShouldReturnError()
    {
        // Create Boreholes with same LocationX, LocationY and TotalDepth as in provided csv and with the same WorkgroupId as provided
        context.Boreholes.Add(new Borehole
        {
            Id = 2100000,
            LocationX = 2100000,
            LocationY = 1100000,
            TotalDepth = 855,
            WorkgroupId = 1,
        });
        context.Boreholes.Add(new Borehole
        {
            Id = 2100001,
            LocationX = 2500000,
            LocationY = 1500000,
            TotalDepth = null,
            WorkgroupId = 1,
        });
        context.SaveChanges();

        var boreholeCsvFile = GetFormFileByExistingFile("duplicateBoreholesInDb.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.AreEqual((int)HttpStatusCode.BadRequest, result.StatusCode);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.", }, problemDetails.Errors["Row1"]);
        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.", }, problemDetails.Errors["Row2"]);
    }

    [TestMethod]
    public async Task UploadDuplicateBoreholesInDbButDifferentWorkgroupShouldUploadBoreholes()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var maxWorkgroudId = context.Workgroups.Max(w => w.Id);
        var minWorkgroudId = context.Workgroups.Min(w => w.Id);

        // Create Boreholes with same LocationX, LocationY and TotalDepth as in provided csv, but different WorkgroupId as provided
        context.Boreholes.Add(new Borehole
        {
            Id = 2100000,
            LocationX = 2100000,
            LocationY = 1100000,
            TotalDepth = 855,
            WorkgroupId = maxWorkgroudId,
        });
        context.Boreholes.Add(new Borehole
        {
            Id = 2100001,
            LocationX = 2500000,
            LocationY = 1500000,
            TotalDepth = null,
        });
        context.SaveChanges();

        var boreholeCsvFile = GetFormFileByExistingFile("duplicateBoreholesInDbButDifferentWorkgroup.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: minWorkgroudId, boreholeCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(OkObjectResult));
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(2, okResult.Value);
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

        var boreholeCsvFile = GetFormFileByExistingFile("borehole_and_location_data.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

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
