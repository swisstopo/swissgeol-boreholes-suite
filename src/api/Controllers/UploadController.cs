using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic.FileIO;
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

        var boreholes = new List<Borehole>();

        using (var parser = new TextFieldParser(file.OpenReadStream()))
        {
            parser.TextFieldType = FieldType.Delimited;
            parser.SetDelimiters(";");

            // Read the header row and get the index of each column
            var header = parser.ReadFields();
            if (header.Length == 0)
            {
                return BadRequest("No content");
            }

            var originalNameIndex = Array.IndexOf(header, "original_name");
            var projectNameIndex = Array.IndexOf(header, "project_name");
            var alternateNameIndex = Array.IndexOf(header, "alternate_name");
            var dateIndex = Array.IndexOf(header, "date");
            var restrictionIdIndex = Array.IndexOf(header, "restriction_id");
            var restrictionUntilIndex = Array.IndexOf(header, "restriction_until");
            var municipalityIndex = Array.IndexOf(header, "municipality");
            var cantonIndex = Array.IndexOf(header, "canton");
            var countryIndex = Array.IndexOf(header, "country");
            var originalReferenceSystemIndex = Array.IndexOf(header, "original_reference_system");
            var locationXLV95Index = Array.IndexOf(header, "location_x_lv_95");
            var locationYLV95Index = Array.IndexOf(header, "location_y_lv_95");
            var locationXLV03Index = Array.IndexOf(header, "location_x_lv_03");
            var locationYLV03Index = Array.IndexOf(header, "location_y_lv_03");
            var qtLocationIdIndex = Array.IndexOf(header, "qt_location_id");
            var elevationZIndex = Array.IndexOf(header, "elevation_z");
            var qtElevationIdIndex = Array.IndexOf(header, "qt_elevation_id");
            var referenceElevationIndex = Array.IndexOf(header, "reference_elevation");
            var referenceElevationTypeIdIndex = Array.IndexOf(header, "reference_elevation_type_id");
            var qtReferenceElevationIdIndex = Array.IndexOf(header, "qt_reference_elevation_id");
            var hrsIdIndex = Array.IndexOf(header, "hrs_id");
            var kindIdIndex = Array.IndexOf(header, "kind_id");
            var drillingDateIndex = Array.IndexOf(header, "drilling_date");
            var drillingDiameterIndex = Array.IndexOf(header, "drilling_diameter");
            var drillingMethodIdIndex = Array.IndexOf(header, "drilling_method_id");
            var purposeIdIndex = Array.IndexOf(header, "purpose_id");
            var spudDateIndex = Array.IndexOf(header, "spud_date");
            var cuttingsIdIndex = Array.IndexOf(header, "cuttings_id");
            var statusIdIndex = Array.IndexOf(header, "status_id");
            var inclinationIndex = Array.IndexOf(header, "inclination");
            var inclinationDirectionIndex = Array.IndexOf(header, "inclination_direction");
            var qtInclinationDirectionIdIndex = Array.IndexOf(header, "qt_inclination_direction_id");
            var remarksIndex = Array.IndexOf(header, "remarks");
            var totalDepthIndex = Array.IndexOf(header, "total_depth");
            var qtDepthIdIndex = Array.IndexOf(header, "qt_depth_id");
            var totalDepthTvdIndex = Array.IndexOf(header, "total_depth_tvd");
            var qtTotalDepthTvdIdIndex = Array.IndexOf(header, "qt_total_depth_tvd_id");
            var topBedrockIndex = Array.IndexOf(header, "top_bedrock");
            var qtTopBedrockIdIndex = Array.IndexOf(header, "qt_top_bedrock_id");
            var topBedrockTvdIndex = Array.IndexOf(header, "top_bedrock_tvd");
            var qtTopBedrockTvdIdIndex = Array.IndexOf(header, "qt_top_bedrock_tvd_id");
            var hasGroundwaterIndex = Array.IndexOf(header, "has_groundwater");
            var lithologyTopBedrockIdIndex = Array.IndexOf(header, "lithology_top_bedrock_id");
            var chronostratigraphyIdIndex = Array.IndexOf(header, "chronostratigraphy_id");
            var lithostratigraphyIdIndex = Array.IndexOf(header, "lithostratigraphy_id");

            while (!parser.EndOfData)
            {
                // Read the next row and create a new Person object
                var fields = parser.ReadFields();
                if (fields.Length > 0)
                {
                    var borehole = new Borehole
                    {
                        OriginalName = GetValueOrNull(fields, originalNameIndex, typeof(string)),
                        ProjectName = GetValueOrNull(fields, projectNameIndex, typeof(string)),
                        AlternateName = GetValueOrNull(fields, alternateNameIndex, typeof(string)),
                        Date = GetValueOrNull(fields, dateIndex, typeof(DateTime)),
                        RestrictionId = GetValueOrNull(fields, restrictionIdIndex, typeof(int)),
                        RestrictionUntil = GetValueOrNull(fields, restrictionUntilIndex, typeof(DateOnly)),
                        Municipality = GetValueOrNull(fields, municipalityIndex, typeof(string)),
                        Canton = GetValueOrNull(fields, cantonIndex, typeof(string)),
                        Country = GetValueOrNull(fields, countryIndex, typeof(string)),
                        OriginalReferenceSystem = (ReferenceSystem)GetValueOrNull(fields, originalReferenceSystemIndex, typeof(int)),
                        LocationX = GetValueOrNull(fields, locationXLV95Index, typeof(double)),
                        LocationY = GetValueOrNull(fields, locationYLV95Index, typeof(double)),
                        LocationXLV03 = GetValueOrNull(fields, locationXLV03Index, typeof(double)),
                        LocationYLV03 = GetValueOrNull(fields, locationYLV03Index, typeof(double)),
                        QtLocationId = GetValueOrNull(fields, qtLocationIdIndex, typeof(int)),
                        ElevationZ = GetValueOrNull(fields, elevationZIndex, typeof(double)),
                        QtElevationId = GetValueOrNull(fields, qtElevationIdIndex, typeof(int)),
                        ReferenceElevation = GetValueOrNull(fields, referenceElevationIndex, typeof(double)),
                        ReferenceElevationTypeId = GetValueOrNull(fields, referenceElevationTypeIdIndex, typeof(int)),
                        QtReferenceElevationId = GetValueOrNull(fields, qtReferenceElevationIdIndex, typeof(int)),
                        HrsId = GetValueOrNull(fields, hrsIdIndex, typeof(int)),
                        KindId = GetValueOrNull(fields, kindIdIndex, typeof(int)),
                        DrillingDate = GetValueOrNull(fields, drillingDateIndex, typeof(DateOnly)),
                        DrillingDiameter = GetValueOrNull(fields, drillingDiameterIndex, typeof(double)),
                        DrillingMethodId = GetValueOrNull(fields, drillingMethodIdIndex, typeof(int)),
                        PurposeId = GetValueOrNull(fields, purposeIdIndex, typeof(int)),
                        SpudDate = GetValueOrNull(fields, spudDateIndex, typeof(DateOnly)),
                        CuttingsId = GetValueOrNull(fields, cuttingsIdIndex, typeof(int)),
                        StatusId = GetValueOrNull(fields, statusIdIndex, typeof(int)),
                        Inclination = GetValueOrNull(fields, inclinationIndex, typeof(double)),
                        InclinationDirection = GetValueOrNull(fields, inclinationDirectionIndex, typeof(double)),
                        QtInclinationDirectionId = GetValueOrNull(fields, qtInclinationDirectionIdIndex, typeof(int)),
                        Remarks = GetValueOrNull(fields, originalNameIndex, typeof(string)),
                        TotalDepth = GetValueOrNull(fields, totalDepthIndex, typeof(double)),
                        QtDepthId = GetValueOrNull(fields, qtDepthIdIndex, typeof(int)),
                        TotalDepthTvd = GetValueOrNull(fields, totalDepthTvdIndex, typeof(int)),
                        QtTotalDepthTvdId = GetValueOrNull(fields, qtTotalDepthTvdIdIndex, typeof(int)),
                        TopBedrock = GetValueOrNull(fields, topBedrockIndex, typeof(double)),
                        QtTopBedrockId = GetValueOrNull(fields, qtTopBedrockIdIndex, typeof(int)),
                        TopBedrockTvd = GetValueOrNull(fields, topBedrockTvdIndex, typeof(double)),
                        QtTopBedrockTvdId = GetValueOrNull(fields, qtTopBedrockTvdIdIndex, typeof(int)),
                        HasGroundwater = GetValueOrNull(fields, hasGroundwaterIndex, typeof(bool)),
                        LithologyTopBedrockId = GetValueOrNull(fields, lithologyTopBedrockIdIndex, typeof(int)),
                        ChronostratigraphyId = GetValueOrNull(fields, chronostratigraphyIdIndex, typeof(int)),
                        LithostratigraphyId = GetValueOrNull(fields, lithostratigraphyIdIndex, typeof(int)),

                        WorkgroupId = workgroupId,
                    };

                    boreholes.Add(borehole);
                }
            }
        }

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

    private dynamic? GetValueOrNull(string[] fields, int idx, Type type)
    {
        var dateCultureInfo = new CultureInfo("de_CH", false);
        var numberCultureInfo = CultureInfo.InvariantCulture;

        if (string.IsNullOrEmpty(fields[idx]))
        {
            return null;
        }
        else
        {
            if (type == typeof(string))
            {
                return fields[idx];
            }

            if (type == typeof(int))
            {
                return int.Parse(fields[idx], numberCultureInfo);
            }

            if (type == typeof(double))
            {
                return double.Parse(fields[idx], numberCultureInfo);
            }

            if (type == typeof(bool))
            {
                return bool.Parse(fields[idx]);
            }

            if (type == typeof(DateOnly))
            {
                return DateOnly.Parse(fields[idx], dateCultureInfo);
            }

            if (type == typeof(DateTime))
            {
                return DateTime.Parse(fields[idx], dateCultureInfo).ToUniversalTime();
            }
            else
            {
                return null;
            }
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
