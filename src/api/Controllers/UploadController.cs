using BDMS.Authentication;
using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.Globalization;
using System.Security.Claims;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class UploadController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly LocationService locationService;
    private readonly int sridLv95 = 2056;
    private readonly int sridLv03 = 21781;

    public UploadController(BdmsContext context, ILogger<UploadController> logger, LocationService locationService)
    {
        this.context = context;
        this.logger = logger;
        this.locationService = locationService;
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
                    b.WorkgroupId = workgroupId;
                    return b;
                }).ToList();

            var userName = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;

            var user = await context.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.Name == userName)
                .ConfigureAwait(false);

            var tasks = boreholes.Select(async b =>
            {
                // Compute borehole location.
                b = await UpdateBoreholeLocation(b).ConfigureAwait(false);

                // Add a workflow per borehole.
                b.Workflows.Add(
                    new Workflow
                    {
                        UserId = user.Id,
                        Role = Role.Editor,
                        Started = DateTime.Now.ToUniversalTime(),
                        Finished = null,
                    });
            });

            await Task.WhenAll(tasks).ConfigureAwait(false);
            await context.Boreholes.AddRangeAsync(boreholes).ConfigureAwait(false);
            return await SaveChangesAsync(() => Ok(boreholes.Count)).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError("Error while importing borehole(s) to workgroup with id <{WorkgroupId}>: <{Error}>", workgroupId, ex);
            return Problem("Error while importing borehole(s).");
        }
    }

    private List<Borehole> ReadBoreholesFromCsv(IFormFile file)
    {
        var csvConfig = new CsvConfiguration(new CultureInfo("de-CH"))
        {
            MissingFieldFound = null,
            HeaderValidated = null,
            Delimiter = ";",
            IgnoreReferences = true,
            PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
        };

        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, csvConfig);

        csv.Context.RegisterClassMap(new BoreholeMap());

        return csv.GetRecords<Borehole>().ToList();
    }

    private async Task<Borehole> UpdateBoreholeLocation(Borehole borehole)
    {
        // Use origin spatial reference system
        var locationX = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationX : borehole.LocationXLV03;
        var locationY = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationY : borehole.LocationYLV03;
        var srid = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? sridLv95 : sridLv03;

        if (locationX == null || locationY == null) return borehole;

        var coordinate = new Coordinate((double)locationX, (double)locationY);
        borehole.Geometry = new Point(coordinate) { SRID = srid };

        var locationInfo = await locationService.IdentifyAsync(locationX.Value, locationY.Value, srid).ConfigureAwait(false);
        borehole.Country = locationInfo.Country;
        borehole.Canton = locationInfo.Canton;
        borehole.Municipality = locationInfo.Municipality;
        return borehole;
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
            Map(b => b.LocationX).Name("location_x_lv_95");
            Map(b => b.LocationY).Name("location_y_lv_95");
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
                }.ForEach(id =>
                {
                    var value = args.Row.GetField<string>(id.Name);
                    if (!string.IsNullOrEmpty(value))
                    {
                        boreholeCodelists.Add(new BoreholeCodelist
                        {
                            CodelistId = id.CodeListId,
                            SchemaName = "borehole_identifier",
                            Value = value,
                        });
                    }
                });

                return boreholeCodelists;
            });
            Map(b => b.Date).Name("date").Convert(args =>
            {
                string? dateString = args.Row.GetField<string>("date");
                if (DateTime.TryParse(dateString, swissCulture, DateTimeStyles.None, out DateTime date))
                {
                    return date.ToUniversalTime();
                }

                return null;
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
