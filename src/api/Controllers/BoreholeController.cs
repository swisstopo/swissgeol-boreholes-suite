using BDMS.Authentication;
using BDMS.Models;
using CsvHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace BDMS.Controllers;

// The api version is temporarily hardcoded as "v2" until the legacy API for borehole is removed.
// This is necessary to avoid a rerouting issue with the reverse proxy, when matching routes exist for both the .net and the python API.
[ApiController]
[Route("api/v2/[controller]")]
public class BoreholeController : BoreholeControllerBase<Borehole>
{
    // Limit the maximum number of items per request to 100.
    // This also applies to the number of filtered ids to ensure the URL length does not exceed the maximum allowed length.
    private const int MaxPageSize = 100;

    public BoreholeController(BdmsContext context, ILogger<BoreholeController> logger, IBoreholeLockService boreholeLockService)
    : base(context, logger, boreholeLockService)
    {
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public async override Task<ActionResult<Borehole>> EditAsync(Borehole entity)
    {
        if (entity == null)
        {
            return BadRequest(ModelState);
        }

        var existingBorehole = await Context.Boreholes
            .Include(b => b.BoreholeCodelists)
            .SingleOrDefaultAsync(l => l.Id == entity.Id)
            .ConfigureAwait(false);

        if (existingBorehole == null)
        {
            return NotFound();
        }

        Context.Entry(existingBorehole).CurrentValues.SetValues(entity);

        // Update the geometry if new coordinates are provided
        if (entity.LocationX.HasValue && entity.LocationY.HasValue)
        {
            existingBorehole.Geometry = new Point(entity.LocationX.Value, entity.LocationY.Value) { SRID = 2056 };
        }

        // Update borehole identifiers with borehole
        if (entity.BoreholeCodelists != null)
        {
            existingBorehole.BoreholeCodelists = entity.BoreholeCodelists;
        }

        try
        {
            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return await GetByIdAsync(entity.Id).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the entity changes.";
            Logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
    }

    /// <summary>
    /// Asynchronously gets all <see cref="Borehole"/> records with optional filtering by ids and pagination.
    /// </summary>
    /// <param name="ids">The optional list of borehole ids to filter by.</param>
    /// <param name="pageNumber">The page number for pagination.</param>
    /// <param name="pageSize">The page size for pagination.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<PaginatedBoreholeResponse>> GetAllAsync([FromQuery][MaxLength(MaxPageSize)] IEnumerable<int>? ids = null, [FromQuery][Range(1, int.MaxValue)] int pageNumber = 1, [FromQuery][Range(1, MaxPageSize)] int pageSize = 100)
    {
        pageSize = Math.Min(MaxPageSize, Math.Max(1, pageSize));

        var skip = (pageNumber - 1) * pageSize;
        var query = GetBoreholesWithIncludes().AsNoTracking();

        if (ids != null && ids.Any())
        {
            query = query.Where(borehole => ids.Contains(borehole.Id));
        }

        var totalCount = await query.CountAsync().ConfigureAwait(false);
        var boreholes = await query.Skip(skip).Take(pageSize).ToListAsync().ConfigureAwait(false);
        var paginatedResponse = new PaginatedBoreholeResponse(totalCount, pageNumber, pageSize, MaxPageSize, boreholes);

        return Ok(paginatedResponse);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Borehole"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of borehole to get.</param>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Borehole>> GetByIdAsync(int id)
    {
        var borehole = await GetBoreholesWithIncludes()
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (borehole == null)
        {
            return NotFound();
        }

        return Ok(borehole);
    }

    private IQueryable<Borehole> GetBoreholesWithIncludes()
    {
        return Context.Boreholes.Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerColorCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerDebrisCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerGrainAngularityCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerGrainShapeCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerOrganicComponentCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerUscs3Codes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.LithologicalDescriptions)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.FaciesDescriptions)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.ChronostratigraphyLayers)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.LithostratigraphyLayers)
            .Include(b => b.Completions).ThenInclude(c => c.Casings).ThenInclude(c => c.CasingElements)
            .Include(b => b.Completions).ThenInclude(c => c.Instrumentations)
            .Include(b => b.Completions).ThenInclude(c => c.Backfills)
            .Include(b => b.Sections).ThenInclude(s => s.SectionElements)
            .Include(b => b.Observations)
            .Include(b => b.BoreholeCodelists)
            .Include(b => b.Workflows)
            .Include(b => b.BoreholeFiles)
            .Include(b => b.BoreholeGeometry)
            .Include(b => b.Workgroup)
            .Include(b => b.UpdatedBy);
    }

    /// <summary>
    /// Exports the details of up to 100 boreholes as a CSV file. Filters the boreholes based on the provided list of IDs.
    /// </summary>
    /// <param name="ids">The list of IDs for the boreholes to be exported.</param>
    /// <returns>A CSV file containing the details of up to 100 specified boreholes.</returns>
    [HttpGet("export-csv")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> DownloadCsv([FromQuery] IEnumerable<int> ids)
    {
        if (!ids.Any())
        {
            return BadRequest("The list of IDs must not be empty.");
        }

        Logger.LogInformation("Export borehole(s) with ids <{Ids}>.", string.Join(", ", ids));

        var boreholes = await Context.Boreholes
                                    .Where(borehole => ids.Contains(borehole.Id))
                                    .Take(100)
                                    .Select(b => new
                                    {
                                        b.Id,
                                        b.OriginalName,
                                        b.ProjectName,
                                        b.Name,
                                        b.RestrictionId,
                                        b.RestrictionUntil,
                                        b.NationalInterest,
                                        b.LocationX,
                                        b.LocationY,
                                        b.LocationPrecisionId,
                                        b.ElevationZ,
                                        b.ElevationPrecisionId,
                                        b.ReferenceElevation,
                                        b.ReferenceElevationTypeId,
                                        b.ReferenceElevationPrecisionId,
                                        b.HrsId,
                                        b.TypeId,
                                        b.PurposeId,
                                        b.StatusId,
                                        b.Remarks,
                                        b.TotalDepth,
                                        b.DepthPresicionId,
                                        b.TopBedrockFreshMd,
                                        b.TopBedrockWeatheredMd,
                                        b.HasGroundwater,
                                        b.LithologyTopBedrockId,
                                        b.ChronostratigraphyTopBedrockId,
                                        b.LithostratigraphyTopBedrockId,
                                    })
                                .ToListAsync()
                                .ConfigureAwait(false);

        var stream = new MemoryStream();
        using (var writer = new StreamWriter(stream, leaveOpen: true))
        using (var csvWriter = new CsvWriter(writer, CultureInfo.InvariantCulture))
        {
            csvWriter.WriteRecords(boreholes);
        }

        stream.Position = 0;

        return File(stream.ToArray(), "text/csv", "boreholes_export.csv");
    }

    /// <summary>
    /// Asynchronously copies a <see cref="Borehole"/>.
    /// </summary>
    /// <param name="id">The <see cref="Borehole.Id"/> of the borehole to copy.</param>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>.</param>
    /// <returns>The id of the newly created <see cref="Borehole"/>.</returns>
    [HttpPost("copy")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> CopyAsync([Required] int id, [Required] int workgroupId)
    {
        Logger.LogInformation("Copy borehole with id <{BoreholeId}> to workgroup with id <{WorkgroupId}>", id, workgroupId);

        var user = await Context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        if (user == null || user.WorkgroupRoles == null || !user.WorkgroupRoles.Any(w => w.WorkgroupId == workgroupId && w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        var borehole = await GetBoreholesWithIncludes()
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id)
            .ConfigureAwait(false);

        if (borehole == null)
        {
            return NotFound();
        }

        if (borehole.Observations != null)
        {
            // Include FieldMeasurementResults and HydrotestResults separately since Entity Framework does not support casting in an Include statement
            var fieldMeasurements = borehole.Observations.OfType<FieldMeasurement>().ToList();
#pragma warning disable CS8603
            // Cannot include null test for fieldMeasurementResults and hydrotestResults since they are not yet loaded
            // if there are no fieldMeasurementResults of hydrotestResults the LoadAsync method will be called but have no effect
            foreach (var fieldMeasurement in fieldMeasurements)
            {
                await Context.Entry(fieldMeasurement)
                    .Collection(f => f.FieldMeasurementResults)
                    .LoadAsync()
                    .ConfigureAwait(false);
            }

            var hydrotests = borehole.Observations.OfType<Hydrotest>().ToList();
            foreach (var hydrotest in hydrotests)
            {
                await Context.Entry(hydrotest)
                    .Collection(h => h.HydrotestResults)
                    .LoadAsync()
                    .ConfigureAwait(false);
            }
#pragma warning restore CS8603
        }

        // Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
        borehole.Id = 0;
        foreach (var stratigraphy in borehole.Stratigraphies)
        {
            stratigraphy.Id = 0;
            foreach (var layer in stratigraphy.Layers)
            {
                layer.Id = 0;
                layer.LayerColorCodes?.ResetLayerIds();
                layer.LayerDebrisCodes?.ResetLayerIds();
                layer.LayerGrainShapeCodes?.ResetLayerIds();
                layer.LayerGrainAngularityCodes?.ResetLayerIds();
                layer.LayerOrganicComponentCodes?.ResetLayerIds();
                layer.LayerUscs3Codes?.ResetLayerIds();
            }

            foreach (var lithologicalDescription in stratigraphy.LithologicalDescriptions)
            {
                lithologicalDescription.Id = 0;
            }

            foreach (var faciesDescription in stratigraphy.FaciesDescriptions)
            {
                faciesDescription.Id = 0;
            }

            foreach (var chronostratigraphy in stratigraphy.ChronostratigraphyLayers)
            {
                chronostratigraphy.Id = 0;
            }

            foreach (var lithostratigraphy in stratigraphy.LithostratigraphyLayers)
            {
                lithostratigraphy.Id = 0;
            }
        }

        foreach (var completion in borehole.Completions)
        {
            completion.Id = 0;
            foreach (var casing in completion.Casings)
            {
                casing.Id = 0;
                foreach (var casingElement in casing.CasingElements)
                {
                    casingElement.Id = 0;
                }
            }

            foreach (var instrumentation in completion.Instrumentations)
            {
                instrumentation.Id = 0;
            }

            foreach (var backfill in completion.Backfills)
            {
                backfill.Id = 0;
            }
        }

        foreach (var section in borehole.Sections)
        {
            section.Id = 0;
            foreach (var sectionElement in section.SectionElements)
            {
                sectionElement.Id = 0;
            }
        }

        foreach (var observation in borehole.Observations)
        {
            observation.Id = 0;
            if (observation is FieldMeasurement fieldMeasurement)
            {
                if (fieldMeasurement.FieldMeasurementResults != null)
                {
                    foreach (var fieldMeasurementResult in fieldMeasurement.FieldMeasurementResults)
                    {
                        fieldMeasurementResult.Id = 0;
                    }
                }
            }

            if (observation is Hydrotest hydrotest)
            {
                if (hydrotest.HydrotestResults != null)
                {
                    foreach (var hydrotestResult in hydrotest.HydrotestResults)
                    {
                        hydrotestResult.Id = 0;
                    }
                }
            }
        }

        foreach (var boreholeFile in borehole.BoreholeFiles)
        {
            boreholeFile.BoreholeId = 0;
        }

        foreach (var boreholeGeometry in borehole.BoreholeGeometry)
        {
            boreholeGeometry.Id = 0;
        }

        borehole.UpdatedBy = null;
        borehole.Workgroup = null;

        borehole.WorkgroupId = workgroupId;

        borehole.Workflows.Clear();
        borehole.Workflows.Add(new Workflow { Borehole = borehole, Role = Role.Editor, UserId = user.Id });

        borehole.OriginalName += " (Copy)";

        var entityEntry = await Context.AddAsync(borehole).ConfigureAwait(false);
        await Context.SaveChangesAsync().ConfigureAwait(false);

        return Ok(entityEntry.Entity.Id);
    }

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(Borehole entity)
    {
        if (entity == null) return default;
        return await Task.FromResult<int?>(entity.Id).ConfigureAwait(false);
    }
}
