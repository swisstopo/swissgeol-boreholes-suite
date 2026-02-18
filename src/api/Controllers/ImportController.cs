using BDMS.Authentication;
using BDMS.Json;
using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.IO.Converters;
using System.Globalization;
using System.IO.Compression;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class ImportController : ControllerBase
{
    private const int MaxFileSize = 210_000_000; // 1024 x 1024 x 200 = 209715200 bytes
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly LocationService locationService;
    private readonly CoordinateService coordinateService;
    private readonly ProfileCloudService profileCloudService;
    private readonly IBoreholePermissionService boreholePermissionService;
    private readonly string nullOrEmptyMsg = "Field '{0}' is required.";

    private static readonly JsonSerializerOptions jsonImportOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        Converters = { new DateOnlyJsonConverter(), new LTreeJsonConverter(), new ObservationConverter(), new GeoJsonConverterFactory() },
        TypeInfoResolver = new DefaultJsonTypeInfoResolver
        {
            Modifiers = { JsonExportHelper.RequireIncludeInExportAttribute },
        },
    };

    public ImportController(BdmsContext context, ILogger<ImportController> logger, LocationService locationService, CoordinateService coordinateService, ProfileCloudService profileCloudService, IBoreholePermissionService boreholePermissionService)
    {
        this.context = context;
        this.logger = logger;
        this.locationService = locationService;
        this.coordinateService = coordinateService;
        this.profileCloudService = profileCloudService;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Receives an uploaded csv file to import one or several <see cref="Borehole"/>(s).
    /// </summary>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>(s).</param>
    /// <param name="boreholesFile">The <see cref="IFormFile"/> containing the borehole csv records that were uploaded.</param>
    /// <returns>The number of the newly created <see cref="Borehole"/>s.</returns>
    [HttpPost("csv")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<ActionResult<int>> UploadCsvFileAsync(int workgroupId, IFormFile boreholesFile)
    {
        if (!await boreholePermissionService.HasUserRoleOnWorkgroupAsync(HttpContext.GetUserSubjectId(), workgroupId, Role.Editor).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        InitializeImport(workgroupId, "CSV");
        if (!ValidateFile(boreholesFile, FileTypeChecker.IsCsv))
            return BadRequest("Invalid or empty CSV file uploaded.");

        try
        {
            // The identifier codelists are used to dynamically map imported identifiers to codelists.
            var identifierCodelists = await context.Codelists
                .Where(c => c.Schema == "borehole_identifier")
                .AsNoTracking()
                .ToListAsync()
                .ConfigureAwait(false);

            var boreholeImports = ReadBoreholesFromCsv(boreholesFile, identifierCodelists);
            ValidateBoreholeImports(workgroupId, boreholeImports, ValidationErrorType.Csv);

            // If any validation error occured, return a bad request.
            if (!ModelState.IsValid) return ValidationProblem();

            // Map to Borehole type
            List<Borehole> boreholes = new();
            foreach (var boreholeImport in boreholeImports)
            {
                var borehole = (Borehole)boreholeImport;

                // Assign borehole id to the borehole import object to be able to map attachments to the borehole.
                boreholeImport.Id = borehole.Id;

                // Add new workflow with status draft.
                borehole.Workflow = new Workflow
                {
                    Status = WorkflowStatus.Draft,
                    ReviewedTabs = new TabStatus(),
                    PublishedTabs = new TabStatus(),
                    HasRequestedChanges = false,
                };

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
            }

            // Save the changes to the db, upload attachments to cloud storage and commit changes to db on success.
            using var transaction = await context.Database.BeginTransactionAsync().ConfigureAwait(false);

            // Add boreholes to database.
            await context.Boreholes.AddRangeAsync(boreholes).ConfigureAwait(false);
            var result = await SaveChangesAsync(() => Ok(boreholes.Count)).ConfigureAwait(false);

            await transaction.CommitAsync().ConfigureAwait(false);
            return result;
        }
        catch (Exception ex) when (ex is HeaderValidationException || ex is ReaderException)
        {
            return Problem(ex.Message, statusCode: (int)HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error while importing borehole(s) to workgroup with id <{WorkgroupId}>.", workgroupId);
            return Problem("Error while importing borehole(s).");
        }
    }

    /// <summary>
    /// Receives an uploaded JSON file to import one or several <see cref="Borehole"/>(s).
    /// </summary>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>(s).</param>
    /// <param name="boreholesFile">The <see cref="IFormFile"/> containing the borehole JSON records that were uploaded.</param>
    /// <returns>The number of the newly created <see cref="Borehole"/>s.</returns>
    [HttpPost("json")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<ActionResult<int>> UploadJsonFileAsync(int workgroupId, IFormFile boreholesFile)
    {
        if (!await boreholePermissionService.HasUserRoleOnWorkgroupAsync(HttpContext.GetUserSubjectId(), workgroupId, Role.Editor).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        InitializeImport(workgroupId, "JSON");
        if (!ValidateFile(boreholesFile, FileTypeChecker.IsJson))
            return BadRequest("Invalid or empty JSON file uploaded.");

        var boreholes = await DeserializeBoreholeDataAsync(boreholesFile.OpenReadStream()).ConfigureAwait(false);
        if (boreholes == null) return BadRequest("The provided file is not an array of boreholes or is not in a valid JSON format.");
        return await ProcessAndSaveBoreholesAsync(workgroupId, boreholes).ConfigureAwait(false);
    }

    /// <summary>
    /// Receives an uploaded ZIP file to import one or several <see cref="Borehole"/>(s).
    /// The ZIP file can additionally contain attachments.
    /// </summary>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>(s).</param>
    /// <param name="boreholesFile">The <see cref="IFormFile"/> containing the borehole records and attachments that were uploaded.</param>
    /// <returns>The number of the newly created <see cref="Borehole"/>s.</returns>
    [HttpPost("zip")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<ActionResult<int>> UploadZipFileAsync(int workgroupId, IFormFile boreholesFile)
    {
        if (!await boreholePermissionService.HasUserRoleOnWorkgroupAsync(HttpContext.GetUserSubjectId(), workgroupId, Role.Editor).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        InitializeImport(workgroupId, "ZIP");
        if (!ValidateFile(boreholesFile, FileTypeChecker.IsZip))
            return BadRequest("Invalid or empty ZIP file uploaded.");

        var zipStream = boreholesFile.OpenReadStream();
        using var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Read);
        var jsonFile = zipArchive.Entries.FirstOrDefault(e => e.FullName.EndsWith(".json", StringComparison.OrdinalIgnoreCase));
        if (jsonFile == null)
            return BadRequest("ZIP file does not contain a JSON file.");

        var boreholes = await DeserializeBoreholeDataAsync(jsonFile.Open()).ConfigureAwait(false);
        if (boreholes == null)
            return BadRequest("The provided file is not an array of boreholes or is not a valid JSON format.");

        var attachmentNames = zipArchive.Entries.Where(e => e.FullName != jsonFile.FullName).Select(e => e.FullName);
        ValidateAttachmentsPresent(attachmentNames, boreholes);
        if (!ModelState.IsValid)
            return ValidationProblem();

        var boreholeFiles = boreholes.Select(b => (b, b.BoreholeFiles?.ToList())).ToList(); // Copy files for re-upload because they are cleared on save.
        ActionResult<int> result = await ProcessAndSaveBoreholesAsync(workgroupId, boreholes).ConfigureAwait(false);
        if (!ModelState.IsValid)
            return ValidationProblem();

        await UploadAttachmentsAsync(zipArchive, boreholeFiles).ConfigureAwait(false);
        return !ModelState.IsValid ? ValidationProblem() : result;
    }

    private void InitializeImport(int workgroupId, string fileType)
    {
        // Increase max allowed errors to be able to return more validation errors at once.
        ModelState.MaxAllowedErrors = 1000;
        logger.LogInformation("Import boreholes to workgroup with id <{WorkgroupId}> via <{FileType}>", workgroupId, fileType);
    }

    private async Task<List<BoreholeImport>?> DeserializeBoreholeDataAsync(Stream stream)
    {
        try
        {
            return await JsonSerializer.DeserializeAsync<List<BoreholeImport>>(stream, jsonImportOptions).ConfigureAwait(false);
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Error while deserializing borehole json file.");
            return null;
        }
    }

    private async Task<ActionResult<int>> ProcessAndSaveBoreholesAsync(int workgroupId, List<BoreholeImport> boreholes)
    {
        var user = await GetUserAsync().ConfigureAwait(false);
        if (user == null)
            return Unauthorized();

        ValidateBoreholeImports(workgroupId, boreholes, ValidationErrorType.Json);
        if (!ModelState.IsValid)
            return ValidationProblem();

        foreach (var borehole in boreholes)
        {
            // Attachments are re-uploaded when importing from a zip file.
            borehole.BoreholeFiles?.Clear();

            // Add new workflow with status draft.
            borehole.Workflow = new Workflow
            {
                Status = WorkflowStatus.Draft,
                ReviewedTabs = new TabStatus(),
                PublishedTabs = new TabStatus(),
                HasRequestedChanges = false,
            };
        }

        await MarkBoreholeContentAsNew(user, workgroupId, boreholes).ConfigureAwait(false);
        await context.Boreholes.AddRangeAsync(boreholes).ConfigureAwait(false);
        return await SaveChangesAsync(() => Ok(boreholes.Count)).ConfigureAwait(false);
    }

    private async Task MarkBoreholeContentAsNew(User user, int workgroupId, List<BoreholeImport>? boreholes)
    {
        var hydrotestCodelists = await GetHydrotestCodelistsAsync().ConfigureAwait(false);

        foreach (var borehole in boreholes)
        {
            borehole.MarkBoreholeContentAsNew(user, workgroupId);
            MapHydrotestCodelists(borehole, hydrotestCodelists);
            MapLithologyCodelists(borehole);
            MapLogCodelists(borehole);
        }
    }

    private async Task UploadAttachmentsAsync(ZipArchive zipArchive, List<(BoreholeImport Borehole, List<Profile>? Files)> boreholeFiles)
    {
        for (var i = 0; i < boreholeFiles.Count; i++)
        {
            var (borehole, files) = boreholeFiles[i];
            if (files != null && files.Count > 0)
            {
                foreach (var fileToProcess in files)
                {
                    var fileName = $"{fileToProcess.File.NameUuid}_{fileToProcess.File.Name}";
                    var attachment = zipArchive.Entries.FirstOrDefault(e => e.FullName == fileName);
                    if (attachment == null)
                    {
                        AddValidationErrorToModelState(i, $"Attachment with the name <{fileName}> is referenced in JSON file but was not not found in ZIP archive.", ValidationErrorType.Attachment);
                        continue;
                    }

                    using var memoryStream = new MemoryStream();
                    await attachment.Open().CopyToAsync(memoryStream).ConfigureAwait(false);
                    memoryStream.Position = 0;

                    await UploadFormFileAsync(memoryStream, fileToProcess, GetContentType(attachment.Name), borehole, i).ConfigureAwait(false);
                }
            }
        }
    }

    private async Task UploadFormFileAsync(Stream fileStream, Profile boreholeFile, string contentType, Borehole borehole, int index)
    {
        var fileName = boreholeFile.File.Name;
        try
        {
            await profileCloudService.UploadFileAndLinkToBoreholeAsync(fileStream, fileName, boreholeFile.Description, boreholeFile.Public, contentType, borehole.Id).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while uploading the file: {FileName}", fileName);
            AddValidationErrorToModelState(index, string.Format(CultureInfo.InvariantCulture, $"An error occurred while uploading the file: <{fileName}>", "upload"), ValidationErrorType.Attachment);
        }
    }

    private static string GetContentType(string fileName)
    {
        var mimeType = MimeTypes.GetMimeType(Path.GetExtension(fileName));
        return string.IsNullOrEmpty(mimeType) ? "application/octet-stream" : mimeType;
    }

    private static bool ValidateFile(IFormFile file, Func<IFormFile, bool> fileValidationFunc)
    {
        if (file == null || file.Length == 0) return false;
        return fileValidationFunc(file);
    }

    private void ValidateAttachmentsPresent(IEnumerable<string> attachmentsInZip, List<BoreholeImport> boreholesFromFile)
    {
        // Files are exported with the original name and the UUID as a prefix to make them unique while preserving the original name
        var referencedAttachments = boreholesFromFile
            .Select(b => b.BoreholeFiles)
            .Where(bf => bf != null)
            .SelectMany(bf => bf!)
            .Select(bf => bf.File.NameUuid + "_" + bf.File.Name);

        var missingAttachments = referencedAttachments.Except(attachmentsInZip).ToList();
        if (missingAttachments.Count > 0)
        {
            foreach (var missingAttachment in missingAttachments)
            {
                AddValidationErrorToModelState(missingAttachments.IndexOf(missingAttachment), $"Attachment with the name <{missingAttachment}> is referenced in JSON file but was not not found in ZIP archive.", ValidationErrorType.Attachment);
            }
        }
    }

    private static List<Codelist> GetCodelists(List<Codelist> codeLists, List<int> codelistIds)
    {
        return codeLists
            .Where(c => codelistIds.Contains(c.Id))
            .ToList();
    }

    private async Task<User?> GetUserAsync()
    {
        var subjectId = HttpContext.GetUserSubjectId();
        return await context.Users.AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == subjectId)
            .ConfigureAwait(false);
    }

    private async Task<List<Codelist>> GetHydrotestCodelistsAsync()
    {
        return await context.Codelists
            .Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema
                     || c.Schema == HydrogeologySchemas.FlowdirectionSchema
                     || c.Schema == HydrogeologySchemas.EvaluationMethodSchema)
            .ToListAsync()
            .ConfigureAwait(false);
    }

    private static void MapLogCodelists(BoreholeImport borehole)
    {
        foreach (var logRun in borehole.LogRuns ?? [])
        {
            foreach (var logFile in logRun.LogFiles ?? [])
            {
                logFile.LogFileToolTypeCodes = logFile.ToolTypeCodelistIds?.Select(id => new LogFileToolTypeCodes { CodelistId = id }).ToList();
            }
        }
    }

    private static void MapHydrotestCodelists(BoreholeImport borehole, List<Codelist> hydrotestCodelists)
    {
        var hydroTests = borehole.Observations?.OfType<Hydrotest>().ToList();
        if (hydroTests == null) return;

        foreach (var hydroTest in hydroTests)
        {
            hydroTest.KindCodelists = GetCodelists(hydrotestCodelists, (List<int>)hydroTest.KindCodelistIds!);
            hydroTest.FlowDirectionCodelists = GetCodelists(hydrotestCodelists, (List<int>)hydroTest.FlowDirectionCodelistIds!);
            hydroTest.EvaluationMethodCodelists = GetCodelists(hydrotestCodelists, (List<int>)hydroTest.EvaluationMethodCodelistIds!);
        }
    }

    private static void MapLithologyCodelists(BoreholeImport borehole)
    {
        foreach (var stratigraphy in borehole.Stratigraphies ?? [])
        {
            foreach (var lithology in stratigraphy.Lithologies ?? [])
            {
                lithology.LithologyRockConditionCodes = lithology.RockConditionCodelistIds?.Select(id => new LithologyRockConditionCodes { CodelistId = id }).ToList();
                lithology.LithologyUscsTypeCodes = lithology.UscsTypeCodelistIds?.Select(id => new LithologyUscsTypeCodes { CodelistId = id }).ToList();
                lithology.LithologyTextureMetaCodes = lithology.TextureMetaCodelistIds?.Select(id => new LithologyTextureMetaCodes { CodelistId = id }).ToList();

                foreach (var description in lithology.LithologyDescriptions ?? [])
                {
                    description.LithologyDescriptionComponentUnconOrganicCodes = description.ComponentUnconOrganicCodelistIds?.Select(id => new LithologyDescriptionComponentUnconOrganicCodes { CodelistId = id }).ToList();
                    description.LithologyDescriptionComponentUnconDebrisCodes = description.ComponentUnconDebrisCodelistIds?.Select(id => new LithologyDescriptionComponentUnconDebrisCodes { CodelistId = id }).ToList();
                    description.LithologyDescriptionGrainShapeCodes = description.GrainShapeCodelistIds?.Select(id => new LithologyDescriptionGrainShapeCodes { CodelistId = id }).ToList();
                    description.LithologyDescriptionGrainAngularityCodes = description.GrainAngularityCodelistIds?.Select(id => new LithologyDescriptionGrainAngularityCodes { CodelistId = id }).ToList();
                    description.LithologyDescriptionLithologyUnconDebrisCodes = description.LithologyUnconDebrisCodelistIds?.Select(id => new LithologyDescriptionLithologyUnconDebrisCodes { CodelistId = id }).ToList();
                    description.LithologyDescriptionComponentConParticleCodes = description.ComponentConParticleCodelistIds?.Select(id => new LithologyDescriptionComponentConParticleCodes { CodelistId = id }).ToList();
                    description.LithologyDescriptionComponentConMineralCodes = description.ComponentConMineralCodelistIds?.Select(id => new LithologyDescriptionComponentConMineralCodes { CodelistId = id }).ToList();
                    description.LithologyDescriptionStructureSynGenCodes = description.StructureSynGenCodelistIds?.Select(id => new LithologyDescriptionStructureSynGenCodes { CodelistId = id }).ToList();
                    description.LithologyDescriptionStructurePostGenCodes = description.StructurePostGenCodelistIds?.Select(id => new LithologyDescriptionStructurePostGenCodes { CodelistId = id }).ToList();
                }
            }
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

    private void ValidateBoreholeImports(int workgroupId, List<BoreholeImport> boreholesFromFile, ValidationErrorType errorType)
    {
        foreach (var borehole in boreholesFromFile.Select((value, index) => (value, index)))
        {
            ValidateBorehole(borehole.value, boreholesFromFile, workgroupId, borehole.index, errorType);
        }
    }

    private void ValidateBorehole(BoreholeImport borehole, List<BoreholeImport> boreholesFromFile, int workgroupId, int boreholeIndex, ValidationErrorType errorType)
    {
        ValidateRequiredFields(borehole, boreholeIndex, errorType);
        ValidateDuplicateInFile(borehole, boreholesFromFile, boreholeIndex, errorType);
        ValidateDuplicateInDb(borehole, workgroupId, boreholeIndex, errorType);
        ValidateCasingReferences(borehole, boreholeIndex);
    }

    private void ValidateRequiredFields(BoreholeImport borehole, int processingIndex, ValidationErrorType errorType)
    {
        if (string.IsNullOrEmpty(borehole.OriginalName)) AddValidationErrorToModelState(processingIndex, string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "original_name"), errorType);
        if (borehole.LocationX == null && borehole.LocationXLV03 == null) AddValidationErrorToModelState(processingIndex, string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "location_x"), errorType);
        if (borehole.LocationY == null && borehole.LocationYLV03 == null) AddValidationErrorToModelState(processingIndex, string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "location_y"), errorType);
    }

    private void ValidateDuplicateInFile(BoreholeImport borehole, List<BoreholeImport> boreholesFromFile, int processingIndex, ValidationErrorType errorType)
    {
        if (boreholesFromFile.Count(b =>
            BoreholeExtensions.CompareToWithTolerance(b.TotalDepth, borehole.TotalDepth, 0) &&
            BoreholeExtensions.CompareToWithTolerance(b.LocationX, borehole.LocationX, 2) &&
            BoreholeExtensions.CompareToWithTolerance(b.LocationY, borehole.LocationY, 2)) > 1)
        {
            AddValidationErrorToModelState(processingIndex, $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", errorType);
        }
    }

    private void ValidateDuplicateInDb(Borehole borehole, int workgroupId, int processingIndex, ValidationErrorType errorType)
    {
        var boreholesFromDb = context.Boreholes.Where(b => b.WorkgroupId == workgroupId).AsNoTracking();

        if (borehole.IsWithinPredefinedTolerance(boreholesFromDb))
        {
            AddValidationErrorToModelState(processingIndex, $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.", errorType);
        }
    }

    private void ValidateCasingReferences(Borehole borehole, int processingIndex)
    {
        if (!borehole.ValidateCasingReferences())
        {
            AddValidationErrorToModelState(
                processingIndex, $"Some {nameof(ICasingReference.CasingId)} in {nameof(Borehole.Observations)}/{nameof(Completion.Backfills)}/{nameof(Completion.Instrumentations)} do not exist in the borehole's casings.", ValidationErrorType.Json);
        }
    }

    private static List<BoreholeImport> ReadBoreholesFromCsv(IFormFile file, List<Codelist> identifierCodelists)
    {
        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, CsvConfigHelper.CsvReadConfig);

        csv.Context.RegisterClassMap(new CsvImportBoreholeMap(identifierCodelists));

        return csv.GetRecords<BoreholeImport>().ToList();
    }

    private async Task UpdateBoreholeLocationAndCoordinates(Borehole borehole)
    {
        // Use origin spatial reference system
        var locationX = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationX : borehole.LocationXLV03;
        var locationY = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationY : borehole.LocationYLV03;
        var srid = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? SpatialReferenceConstants.SridLv95 : SpatialReferenceConstants.SridLv03;

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

    private void AddValidationErrorToModelState(int boreholeIndex, string errorMessage, ValidationErrorType errorType)
    {
        // Use 'Borehole' as prefix and zero based index for json files. E.g. 'Borehole0'
        // Use 'Row' as prefix and one based index for csv files. E.g. 'Row1'.
        // Use 'Attachment' as prefix and one based index for attachments. E.g. 'Attachment1'
        string prefix = errorType switch
        {
            ValidationErrorType.Json => "Borehole",
            ValidationErrorType.Csv => "Row",
            ValidationErrorType.Attachment => "Attachment",
            _ => throw new ArgumentOutOfRangeException(nameof(errorType), errorType, null),
        };

        int index = errorType == ValidationErrorType.Json ? boreholeIndex : boreholeIndex + 1;
        ModelState.AddModelError($"{prefix}{index}", errorMessage);
    }

    private sealed class CsvImportBoreholeMap : ClassMap<BoreholeImport>
    {
        public CsvImportBoreholeMap(List<Codelist> codelists)
        {
            AutoMap(CsvConfigHelper.CsvReadConfig);

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
            Map(m => m.TopBedrockIntersected).Optional();

            // Define properties to ignore
            Map(b => b.Municipality).Ignore();
            Map(b => b.Canton).Ignore();
            Map(b => b.Country).Ignore();
            Map(m => m.Id).Ignore();
            Map(m => m.TotalDepthTvd).Ignore();
            Map(m => m.TopBedrockFreshTvd).Ignore();
            Map(m => m.TopBedrockWeatheredTvd).Ignore();

            Map(m => m.BoreholeCodelists).Convert(args =>
            {
                var boreholeCodeLists = new List<BoreholeCodelist>();

                foreach (var header in args.Row.HeaderRecord ?? Array.Empty<string>())
                {
                    // Find the corresponding codelist by comparing the header with Codelist.En, ignoring whitespace
                    var codelist = codelists.FirstOrDefault(cl => string.Equals(
                        cl.En.Replace(" ", string.Empty, StringComparison.OrdinalIgnoreCase),
                        header.Replace(" ", string.Empty, StringComparison.OrdinalIgnoreCase),
                        StringComparison.OrdinalIgnoreCase));

                    if (codelist != null)
                    {
                        var value = args.Row.GetField<string?>(header);
                        if (!string.IsNullOrEmpty(value))
                        {
                            boreholeCodeLists.Add(new BoreholeCodelist
                            {
                                CodelistId = codelist.Id,
                                Value = value,
                            });
                        }
                    }
                }

                return boreholeCodeLists;
            });

            // Set precision to both reference systems
            Map(m => m.PrecisionLocationX).Convert(args => GetPrecision(args.Row, "LocationX"));
            Map(m => m.PrecisionLocationXLV03).Convert(args => GetPrecision(args.Row, "LocationX"));
            Map(m => m.PrecisionLocationY).Convert(args => GetPrecision(args.Row, "LocationY"));
            Map(m => m.PrecisionLocationYLV03).Convert(args => GetPrecision(args.Row, "LocationY"));
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
