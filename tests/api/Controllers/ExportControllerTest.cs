using Amazon.S3;
using BDMS.Models;
using CsvHelper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System.Diagnostics.CodeAnalysis;
using System.IO.Compression;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[SuppressMessage("StyleCop.CSharp.SpacingRules", "SA1010:Opening square brackets should be spaced correctly", Justification = "False positive for collection initializers.")]
[DeploymentItem("TestData")]
[TestClass]
public class ExportControllerTest
{
    private const string TestCsvString = "text/csv";
    private const string ExportFileName = "boreholes_export";
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

        var boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_viewer", It.IsAny<int?>()))
            .ReturnsAsync(false);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(true);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(true);

        var boreholeFileControllerLoggerMock = new Mock<ILogger<BoreholeFileController>>(MockBehavior.Strict);
        boreholeFileControllerLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));

        var loggerMock = new Mock<ILogger<ExportController>>();
        controller = new ExportController(context, boreholeFileCloudService, loggerMock.Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestMethod]
    public async Task ExportGeopackage()
    {
        var id = 1_000_257;

        var response = await controller.ExportGeoPackageAsync(new List<int>() { id }).ConfigureAwait(false);
        FileContentResult fileContentResult = (FileContentResult)response!;
        Assert.IsNotNull(fileContentResult);
        Assert.AreEqual("application/geopackage+sqlite", fileContentResult.ContentType);
        Assert.AreEqual($"boreholes_export_{DateTime.Now:yyyyMMdd}.gpkg", fileContentResult.FileDownloadName);
        Assert.IsTrue(fileContentResult.FileContents.Length > 0);
    }

    // Export 3 seeded boreholes from richBoreholesRange (IDs 1_000_000 - 1_000_100), to increase likelihood, that each attribute is exported at least once.
    [TestMethod]
    [DataRow(1_000_057)]
    [DataRow(1_000_058)]
    [DataRow(1_000_059)]
    public async Task ExportJson(int boreholeId)
    {
        var newBorehole = await context.BoreholesWithIncludes.AsNoTracking().SingleAsync(b => b.Id == boreholeId);

        // Make sure all CodelistId collections are populated so they can be compared, to the export.
        foreach (var strat in newBorehole.Stratigraphies ?? [])
        {
            foreach (var lithology in strat.Lithologies)
            {
                lithology.RockConditionCodelistIds = lithology.LithologyRockConditionCodes?.Select(c => c.CodelistId).ToList();
                lithology.UscsTypeCodelistIds = lithology.LithologyUscsTypeCodes?.Select(c => c.CodelistId).ToList();
                lithology.TextureMetaCodelistIds = lithology.LithologyTextureMetaCodes?.Select(c => c.CodelistId).ToList();

                foreach (var lithologyDescription in lithology.LithologyDescriptions)
                {
                    lithologyDescription.ComponentUnconOrganicCodelistIds = lithologyDescription.LithologyDescriptionComponentUnconOrganicCodes?.Select(c => c.CodelistId).ToList();
                    lithologyDescription.ComponentConParticleCodelistIds = lithologyDescription.LithologyDescriptionComponentConParticleCodes?.Select(c => c.CodelistId).ToList();
                    lithologyDescription.ComponentUnconDebrisCodelistIds = lithologyDescription.LithologyDescriptionComponentUnconDebrisCodes?.Select(c => c.CodelistId).ToList();
                    lithologyDescription.GrainShapeCodelistIds = lithologyDescription.LithologyDescriptionGrainShapeCodes?.Select(c => c.CodelistId).ToList();
                    lithologyDescription.GrainAngularityCodelistIds = lithologyDescription.LithologyDescriptionGrainAngularityCodes?.Select(c => c.CodelistId).ToList();
                    lithologyDescription.LithologyUnconDebrisCodelistIds = lithologyDescription.LithologyDescriptionLithologyUnconDebrisCodes?.Select(c => c.CodelistId).ToList();
                    lithologyDescription.ComponentConMineralCodelistIds = lithologyDescription.LithologyDescriptionComponentConMineralCodes?.Select(c => c.CodelistId).ToList();
                    lithologyDescription.StructureSynGenCodelistIds = lithologyDescription.LithologyDescriptionStructureSynGenCodes?.Select(c => c.CodelistId).ToList();
                    lithologyDescription.StructurePostGenCodelistIds = lithologyDescription.LithologyDescriptionStructurePostGenCodes?.Select(c => c.CodelistId).ToList();
                }
            }
        }

        var response = await controller.ExportJsonAsync([newBorehole.Id]).ConfigureAwait(false);
        JsonResult jsonResult = (JsonResult)response!;
        Assert.IsNotNull(jsonResult.Value);
        List<Borehole> boreholes = (List<Borehole>)jsonResult.Value;
        Assert.AreEqual(1, boreholes.Count);

        var exported = boreholes.Single();
        AssertEntitiesEqualByIncludeInExportAttribute(newBorehole, exported, new HashSet<object?>());
    }

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
        var boreholeFile = await boreholeFileCloudService.UploadFileAndLinkToBoreholeAsync(new MemoryStream(fileBytes), fileName, "application/pdf", newBorehole.Id).ConfigureAwait(false);
        context.BoreholeFiles.Add(boreholeFile);

        var photoName = $"{Guid.NewGuid()}.tif";

        var photo = new Photo
        {
            BoreholeId = newBorehole.Id,
            Name = photoName,
            NameUuid = Guid.NewGuid().ToString() + ".tif",
            FileType = "image/tiff",
        };

        context.Photos.Add(photo);
        Assert.IsNotNull(newBorehole.Photos);

        var result = await controller.ExportJsonWithAttachmentsAsync([newBorehole.Id]).ConfigureAwait(false);

        var fileResult = result as FileContentResult;
        Assert.IsNotNull(fileResult);
        Assert.AreEqual("application/zip", fileResult.ContentType);
        Assert.AreEqual("Borehole 257", fileResult.FileDownloadName[0..12]);
        Assert.IsNotNull(fileResult);

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

        // Assert that photos are not included in the JSON export
        Assert.IsNull(borehole.Photos);
    }

    [TestMethod]
    public async Task ExportJsonWithAttachmementsButFileDoesNotExist()
    {
        var newBorehole = GetBoreholeToAdd();

        context.Add(newBorehole);

        // Save first to get boreholeId
        await context.SaveChangesAsync().ConfigureAwait(false);

        var fileWithoutAttachments = new BoreholeFile
        {
            BoreholeId = newBorehole.Id,
            File = new Models.File() { Name = "file.pdf", NameUuid = $"{Guid.NewGuid}.pdf", Type = "pdf" },
        };

        // Add file to context but not to S3 store
        context.Add(fileWithoutAttachments);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var result = await controller.ExportJsonWithAttachmentsAsync([newBorehole.Id]).ConfigureAwait(false);

        Assert.IsInstanceOfType(result, typeof(ObjectResult));
        ObjectResult objectResult = (ObjectResult)result;
        ProblemDetails problemDetails = (ProblemDetails)objectResult.Value!;
        StringAssert.StartsWith(problemDetails.Detail, "An error occurred while fetching a file from the cloud storage.");
    }

    [TestMethod]
    [DataRow(new int[] { }, typeof(BadRequestObjectResult), DisplayName = "Ids is empty list.")]
    [DataRow(null, typeof(BadRequestObjectResult), DisplayName = "Ids is null.")]
    [DataRow(new int[] { 1_000_257, 1_000_258 }, typeof(FileContentResult), DisplayName = "Valid multiple ids.")]
    [DataRow(new int[] { 1, 2 }, typeof(NotFoundObjectResult), DisplayName = "No boreholes found for ids.")]
    public async Task ExportGeoPackageIdsValidation(IEnumerable<int> ids, Type responseResultType)
    {
        var result = await controller.ExportGeoPackageAsync(ids).ConfigureAwait(false);

        Assert.IsInstanceOfType(result, responseResultType);

        if (responseResultType == typeof(BadRequestObjectResult))
        {
            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
            Assert.AreEqual("The list of IDs must not be empty.", badRequestResult.Value);
        }
    }

    [TestMethod]
    [DataRow(new int[] { }, typeof(BadRequestObjectResult), DisplayName = "Ids is empty list.")]
    [DataRow(null, typeof(BadRequestObjectResult), DisplayName = "Ids is null.")]
    [DataRow(new int[] { 1_000_257, 1_000_258 }, typeof(JsonResult), DisplayName = "Valid multiple ids.")]
    [DataRow(new int[] { 1, 2 }, typeof(NotFoundObjectResult), DisplayName = "No boreholes found for ids.")]
    public async Task ExportJsonIdsValidation(IEnumerable<int> ids, Type responseResultType)
    {
        var result = await controller.ExportJsonAsync(ids).ConfigureAwait(false);

        Assert.IsInstanceOfType(result, responseResultType);

        if (responseResultType == typeof(BadRequestObjectResult))
        {
            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
            Assert.AreEqual("The list of IDs must not be empty.", badRequestResult.Value);
        }
    }

    [TestMethod]
    [DataRow(new int[] { }, typeof(BadRequestObjectResult), DisplayName = "Ids is empty list.")]
    [DataRow(null, typeof(BadRequestObjectResult), DisplayName = "Ids is null.")]
    [DataRow(new int[] { 1_000_257, 1_000_258 }, typeof(FileContentResult), DisplayName = "Valid multiple ids.")]
    [DataRow(new int[] { 1, 2 }, typeof(NotFoundObjectResult), DisplayName = "No boreholes found for ids.")]
    public async Task ExportJsonWithAttachmentsIdsValidation(IEnumerable<int> ids, Type responseResultType)
    {
        var result = await controller.ExportJsonWithAttachmentsAsync(ids).ConfigureAwait(false);

        Assert.IsInstanceOfType(result, responseResultType);

        if (responseResultType == typeof(BadRequestObjectResult))
        {
            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
            Assert.AreEqual("The list of IDs must not be empty.", badRequestResult.Value);
        }
    }

    [TestMethod]
    public async Task ExportExcludesPropertiesWithoutAttribute()
    {
        var newBorehole = GetBoreholeToAdd();

        context.Add(newBorehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var response = await controller.ExportJsonAsync([newBorehole.Id]).ConfigureAwait(false);
        JsonResult jsonResult = (JsonResult)response!;
        Assert.IsNotNull(jsonResult.Value);

        // Serialize using export options
        using var jsonStream = new MemoryStream();
        await JsonSerializer.SerializeAsync(jsonStream, jsonResult.Value, (JsonSerializerOptions?)jsonResult.SerializerSettings);

        // Deserialize all properties
        jsonStream.Position = 0;
        var boreholes = await JsonSerializer.DeserializeAsync<List<Dictionary<string, JsonElement>>>(jsonStream);
        Assert.AreEqual(1, boreholes.Count);

        var borehole = boreholes.Single();
        Assert.AreEqual(newBorehole.Id, borehole[nameof(Borehole.Id)].GetInt32());
        Assert.AreEqual(newBorehole.Name, borehole[nameof(Borehole.Name)].GetString());
        Assert.IsFalse(borehole.ContainsKey(nameof(Borehole.CreatedBy)));
        Assert.IsFalse(borehole.ContainsKey(nameof(Borehole.CreatedById)));
        Assert.IsFalse(borehole.ContainsKey(nameof(Borehole.UpdatedBy)));
        Assert.IsFalse(borehole.ContainsKey(nameof(Borehole.UpdatedById)));
        Assert.IsFalse(borehole.ContainsKey(nameof(Borehole.LockedBy)));
        Assert.IsFalse(borehole.ContainsKey(nameof(Borehole.LockedById)));
    }

    [TestMethod]
    [DataRow(new int[] { }, typeof(BadRequestObjectResult), DisplayName = "Ids is empty list.")]
    [DataRow(null, typeof(BadRequestObjectResult), DisplayName = "Ids is null.")]
    [DataRow(new int[] { 1_000_257, 1_000_258 }, typeof(FileContentResult), DisplayName = "Valid multiple ids.")]
    [DataRow(new int[] { 1, 2 }, typeof(NotFoundObjectResult), DisplayName = "No boreholes found for ids.")]
    public async Task ExportCsvIdsValidation(IEnumerable<int> ids, Type responseResultType)
    {
        var result = await controller.ExportCsvAsync(ids).ConfigureAwait(false);

        Assert.IsInstanceOfType(result, responseResultType);

        if (responseResultType == typeof(BadRequestObjectResult))
        {
            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
            Assert.AreEqual("The list of IDs must not be empty.", badRequestResult.Value);
        }
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
        Assert.AreEqual(ExportFileName, result.FileDownloadName[0..16]);
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
        Assert.AreEqual(ExportFileName, result.FileDownloadName[0..16]);

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
        Assert.AreEqual(TestCsvString, result.ContentType);
        Assert.AreEqual(ExportFileName, result.FileDownloadName[0..16]);
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

    [TestMethod]
    public async Task ExportControllerMethodsShouldValidateUserHasPermissions()
    {
        // Override return value of HasUserWorkgroupPermissions in this specific test
        var boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Loose);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(false);

        var boreholeFileControllerLoggerMock = new Mock<ILogger<BoreholeFileController>>(MockBehavior.Strict);
        boreholeFileControllerLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));

        var loggerMock = new Mock<ILogger<ExportController>>();
        controller = new ExportController(context, boreholeFileCloudService, loggerMock.Object, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };

        // Get all export methods from ExportController
        var exportMethods = typeof(ExportController)
            .GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .Where(m => !m.IsConstructor && m.Name.Contains("export", StringComparison.OrdinalIgnoreCase))
            .ToList();

        Assert.AreEqual(4, exportMethods.Count);

        // Invoke each export method and check if the user permissions are validated
        foreach (var method in exportMethods)
        {
            var resultTask = method.Invoke(controller, [new List<int>() { 1_000_257 }]) as Task;
            await resultTask.ConfigureAwait(false);

            var result = (resultTask as dynamic).Result;

            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult, $"Method {method.Name} did not return BadRequestObjectResult");
            Assert.AreEqual("The user lacks permissions to export the borehole(s).", badRequestResult.Value);
        }
    }

    private static void AssertEntitiesEqualByIncludeInExportAttribute(object? expected, object? actual, ISet<object?> visited)
    {
        Assert.IsNotNull(expected);
        Assert.IsNotNull(actual);

        // Prevent infinite recursion in case of cycles in the object graph.
        if (visited.Contains(expected))
        {
            return;
        }

        visited.Add(expected);

        var type = expected!.GetType();
        Assert.AreEqual(type, actual!.GetType(), "Entity types do not match.");

        // Select all properties with the attribute [IncludeInExport].
        var properties = GetExportProperties(type);

        foreach (var prop in properties)
        {
            var expectedValue = prop.GetValue(expected);
            var actualValue = prop.GetValue(actual);

            AssertPropertyEqual(prop, expectedValue, actualValue, visited);
        }
    }

    private static IEnumerable<PropertyInfo> GetExportProperties(Type type)
    {
        return type.GetProperties(BindingFlags.Public | BindingFlags.Instance).Where(p => p.GetCustomAttribute<Json.IncludeInExportAttribute>() != null);
    }

    private static void AssertPropertyEqual(PropertyInfo prop, object? expectedValue, object? actualValue, ISet<object?> visited)
    {
        var propertyType = prop.PropertyType;

        if (IsDateTime(propertyType))
        {
            AssertDateTimeEqual(prop, expectedValue, actualValue);
            return;
        }

        if (IsCollectionType(propertyType))
        {
            AssertCollectionEqual(prop, expectedValue, actualValue, visited);
            return;
        }

        if (!IsComplexType(propertyType))
        {
            Assert.AreEqual(expectedValue, actualValue, $"Property {prop.Name} differs between original and exported entity.");
            return;
        }

        // Complex nested entity: compare recursively.
        AssertEntitiesEqualByIncludeInExportAttribute(expectedValue, actualValue, visited);
    }

    private static bool IsDateTime(Type propertyType)
    {
        return propertyType == typeof(DateTime) || propertyType == typeof(DateTime?);
    }

    private static bool IsCollectionType(Type propertyType)
    {
        return typeof(System.Collections.IEnumerable).IsAssignableFrom(propertyType) && propertyType != typeof(string);
    }

    private static bool IsComplexType(Type propertyType)
    {
        return propertyType.IsClass && propertyType != typeof(string);
    }

    private static void AssertDateTimeEqual(PropertyInfo prop, object? expectedValue, object? actualValue)
    {
        var expectedDate = (DateTime?)expectedValue;
        var actualDate = (DateTime?)actualValue;

        Assert.AreEqual(expectedDate?.ToUniversalTime().ToString(), actualDate?.ToUniversalTime().ToString(), $"Date Property {prop.Name} differs between original and exported entity.");
    }

    private static void AssertCollectionEqual(PropertyInfo prop, object? expectedValue, object? actualValue, ISet<object?> visited)
    {
        var expectedEnumerable = ((System.Collections.IEnumerable?)expectedValue)?.Cast<object?>().ToList();
        var actualEnumerable = ((System.Collections.IEnumerable?)actualValue)?.Cast<object?>().ToList();

        var expectedNullOrEmpty = expectedEnumerable == null || expectedEnumerable.Count == 0;
        var actualNullOrEmpty = actualEnumerable == null || actualEnumerable.Count == 0;

        if (expectedNullOrEmpty && actualNullOrEmpty)
        {
            return;
        }

        Assert.IsNotNull(expectedEnumerable, $"Expected collection for property {prop.Name} is null.");
        Assert.IsNotNull(actualEnumerable, $"Actual collection for property {prop.Name} is null.");
        Assert.AreEqual(expectedEnumerable!.Count, actualEnumerable!.Count, $"Collection size for property {prop.Name} differs between original and exported entity.");

        for (var i = 0; i < expectedEnumerable.Count; i++)
        {
            var expectedItem = expectedEnumerable[i];
            var actualItem = actualEnumerable[i];

            if (expectedItem == null && actualItem == null)
            {
                continue;
            }

            // Recursively compare each collection element, so nested entities are checked.
            AssertEntitiesEqualByIncludeInExportAttribute(expectedItem, actualItem, visited);
        }
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
