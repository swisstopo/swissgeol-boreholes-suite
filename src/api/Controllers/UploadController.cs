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
    /// Uploads a csv file to import  <see cref="Borehole"/>s.
    /// </summary>
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
                    var dateCultureInfo = new CultureInfo("de_CH", false);
                    var numberCultureInfo = CultureInfo.InvariantCulture;

                    var borehole = new Borehole
                    {
                        OriginalName = string.IsNullOrEmpty(fields[originalNameIndex]) ? null : fields[originalNameIndex],
                        ProjectName = string.IsNullOrEmpty(fields[projectNameIndex]) ? null : fields[projectNameIndex],
                        AlternateName = string.IsNullOrEmpty(fields[alternateNameIndex]) ? null : fields[alternateNameIndex],
                        Date = string.IsNullOrEmpty(fields[dateIndex]) ? null : DateTime.Parse(fields[dateIndex], dateCultureInfo).ToUniversalTime(),
                        RestrictionId = string.IsNullOrEmpty(fields[restrictionIdIndex]) ? null : int.Parse(fields[restrictionIdIndex], numberCultureInfo),
                        RestrictionUntil = string.IsNullOrEmpty(fields[restrictionUntilIndex]) ? null : DateOnly.Parse(fields[restrictionUntilIndex], dateCultureInfo),
                        Municipality = string.IsNullOrEmpty(fields[municipalityIndex]) ? null : fields[municipalityIndex],
                        Canton = string.IsNullOrEmpty(fields[cantonIndex]) ? null : fields[cantonIndex],
                        Country = string.IsNullOrEmpty(fields[countryIndex]) ? null : fields[countryIndex],
                        OriginalReferenceSystem = (ReferenceSystem)int.Parse(fields[originalReferenceSystemIndex], numberCultureInfo),
                        LocationX = string.IsNullOrEmpty(fields[locationXLV95Index]) ? null : double.Parse(fields[locationXLV95Index], numberCultureInfo),
                        LocationY = string.IsNullOrEmpty(fields[locationYLV95Index]) ? null : double.Parse(fields[locationYLV95Index], numberCultureInfo),
                        LocationXLV03 = string.IsNullOrEmpty(fields[locationXLV03Index]) ? null : double.Parse(fields[locationXLV03Index], numberCultureInfo),
                        LocationYLV03 = string.IsNullOrEmpty(fields[locationYLV03Index]) ? null : double.Parse(fields[locationYLV03Index], numberCultureInfo),
                        QtLocationId = string.IsNullOrEmpty(fields[qtLocationIdIndex]) ? null : int.Parse(fields[qtLocationIdIndex], numberCultureInfo),
                        ElevationZ = string.IsNullOrEmpty(fields[elevationZIndex]) ? null : double.Parse(fields[elevationZIndex], numberCultureInfo),
                        QtElevationId = string.IsNullOrEmpty(fields[qtElevationIdIndex]) ? null : int.Parse(fields[qtElevationIdIndex], numberCultureInfo),
                        ReferenceElevation = string.IsNullOrEmpty(fields[referenceElevationIndex]) ? null : double.Parse(fields[referenceElevationIndex], numberCultureInfo),
                        ReferenceElevationTypeId = string.IsNullOrEmpty(fields[referenceElevationTypeIdIndex]) ? null : int.Parse(fields[referenceElevationTypeIdIndex], numberCultureInfo),
                        QtReferenceElevationId = string.IsNullOrEmpty(fields[qtReferenceElevationIdIndex]) ? null : int.Parse(fields[qtReferenceElevationIdIndex], numberCultureInfo),
                        HrsId = string.IsNullOrEmpty(fields[hrsIdIndex]) ? null : int.Parse(fields[hrsIdIndex], numberCultureInfo),
                        KindId = string.IsNullOrEmpty(fields[kindIdIndex]) ? null : int.Parse(fields[kindIdIndex], numberCultureInfo),
                        DrillingDate = string.IsNullOrEmpty(fields[drillingDateIndex]) ? null : DateOnly.Parse(fields[drillingDateIndex], dateCultureInfo),
                        DrillingDiameter = string.IsNullOrEmpty(fields[drillingDiameterIndex]) ? null : double.Parse(fields[drillingDiameterIndex], numberCultureInfo),
                        DrillingMethodId = string.IsNullOrEmpty(fields[drillingMethodIdIndex]) ? null : int.Parse(fields[drillingMethodIdIndex], numberCultureInfo),
                        PurposeId = string.IsNullOrEmpty(fields[purposeIdIndex]) ? null : int.Parse(fields[purposeIdIndex], numberCultureInfo),
                        SpudDate = string.IsNullOrEmpty(fields[spudDateIndex]) ? null : DateOnly.Parse(fields[spudDateIndex], dateCultureInfo),
                        CuttingsId = string.IsNullOrEmpty(fields[cuttingsIdIndex]) ? null : int.Parse(fields[cuttingsIdIndex], numberCultureInfo),
                        StatusId = string.IsNullOrEmpty(fields[statusIdIndex]) ? null : int.Parse(fields[statusIdIndex], numberCultureInfo),
                        Inclination = string.IsNullOrEmpty(fields[inclinationIndex]) ? null : double.Parse(fields[inclinationIndex], numberCultureInfo),
                        InclinationDirection = string.IsNullOrEmpty(fields[inclinationDirectionIndex]) ? null : double.Parse(fields[inclinationDirectionIndex], numberCultureInfo),
                        QtInclinationDirectionId = string.IsNullOrEmpty(fields[qtInclinationDirectionIdIndex]) ? null : int.Parse(fields[qtInclinationDirectionIdIndex], numberCultureInfo),
                        Remarks = string.IsNullOrEmpty(fields[originalNameIndex]) ? null : fields[remarksIndex],
                        TotalDepth = string.IsNullOrEmpty(fields[totalDepthIndex]) ? null : double.Parse(fields[totalDepthIndex], numberCultureInfo),
                        QtDepthId = string.IsNullOrEmpty(fields[qtDepthIdIndex]) ? null : int.Parse(fields[qtDepthIdIndex], numberCultureInfo),
                        TotalDepthTvd = string.IsNullOrEmpty(fields[totalDepthTvdIndex]) ? null : int.Parse(fields[totalDepthTvdIndex], numberCultureInfo),
                        QtTotalDepthTvdId = string.IsNullOrEmpty(fields[qtTotalDepthTvdIdIndex]) ? null : int.Parse(fields[qtTotalDepthTvdIdIndex], numberCultureInfo),
                        TopBedrock = string.IsNullOrEmpty(fields[topBedrockIndex]) ? null : double.Parse(fields[topBedrockIndex], numberCultureInfo),
                        QtTopBedrockId = string.IsNullOrEmpty(fields[qtTopBedrockIdIndex]) ? null : int.Parse(fields[qtTopBedrockIdIndex], numberCultureInfo),
                        TopBedrockTvd = string.IsNullOrEmpty(fields[topBedrockTvdIndex]) ? null : double.Parse(fields[topBedrockTvdIndex], numberCultureInfo),
                        QtTopBedrockTvdId = string.IsNullOrEmpty(fields[qtTopBedrockTvdIdIndex]) ? null : int.Parse(fields[qtTopBedrockTvdIdIndex], numberCultureInfo),
                        HasGroundwater = string.IsNullOrEmpty(fields[hasGroundwaterIndex]) ? null : bool.Parse(fields[hasGroundwaterIndex]),
                        LithologyTopBedrockId = string.IsNullOrEmpty(fields[lithologyTopBedrockIdIndex]) ? null : int.Parse(fields[lithologyTopBedrockIdIndex], numberCultureInfo),
                        ChronostratigraphyId = string.IsNullOrEmpty(fields[chronostratigraphyIdIndex]) ? null : int.Parse(fields[chronostratigraphyIdIndex], numberCultureInfo),
                        LithostratigraphyId = string.IsNullOrEmpty(fields[lithostratigraphyIdIndex]) ? null : int.Parse(fields[lithostratigraphyIdIndex], numberCultureInfo),

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
                Role = Role.Editor, // take from user.
                Started = DateTime.Now.ToUniversalTime(),
                Finished = null,
            };
            workflows.Add(workflow);
        });
        await context.Workflows.AddRangeAsync(workflows).ConfigureAwait(false);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return boreholeCountResult;
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
