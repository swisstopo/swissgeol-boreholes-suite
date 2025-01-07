using BDMS.Authentication;
using BDMS.Models;
using CsvHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class ExportController : ControllerBase
{
    // Limit the maximum number of items per request to 100.
    // This also applies to the number of filtered ids to ensure the URL length does not exceed the maximum allowed length.
    private const int MaxPageSize = 100;
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly BoreholeFileCloudService boreholeFileCloudService;

    private static readonly JsonSerializerOptions jsonExportOptions = new()
    {
        WriteIndented = true,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        Converters = { new DateOnlyJsonConverter(), new LTreeJsonConverter(), new ObservationConverter() },
    };

    public ExportController(BdmsContext context, BoreholeFileCloudService boreholeFileCloudService, ILogger<ExportController> logger)
    {
        this.context = context;
        this.logger = logger;
        this.boreholeFileCloudService = boreholeFileCloudService;
    }

    /// <summary>
    /// Asynchronously gets all <see cref="Borehole"/> records filtered by ids. Additional data is included in the response.
    /// </summary>
    /// <param name="ids">The required list of borehole ids to filter by.</param>
    [HttpGet("json")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> ExportJsonAsync([FromQuery][MaxLength(MaxPageSize)] IEnumerable<int> ids)
    {
        if (ids == null || !ids.Any()) return BadRequest("The list of IDs must not be empty.");

        var boreholes = await context.Boreholes.GetAllWithIncludes().AsNoTracking().Where(borehole => ids.Contains(borehole.Id)).ToListAsync().ConfigureAwait(false);

        return new JsonResult(boreholes, jsonExportOptions);
    }

    /// <summary>
    /// Exports the details of up to <see cref="MaxPageSize"></see> boreholes as a CSV file. Filters the boreholes based on the provided list of IDs.
    /// </summary>
    /// <param name="ids">The list of IDs for the boreholes to be exported.</param>
    /// <returns>A CSV file containing the details of the specified boreholes.</returns>
    [HttpGet("csv")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> ExportCsvAsync([FromQuery][MaxLength(MaxPageSize)] IEnumerable<int> ids)
    {
        List<int> idList = ids.Take(MaxPageSize).ToList();
        if (idList.Count < 1) return BadRequest("The list of IDs must not be empty.");

        var boreholes = await context.Boreholes
            .Include(b => b.BoreholeCodelists).ThenInclude(bc => bc.Codelist)
            .Where(borehole => idList.Contains(borehole.Id))
            .OrderBy(b => idList.IndexOf(b.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (boreholes.Count == 0) return NotFound("No borehole(s) found for the provided id(s).");

        using var stringWriter = new StringWriter();
        using var csvWriter = new CsvWriter(stringWriter, CsvConfigHelper.CsvWriteConfig);

        // Write headers for standard fields
        csvWriter.WriteField(nameof(Borehole.Id));
        csvWriter.WriteField(nameof(Borehole.OriginalName));
        csvWriter.WriteField(nameof(Borehole.ProjectName));
        csvWriter.WriteField(nameof(Borehole.Name));
        csvWriter.WriteField(nameof(Borehole.RestrictionId));
        csvWriter.WriteField(nameof(Borehole.RestrictionUntil));
        csvWriter.WriteField(nameof(Borehole.NationalInterest));
        csvWriter.WriteField(nameof(Borehole.LocationX));
        csvWriter.WriteField(nameof(Borehole.LocationY));
        csvWriter.WriteField(nameof(Borehole.LocationXLV03));
        csvWriter.WriteField(nameof(Borehole.LocationYLV03));
        csvWriter.WriteField(nameof(Borehole.LocationPrecisionId));
        csvWriter.WriteField(nameof(Borehole.ElevationZ));
        csvWriter.WriteField(nameof(Borehole.ElevationPrecisionId));
        csvWriter.WriteField(nameof(Borehole.ReferenceElevation));
        csvWriter.WriteField(nameof(Borehole.ReferenceElevationTypeId));
        csvWriter.WriteField(nameof(Borehole.ReferenceElevationPrecisionId));
        csvWriter.WriteField(nameof(Borehole.HrsId));
        csvWriter.WriteField(nameof(Borehole.TypeId));
        csvWriter.WriteField(nameof(Borehole.PurposeId));
        csvWriter.WriteField(nameof(Borehole.StatusId));
        csvWriter.WriteField(nameof(Borehole.Remarks));
        csvWriter.WriteField(nameof(Borehole.TotalDepth));
        csvWriter.WriteField(nameof(Borehole.DepthPrecisionId));
        csvWriter.WriteField(nameof(Borehole.TopBedrockFreshMd));
        csvWriter.WriteField(nameof(Borehole.TopBedrockWeatheredMd));
        csvWriter.WriteField(nameof(Borehole.TotalDepthTvd));
        csvWriter.WriteField(nameof(Borehole.TopBedrockFreshTvd));
        csvWriter.WriteField(nameof(Borehole.TopBedrockWeatheredTvd));
        csvWriter.WriteField(nameof(Borehole.HasGroundwater));
        csvWriter.WriteField(nameof(Borehole.LithologyTopBedrockId));
        csvWriter.WriteField(nameof(Borehole.ChronostratigraphyTopBedrockId));
        csvWriter.WriteField(nameof(Borehole.LithostratigraphyTopBedrockId));

        // Write dynamic headers for each distinct custom Id
        var customIdHeaders = boreholes
            .SelectMany(b => GetBoreholeCodelists(b))
            .Select(bc => new { bc.CodelistId, bc.Codelist?.En })
            .Distinct()
            .OrderBy(x => x.CodelistId)
            .ToList();

        foreach (var header in customIdHeaders)
        {
            csvWriter.WriteField(header.En.Replace(" ", "", StringComparison.OrdinalIgnoreCase));
        }

        // Move to the next line
        await csvWriter.NextRecordAsync().ConfigureAwait(false);

        // Write data for standard fields
        foreach (var b in boreholes)
        {
            var boreholeGeometry = await context.BoreholeGeometry
                .AsNoTracking()
                .Where(g => g.BoreholeId == b.Id)
                .ToListAsync()
                .ConfigureAwait(false);

            b.TotalDepthTvd = boreholeGeometry.GetTVDIfGeometryExists(b.TotalDepth);
            b.TopBedrockFreshTvd = boreholeGeometry.GetTVDIfGeometryExists(b.TopBedrockFreshMd);
            b.TopBedrockWeatheredTvd = boreholeGeometry.GetTVDIfGeometryExists(b.TopBedrockWeatheredMd);

            csvWriter.WriteField(b.Id);
            csvWriter.WriteField(b.OriginalName);
            csvWriter.WriteField(b.ProjectName);
            csvWriter.WriteField(b.Name);
            csvWriter.WriteField(b.RestrictionId);
            csvWriter.WriteField(b.RestrictionUntil);
            csvWriter.WriteField(b.NationalInterest);
            csvWriter.WriteField(b.LocationX);
            csvWriter.WriteField(b.LocationY);
            csvWriter.WriteField(b.LocationXLV03);
            csvWriter.WriteField(b.LocationYLV03);
            csvWriter.WriteField(b.LocationPrecisionId);
            csvWriter.WriteField(b.ElevationZ);
            csvWriter.WriteField(b.ElevationPrecisionId);
            csvWriter.WriteField(b.ReferenceElevation);
            csvWriter.WriteField(b.ReferenceElevationTypeId);
            csvWriter.WriteField(b.ReferenceElevationPrecisionId);
            csvWriter.WriteField(b.HrsId);
            csvWriter.WriteField(b.TypeId);
            csvWriter.WriteField(b.PurposeId);
            csvWriter.WriteField(b.StatusId);
            csvWriter.WriteField(b.Remarks);
            csvWriter.WriteField(b.TotalDepth);
            csvWriter.WriteField(b.DepthPrecisionId);
            csvWriter.WriteField(b.TopBedrockFreshMd);
            csvWriter.WriteField(b.TopBedrockWeatheredMd);
            csvWriter.WriteField(b.TotalDepthTvd);
            csvWriter.WriteField(b.TopBedrockFreshTvd);
            csvWriter.WriteField(b.TopBedrockWeatheredTvd);
            csvWriter.WriteField(b.HasGroundwater);
            csvWriter.WriteField(b.LithologyTopBedrockId);
            csvWriter.WriteField(b.ChronostratigraphyTopBedrockId);
            csvWriter.WriteField(b.LithostratigraphyTopBedrockId);

            // Write dynamic fields for custom Ids
            foreach (var header in customIdHeaders)
            {
                var codelistValue = GetBoreholeCodelists(b).FirstOrDefault(bc => bc.CodelistId == header.CodelistId)?.Value;
                csvWriter.WriteField(codelistValue ?? "");
            }

            // Move to the next line
            await csvWriter.NextRecordAsync().ConfigureAwait(false);
        }

        await csvWriter.FlushAsync().ConfigureAwait(false);
        return File(Encoding.UTF8.GetBytes(stringWriter.ToString()), "text/csv", "boreholes_export.csv");
    }

    /// <summary>
    /// Asynchronously gets all <see cref="Borehole"/> with attachments filtered by ids.
    /// </summary>
    /// <param name="ids">The required list of borehole ids to filter by.</param>
    /// <returns>A ZIP-file including the borehole data as .json and all corresponding attachments.</returns>
    [HttpGet("zip")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> ExportJsonWithAttachmentsAsync([FromQuery][MaxLength(MaxPageSize)] IEnumerable<int> ids)
    {
        var idCount = ids.Count();
        if (ids == null || idCount < 1) return BadRequest("The list of IDs must not be empty.");

        try
        {
            var boreholes = await context.Boreholes.GetAllWithIncludes().AsNoTracking().Where(borehole => ids.Contains(borehole.Id)).ToListAsync().ConfigureAwait(false);
            var files = await context.BoreholeFiles.Include(f => f.File).Where(f => ids.Contains(f.BoreholeId)).ToListAsync().ConfigureAwait(false);
            var fileName = $"boreholes_with_attachments_{DateTime.UtcNow:yyyyMMddHHmmss}";

            if (idCount == 1)
            {
                fileName = boreholes.Single().Name;
            }

            var json = JsonSerializer.Serialize(boreholes, jsonExportOptions);

            using var memoryStream = new MemoryStream();
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                // Add JSON file with borehole data
                var jsonEntry = archive.CreateEntry($"{fileName}.json", CompressionLevel.Fastest);
                using (var entryStream = jsonEntry.Open())
                using (var textWriter = new StreamWriter(entryStream))
                {
                    await textWriter.WriteAsync(json).ConfigureAwait(false);
                }

                foreach (var file in files)
                {
                    if (file.File.NameUuid != null)
                    {
                        var fileBytes = await boreholeFileCloudService.GetObject(file.File.NameUuid).ConfigureAwait(false);
                        var zipEntry = archive.CreateEntry($"{file.BoreholeId}_{file.File.Name}", CompressionLevel.Fastest);
                        using var zipEntryStream = zipEntry.Open();
                        await zipEntryStream.WriteAsync(fileBytes.AsMemory(0, fileBytes.Length)).ConfigureAwait(false);
                    }
                }
            }

            return File(memoryStream.ToArray(), "application/zip", fileName);
        }
        catch (Exception ex)
        {
            logger.LogError("Failed to prepare ZIP File: {Exception}", ex);
            return Problem("An error occurred while preparing the ZIP File.");
        }
    }

    private static IEnumerable<BoreholeCodelist> GetBoreholeCodelists(Borehole borehole)
    {
        return borehole.BoreholeCodelists ?? Enumerable.Empty<BoreholeCodelist>();
    }
}
