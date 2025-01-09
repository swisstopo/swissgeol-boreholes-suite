using Amazon.S3;
using BDMS.Models;
using CsvHelper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.IO;
using System.IO.Compression;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[DeploymentItem("TestData")]
[TestClass]
public class ExportControllerTest
{
    private const string TestCsvString = "text/csv";
    private const string ExportFileName = "boreholes_export.csv";
    private const int TestBoreholeId = 1000068;
    private BdmsContext context;
    private BoreholeFileCloudService boreholeFileCloudService;
    private ExportController controller;
    private User adminUser;
    private static readonly JsonSerializerOptions jsonImportOptions = new()
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
    };

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.GetTestContext();
        adminUser = context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");
        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId)]));

        var s3ClientMock = new AmazonS3Client(
            configuration["S3:ACCESS_KEY"],
            configuration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = configuration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = configuration["S3:SECURE"] == "0",
            });

        var boreholeFileCloudServiceLoggerMock = new Mock<ILogger<BoreholeFileCloudService>>(MockBehavior.Strict);
        boreholeFileCloudServiceLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        boreholeFileCloudService = new BoreholeFileCloudService(context, configuration, boreholeFileCloudServiceLoggerMock.Object, contextAccessorMock.Object, s3ClientMock);

        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(false);

        boreholeLockServiceMock
            .Setup(x => x.IsUserLackingPermissions(It.IsAny<int?>(), "sub_viewer"))
            .ReturnsAsync(true);

        boreholeLockServiceMock
            .Setup(x => x.IsUserLackingPermissions(It.IsAny<int?>(), "sub_admin"))
            .ReturnsAsync(false);

        var boreholeFileControllerLoggerMock = new Mock<ILogger<BoreholeFileController>>(MockBehavior.Strict);
        boreholeFileControllerLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));

        var loggerMock = new Mock<ILogger<ExportController>>();
        controller = new ExportController(context, boreholeFileCloudService, loggerMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }
#pragma warning disable SA1010

    [TestMethod]
    public async Task ExportJson()
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
            FieldMeasurementResults = [fieldMeasurementResult],
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
            HydrotestResults = [hydroTestResult],
            HydrotestFlowDirectionCodes = [new() { CodelistId = flowDirectionCodelists[0].Id }, new() { CodelistId = flowDirectionCodelists[1].Id }],
            HydrotestKindCodes = [new() { CodelistId = kindCodelists[0].Id }, new() { CodelistId = kindCodelists[1].Id }],
            HydrotestEvaluationMethodCodes = [new() { CodelistId = evaluationMethodCodelists[0].Id }, new() { CodelistId = evaluationMethodCodelists[1].Id }],
        };

        newBorehole.Observations = [hydroTest, fieldMeasurement, groundwaterLevelMeasurement, waterIngress];

        context.Add(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var response = await controller.ExportJsonAsync([newBorehole.Id]).ConfigureAwait(false);
        JsonResult jsonResult = (JsonResult)response!;
        Assert.IsNotNull(jsonResult.Value);
        List<Borehole> boreholes = (List<Borehole>)jsonResult.Value;
        Assert.AreEqual(1, boreholes.Count);
    }

#pragma warning restore SA1010

    [TestMethod]
    public async Task ExportJsonWithAttachments()
    {
        var newBorehole = GetBoreholeToAdd();
        context.Add(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        // Add pdf attachment
        var fileName = $"{Guid.NewGuid()}.pdf";
        var content = Guid.NewGuid().ToString();
        var fileBytes = Encoding.UTF8.GetBytes(content);
        var formFile = new FormFile(new MemoryStream(fileBytes), 0, fileBytes.Length, null, fileName) { Headers = new HeaderDictionary(), ContentType = "application/pdf" };
        var boreholeFile = await boreholeFileCloudService.UploadFileAndLinkToBorehole(formFile, newBorehole.Id).ConfigureAwait(false);
        context.BoreholeFiles.Add(boreholeFile);

        var result = await controller.ExportJsonWithAttachmentsAsync([newBorehole.Id]).ConfigureAwait(false);

        var fileResult = result as FileContentResult;
        Assert.IsNotNull(fileResult);
        Assert.AreEqual("application/zip", fileResult.ContentType);
        Assert.AreEqual("Borehole 257", fileResult.FileDownloadName[0..12]);

        // Extract the files from the returned ZIP stream
        using var zipStream = new MemoryStream(fileResult.FileContents);
        using var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Read);

        var jsonFile = zipArchive.Entries.FirstOrDefault(entry => entry.FullName.EndsWith(".json"));
        var pdfFile = zipArchive.Entries.FirstOrDefault(entry => entry.FullName.EndsWith(".pdf"));

        Assert.IsNotNull(jsonFile, "The ZIP file does not contain a JSON file.");
        Assert.IsNotNull(pdfFile, "The ZIP file does not contain a PDF file.");

        using var jsonStream = jsonFile.Open();
        var boreholes = await JsonSerializer.DeserializeAsync<List<Borehole>>(jsonStream, jsonImportOptions).ConfigureAwait(false);
        var borehole = boreholes.Single();

        // Check some properties of deserialized borehole
        Assert.AreEqual("Test borehole for project", borehole.Remarks);
        Assert.AreEqual("Borehole 257", borehole.Name);
        Assert.AreEqual("Project Alpha", borehole.ProjectName);
    }

    [TestMethod]
    public async Task ExportJsonEmptyIdsReturnsBadRequest()
    {
        var result = await controller.ExportJsonAsync([]).ConfigureAwait(false);
        var badRequestResult = result as BadRequestObjectResult;
        Assert.IsNotNull(badRequestResult);
        Assert.AreEqual("The list of IDs must not be empty.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task ExportWithAttachmentsEmptyIdsReturnsBadRequest()
            {
        var result = await controller.ExportJsonWithAttachmentsAsync([]).ConfigureAwait(false);
        var badRequestResult = result as BadRequestObjectResult;
        Assert.IsNotNull(badRequestResult);
        Assert.AreEqual("The list of IDs must not be empty.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task DownloadCsvWithValidIdsReturnsFileResultWithMax100Boreholes()
    {
        var ids = Enumerable.Range(TestBoreholeId, 120).ToList();

        var result = await controller.ExportCsvAsync(ids) as FileContentResult;

        Assert.IsNotNull(result);
        Assert.AreEqual(TestCsvString, result.ContentType);
        Assert.AreEqual(ExportFileName, result.FileDownloadName);
        var csvData = Encoding.UTF8.GetString(result.FileContents);
        var fileLength = csvData.Split('\n').Length;
        var recordCount = fileLength - 2; // Remove header and last line break
        Assert.AreEqual(100, recordCount);
    }

    [TestMethod]
    public async Task DownloadCsvReturnsTVD()
    {
        var boreholeQuery = context.Boreholes
             .Include(b => b.BoreholeGeometry);

        var boreholeIdsWithoutGeometry = await boreholeQuery
             .Where(b => b.BoreholeGeometry.Count < 2)
             .Take(3).Select(b => b.Id).ToListAsync();

        var boreholeIdsWithGeometry = await boreholeQuery
             .Where(b => b.BoreholeGeometry.Count > 1)
             .Take(3).Select(b => b.Id).ToListAsync();

        var boreholeIds = boreholeIdsWithoutGeometry.Concat(boreholeIdsWithGeometry);
        var result = await controller.ExportCsvAsync(boreholeIds) as FileContentResult;

        Assert.IsNotNull(result);
        Assert.AreEqual(TestCsvString, result.ContentType);
        Assert.AreEqual(ExportFileName, result.FileDownloadName);
        var records = GetRecordsFromFileContent(result);

        foreach (var record in records)
        {
            var totalDepthTvd = record.TotalDepthTvd;
            var totalDepthMd = record.TotalDepth;
            var topBedrockFreshTvd = record.TopBedrockFreshTvd;
            var topBedrockFreshMd = record.TopBedrockFreshMd;
            var topBedrockWeatheredTvd = record.TopBedrockWeatheredTvd;
            var topBedrockWeatheredMd = record.TopBedrockWeatheredMd;

            if (boreholeIdsWithoutGeometry.Contains(int.Parse(record.Id)))
            {
                Assert.AreEqual(totalDepthMd, totalDepthTvd);
                Assert.AreEqual(topBedrockFreshMd, topBedrockFreshTvd);
                Assert.AreEqual(topBedrockWeatheredMd, topBedrockWeatheredTvd);
            }

            if (boreholeIdsWithGeometry.Contains(int.Parse(record.Id)))
            {
                Assert.AreNotEqual(totalDepthMd, totalDepthTvd);
                Assert.AreNotEqual(topBedrockFreshMd, topBedrockFreshTvd);
                if (topBedrockWeatheredMd != "")
                {
                    Assert.AreNotEqual(topBedrockWeatheredMd, topBedrockWeatheredTvd);
                }
                else
                {
                    Assert.AreEqual("", topBedrockWeatheredTvd);
                }
            }
        }

        // Assert values for single borehole with geometry
        var singleRecord = records.Single(r => r.Id == "1000002");
        Assert.AreEqual("680.5358560199551", singleRecord.TotalDepth);
        Assert.AreEqual("601.9441138962023", singleRecord.TopBedrockFreshMd);
        Assert.AreEqual("", singleRecord.TopBedrockWeatheredMd);
        Assert.AreEqual("216.25173394135473", singleRecord.TotalDepthTvd);
        Assert.AreEqual("191.34988682963814", singleRecord.TopBedrockFreshTvd);
        Assert.AreEqual("", singleRecord.TopBedrockWeatheredTvd);
    }

    [TestMethod]
    public async Task DownloadCsvWithCustomIds()
    {
        string idGeoDinValue = "ID GeoDIN value";
        string idTopFelsValue = "ID TopFels value";
        string idKernlagerValue = "ID Kernlager value";
        var firstBoreholeId = 1_009_068;
        var boreholeWithCustomIds = new Borehole
        {
            Id = firstBoreholeId,
            BoreholeCodelists =
        [
            new()
            {
                BoreholeId = firstBoreholeId,
                CodelistId = 100000010,
                Value = idGeoDinValue,
            },
            new()
            {
                BoreholeId = firstBoreholeId,
                CodelistId = 100000011,
                Value = idKernlagerValue,
            },
        ],
        };

        var secondBoreholeId = 1_009_069;
        var boreholeWithOtherCustomIds = new Borehole
        {
            Id = secondBoreholeId,
            BoreholeCodelists =
        [
            new()
            {
                BoreholeId = secondBoreholeId,
                CodelistId = 100000010,
                Value = idGeoDinValue,
            },
            new()
            {
                BoreholeId = secondBoreholeId,
                CodelistId = 100000009,
                Value = idTopFelsValue,
            },
        ],
        };

        context.Boreholes.AddRange(boreholeWithCustomIds, boreholeWithOtherCustomIds);
        await context.SaveChangesAsync();

        var ids = new List<int> { firstBoreholeId, secondBoreholeId };

        var result = await controller.ExportCsvAsync(ids) as FileContentResult;
        Assert.IsNotNull(result);
        Assert.AreEqual(TestCsvString, result.ContentType);
        Assert.AreEqual(ExportFileName, result.FileDownloadName);

        var records = GetRecordsFromFileContent(result);

        var firstBorehole = records.Find(r => r.Id == firstBoreholeId.ToString());
        Assert.IsNotNull(firstBorehole);
        Assert.AreEqual(idGeoDinValue, firstBorehole.IDGeODin);
        Assert.AreEqual(idKernlagerValue, firstBorehole.IDKernlager);
        Assert.AreEqual("", firstBorehole.IDTopFels);

        var secondBorehole = records.Find(r => r.Id == secondBoreholeId.ToString());
        Assert.IsNotNull(secondBorehole);
        Assert.AreEqual(idGeoDinValue, secondBorehole.IDGeODin);
        Assert.AreEqual("", secondBorehole.IDKernlager);
        Assert.AreEqual(idTopFelsValue, secondBorehole.IDTopFels);
    }

    [TestMethod]
    public async Task DownloadCsvWithInvalidIdsReturnsNotFound()
    {
        var ids = new List<int> { 8, 2, 11, 87 };

        var result = await controller.ExportCsvAsync(ids) as NotFoundObjectResult;

        Assert.IsNotNull(result);
        Assert.AreEqual("No borehole(s) found for the provided id(s).", result.Value);
    }

    [TestMethod]
    public async Task DownloadCsvWithPartiallyValidIdsReturnsFileForPartillyValidIds()
    {
        var ids = new List<int> { 9, 8, 0, TestBoreholeId };

        var result = await controller.ExportCsvAsync(ids) as FileContentResult;

        Assert.IsNotNull(result);
        Assert.IsNotNull(result);
        Assert.AreEqual(TestCsvString, result.ContentType);
        Assert.AreEqual(ExportFileName, result.FileDownloadName);
        var csvData = Encoding.UTF8.GetString(result.FileContents);
        var fileLength = csvData.Split('\n').Length;
        var recordCount = fileLength - 2;
        Assert.AreEqual(recordCount, 1);
    }

    [TestMethod]
    public async Task DownloadCsvEmptyIdsReturnsBadRequest()
    {
        var ids = new List<int>();

        var result = await controller.ExportCsvAsync(ids) as BadRequestObjectResult;

        Assert.IsNotNull(result);
        Assert.AreEqual("The list of IDs must not be empty.", result.Value);
    }

    private static List<dynamic> GetRecordsFromFileContent(FileContentResult result)
    {
        var memoryStream = new MemoryStream(result.FileContents);
        var reader = new StreamReader(memoryStream);
        var csv = new CsvReader(reader, CsvConfigHelper.CsvWriteConfig);
        return csv.GetRecords<dynamic>().ToList();
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
}
