using BDMS.Authentication;
using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class UploadController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;

    public UploadController(BdmsContext context, ILogger<UploadController> logger)
    {
        this.context = context;
        this.logger = logger;
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

        await context.Boreholes.AddRangeAsync(boreholes).ConfigureAwait(false);
        var boreholeCountResult = await SaveChangesAsync(() => Ok(boreholes.Count)).ConfigureAwait(false);

        var workflows = new List<Workflow>();
        var userName = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;

        var user = await context.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Name == userName)
            .ConfigureAwait(false);

        boreholes.ForEach(b =>
        {
            var workflow = new Workflow
            {
                UserId = user.Id,
                BoreholeId = b.Id,
                Role = Role.Editor,
                Started = DateTime.Now.ToUniversalTime(),
                Finished = null,
            };
            workflows.Add(workflow);
        });
        await context.Workflows.AddRangeAsync(workflows).ConfigureAwait(false);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return boreholeCountResult;
    }

    private List<Borehole> ReadBoreholesFromCsv(IFormFile file)
    {
        var csvConfig = new CsvConfiguration(CultureInfo.CurrentCulture)
        {
            MissingFieldFound = null,
            HeaderValidated = null,
            IgnoreReferences = true,
            PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
        };

        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, csvConfig);

        csv.Context.RegisterClassMap(new RecordMap());

        var boreholes = csv.GetRecords<Borehole>().ToList();
        return boreholes;
    }

    private sealed class RecordMap : ClassMap<Borehole>
    {
        public RecordMap()
        {
            CultureInfo culture = CultureInfo.CurrentCulture;

            var config = new CsvConfiguration(culture)
            {
                IgnoreReferences = true,
                PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
            };

            AutoMap(config);
            Map(b => b.LocationX).Name("location_x_lv_95");
            Map(b => b.LocationY).Name("location_y_lv_95");
            Map(b => b.Date).Name("date").Convert(args =>
            {
                string? dateString = args.Row.GetField<string>("date");
                if (DateTime.TryParse(dateString, culture, DateTimeStyles.None, out DateTime date))
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
