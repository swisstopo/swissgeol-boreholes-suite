using BDMS.Authentication;
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
using ValidationException = System.ComponentModel.DataAnnotations.ValidationException;

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
    /// <param name="file">The <see cref="IFormFile"/> containing the csv records that were uploaded.</param>
    /// <returns>The number of the newly created <see cref="Borehole"/>s.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> UploadFileAsync(int workgroupId, IFormFile file)
    {
        logger.LogInformation("Import borehole(s) to workgroup with id <{WorkgroupId}>", workgroupId);
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var boreholes = ReadBoreholesFromCsv(file)
                .Select(b =>
                {
                    // Set DateTime kind to UTC, since PSQL type 'timestamp with timezone' requires UTC as DateTime.Kind
                    b.SpudDate = b.SpudDate != null ? DateTime.SpecifyKind(b.SpudDate.Value, DateTimeKind.Utc) : null;
                    b.DrillingDate = b.DrillingDate != null ? DateTime.SpecifyKind(b.DrillingDate.Value, DateTimeKind.Utc) : null;
                    b.RestrictionUntil = b.RestrictionUntil != null ? DateTime.SpecifyKind(b.RestrictionUntil.Value, DateTimeKind.Utc) : null;
                    b.WorkgroupId = workgroupId;
                    return b;
                }).ToList();

            ValidateBoreholes(boreholes);

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
        catch (Exception ex)
        {
            logger.LogError("Error while importing borehole(s) to workgroup with id <{WorkgroupId}>: <{Error}>", workgroupId, ex);

            if (ex is ValidationException validationEx)
            {
                if (!ModelState.IsValid)
                {
                    var problemDetails = new ValidationProblemDetails(ModelState);

                    return new ObjectResult(problemDetails)
                    {
                        ContentTypes = { "application/problem+json" },
                        StatusCode = 400,
                    };
                }

                return Problem(validationEx.Message, statusCode: (int)HttpStatusCode.BadRequest);
            }

            return Problem("Error while importing borehole(s).");
        }
    }

    private void ValidateBoreholes(List<Borehole> boreholes)
    {
        foreach (var borehole in boreholes.Select((value, index) => (value, index)))
        {
            if (string.IsNullOrEmpty(borehole.value.OriginalName))
            {
                ModelState.AddModelError($"Row{borehole.index}", "Field 'original_name' is invalid.");
            }

            if (borehole.value.LocationX == null && borehole.value.LocationXLV03 == null)
            {
                ModelState.AddModelError($"Row{borehole.index}", "Field 'location_x' is invalid.");
            }

            if (borehole.value.LocationY == null && borehole.value.LocationYLV03 == null)
            {
                ModelState.AddModelError($"Row{borehole.index}", "Field 'location_y' is invalid.");
            }
        }

        if (!ModelState.IsValid)
        {
            throw new ValidationException("");
        }
    }

    private List<Borehole> ReadBoreholesFromCsv(IFormFile file)
    {
        var requiredHeaders = new List<string>() { "original_name", "location_x", "location_y" };
        var csvConfig = new CsvConfiguration(new CultureInfo("de-CH"))
        {
            Delimiter = ";",
            IgnoreReferences = true,
            PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
            MissingFieldFound = null,

            // Check if all required Headers are present in the provided CSV file.
            HeaderValidated = args =>
            {
                foreach (var header in requiredHeaders)
                {
                    if (args.Context.Reader.HeaderRecord != null && !args.Context.Reader.HeaderRecord.Contains(header))
                    {
                        throw new ValidationException($"Please ensure all reuqired Headers ({string.Join(", ", requiredHeaders)}) are defined.");
                    }
                }
            },
        };

        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, csvConfig);

        csv.Context.RegisterClassMap(new BoreholeMap());

        return csv.GetRecords<Borehole>().ToList();
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

    private sealed class BoreholeMap : ClassMap<Borehole>
    {
        private readonly CultureInfo swissCulture = new("de-CH");

        public BoreholeMap()
        {
            var config = new CsvConfiguration(swissCulture)
            {
                IgnoreReferences = true,
                PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
            };

            AutoMap(config);

            // Define all optional properties of Borehole (only simple types need to be defined as optional)
            Map(m => m.Id).Optional();
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

            // Define properties to ignore
            Map(b => b.Municipality).Ignore();
            Map(b => b.Canton).Ignore();
            Map(b => b.Country).Ignore();

            // Define additional mapping logic
            Map(b => b.OriginalReferenceSystem).Convert(args =>
            {
                var locationX = args.Row.GetField<double?>("location_x");
                var locationY = args.Row.GetField<double?>("location_y");
                return locationX == null || locationY == null ? null : locationX >= 2_000_000 ? ReferenceSystem.LV95 : ReferenceSystem.LV03;
            });
            Map(b => b.LocationX).Convert(args => args.Row.GetField<double?>("location_x") >= 2_000_000 ? args.Row.GetField<double?>("location_x") : null);
            Map(b => b.LocationY).Convert(args => args.Row.GetField<double?>("location_y") >= 1_000_000 ? args.Row.GetField<double?>("location_y") : null);
            Map(b => b.LocationXLV03).Convert(args => args.Row.GetField<double?>("location_x") < 2_000_000 ? args.Row.GetField<double?>("location_x") : null);
            Map(b => b.LocationYLV03).Convert(args => args.Row.GetField<double?>("location_y") < 1_000_000 ? args.Row.GetField<double?>("location_y") : null);
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
