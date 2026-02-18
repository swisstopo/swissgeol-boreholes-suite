using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;

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

    public BoreholeController(BdmsContext context, ILogger<BoreholeController> logger, IBoreholePermissionService boreholePermissionService)
    : base(context, logger, boreholePermissionService)
    {
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public async override Task<ActionResult<Borehole>> CreateAsync(Borehole entity)
    {
        entity.Workflow = new Workflow
        {
            ReviewedTabs = new(),
            PublishedTabs = new(),
        };

        var subjectId = HttpContext.GetUserSubjectId();

        if (!await BoreholePermissionService.HasUserRoleOnWorkgroupAsync(subjectId, entity.WorkgroupId, Role.Editor).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        if (entity.Id > 0)
        {
            var errorMessage = "You cannot create a new borehole with a defined Id.";
            Logger?.LogError(errorMessage);
            return Problem(errorMessage);
        }

        await Context.AddAsync(entity).ConfigureAwait(false);
        try
        {
            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return Ok(entity);
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the entity changes.";
            Logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
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
            .Include(b => b.Workflow)
            .SingleOrDefaultAsync(l => l.Id == entity.Id)
            .ConfigureAwait(false);

        if (existingBorehole == null)
        {
            return NotFound();
        }

        // Check if associated borehole is locked or user has permissions
        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), existingBorehole.Id).ConfigureAwait(false)) return Unauthorized();

        var workflow = existingBorehole.Workflow;
        Context.Entry(existingBorehole).CurrentValues.SetValues(entity);

        // Ensure that the borehole has a workflow
        existingBorehole.Workflow = workflow ?? new Workflow
        {
            ReviewedTabs = new(),
            PublishedTabs = new(),
        };

        // Update the geometry if new coordinates are provided
        if (entity.LocationX.HasValue && entity.LocationY.HasValue)
        {
            existingBorehole.Geometry = new Point(entity.LocationX.Value, entity.LocationY.Value) { SRID = SpatialReferenceConstants.SridLv95 };
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
        var user = await Context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        var boreholes = Context.BoreholesWithIncludes.AsNoTracking();

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            boreholes = boreholes.Where(b => b.WorkgroupId.HasValue && allowedWorkgroupIds.Contains(b.WorkgroupId.Value));
        }

        pageSize = Math.Min(MaxPageSize, Math.Max(1, pageSize));

        var skip = (pageNumber - 1) * pageSize;

        if (ids != null && ids.Any())
        {
            boreholes = boreholes.Where(borehole => ids.Contains(borehole.Id));
        }

        var totalCount = await boreholes.CountAsync().ConfigureAwait(false);
        var paginatedBoreholes = await boreholes.Skip(skip).Take(pageSize).ToListAsync().ConfigureAwait(false);
        var paginatedResponse = new PaginatedBoreholeResponse(totalCount, pageNumber, pageSize, MaxPageSize, paginatedBoreholes);

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
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), id).ConfigureAwait(false)) return Unauthorized();

        var borehole = await Context.BoreholesWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (borehole == null)
        {
            return NotFound();
        }

        return Ok(borehole);
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

        var user = await Context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        if (user == null || user.WorkgroupRoles == null || !user.WorkgroupRoles.Any(w => w.WorkgroupId == workgroupId && w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        var borehole = await Context.BoreholesWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id)
            .ConfigureAwait(false);

        if (borehole == null) return NotFound();

        borehole.MarkBoreholeContentAsNew(user, workgroupId);

        // Do not copy borehole attachments
        borehole.Profiles.Clear();
        borehole.Photos.Clear();

        borehole.OriginalName += " (Copy)";
        borehole.Name += " (Copy)";

        // Do not copy borehole locked status
        borehole.Locked = null;
        borehole.LockedById = null;
        borehole.LockedBy = null;

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
