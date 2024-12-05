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
using System.Text.Json;

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

    private static readonly JsonSerializerOptions jsonImportOptions = new() { PropertyNameCaseInsensitive = true };

    public UploadController(BdmsContext context, ILogger<UploadController> logger, LocationService locationService, CoordinateService coordinateService, BoreholeFileCloudService boreholeFileCloudService)
    {
        this.context = context;
        this.logger = logger;
        this.locationService = locationService;
        this.coordinateService = coordinateService;
        this.boreholeFileCloudService = boreholeFileCloudService;
    }

    /// <summary>
    /// Receives an uploaded JSON file to import one or several <see cref="Borehole"/>(s).
    /// </summary>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>(s).</param>
    /// <param name="file">The <see cref="IFormFile"/> containing the borehole JSON records that were uploaded.</param>
    /// <returns>The number of the newly created <see cref="Borehole"/>s.</returns>
    [HttpPost("json")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<ActionResult<int>> UploadJsonFileAsync(int workgroupId, IFormFile file)
    {
        // Increase max allowed errors to be able to return more validation errors at once.
        ModelState.MaxAllowedErrors = 1000;

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        if (!FileTypeChecker.IsJson(file)) return BadRequest("Invalid file type for borehole JSON.");

        try
        {
            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            var jsonContent = await reader.ReadToEndAsync().ConfigureAwait(false);

            List<BoreholeImport>? boreholes;

            try
            {
                boreholes = JsonSerializer.Deserialize<List<BoreholeImport>>(jsonContent, jsonImportOptions);
            }
            catch (JsonException)
            {
                return BadRequest("The provided file is not a array of boreholes or is not a valid JSON format.");
            }

            if (boreholes == null || boreholes.Count == 0)
            {
                return BadRequest("No boreholes found in file.");
            }

            for (var i = 0; i < boreholes.Count; i++)
            {
                boreholes[i].ImportId = i + 1;
            }

            ValidateBoreholeImports(workgroupId, boreholes, true);

            if (!ModelState.IsValid)
            {
                return ValidationProblem(statusCode: (int)HttpStatusCode.BadRequest);
            }

            var subjectId = HttpContext.GetUserSubjectId();

            var user = await context.Users
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.SubjectId == subjectId)
                .ConfigureAwait(false);

            foreach (var borehole in boreholes)
            {
                borehole.MarkAsNew();
                borehole.WorkgroupId = workgroupId;
                borehole.LockedById = null;

                borehole.Stratigraphies?.MarkAsNew();
                borehole.Completions?.MarkAsNew();
                borehole.Sections?.MarkAsNew();
                borehole.Observations?.MarkAsNew();

                borehole.Workflows.Clear();
                borehole.Workflows.Add(new Workflow { Borehole = borehole, Role = Role.Editor, UserId = user.Id });
            }

            await context.Boreholes.AddRangeAsync(boreholes).ConfigureAwait(false);
            var result = await SaveChangesAsync(() => Ok(boreholes.Count)).ConfigureAwait(false);

            return result;
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Receives an uploaded csv file to import one or several <see cref="Borehole"/>(s).
    /// </summary>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>(s).</param>
    /// <param name="boreholesFile">The <see cref="IFormFile"/> containing the borehole csv records that were uploaded.</param>
    /// <param name="lithologyFile">The <see cref="IFormFile"/> containing the lithology csv records that were uploaded.</param>
    /// <param name="attachments">The list of <see cref="IFormFile"/> containing the borehole attachments referred in <paramref name="boreholesFile"/>.</param>
    /// <returns>The number of the newly created <see cref="Borehole"/>s.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<ActionResult<int>> UploadFileAsync(int workgroupId, IFormFile boreholesFile, IFormFile? lithologyFile = null, IList<IFormFile>? attachments = null)
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

            // if a lithology file is provided, checks if it is a CSV file.
            if (lithologyFile != null && !FileTypeChecker.IsCsv(lithologyFile)) return BadRequest("Invalid file type for lithology csv.");

            var boreholeImports = ReadBoreholesFromCsv(boreholesFile);
            ValidateBoreholeImports(workgroupId, boreholeImports, false, attachments);

            var lithologyImports = new List<LithologyImport>();
            if (lithologyFile != null)
            {
                lithologyImports = ReadLithologiesFromCsv(lithologyFile);
                ValidateLithologyImports(boreholeImports.Select(bhi => bhi.ImportId).ToList(), lithologyImports);
            }

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

            // Add lithology imports if provided
            if (lithologyImports.Count > 0)
            {
                // Get the kind id of a lithostratigraphy.
                var lithoStratiKindId = context.Codelists.Single(cl => cl.Schema == "layer_kind" && cl.IsDefault == true).Id;

                // Group lithology records by import id to get lithologies by boreholes.
                var boreholeGroups = lithologyImports.GroupBy(l => l.ImportId);

                var codeLists = await context.Codelists.ToListAsync().ConfigureAwait(false);

                var stratiesToAdd = new List<Stratigraphy>();
                var lithologiesToAdd = new List<Layer>();
                foreach (var boreholeLithologies in boreholeGroups)
                {
                    // Group lithology of one borehole by strati import id to get lithologies per stratigraphy.
                    var stratiGroups = boreholeLithologies.GroupBy(bhoGroup => bhoGroup.StratiImportId);
                    foreach (var stratiGroup in stratiGroups)
                    {
                        // Create a stratigraphy and assign it to the borehole with the provided import id.
                        var strati = new Stratigraphy
                        {
                            BoreholeId = boreholeImports.Single(bhi => bhi.ImportId == boreholeLithologies.Key).Id,
                            Date = stratiGroup.First().StratiDate != null ? DateTime.SpecifyKind(stratiGroup.First().StratiDate!.Value, DateTimeKind.Utc) : null,
                            Name = stratiGroup.First().StratiName,
                        };

                        // Create a lithology for each record in the group (same strati id) and assign it to the new stratigraphy.
                        var lithologies = stratiGroup.Select(sg =>
                        {
                            var lithology = (Layer)sg;
                            lithology.ColorCodelistIds = ParseIds(sg.ColorIds);
                            lithology.DebrisCodelistIds = ParseIds(sg.DebrisIds);
                            lithology.GrainShapeCodelistIds = ParseIds(sg.GrainShapeIds);
                            lithology.GrainAngularityCodelistIds = ParseIds(sg.GrainGranularityIds);
                            lithology.OrganicComponentCodelistIds = ParseIds(sg.OrganicComponentIds);
                            lithology.Uscs3CodelistIds = ParseIds(sg.Uscs3Ids);

                            lithology.LayerColorCodes = CreateLayerCodes<LayerColorCode>(GetCodelists(lithology.ColorCodelistIds));
                            lithology.LayerDebrisCodes = CreateLayerCodes<LayerDebrisCode>(GetCodelists(lithology.DebrisCodelistIds));
                            lithology.LayerGrainShapeCodes = CreateLayerCodes<LayerGrainShapeCode>(GetCodelists(lithology.GrainShapeCodelistIds));
                            lithology.LayerGrainAngularityCodes = CreateLayerCodes<LayerGrainAngularityCode>(GetCodelists(lithology.GrainAngularityCodelistIds));
                            lithology.LayerOrganicComponentCodes = CreateLayerCodes<LayerOrganicComponentCode>(GetCodelists(lithology.OrganicComponentCodelistIds));
                            lithology.LayerUscs3Codes = CreateLayerCodes<LayerUscs3Code>(GetCodelists(lithology.Uscs3CodelistIds));

                            lithology.Stratigraphy = strati;
                            return lithology;
                        }).ToList();

                        stratiesToAdd.Add(strati);
                        lithologiesToAdd.AddRange(lithologies);
                    }
                }

                // Add stratigraphies to database.
                await context.Stratigraphies.AddRangeAsync(stratiesToAdd).ConfigureAwait(false);
                await SaveChangesAsync(() => Ok(stratiesToAdd.Count)).ConfigureAwait(false);

                // Add litholigies to database.
                await context.Layers.AddRangeAsync(lithologiesToAdd).ConfigureAwait(false);
                await SaveChangesAsync(() => Ok(lithologiesToAdd.Count)).ConfigureAwait(false);
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

    /// <summary>
    /// Parses a string of <see cref="Codelist"/> IDs into a list of integers.
    /// </summary>
    /// <param name="ids">The string of <see cref="Codelist"/> IDs to parse. IDs are expected to be separated by commas.</param>
    /// <returns>A list of integers parsed from the input string.</returns>
    internal List<int> ParseIds(string ids)
    {
        if (string.IsNullOrEmpty(ids))
        {
            return new List<int>();
        }

        return ids
            .Split(',')
            .Select(s =>
            {
                if (!int.TryParse(s, out var num))
                {
                    logger.LogError($"Invalid code list value: {s}");
                    throw new FormatException($"Invalid code list value: {s}");
                }

                return num;
            }).ToList();
    }

    internal List<Codelist> GetCodelists(ICollection<int> codelistIds)
    {
        return context.Codelists.Where(c => codelistIds.Contains(c.Id)).ToList();
    }

    internal List<T> CreateLayerCodes<T>(List<Codelist> codelists)
        where T : ILayerCode, new()
    {
        return codelists.Select(c => new T { Codelist = c, CodelistId = c.Id }).ToList();
    }

    internal List<int> ParseMultiValueCodeListIds(LithologyImport lithologyImport)
    {
        // Select all code list ids of all multi value code list properties.
        return new[] { lithologyImport.ColorIds, lithologyImport.OrganicComponentIds, lithologyImport.GrainShapeIds, lithologyImport.GrainGranularityIds, lithologyImport.Uscs3Ids, lithologyImport.DebrisIds }
            .SelectMany(str => str.Split(','))
            .Where(s => !string.IsNullOrEmpty(s)).Select(int.Parse).ToList() ?? new List<int>();
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

    private void ValidateBoreholeImports(int workgroupId, List<BoreholeImport> boreholesFromFile, bool zeroBasedIndex, IList<IFormFile>? attachments = null)
    {
        var prefix = zeroBasedIndex ? "Borehole" : "Row";

        foreach (var borehole in boreholesFromFile.Select((value, index) => (value, index)))
        {
            var processingIndex = zeroBasedIndex ? borehole.index : borehole.index + 1;
            var boreholeValue = borehole.value;

            ValidateBorehole(boreholeValue, boreholesFromFile, workgroupId, processingIndex, prefix, attachments);
        }
    }

    private void ValidateBorehole(BoreholeImport borehole, List<BoreholeImport> boreholesFromFile, int workgroupId, int processingIndex, string prefix, IList<IFormFile>? attachments)
    {
        ValidateRequiredFields(borehole, processingIndex, prefix);
        ValidateDuplicateInFile(borehole, boreholesFromFile, processingIndex, prefix);
        ValidateDuplicateInDb(borehole, workgroupId, processingIndex, prefix);
        ValidateAttachments(borehole, attachments, processingIndex, prefix);
    }

    private void ValidateRequiredFields(BoreholeImport borehole, int processingIndex, string prefix)
    {
        if (string.IsNullOrEmpty(borehole.OriginalName))
        {
            ModelState.AddModelError($"{prefix}{processingIndex}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "original_name"));
        }

        if (borehole.LocationX == null && borehole.LocationXLV03 == null)
        {
            ModelState.AddModelError($"{prefix}{processingIndex}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "location_x"));
        }

        if (borehole.LocationY == null && borehole.LocationYLV03 == null)
        {
            ModelState.AddModelError($"{prefix}{processingIndex}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "location_y"));
        }
    }

    private void ValidateDuplicateInFile(BoreholeImport borehole, List<BoreholeImport> boreholesFromFile, int processingIndex, string prefix)
    {
        if (boreholesFromFile.Any(b =>
            b.ImportId != borehole.ImportId &&
            CompareValuesWithTolerance(b.TotalDepth, borehole.TotalDepth, 0) &&
            CompareValuesWithTolerance(b.LocationX, borehole.LocationX, 2) &&
            CompareValuesWithTolerance(b.LocationY, borehole.LocationY, 2)))
        {
            ModelState.AddModelError($"{prefix}{processingIndex}", $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.");
        }
    }

    private void ValidateDuplicateInDb(BoreholeImport borehole, int workgroupId, int processingIndex, string prefix)
    {
        var boreholesFromDb = context.Boreholes
            .Where(b => b.WorkgroupId == workgroupId)
            .AsNoTracking()
            .Select(b => new { b.Id, b.TotalDepth, b.LocationX, b.LocationY, b.LocationXLV03, b.LocationYLV03 })
            .ToList();

        if (boreholesFromDb.Any(b =>
            CompareValuesWithTolerance(b.TotalDepth, borehole.TotalDepth, 0) &&
            (CompareValuesWithTolerance(b.LocationX, borehole.LocationX, 2) || CompareValuesWithTolerance(b.LocationXLV03, borehole.LocationX, 2)) &&
            (CompareValuesWithTolerance(b.LocationY, borehole.LocationY, 2) || CompareValuesWithTolerance(b.LocationYLV03, borehole.LocationY, 2))))
        {
            ModelState.AddModelError($"{prefix}{processingIndex}", $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.");
        }
    }

    private void ValidateAttachments(BoreholeImport borehole, IList<IFormFile>? attachments, int processingIndex, string prefix)
    {
        if (attachments == null || string.IsNullOrEmpty(borehole.Attachments))
        {
            return;
        }

        var attachmentFileNamesToLink = borehole.Attachments
            .Split(",")
            .Select(s => s.Trim())
            .Where(s => !string.IsNullOrEmpty(s))
            .ToList();

        foreach (var attachmentFileNameToLink in attachmentFileNamesToLink)
        {
            if (!attachments.Any(a => a.FileName.Equals(attachmentFileNameToLink, StringComparison.OrdinalIgnoreCase)))
            {
                ModelState.AddModelError($"{prefix}{processingIndex}", $"Attachment file '{attachmentFileNameToLink}' not found.");
            }
        }
    }

    private void ValidateLithologyImports(List<int> importIds, List<LithologyImport> lithologyImports)
    {
        // Iterate over provided lithology imports, validate them, and create error messages when necessary. Use a non-zero based index for error message keys (e.g. 'Row1').
        foreach (var lithology in lithologyImports.Select((value, index) => (value, index: index + 1)))
        {
            if (lithology.value.ImportId == 0)
            {
                ModelState.AddModelError($"Row{lithology.index}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "import_id"));
            }

            if (lithology.value.StratiImportId == 0)
            {
                ModelState.AddModelError($"Row{lithology.index}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "strati_import_id"));
            }

            if (lithology.value.FromDepth == null)
            {
                ModelState.AddModelError($"Row{lithology.index}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "from_depth"));
            }

            if (lithology.value.ToDepth == null)
            {
                ModelState.AddModelError($"Row{lithology.index}", string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "to_depth"));
            }

            // Check if all import ids exist in the list of provided import ids (from borehole import file)
            if (!importIds.Contains(lithology.value.ImportId))
            {
                ModelState.AddModelError($"Row{lithology.index}", $"Borehole with {nameof(LithologyImport.ImportId)} '{lithology.value.ImportId}' not found.");
            }

            // Check if all multi code list values are numbers
            try
            {
                ParseMultiValueCodeListIds(lithology.value);
            }
            catch
            {
                ModelState.AddModelError($"Row{lithology.index}", $"One or more invalid (not a number) code list id in any of the following properties: {nameof(LithologyImport.ColorIds)}, {nameof(LithologyImport.OrganicComponentIds)}, {nameof(LithologyImport.GrainShapeIds)}, {nameof(LithologyImport.GrainGranularityIds)}, {nameof(LithologyImport.Uscs3Ids)}, {nameof(LithologyImport.DebrisIds)}.");
            }
        }

        // Group lithology records by import id to get lithologies per borehole.
        var boreholeGroups = lithologyImports.GroupBy(l => l.ImportId);

        foreach (var boreholeLithologies in boreholeGroups)
        {
            // Group lithology records per borehole by strati import id to get lithologies per stratigraphy.
            var stratiGroups = boreholeLithologies.GroupBy(bhoGroup => bhoGroup.StratiImportId);
            foreach (var stratiGroup in stratiGroups)
            {
                // Check if all records with the same strati import id have the same strati name.
                if (stratiGroup.Select(s => s.StratiName).Distinct().Count() > 1)
                {
                    ModelState.AddModelError($"Row{stratiGroup.First().ImportId}", $"Lithology with {nameof(LithologyImport.StratiImportId)} '{stratiGroup.Key}' has various {nameof(LithologyImport.StratiName)}.");
                }

                // Check if all records with the same strati import id have the same strati date.
                if (stratiGroup.Select(s => s.StratiDate).Distinct().Count() > 1)
                {
                    ModelState.AddModelError($"Row{stratiGroup.First().ImportId}", $"Lithology with {nameof(LithologyImport.StratiImportId)} '{stratiGroup.Key}' has various {nameof(LithologyImport.StratiDate)}.");
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

    private List<LithologyImport> ReadLithologiesFromCsv(IFormFile? file)
    {
        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, csvConfig);

        csv.Context.RegisterClassMap(new CsvImportLithologyMap());

        return csv.GetRecords<LithologyImport>().ToList();
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
            Map(m => m.AlternateName).Optional();
            Map(m => m.LocationPrecisionId).Optional();
            Map(m => m.ElevationPrecisionId).Optional();
            Map(m => m.ProjectName).Optional();
            Map(m => m.PurposeId).Optional();
            Map(m => m.StatusId).Optional();
            Map(m => m.QtDepthId).Optional();
            Map(m => m.TopBedrockFreshMd).Optional();
            Map(m => m.TopBedrockWeatheredMd).Optional();
            Map(m => m.HasGroundwater).Optional();
            Map(m => m.Remarks).Optional();
            Map(m => m.LithologyTopBedrockId).Optional();
            Map(m => m.LithostratigraphyId).Optional();
            Map(m => m.ChronostratigraphyId).Optional();
            Map(m => m.ReferenceElevation).Optional();
            Map(m => m.QtReferenceElevationId).Optional();
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

    private sealed class CsvImportLithologyMap : ClassMap<LithologyImport>
    {
        private readonly CultureInfo swissCulture = new("de-CH");

        public CsvImportLithologyMap()
        {
            var config = new CsvConfiguration(swissCulture)
            {
                IgnoreReferences = true,
                PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
            };

            AutoMap(config);

            // Define all optional properties of Layer (ef navigation properties do not need to be defined as optional).
            Map(m => m.StratiDate).Optional();
            Map(m => m.StratiName).Optional();
            Map(m => m.Id).Optional();
            Map(m => m.StratigraphyId).Optional();
            Map(m => m.CreatedById).Optional();
            Map(m => m.Created).Optional();
            Map(m => m.UpdatedById).Optional();
            Map(m => m.Updated).Optional();
            Map(m => m.IsUndefined).Optional();
            Map(m => m.IsLast).Optional();
            Map(m => m.DescriptionQualityId).Optional();
            Map(m => m.LithologyId).Optional();
            Map(m => m.PlasticityId).Optional();
            Map(m => m.ConsistanceId).Optional();
            Map(m => m.AlterationId).Optional();
            Map(m => m.CompactnessId).Optional();
            Map(m => m.GrainSize1Id).Optional();
            Map(m => m.GrainSize2Id).Optional();
            Map(m => m.CohesionId).Optional();
            Map(m => m.Uscs1Id).Optional();
            Map(m => m.Uscs2Id).Optional();
            Map(m => m.OriginalUscs).Optional();
            Map(m => m.UscsDeterminationId).Optional();
            Map(m => m.Notes).Optional();
            Map(m => m.LithostratigraphyId).Optional();
            Map(m => m.HumidityId).Optional();
            Map(m => m.IsStriae).Optional();
            Map(m => m.GradationId).Optional();
            Map(m => m.LithologyTopBedrockId).Optional();
            Map(m => m.OriginalLithology).Optional();
            Map(m => m.ColorIds).Optional();
            Map(m => m.OrganicComponentIds).Optional();
            Map(m => m.GrainShapeIds).Optional();
            Map(m => m.GrainGranularityIds).Optional();
            Map(m => m.Uscs3Ids).Optional();
            Map(m => m.DebrisIds).Optional();
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
