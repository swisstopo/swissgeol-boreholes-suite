﻿using BDMS.Authentication;
using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Net;
using System.Security.Claims;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class UploadController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly LocationService locationService;
    private readonly CoordinateService coordinateService;
    private readonly int sridLv95 = 2056;
    private readonly int sridLv03 = 21781;

    public UploadController(BdmsContext context, ILogger<UploadController> logger, LocationService locationService, CoordinateService coordinateService)
    {
        this.context = context;
        this.logger = logger;
        this.locationService = locationService;
        this.coordinateService = coordinateService;
    }

    /// <summary>
    /// Receives an uploaded csv file to import one or several <see cref="Borehole"/>(s).
    /// </summary>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>(s).</param>
    /// <param name="boreholesFile">The <see cref="IFormFile"/> containing the csv records that were uploaded.</param>
    /// <param name="pdfAttachments">The list of <see cref="IFormFile"/> containing the pdf attachments referred in <paramref name="boreholesFile"/>.</param>
    /// <returns>The number of the newly created <see cref="Borehole"/>s.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> UploadFileAsync(int workgroupId, IFormFile boreholesFile, IList<IFormFile>? pdfAttachments = null)
    {
        logger.LogInformation("Import borehole(s) to workgroup with id <{WorkgroupId}>", workgroupId);
        try
        {
            // Checks if the provided boreholes file is empty or not provided.
            if (boreholesFile == null || boreholesFile.Length == 0)
            {
                return BadRequest("No borehole csv file uploaded.");
            }

            // Check if the provided boreholes file is a CSV file.
            if (!FileTypeChecker.IsCsv(boreholesFile))
            {
                return BadRequest("Invalid file type for borehole csv.");
            }

            // Check if the provided borehole attachments are PDF files.
            if (pdfAttachments != null && pdfAttachments.Count > 0)
            {
                if (pdfAttachments.Any(pdfFile => !FileTypeChecker.IsPdf(pdfFile)))
                {
                    return BadRequest("Invalid file type for pdf attachment.");
                }
            }

            var boreholes = ReadBoreholesFromCsv(boreholesFile)
                .Select(importBorehole =>
                {
                    var borehole = (Borehole)importBorehole;

                    // Set DateTime kind to UTC, since PSQL type 'timestamp with timezone' requires UTC as DateTime.Kind
                    borehole.SpudDate = borehole.SpudDate != null ? DateTime.SpecifyKind(borehole.SpudDate.Value, DateTimeKind.Utc) : null;
                    borehole.DrillingDate = borehole.DrillingDate != null ? DateTime.SpecifyKind(borehole.DrillingDate.Value, DateTimeKind.Utc) : null;
                    borehole.RestrictionUntil = borehole.RestrictionUntil != null ? DateTime.SpecifyKind(borehole.RestrictionUntil.Value, DateTimeKind.Utc) : null;
                    borehole.WorkgroupId = workgroupId;

                    // Detect coordinate reference system and set according coordinate properties of borehole.
                    if (importBorehole.Location_x != null && importBorehole.Location_y != null)
                    {
                        if (importBorehole.Location_x >= 2_000_000)
                        {
                            borehole.OriginalReferenceSystem = ReferenceSystem.LV95;
                            borehole.LocationX = importBorehole.Location_x;
                            borehole.LocationY = importBorehole.Location_y;
                        }
                        else
                        {
                            borehole.OriginalReferenceSystem = ReferenceSystem.LV03;
                            borehole.LocationXLV03 = importBorehole.Location_x;
                            borehole.LocationYLV03 = importBorehole.Location_y;
                        }
                    }

                    return borehole;
                })
                .ToList();

            ValidateBoreholes(boreholes);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(statusCode: (int)HttpStatusCode.BadRequest);
            }

            var userName = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;

            var user = await context.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.Name == userName)
                .ConfigureAwait(false);

            foreach (var borehole in boreholes)
            {
                // Compute borehole location.
                await UpdateBoreholeLocationAndCoordinates(borehole).ConfigureAwait(false);

                // Add a workflow per borehole.
                borehole.Workflows.Add(
                    new Workflow
                    {
                        UserId = user.Id,
                        Role = Role.Editor,
                        Started = DateTime.Now.ToUniversalTime(),
                        Finished = null,
                    });
            }

            await context.Boreholes.AddRangeAsync(boreholes).ConfigureAwait(false);
            return await SaveChangesAsync(() => Ok(boreholes.Count)).ConfigureAwait(false);
        }
        catch (Exception ex) when (ex is HeaderValidationException || ex is ReaderException)
        {
            return Problem(ex.Message, statusCode: (int)HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            logger.LogError("Error while importing borehole(s) to workgroup with id <{WorkgroupId}>: <{Error}>", workgroupId, ex);
            return Problem("Error while importing borehole(s).");
        }
    }

    private void ValidateBoreholes(List<Borehole> boreholesFromFile)
    {
        var boreholesFromDb = context.Boreholes
            .AsNoTracking()
            .Select(x => new { x.Id, x.TotalDepth, x.LocationX, x.LocationY })
            .ToList();

        var boreholesCombined = boreholesFromDb
            .Concat(boreholesFromFile.Select(x => new { x.Id, x.TotalDepth, x.LocationX, x.LocationY }))
            .ToList();

        var nullOrEmptyMsg = "Field '{0}' is required.";
        foreach (var boreholeFromFile in boreholesFromFile.Select((value, index) => (value, index)))
        {
            if (string.IsNullOrEmpty(boreholeFromFile.value.OriginalName))
            {
                ModelState.AddModelError($"Row{boreholeFromFile.index}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "original_name"));
            }

            if (boreholeFromFile.value.LocationX == null && boreholeFromFile.value.LocationXLV03 == null)
            {
                ModelState.AddModelError($"Row{boreholeFromFile.index}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "location_x"));
            }

            if (boreholeFromFile.value.LocationY == null && boreholeFromFile.value.LocationYLV03 == null)
            {
                ModelState.AddModelError($"Row{boreholeFromFile.index}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "location_y"));
            }

            // TODO: Refactor logic to determine wether the dupliacted borehole is in the db or the provided file (#584)
            // Until refactoring check for duplicatedBoreholes.Count > 1.
            // Check if borehole with same coordinates (in tolerance) and same total depth occurs mutliple times in list.
            var duplicatedBoreholes = boreholesCombined
                .Where(b =>
                    CompareValuesWithTolerance(b.TotalDepth, boreholeFromFile.value.TotalDepth, 0) &&
                    CompareValuesWithTolerance(b.LocationX, boreholeFromFile.value.LocationX, 2) &&
                    CompareValuesWithTolerance(b.LocationY, boreholeFromFile.value.LocationY, 2))
                .ToList();

            if (duplicatedBoreholes.Count > 1)
            {
                // Adjust error msg depending on where the duplicated borehole is (db or file).
                var errorMsg = $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)}";
                errorMsg += duplicatedBoreholes.Any(x => x.Id > 0) ? " already exists in database." : " is provied multiple times.";

                ModelState.AddModelError($"Row{boreholeFromFile.index}", errorMsg);
            }
        }
    }

    internal static bool CompareValuesWithTolerance(double? firstValue, double? secondValue, double tolerance)
    {
        if (firstValue == null && secondValue == null) return true;
        if (firstValue == null || secondValue == null) return false;

        return Math.Abs(firstValue.Value - secondValue.Value) <= tolerance;
    }

    private List<BoreholeImport> ReadBoreholesFromCsv(IFormFile file)
    {
        var csvConfig = new CsvConfiguration(new CultureInfo("de-CH"))
        {
            Delimiter = ";",
            IgnoreReferences = true,
            PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
            MissingFieldFound = null,
        };

        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, csvConfig);

        csv.Context.RegisterClassMap(new CsvImportBoreholeMap());

        return csv.GetRecords<BoreholeImport>().ToList();
    }

    private async Task UpdateBoreholeLocationAndCoordinates(Borehole borehole)
    {
        // Use origin spatial reference system
        var locationX = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationX : borehole.LocationXLV03;
        var locationY = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationY : borehole.LocationYLV03;
        var srid = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? sridLv95 : sridLv03;

        if (locationX == null || locationY == null) return;

        // Set coordinates for missing reference system.
        await coordinateService.MigrateCoordinatesOfBorehole(borehole, onlyMissing: false).ConfigureAwait(false);

        var locationInfo = await locationService.IdentifyAsync(locationX.Value, locationY.Value, srid).ConfigureAwait(false);
        if (locationInfo != null)
        {
            borehole.Country = locationInfo.Country;
            borehole.Canton = locationInfo.Canton;
            borehole.Municipality = locationInfo.Municipality;
        }
    }

    private sealed class CsvImportBoreholeMap : ClassMap<BoreholeImport>
    {
        private readonly CultureInfo swissCulture = new("de-CH");

        public CsvImportBoreholeMap()
        {
            var config = new CsvConfiguration(swissCulture)
            {
                IgnoreReferences = true,
                PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
            };

            AutoMap(config);

            // Define all optional properties of Borehole (ef navigation properties do not need to be defined as optional).
            Map(m => m.CreatedById).Optional();
            Map(m => m.Created).Optional();
            Map(m => m.Updated).Optional();
            Map(m => m.UpdatedById).Optional();
            Map(m => m.Locked).Optional();
            Map(m => m.LockedById).Optional();
            Map(m => m.WorkgroupId).Optional();
            Map(m => m.IsPublic).Optional();
            Map(m => m.KindId).Optional();
            Map(m => m.ElevationZ).Optional();
            Map(m => m.HrsId).Optional();
            Map(m => m.TotalDepth).Optional();
            Map(m => m.RestrictionId).Optional();
            Map(m => m.RestrictionUntil).Optional();
            Map(m => m.AlternateName).Optional();
            Map(m => m.QtLocationId).Optional();
            Map(m => m.QtElevationId).Optional();
            Map(m => m.ProjectName).Optional();
            Map(m => m.DrillingMethodId).Optional();
            Map(m => m.DrillingDate).Optional();
            Map(m => m.CuttingsId).Optional();
            Map(m => m.PurposeId).Optional();
            Map(m => m.DrillingDiameter).Optional();
            Map(m => m.StatusId).Optional();
            Map(m => m.Inclination).Optional();
            Map(m => m.InclinationDirection).Optional();
            Map(m => m.QtInclinationDirectionId).Optional();
            Map(m => m.QtDepthId).Optional();
            Map(m => m.TopBedrock).Optional();
            Map(m => m.QtTopBedrockId).Optional();
            Map(m => m.HasGroundwater).Optional();
            Map(m => m.Remarks).Optional();
            Map(m => m.LithologyTopBedrockId).Optional();
            Map(m => m.LithostratigraphyId).Optional();
            Map(m => m.ChronostratigraphyId).Optional();
            Map(m => m.SpudDate).Optional();
            Map(m => m.TopBedrockTvd).Optional();
            Map(m => m.QtTopBedrockTvdId).Optional();
            Map(m => m.ReferenceElevation).Optional();
            Map(m => m.QtReferenceElevationId).Optional();
            Map(m => m.ReferenceElevationTypeId).Optional();
            Map(m => m.TotalDepthTvd).Optional();
            Map(m => m.QtTotalDepthTvdId).Optional();
            Map(m => m.LocationX).Optional();
            Map(m => m.LocationY).Optional();
            Map(m => m.LocationXLV03).Optional();
            Map(m => m.LocationYLV03).Optional();
            Map(m => m.OriginalReferenceSystem).Optional();

            // Define properties to ignore
            Map(b => b.Municipality).Ignore();
            Map(b => b.Canton).Ignore();
            Map(b => b.Country).Ignore();
            Map(m => m.Id).Ignore();

            // Define additional mapping logic
            Map(m => m.BoreholeCodelists).Convert(args =>
            {
                var boreholeCodelists = new List<BoreholeCodelist>();
                new List<(string Name, int CodeListId)>
                {
                    ("id_geodin_shortname", 100000000),
                    ("id_info_geol", 100000003),
                    ("id_original", 100000004),
                    ("id_canton", 100000005),
                    ("id_geo_quat", 100000006),
                    ("id_geo_mol", 100000007),
                    ("id_geo_therm", 100000008),
                    ("id_top_fels", 100000009),
                    ("id_geodin", 100000010),
                    ("id_kernlager", 100000011),
                }.ForEach(id =>
                {
                    if (args.Row.HeaderRecord != null && args.Row.HeaderRecord.Any(h => h == id.Name))
                    {
                        var value = args.Row.GetField<string?>(id.Name);
                        if (!string.IsNullOrEmpty(value))
                        {
                            boreholeCodelists.Add(new BoreholeCodelist
                            {
                                CodelistId = id.CodeListId,
                                SchemaName = "borehole_identifier",
                                Value = value,
                            });
                        }
                    }
                });

                return boreholeCodelists;
            });
        }
    }

    private async Task<ActionResult<int>> SaveChangesAsync(Func<ActionResult<int>> successResult)
    {
        try
        {
            await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

            return successResult();
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the entity changes.";
            logger?.LogError(ex, errorMessage);
            return Problem(errorMessage, statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
