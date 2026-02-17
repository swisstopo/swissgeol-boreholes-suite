using Amazon.S3;
using BDMS.Authentication;
using BDMS.Json;
using BDMS.Models;
using CsvHelper;
using MaxRev.Gdal.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.IO.Converters;
using OSGeo.OGR;
using System.ComponentModel.DataAnnotations;
using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class ExportController : ControllerBase
{
    // Limit the maximum number of items per request to 100.
    // This also applies to the number of filtered ids to ensure the URL length does not exceed the maximum allowed length.
    private const int MaxPageSize = 100;
    private const string ExportFileName = "boreholes_export";
    private const string MissingIdsMessage = "The list of IDs must not be empty.";
    private const string NoBoreholesFoundMessage = "No borehole(s) found for the provided id(s).";
    private const string UserLacksPermissionsMessage = "The user lacks permissions to export the borehole(s).";
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly BoreholeFileCloudService boreholeFileCloudService;
    private readonly IBoreholePermissionService boreholePermissionService;

    private static readonly JsonSerializerOptions jsonExportOptions = new()
    {
        WriteIndented = true,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        Converters = { new DateOnlyJsonConverter(), new LTreeJsonConverter(), new ObservationConverter(), new GeoJsonConverterFactory() },
        TypeInfoResolver = new DefaultJsonTypeInfoResolver
        {
            Modifiers = { JsonExportHelper.RequireIncludeInExportAttribute },
        },
    };

    public ExportController(BdmsContext context, BoreholeFileCloudService boreholeFileCloudService, ILogger<ExportController> logger, IBoreholePermissionService boreholePermissionService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholeFileCloudService = boreholeFileCloudService;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Exports the details of up to <see cref="MaxPageSize"></see> boreholes as a JSON file. Filters the boreholes based on the provided list of IDs.
    /// </summary>
    /// <param name="ids">The required list of borehole ids to filter by.</param>
    [HttpGet("json")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> ExportJsonAsync([FromQuery][MaxLength(MaxPageSize)] IEnumerable<int> ids)
    {
        if (!ValidateIds(ids, out var idList)) return BadRequest(MissingIdsMessage);

        var boreholes = await context.BoreholesWithIncludes.AsNoTracking().Where(borehole => idList.Contains(borehole.Id)).ToListAsync().ConfigureAwait(false);
        if (boreholes.Count == 0) return NotFound(NoBoreholesFoundMessage);

        if (!await HasViewPermissionsForAllBoreholes(boreholes).ConfigureAwait(false)) return BadRequest(UserLacksPermissionsMessage);

        MapCodelists(boreholes);
        return new JsonResult(boreholes, jsonExportOptions);
    }

    /// <summary>
    /// Exports the details of up to <see cref="MaxPageSize"></see> boreholes as a GeoPackage file. Filters the boreholes based on the provided list of IDs.
    /// </summary>
    /// <param name="ids">The required list of borehole ids to filter by.</param>
    [HttpGet("gpkg")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> ExportGeoPackageAsync([FromQuery][MaxLength(MaxPageSize)] IEnumerable<int> ids)
    {
        if (!ValidateIds(ids, out var idList)) return BadRequest(MissingIdsMessage);

        var boreholes = await context.BoreholesWithIncludes.AsNoTracking().Where(borehole => idList.Contains(borehole.Id)).ToListAsync().ConfigureAwait(false);
        if (boreholes.Count == 0) return NotFound(NoBoreholesFoundMessage);

        if (!await HasViewPermissionsForAllBoreholes(boreholes).ConfigureAwait(false)) return BadRequest(UserLacksPermissionsMessage);

        try
        {
            var boreholeGeometries = await GetBoreholeGeometriesAsync(idList).ConfigureAwait(false);

            foreach (var borehole in boreholes)
            {
                borehole.SetTvdValues(boreholeGeometries);
            }

            // Create the GeoJSON features for each borehole
            var features = boreholes.Select(borehole =>
            {
                return new
                {
                    type = "Feature",
                    geometry = new
                    {
                        type = "Point",
                        crs = new
                        {
                            type = "name",
                            properties = new { name = "EPSG:2056" },
                        },
                        coordinates = new[] { borehole.LocationX, borehole.LocationY },
                    },
                    properties = borehole,
                };
            }).ToList();

            // Create the GeoJSON feature collection for each GeoJSON feature
            var geojson = new
            {
                type = "FeatureCollection",
                crs = new
                {
                    type = "name",
                    properties = new { name = "EPSG:2056" },
                },
                features,
            };

            var tempGeoJsonFilePath = Path.Combine(Path.GetTempPath(), $"temp_geojson_{Guid.NewGuid()}.geojson");
            await System.IO.File.WriteAllTextAsync(tempGeoJsonFilePath, JsonSerializer.Serialize(geojson, jsonExportOptions)).ConfigureAwait(false);

            GdalBase.ConfigureAll();
            Ogr.RegisterAll();
            Ogr.UseExceptions();

            // Create a temporary file for GeoPackage
            var tempGpkgFilePath = Path.Combine(Path.GetTempPath(), $"temp_gpkg_{Guid.NewGuid()}.gpkg");
            var openFileGdbDriver = Ogr.GetDriverByName("GPKG");

            // Write GeoPackage to temporary file
            using (var gpkgDataSource = openFileGdbDriver.CreateDataSource(tempGpkgFilePath, null))
            {
                using var geojsonDataSource = Ogr.Open(tempGeoJsonFilePath, 1);

                if (geojsonDataSource == null)
                {
                    throw new InvalidOperationException("Could not open input GeoJSON datasource.");
                }

                gpkgDataSource.CopyLayer(geojsonDataSource.GetLayerByIndex(0), "boreholes", null);
            }

            // Read GeoPackage into memory
            var gpkgBytes = await System.IO.File.ReadAllBytesAsync(tempGpkgFilePath).ConfigureAwait(false);

            // Cleanup temporary file
            System.IO.File.Delete(tempGpkgFilePath);
            System.IO.File.Delete(tempGeoJsonFilePath);

            // Return GeoPackage as a downloadable file
            return File(gpkgBytes, "application/geopackage+sqlite", $"{ExportFileName}_{DateTime.Now:yyyyMMdd}.gpkg");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to prepare GPKG file.");
            return Problem("An error occurred while preparing the GPKG file.");
        }
    }

    /// <summary>
    /// Exports the details of up to <see cref="MaxPageSize"></see> boreholes as a CSV file. Filters the boreholes based on the provided list of IDs.
    /// </summary>
    /// <param name="ids">The list of ids for the boreholes to be exported.</param>
    /// <returns>A CSV file containing the details of the specified boreholes.</returns>
    [HttpGet("csv")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> ExportCsvAsync([FromQuery][MaxLength(MaxPageSize)] IEnumerable<int> ids)
    {
        if (!ValidateIds(ids, out var idList)) return BadRequest(MissingIdsMessage);

        var boreholes = await context.Boreholes
            .Include(b => b.BoreholeCodelists).ThenInclude(bc => bc.Codelist)
            .Where(borehole => idList.Contains(borehole.Id))
            .OrderBy(b => idList.IndexOf(b.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (boreholes.Count == 0) return NotFound(NoBoreholesFoundMessage);

        if (!await HasViewPermissionsForAllBoreholes(boreholes).ConfigureAwait(false)) return BadRequest(UserLacksPermissionsMessage);

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
        csvWriter.WriteField(nameof(Borehole.TopBedrockIntersected));

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

        var boreholeGeometries = await GetBoreholeGeometriesAsync(idList).ConfigureAwait(false);

        // Write data for standard fields
        foreach (var b in boreholes)
        {
            b.SetTvdValues(boreholeGeometries);

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
            csvWriter.WriteField(b.TopBedrockIntersected);

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
        return File(Encoding.UTF8.GetBytes(stringWriter.ToString()), "text/csv", $"{ExportFileName}_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    /// <summary>
    /// Asynchronously gets all <see cref="Borehole"/> with attachments filtered by ids.
    /// </summary>
    /// <param name="ids">The required list of borehole ids to filter by.</param>
    /// <returns>A ZIP file including the borehole data as JSON and all corresponding attachments.</returns>
    [HttpGet("zip")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> ExportJsonWithAttachmentsAsync([FromQuery][MaxLength(MaxPageSize)] IEnumerable<int> ids)
    {
        if (!ValidateIds(ids, out var idList)) return BadRequest(MissingIdsMessage);

        var boreholes = await context.BoreholesWithIncludes.AsNoTracking().Where(borehole => idList.Contains(borehole.Id)).ToListAsync().ConfigureAwait(false);
        if (boreholes.Count == 0) return NotFound(NoBoreholesFoundMessage);

        if (!await HasViewPermissionsForAllBoreholes(boreholes).ConfigureAwait(false)) return BadRequest(UserLacksPermissionsMessage);

        MapCodelists(boreholes);

        try
        {
            var files = await context.BoreholeFiles.Include(f => f.File).AsNoTracking().Where(f => idList.Contains(f.BoreholeId)).ToListAsync().ConfigureAwait(false);
            var fileName = $"{ExportFileName}_{DateTime.UtcNow:yyyyMMddHHmmss}";

            // If only one borehole is exported, use its name as the file name
            if (idList.Count == 1)
            {
                fileName = boreholes.Single().Name;
            }

            var json = JsonSerializer.Serialize(boreholes, jsonExportOptions);

            using var memoryStream = new MemoryStream();
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                // Add JSON file with borehole data
                var jsonEntry = archive.CreateEntry($"{fileName}.json", CompressionLevel.Fastest);
                using var entryStream = jsonEntry.Open();
                using (var textWriter = new StreamWriter(entryStream))
                {
                    await textWriter.WriteAsync(json).ConfigureAwait(false);
                }

                foreach (var file in files.Select(f => f.File))
                {
                    var fileBytes = await boreholeFileCloudService.GetObject(file.NameUuid!).ConfigureAwait(false);

                    // Export the file with the original name and the UUID as a prefix to make it unique while preserving the original name
                    var zipEntry = archive.CreateEntry($"{file.NameUuid}_{file.Name}", CompressionLevel.Fastest);
                    using var zipEntryStream = zipEntry.Open();
                    await zipEntryStream.WriteAsync(fileBytes.AsMemory(0, fileBytes.Length)).ConfigureAwait(false);
                }
            }

            return File(memoryStream.ToArray(), "application/zip", $"{fileName}");
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, "Amazon S3 Store threw an exception.");
            return Problem("An error occurred while fetching a file from the cloud storage.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to prepare ZIP file.");
            return Problem("An error occurred while preparing the ZIP file.");
        }
    }

    private static IEnumerable<BoreholeCodelist> GetBoreholeCodelists(Borehole borehole)
    {
        return borehole.BoreholeCodelists ?? Enumerable.Empty<BoreholeCodelist>();
    }

    /// <summary>
    /// Fetches borehole geometries for the provided borehole IDs.
    /// </summary>
    /// <param name="boreholeIds"></param>
    /// <returns>A dictionary of borehole geometries keyed by borehole ID.</returns>
    private async Task<Dictionary<int, List<BoreholeGeometryElement>>> GetBoreholeGeometriesAsync(List<int> boreholeIds)
    {
        return await context.BoreholeGeometry
            .AsNoTracking()
            .Where(g => boreholeIds.Contains(g.BoreholeId))
            .GroupBy(g => g.BoreholeId)
            .ToDictionaryAsync(group => group.Key, group => group.ToList())
            .ConfigureAwait(false);
    }

    private static void MapCodelists(IEnumerable<Borehole> boreholes)
    {
        foreach (var borehole in boreholes)
        {
            MapLithologyCodelists(borehole);
            MapHydrotestCodelists(borehole);
            MapLogFileCodelists(borehole);
        }
    }

    private static void MapLogFileCodelists(Borehole borehole)
    {
        foreach (var logRun in borehole.LogRuns ?? [])
        {
            foreach (var logFile in logRun.LogFiles ?? [])
            {
                logFile.ToolTypeCodelistIds = logFile.LogFileToolTypeCodes?.Select(c => c.CodelistId).ToList();
            }
        }
    }

    private static void MapHydrotestCodelists(Borehole borehole)
    {
        foreach (var observation in borehole.Observations ?? [])
        {
            if (observation.Type == ObservationType.Hydrotest)
            {
                var hydroTest = observation as Hydrotest;
                hydroTest.EvaluationMethodCodelistIds = hydroTest.HydrotestEvaluationMethodCodes?.Select(c => c.CodelistId).ToList();
                hydroTest.FlowDirectionCodelistIds = hydroTest.HydrotestFlowDirectionCodes?.Select(c => c.CodelistId).ToList();
                hydroTest.KindCodelistIds = hydroTest.HydrotestKindCodes?.Select(c => c.CodelistId).ToList();
            }
        }
    }

    private static void MapLithologyCodelists(Borehole borehole)
    {
        foreach (var stratigraphy in borehole.Stratigraphies ?? [])
        {
            foreach (var lithology in stratigraphy.Lithologies ?? [])
            {
                lithology.RockConditionCodelistIds = lithology.LithologyRockConditionCodes?.Select(code => code.CodelistId).ToList();
                lithology.UscsTypeCodelistIds = lithology.LithologyUscsTypeCodes?.Select(code => code.CodelistId).ToList();
                lithology.TextureMetaCodelistIds = lithology.LithologyTextureMetaCodes?.Select(code => code.CodelistId).ToList();

                foreach (var description in lithology.LithologyDescriptions ?? [])
                {
                    description.ComponentUnconOrganicCodelistIds = description.LithologyDescriptionComponentUnconOrganicCodes?.Select(code => code.CodelistId).ToList();
                    description.ComponentUnconDebrisCodelistIds = description.LithologyDescriptionComponentUnconDebrisCodes?.Select(code => code.CodelistId).ToList();
                    description.GrainShapeCodelistIds = description.LithologyDescriptionGrainShapeCodes?.Select(code => code.CodelistId).ToList();
                    description.GrainAngularityCodelistIds = description.LithologyDescriptionGrainAngularityCodes?.Select(code => code.CodelistId).ToList();
                    description.LithologyUnconDebrisCodelistIds = description.LithologyDescriptionLithologyUnconDebrisCodes?.Select(code => code.CodelistId).ToList();
                    description.ComponentConParticleCodelistIds = description.LithologyDescriptionComponentConParticleCodes?.Select(code => code.CodelistId).ToList();
                    description.ComponentConMineralCodelistIds = description.LithologyDescriptionComponentConMineralCodes?.Select(code => code.CodelistId).ToList();
                    description.StructureSynGenCodelistIds = description.LithologyDescriptionStructureSynGenCodes?.Select(code => code.CodelistId).ToList();
                    description.StructurePostGenCodelistIds = description.LithologyDescriptionStructurePostGenCodes?.Select(code => code.CodelistId).ToList();
                }
            }
        }
    }

    private static bool ValidateIds(IEnumerable<int> ids, out List<int> idList)
    {
        idList = ids?.ToList() ?? [];
        if (idList.Count < 1) return false;

        return true;
    }

    /// <summary>
    /// Determines if the user has sufficient permissions to export all provided boreholes.
    /// </summary>
    /// <param name="boreholes">The list of boreholes to check permissions for.</param>
    /// <returns><see langword="true"/> if the user has permissions for all boreholes; otherwise, <see langword="false"/>.</returns>
    private async Task<bool> HasViewPermissionsForAllBoreholes(List<Borehole> boreholes)
    {
        foreach (var borehole in boreholes)
        {
            if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), borehole.Id).ConfigureAwait(false))
            {
                return false;
            }
        }

        return true;
    }
}
