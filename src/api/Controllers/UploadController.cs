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

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class UploadController : ControllerBase
{
    private const int MaxFileSize = 210_000_000; // 1024 x 1024 x 200 = 209715200 bytes
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly LocationService locationService;
    private readonly CoordinateService coordinateService;
    private readonly BoreholeFileCloudService boreholeFileCloudService;
    private readonly int sridLv95 = 2056;
    private readonly int sridLv03 = 21781;
    private readonly string nullOrEmptyMsg = "Field '{0}' is required.";
    private readonly CsvConfiguration csvConfig = new(new CultureInfo("de-CH"))
    {
        Delimiter = ";",
        IgnoreReferences = true,
        PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
        MissingFieldFound = null,
    };

    public UploadController(BdmsContext context, ILogger<UploadController> logger, LocationService locationService, CoordinateService coordinateService, BoreholeFileCloudService boreholeFileCloudService)
    {
        this.context = context;
        this.logger = logger;
        this.locationService = locationService;
        this.coordinateService = coordinateService;
        this.boreholeFileCloudService = boreholeFileCloudService;
    }

    /// <summary>
    /// Receives an uploaded csv file to import one or several <see cref="Borehole"/>(s).
    /// </summary>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>(s).</param>
    /// <param name="boreholesFile">The <see cref="IFormFile"/> containing the borehole csv records that were uploaded.</param>
    /// <param name="attachments">The list of <see cref="IFormFile"/> containing the borehole attachments referred in <paramref name="boreholesFile"/>.</param>
    /// <returns>The number of the newly created <see cref="Borehole"/>s.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<ActionResult<int>> UploadFileAsync(int workgroupId, IFormFile boreholesFile, IList<IFormFile>? attachments = null)
    {
        // Increase max allowed errors to be able to return more validation errors at once.
        ModelState.MaxAllowedErrors = 1000;

        logger.LogInformation("Import borehole(s) to workgroup with id <{WorkgroupId}>", workgroupId);
        try
        {
            // Checks if the boreholes file is provided and not empty.
            if (boreholesFile == null || boreholesFile.Length == 0) return BadRequest("No borehole csv file uploaded.");

            // Checks if the provided boreholes file is a CSV file.
            if (!FileTypeChecker.IsCsv(boreholesFile)) return BadRequest("Invalid file type for borehole csv.");

            // Checks if any of the provided attachments has a whitespace in its file name.
            if (attachments?.Any(a => a.FileName.Any(char.IsWhiteSpace)) == true) return BadRequest("One or more file name(s) contain a whitespace.");

            // Checks if any of the provided attachments exceeds the maximum file size.
            if (attachments?.Any(a => a.Length > MaxFileSize) == true) return BadRequest($"One or more attachment exceed maximum file size of {MaxFileSize / 1024 / 1024} Mb.");

            var boreholeImports = ReadBoreholesFromCsv(boreholesFile);
            ValidateBoreholeImports(workgroupId, boreholeImports, attachments);

            // If any validation error occured, return a bad request.
            if (!ModelState.IsValid)
            {
                return ValidationProblem(statusCode: (int)HttpStatusCode.BadRequest);
            }

            var subjectId = HttpContext.GetUserSubjectId();

            var user = await context.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.SubjectId == subjectId)
                .ConfigureAwait(false);

            // Map to Borehole type
            List<Borehole> boreholes = new();
            foreach (var boreholeImport in boreholeImports)
            {
                var borehole = (Borehole)boreholeImport;

                // Assign borehole id to the borehole import object to be able to map attachments to the borehole.
                boreholeImport.Id = borehole.Id;

                // Set DateTime kind to UTC, since PSQL type 'timestamp with timezone' requires UTC as DateTime.Kind
                borehole.RestrictionUntil = borehole.RestrictionUntil != null ? DateTime.SpecifyKind(borehole.RestrictionUntil.Value, DateTimeKind.Utc) : null;
                borehole.WorkgroupId = workgroupId;

                // Detect coordinate reference system and set according coordinate properties of borehole.
                if (boreholeImport.Location_x != null && boreholeImport.Location_y != null)
                {
                    if (boreholeImport.Location_x >= 2_000_000)
                    {
                        borehole.OriginalReferenceSystem = ReferenceSystem.LV95;
                        borehole.LocationX = boreholeImport.Location_x;
                        borehole.LocationY = boreholeImport.Location_y;
                        borehole.PrecisionLocationXLV03 = Math.Max(borehole.PrecisionLocationX ?? 0, borehole.PrecisionLocationY ?? 0);
                        borehole.PrecisionLocationYLV03 = borehole.PrecisionLocationXLV03;
                    }
                    else
                    {
                        borehole.OriginalReferenceSystem = ReferenceSystem.LV03;
                        borehole.LocationXLV03 = boreholeImport.Location_x;
                        borehole.LocationYLV03 = boreholeImport.Location_y;
                        borehole.PrecisionLocationX = Math.Max(borehole.PrecisionLocationXLV03 ?? 0, borehole.PrecisionLocationYLV03 ?? 0);
                        borehole.PrecisionLocationY = borehole.PrecisionLocationX;
                    }
                }

                boreholes.Add(borehole);
            }

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

            // Save the changes to the db, upload attachments to cloud storage and commit changes to db on success.
            using var transaction = await context.Database.BeginTransactionAsync().ConfigureAwait(false);

            // Add boreholes to database.
            await context.Boreholes.AddRangeAsync(boreholes).ConfigureAwait(false);
            var result = await SaveChangesAsync(() => Ok(boreholes.Count)).ConfigureAwait(false);

            // Add attachments to borehole.
            if (attachments != null)
            {
                var boreholeImportsWithAttachments = boreholeImports.Where(x => x.Attachments?.Length > 0).ToList();
                foreach (var boreholeImport in boreholeImportsWithAttachments)
                {
                    var attachmentFileNames = boreholeImport.Attachments?.Split(",").Select(s => s.Replace(" ", "", StringComparison.InvariantCulture)).ToList();
                    var attachmentFiles = attachments.Where(x => attachmentFileNames != null && attachmentFileNames.Contains(x.FileName.Replace(" ", "", StringComparison.InvariantCulture))).ToList();
                    foreach (var attachmentFile in attachmentFiles)
                    {
                        await boreholeFileCloudService.UploadFileAndLinkToBorehole(attachmentFile, boreholeImport.Id).ConfigureAwait(false);
                    }
                }
            }

            await transaction.CommitAsync().ConfigureAwait(false);
            return result;
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

    internal static int GetPrecision(IReaderRow row, string fieldName)
    {
        if (row.HeaderRecord != null && row.HeaderRecord.Any(h => h == fieldName))
        {
            var value = row.GetField<string?>(fieldName);
            if (!string.IsNullOrEmpty(value) && value.Contains('.', StringComparison.Ordinal))
            {
                return value.Split('.')[1].Length;
            }
        }

        return 0;
    }

    private void ValidateBoreholeImports(int workgroupId, List<BoreholeImport> boreholesFromFile, IList<IFormFile>? attachments = null)
    {
        // Get boreholes from db with same workgroupId as provided.
        var boreholesFromDb = context.Boreholes
            .Where(b => b.WorkgroupId == workgroupId)
            .AsNoTracking()
            .Select(b => new { b.Id, b.TotalDepth, b.LocationX, b.LocationY, b.LocationXLV03, b.LocationYLV03 })
            .ToList();

        // Iterate over provided boreholes, validate them, and create error messages when necessary. Use a non-zero based index for error message keys (e.g. 'Row1').
        foreach (var boreholeFromFile in boreholesFromFile.Select((value, index) => (value, index: index + 1)))
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

            // Check if any borehole with same coordinates (in tolerance) and same total depth is duplicated in file
            if (boreholesFromFile.Any(b =>
                b.ImportId != boreholeFromFile.value.ImportId &&
                CompareValuesWithTolerance(b.TotalDepth, boreholeFromFile.value.TotalDepth, 0) &&
                CompareValuesWithTolerance(b.LocationX, boreholeFromFile.value.LocationX, 2) &&
                CompareValuesWithTolerance(b.LocationY, boreholeFromFile.value.LocationY, 2)))
            {
                ModelState.AddModelError($"Row{boreholeFromFile.index}", $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.");
            }

            // Check if borehole with same coordinates (in tolerance) and same total depth already exists in db.
            if (boreholesFromDb.Any(b =>
                CompareValuesWithTolerance(b.TotalDepth, boreholeFromFile.value.TotalDepth, 0) &&
                (CompareValuesWithTolerance(b.LocationX, boreholeFromFile.value.LocationX, 2) || CompareValuesWithTolerance(b.LocationXLV03, boreholeFromFile.value.LocationX, 2)) &&
                (CompareValuesWithTolerance(b.LocationY, boreholeFromFile.value.LocationY, 2) || CompareValuesWithTolerance(b.LocationYLV03, boreholeFromFile.value.LocationY, 2))))
            {
                ModelState.AddModelError($"Row{boreholeFromFile.index}", $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.");
            }

            // Checks if each file name in the comma separated string is present in the list of the attachments.
            var attachmentFileNamesToLink = boreholeFromFile.value.Attachments?
                .Split(",")
                .Select(s => s.Replace(" ", "", StringComparison.OrdinalIgnoreCase))
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList()
                ?? new List<string>();

            foreach (var attachmentFileNameToLink in attachmentFileNamesToLink)
            {
                if (attachments?.Any(a => a.FileName.Equals(attachmentFileNameToLink, StringComparison.OrdinalIgnoreCase)) == false)
                {
                    ModelState.AddModelError($"Row{boreholeFromFile.index}", $"Attachment file '{attachmentFileNameToLink}' not found.");
                }
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
            Map(m => m.TypeId).Optional();
            Map(m => m.ElevationZ).Optional();
            Map(m => m.HrsId).Optional();
            Map(m => m.TotalDepth).Optional();
            Map(m => m.RestrictionId).Optional();
            Map(m => m.RestrictionUntil).Optional();
            Map(m => m.NationalInterest).Optional();
            Map(m => m.Name).Optional();
            Map(m => m.LocationPrecisionId).Optional();
            Map(m => m.ElevationPrecisionId).Optional();
            Map(m => m.ProjectName).Optional();
            Map(m => m.PurposeId).Optional();
            Map(m => m.StatusId).Optional();
            Map(m => m.DepthPrecisionId).Optional();
            Map(m => m.TopBedrockFreshMd).Optional();
            Map(m => m.TopBedrockWeatheredMd).Optional();
            Map(m => m.HasGroundwater).Optional();
            Map(m => m.Remarks).Optional();
            Map(m => m.LithologyTopBedrockId).Optional();
            Map(m => m.LithostratigraphyTopBedrockId).Optional();
            Map(m => m.ChronostratigraphyTopBedrockId).Optional();
            Map(m => m.ReferenceElevation).Optional();
            Map(m => m.ReferenceElevationPrecisionId).Optional();
            Map(m => m.ReferenceElevationTypeId).Optional();
            Map(m => m.LocationX).Optional();
            Map(m => m.LocationY).Optional();
            Map(m => m.LocationXLV03).Optional();
            Map(m => m.LocationYLV03).Optional();
            Map(m => m.OriginalReferenceSystem).Optional();
            Map(m => m.Attachments).Optional();

            // Define properties to ignore
            Map(b => b.Municipality).Ignore();
            Map(b => b.Canton).Ignore();
            Map(b => b.Country).Ignore();
            Map(m => m.Id).Ignore();

            // Define additional mapping logic
            Map(m => m.BoreholeCodelists).Convert(args =>
            {
                var boreholeCodeLists = new List<BoreholeCodelist>();
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
                            boreholeCodeLists.Add(new BoreholeCodelist
                            {
                                CodelistId = id.CodeListId,
                                Value = value,
                            });
                        }
                    }
                });

                return boreholeCodeLists;
            });

            // Set precision to both reference systems
            Map(m => m.PrecisionLocationX).Convert(args => GetPrecision(args.Row, "location_x"));
            Map(m => m.PrecisionLocationXLV03).Convert(args => GetPrecision(args.Row, "location_x"));
            Map(m => m.PrecisionLocationY).Convert(args => GetPrecision(args.Row, "location_y"));
            Map(m => m.PrecisionLocationYLV03).Convert(args => GetPrecision(args.Row, "location_y"));
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
            return Problem(errorMessage);
        }
    }
}
