using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Globalization;
using System.Text;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[DeploymentItem("TestData")]
[TestClass]
public class ExportControllerTest
{
    private BdmsContext context;
    private ExportController controller;
    private Mock<ILogger<ExportController>> loggerMock;
    private static int testBoreholeId = 1000068;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.GetTestContext();
        loggerMock = new Mock<ILogger<ExportController>>();
        controller = new ExportController(context, loggerMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestMethod]
    public async Task DownloadCsvWithValidIdsReturnsFileResultWithMax100Boreholes()
    {
        var ids = Enumerable.Range(testBoreholeId, 120).ToList();

        var result = await controller.ExportCsvAsync(ids) as FileContentResult;

        Assert.IsNotNull(result);
        Assert.AreEqual("text/csv", result.ContentType);
        Assert.AreEqual("boreholes_export.csv", result.FileDownloadName);
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

        var boreholeIdsWithoutGeometry = boreholeQuery
             .Where(b => b.BoreholeGeometry.Count < 2)
             .Take(3).Select(b => b.Id);

        var boreholeIdsWithGeometry = boreholeQuery
             .Where(b => b.BoreholeGeometry.Count > 1)
             .Take(3).Select(b => b.Id);

        var boreholeIds = await boreholeIdsWithoutGeometry.Concat(boreholeIdsWithGeometry).ToListAsync();
        var result = await controller.ExportCsvAsync(boreholeIds) as FileContentResult;

        Assert.IsNotNull(result);
        Assert.AreEqual("text/csv", result.ContentType);
        Assert.AreEqual("boreholes_export.csv", result.FileDownloadName);
        var records = GetRecordsFromFileContent(result);

        foreach (var record in records)
        {
            var totalDepthTvd = record.TotalDepthTvd;
            var totalDepthMd = record.TotalDepth;
            var topBedrockFreshTvd = record.TopBedrockFreshTvd;
            var topBedrockFreshMd = record.TopBedrockFreshMd;
            var topBedrockWeatheredTvd = record.TopBedrockWeatheredTvd;
            var topBedrockWeatheredMd = record.TopBedrockWeatheredMd;

            if (boreholeIdsWithoutGeometry.Select(b => b.ToString()).ToList().Contains(record.Id))
            {
                Assert.AreEqual(totalDepthMd, totalDepthTvd);
                Assert.AreEqual(topBedrockFreshMd, topBedrockFreshTvd);
                Assert.AreEqual(topBedrockWeatheredMd, topBedrockWeatheredTvd);
            }

            if (boreholeIdsWithGeometry.Select(b => b.ToString()).ToList().Contains(record.Id))
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
        var firstBoreholeId = 1_009_068;
        var boreholeWithCustomIds = new Borehole
        {
            Id = firstBoreholeId,
            BoreholeCodelists = new List<BoreholeCodelist>
        {
            new BoreholeCodelist
            {
                BoreholeId = firstBoreholeId,
                CodelistId = 100000010,
                Value = "ID GeoDIN value",
            },
            new BoreholeCodelist
            {
                BoreholeId = firstBoreholeId,
                CodelistId = 100000011,
                Value = "ID Kernlager value",
            },
        },
        };

        var secondBoreholeId = 1_009_069;
        var boreholeWithOtherCustomIds = new Borehole
        {
            Id = secondBoreholeId,
            BoreholeCodelists = new List<BoreholeCodelist>
        {
            new BoreholeCodelist
            {
                BoreholeId = secondBoreholeId,
                CodelistId = 100000010,
                Value = "ID GeoDIN value",
            },
            new BoreholeCodelist
            {
                BoreholeId = secondBoreholeId,
                CodelistId = 100000009,
                Value = "ID TopFels value",
            },
        },
        };

        context.Boreholes.AddRange(boreholeWithCustomIds, boreholeWithOtherCustomIds);
        await context.SaveChangesAsync();

        var ids = new List<int> { firstBoreholeId, secondBoreholeId };

        var result = await controller.ExportCsvAsync(ids) as FileContentResult;
        Assert.IsNotNull(result);
        Assert.AreEqual("text/csv", result.ContentType);
        Assert.AreEqual("boreholes_export.csv", result.FileDownloadName);

        var records = GetRecordsFromFileContent(result);

        var firstBorehole = records.Find(r => r.Id == firstBoreholeId.ToString());
        Assert.IsNotNull(firstBorehole);
        Assert.AreEqual("ID GeoDIN value", firstBorehole.IDGeODin);
        Assert.AreEqual("ID Kernlager value", firstBorehole.IDKernlager);
        Assert.AreEqual("", firstBorehole.IDTopFels);

        var secondBorehole = records.Find(r => r.Id == secondBoreholeId.ToString());
        Assert.IsNotNull(secondBorehole);
        Assert.AreEqual("ID GeoDIN value", secondBorehole.IDGeODin);
        Assert.AreEqual("", secondBorehole.IDKernlager);
        Assert.AreEqual("ID TopFels value", secondBorehole.IDTopFels);
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
        var ids = new List<int> { 9, 8, 0, testBoreholeId };

        var result = await controller.ExportCsvAsync(ids) as FileContentResult;

        Assert.IsNotNull(result);
        Assert.IsNotNull(result);
        Assert.AreEqual("text/csv", result.ContentType);
        Assert.AreEqual("boreholes_export.csv", result.FileDownloadName);
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
}
