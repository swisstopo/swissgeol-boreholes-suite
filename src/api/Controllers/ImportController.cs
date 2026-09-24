using BDMS.Authentication;
using BDMS.Json;
using BDMS.Models;
using BDMS.Services;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using NetTopologySuite.IO.Converters;
using System.Globalization;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class ImportController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly LocationService locationService;
    private readonly CoordinateService coordinateService;
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

    public ImportController(BdmsContext context, ILogger<ImportController> logger, LocationService locationService, CoordinateService coordinateService, IBoreholePermissionService boreholePermissionService)
    {
        this.context = context;
        this.logger = logger;
        this.locationService = locationService;
        this.coordinateService = coordinateService;
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
    [RequestFormLimits(MultipartBodyLengthLimit = FileSizeLimits.Standard)]
    public async Task<ActionResult<int>> UploadCsvFileAsync(int workgroupId, IFormFile boreholesFile)
    {
        if (!await boreholePermissionService.HasUserRoleOnWorkgroupAsync(HttpContext.GetUserSubjectId(), workgroupId, Role.Editor).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        InitializeImport(workgroupId, "CSV");
        if (!ValidateFile(boreholesFile, FileTypeChecker.IsCsv))
            return BadRequest(new { detail = "Invalid or empty CSV file uploaded.", messageKey = "invalidOrEmptyCsvFile" });

        try
        {
            // The identifier codelists are used to dynamically map imported identifiers to codelists.
            var identifierCodelists = await context.Codelists
                .Where(c => c.Schema == "borehole_identifier")
                .AsNoTracking()
                .ToListAsync()
                .ConfigureAwait(false);

            var boreholeImports = ReadBoreholesFromCsv(boreholesFile, identifierCodelists);
            ValidateBoreholeImports(boreholeImports, ValidationErrorType.Csv);

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

                borehole.WorkgroupId = workgroupId;

                // Detect coordinate reference system and set according coordinate properties of borehole.
                if (boreholeImport.Location_x != null && boreholeImport.Location_y != null)
                {
                    if (boreholeImport.Location_x >= 2_000_000)
                    {
                        borehole.OriginalReferenceSystemId = SpatialReferenceCodelistId.LV95;
                        borehole.LocationX = boreholeImport.Location_x;
                        borehole.LocationY = boreholeImport.Location_y;
                        borehole.PrecisionLocationXLV03 = Math.Max(borehole.PrecisionLocationX ?? 0, borehole.PrecisionLocationY ?? 0);
                        borehole.PrecisionLocationYLV03 = borehole.PrecisionLocationXLV03;
                    }
                    else
                    {
                        borehole.OriginalReferenceSystemId = SpatialReferenceCodelistId.LV03;
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
            var result = await SaveChangesAsync<int>(() => Ok(boreholes.Count)).ConfigureAwait(false);

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
    /// <param name="importAttachments">
    /// Whether the caller holds the attachments the JSON describes and will upload them. When it
    /// does, a row is written per attachment for those uploads to fill; when it does not, the
    /// profiles are dropped, because nothing would ever arrive for them.
    /// </param>
    /// <returns>What was imported, and the rows still waiting for a file.</returns>
    [HttpPost("json")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = FileSizeLimits.Standard)]
    public async Task<ActionResult<BoreholeImportResult>> UploadJsonFileAsync(int workgroupId, IFormFile boreholesFile, [FromQuery] bool importAttachments = false)
    {
        if (!await boreholePermissionService.HasUserRoleOnWorkgroupAsync(HttpContext.GetUserSubjectId(), workgroupId, Role.Editor).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        InitializeImport(workgroupId, "JSON");
        if (!ValidateFile(boreholesFile, FileTypeChecker.IsJson))
            return BadRequest(new { detail = "Invalid or empty JSON file uploaded.", messageKey = "invalidOrEmptyJsonFile" });

        var boreholes = await DeserializeBoreholeDataAsync(boreholesFile.OpenReadStream()).ConfigureAwait(false);
        if (boreholes == null) return BadRequest(new { detail = "The provided file is not an array of boreholes or is not in a valid JSON format.", messageKey = "invalidJsonBoreholeArray" });
        return await ProcessAndSaveBoreholesAsync(workgroupId, boreholes, importAttachments).ConfigureAwait(false);
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

    private async Task<ActionResult<BoreholeImportResult>> ProcessAndSaveBoreholesAsync(int workgroupId, List<BoreholeImport> boreholes, bool importAttachments)
    {
        var user = await GetUserAsync().ConfigureAwait(false);
        if (user == null)
            return Unauthorized();

        ValidateBoreholeImports(boreholes, ValidationErrorType.Json);
        if (!ModelState.IsValid)
            return ValidationProblem();

        // Holding the attachments is a promise the caller is taken at its word on. The archive is
        // unpacked in the browser, which is also the only thing holding the import to
        // FileSizeLimits.MaxImportArchive, so nothing here ever sees the attachments and nothing
        // reconciles or expires the rows written for them: a client that stops half way leaves rows
        // with no file behind, and they stay until a user deletes them. That is the price of an
        // import no longer bounded by what one request can carry, and a row in that state is
        // complete enough to live with, which PrepareAwaitingAttachments says more about.
        List<(Profile Profile, Borehole Borehole, string EntryName)> awaiting = importAttachments ? PrepareAwaitingAttachments(boreholes) : [];

        foreach (var borehole in boreholes)
        {
            // Nothing arrives to fill a profile when the caller holds no attachments, so the row
            // would wait for a file forever.
            if (!importAttachments) borehole.Profiles?.Clear();

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

        // Both ids are zero until the save assigns them, so the result is built inside the success
        // path rather than ahead of it.
        return await SaveChangesAsync<BoreholeImportResult>(() => Ok(new BoreholeImportResult(
            boreholes.Count,
            awaiting.Select(entry => new PendingAttachment(entry.Profile.Id, entry.Borehole.Id, entry.EntryName)).ToList()))).ConfigureAwait(false);
    }

    /// <summary>
    /// Turns the profiles the JSON describes into rows waiting for their uploads, and names the
    /// archive entry each one expects.
    ///
    /// The row is written with no object and with OCR switched off. Both are corrected when the
    /// upload arrives: a row that claimed an eligible status now would be handed to the OCR service
    /// with no file to read, and the user's document would be marked failed before it was sent.
    ///
    /// Nothing obliges the upload to arrive, and a row whose upload never does stays until a user
    /// deletes it. That state is a settled one rather than a broken one: the export skips such a
    /// row, downloading it answers not found, deleting it works, and the OCR catch-up passes it
    /// over, all of which is held by tests.
    /// </summary>
    /// <param name="boreholes">The deserialized boreholes, whose profiles carry the exporting system's keys.</param>
    /// <returns>
    /// One entry per profile the archive holds a file for, carrying the row, the borehole the
    /// upload is authorized against, and the archive entry the client is to send. A profile the
    /// export left no file for is written as a row but named here by nothing.
    /// </returns>
    private static List<(Profile Profile, Borehole Borehole, string EntryName)> PrepareAwaitingAttachments(List<BoreholeImport> boreholes)
    {
        var awaiting = new List<(Profile, Borehole, string)>();

        foreach (var borehole in boreholes)
        {
            foreach (var profile in borehole.Profiles ?? [])
            {
                // The entry carries the exporting system's key, which is what the JSON still holds
                // at this point; the row's own key is assigned when its upload is stored.
                var exportedObjectKey = profile.NameUuid;

                profile.NameUuid = null;
                profile.OcrStatus = OcrStatus.WillNotBeProcessed;

                // An export leaves out the file of a profile whose upload never arrived, so such a
                // profile carries no key and the archive holds no entry for it. Naming one would
                // send the client after a file nobody ever stored. The row is written all the same,
                // because the exporting system holds one too.
                if (exportedObjectKey is null) continue;

                awaiting.Add((profile, borehole, FileHelper.BuildAttachmentZipEntryName(exportedObjectKey, profile.Name)));
            }
        }

        return awaiting;
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

    private static bool ValidateFile(IFormFile file, Func<IFormFile, bool> fileValidationFunc)
    {
        if (file == null || file.Length == 0) return false;
        return fileValidationFunc(file);
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
        if (row.HeaderRecord != null && row.HeaderRecord.Any(h => CsvConfigHelper.IsSameColumn(h, fieldName)))
        {
            var value = row.GetField<string?>(fieldName);
            if (!string.IsNullOrEmpty(value) && value.Contains('.', StringComparison.Ordinal))
            {
                return value.Split('.')[1].Length;
            }
        }

        return 0;
    }

    private void ValidateBoreholeImports(List<BoreholeImport> boreholesFromFile, ValidationErrorType errorType)
    {
        foreach (var borehole in boreholesFromFile.Select((value, index) => (value, index)))
        {
            ValidateBorehole(borehole.value, borehole.index, errorType);
        }
    }

    private void ValidateBorehole(BoreholeImport borehole, int boreholeIndex, ValidationErrorType errorType)
    {
        ValidateRequiredFields(borehole, boreholeIndex, errorType);
        ValidateCasingReferences(borehole, boreholeIndex);
    }

    private void ValidateRequiredFields(BoreholeImport borehole, int processingIndex, ValidationErrorType errorType)
    {
        if (string.IsNullOrEmpty(borehole.OriginalName)) AddValidationErrorToModelState(processingIndex, string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "original_name"), errorType);
        if (borehole.LocationX == null && borehole.LocationXLV03 == null) AddValidationErrorToModelState(processingIndex, string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "location_x"), errorType);
        if (borehole.LocationY == null && borehole.LocationYLV03 == null) AddValidationErrorToModelState(processingIndex, string.Format(CultureInfo.InvariantCulture, nullOrEmptyMsg, "location_y"), errorType);
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
        using var reader = CsvEncoding.OpenText(file);
        using var csv = new CsvReader(reader, CsvConfigHelper.CsvReadConfig);

        csv.Context.RegisterClassMap(new CsvImportBoreholeMap(identifierCodelists));

        return csv.GetRecords<BoreholeImport>().ToList();
    }

    private async Task UpdateBoreholeLocationAndCoordinates(Borehole borehole)
    {
        // Use origin spatial reference system
        var locationX = borehole.OriginalReferenceSystemId == SpatialReferenceCodelistId.LV95 ? borehole.LocationX : borehole.LocationXLV03;
        var locationY = borehole.OriginalReferenceSystemId == SpatialReferenceCodelistId.LV95 ? borehole.LocationY : borehole.LocationYLV03;
        var srid = SpatialReferenceIdentifier.GetByCodelistId(borehole.OriginalReferenceSystemId);

        if (locationX == null || locationY == null) return;

        // Set coordinates for missing reference system.
        await coordinateService.MigrateCoordinatesAsync(borehole, onlyMissing: false).ConfigureAwait(false);

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
        string prefix = errorType switch
        {
            ValidationErrorType.Json => "Borehole",
            ValidationErrorType.Csv => "Row",
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
            Map(m => m.OriginalReferenceSystemId).Optional();
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

                foreach (var (header, index) in (args.Row.HeaderRecord ?? Array.Empty<string>()).Select((h, i) => (Header: h, Index: i)))
                {
                    // Find the corresponding codelist by comparing the header with Codelist.En, ignoring whitespace
                    var codelist = codelists.FirstOrDefault(cl => string.Equals(
                        cl.En.Replace(" ", string.Empty, StringComparison.OrdinalIgnoreCase),
                        header.Replace(" ", string.Empty, StringComparison.OrdinalIgnoreCase),
                        StringComparison.OrdinalIgnoreCase));

                    if (codelist != null)
                    {
                        var value = args.Row.GetField<string?>(index);
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

    private async Task<ActionResult<T>> SaveChangesAsync<T>(Func<ActionResult<T>> successResult)
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
