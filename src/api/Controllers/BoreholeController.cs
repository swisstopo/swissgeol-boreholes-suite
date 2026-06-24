using BDMS.Authentication;
using BDMS.Models;
using BDMS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BoreholeController : BoreholeControllerBase<Borehole>
{
    private readonly IFilterService filterService;

    public BoreholeController(BdmsContext context, ILogger<BoreholeController> logger, IBoreholePermissionService boreholePermissionService, IFilterService filterService)
    : base(context, logger, boreholePermissionService)
    {
        this.filterService = filterService;
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

        if (!await CanEditInWorkgroupAsync(subjectId, entity.WorkgroupId).ConfigureAwait(false))
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

        var subjectId = HttpContext.GetUserSubjectId();

        // Check if associated borehole is locked or user has permissions
        if (!await BoreholePermissionService.CanEditBoreholeAsync(subjectId, existingBorehole.Id).ConfigureAwait(false)) return Unauthorized();

        // Moving the borehole to another workgroup additionally requires edit rights on the TARGET workgroup.
        if (entity.WorkgroupId != existingBorehole.WorkgroupId
            && !await CanEditInWorkgroupAsync(subjectId, entity.WorkgroupId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

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
            existingBorehole.Geometry = new Point(entity.LocationX.Value, entity.LocationY.Value) { SRID = SpatialReferenceIdentifier.LV95 };
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
    /// Asynchronously applies the same set of field changes to multiple boreholes.
    /// Only the properties named in <see cref="BoreholeBulkUpdateRequest.FieldsToUpdate"/> are written.
    /// The whole batch is rejected (nothing is saved) if the current user cannot edit any selected borehole.
    /// Resets the workflow tab status of any tab whose fields were changed.
    /// </summary>
    /// <param name="request">The boreholes to edit, the values to apply, and the field mask.</param>
    [HttpPost("bulkedit")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> BulkEditAsync([FromBody] BoreholeBulkUpdateRequest request)
    {
        var unknownFields = request.FieldsToUpdate.Where(f => !BulkEditableFields.Contains(f)).ToList();
        if (unknownFields.Count > 0)
        {
            return BadRequest($"Unknown bulk edit field(s): {string.Join(", ", unknownFields)}.");
        }

        var subjectId = HttpContext.GetUserSubjectId();

        // Reassigning the workgroup requires edit rights on the TARGET workgroup, matching CreateAsync and
        // CopyAsync. Without this check a user could move boreholes into a workgroup they have no role on.
        if (request.FieldsToUpdate.Any(f => string.Equals(f, "workgroupId", StringComparison.OrdinalIgnoreCase)))
        {
            if (request.Update.WorkgroupId == null)
            {
                return BadRequest("A target workgroup is required when 'workgroupId' is updated.");
            }

            if (!await CanEditInWorkgroupAsync(subjectId, request.Update.WorkgroupId.Value).ConfigureAwait(false))
            {
                return ForbiddenUserError(
                    "You are not authorized to move boreholes into the selected workgroup.",
                    "bulkEditUnauthorizedWorkgroup");
            }
        }

        var unauthorizedBoreholeIds = await BoreholePermissionService
            .GetBoreholeIdsUserCannotEditAsync(subjectId, request.BoreholeIds)
            .ConfigureAwait(false);

        if (unauthorizedBoreholeIds.Count > 0)
        {
            return UnauthorizedBoreholesProblem(unauthorizedBoreholeIds, "bulkEditUnauthorizedBoreholes");
        }

        var boreholes = await Context.Boreholes
            .Include(b => b.Workflow).ThenInclude(w => w.ReviewedTabs)
            .Include(b => b.Workflow).ThenInclude(w => w.PublishedTabs)
            .Where(b => request.BoreholeIds.Contains(b.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        var resetLocationTab = request.FieldsToUpdate.Any(f => LocationTabFields.Contains(f));
        var resetGeneralTab = request.FieldsToUpdate.Any(f => GeneralTabFields.Contains(f));

        foreach (var borehole in boreholes)
        {
            foreach (var field in request.FieldsToUpdate)
            {
                ApplyBulkEditField(borehole, request.Update, field);
            }

            ResetAffectedTabs(borehole, resetLocationTab, resetGeneralTab);
        }

        try
        {
            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return Ok(request.BoreholeIds);
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the bulk edit changes.";
            Logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
    }

    /// <summary>
    /// Filters boreholes based on the provided criteria.
    /// </summary>
    /// <param name="filterRequest">The filter request with filtering criteria.</param>
    /// <returns>A paginated response with filtered boreholes, GeoJSON for map display, and all filtered IDs.</returns>
    [HttpPost("filter")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public Task<ActionResult<FilterResponse>> FilterAsync([FromBody] FilterRequest filterRequest) =>
        ExecuteAsAuthenticatedUserAsync("filtering boreholes", user => filterService.FilterBoreholesAsync(filterRequest, user));

    /// <summary>
    /// Computes per-option filter counts under the active filter request,
    /// using filter-exclusion semantics so each dimension's counts predict what
    /// adding that option would yield.
    /// </summary>
    /// <param name="filterRequest">The active filter request; may be null to compute unconstrained counts.</param>
    /// <returns>A <see cref="FilterStatsResponse"/> with counts for every filterable dimension.</returns>
    [HttpPost("filter/stats")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public Task<ActionResult<FilterStatsResponse>> FilterStatsAsync([FromBody] FilterRequest? filterRequest) =>
        ExecuteAsAuthenticatedUserAsync("computing filter stats", user => filterService.GetFilterStatsAsync(filterRequest, user));

    /// <summary>
    /// Returns autocomplete suggestions for a borehole text column. When a
    /// <paramref name="filterRequest"/> is supplied, suggestions are restricted to boreholes
    /// matching every active filter except the filter on the field being autocompleted, so the
    /// user can refine that field's value (filter-exclusion on the self-field).
    /// </summary>
    /// <param name="field">The borehole column to search (originalName, projectName, or name).</param>
    /// <param name="query">The prefix string to match against; must be at least 2 characters.</param>
    /// <param name="limit">Maximum number of suggestions to return (1–50, default 10).</param>
    /// <param name="filterRequest">The active filter request body; may be null/empty to compute suggestions over all boreholes the caller can see.</param>
    /// <returns>A list of <see cref="BoreholeSuggestion"/> ordered by frequency then value.</returns>
    [HttpPost("suggest")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IList<BoreholeSuggestion>>> SuggestAsync(
        [FromQuery] BoreholeSuggestionField field,
        [FromQuery] string? query,
        [FromQuery] int limit = 10,
        [FromBody] FilterRequest? filterRequest = null)
    {
        const int minQueryLength = 1;
        const int maxLimit = 50;

        if (string.IsNullOrWhiteSpace(query) || query.Length < minQueryLength)
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Invalid query", detail: $"'query' must be at least {minQueryLength} characters.");
        }

        if (limit < 1 || limit > maxLimit)
        {
            return Problem(statusCode: StatusCodes.Status400BadRequest, title: "Invalid limit", detail: $"'limit' must be between 1 and {maxLimit}.");
        }

        return await ExecuteAsAuthenticatedUserAsync(
            "computing borehole suggestions",
            user => filterService.GetSuggestionsAsync(field, query!, limit, filterRequest, user)).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Borehole"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of borehole to get.</param>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Borehole>> GetByIdAsync(int id)
    {
        var borehole = await Context.BoreholesWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (borehole is null)
        {
            return NotFound();
        }

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), id).ConfigureAwait(false)) return Unauthorized();

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

        var subjectId = HttpContext.GetUserSubjectId();

        var user = await Context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == subjectId)
            .ConfigureAwait(false);

        if (user == null || !await CanEditInWorkgroupAsync(subjectId, workgroupId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        var workgroupExists = await Context.Workgroups
            .AsNoTracking()
            .AnyAsync(w => w.Id == workgroupId)
            .ConfigureAwait(false);

        if (!workgroupExists)
        {
            return NotFound($"Workgroup with id {workgroupId} not found.");
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

    /// <summary>
    /// Asynchronously deletes the <see cref="Borehole"/> with the specified <paramref name="id"/>.
    /// Permission is checked via <see cref="IBoreholePermissionService.CanChangeBoreholeStatusAsync"/>,
    /// so admins can delete a borehole regardless of whether it is locked by another user or already in
    /// Reviewed/Published status.
    /// </summary>
    /// <param name="id">The id of the borehole to delete.</param>
    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async override Task<IActionResult> DeleteAsync(int id)
    {
        var borehole = await Context.Boreholes
            .SingleOrDefaultAsync(b => b.Id == id)
            .ConfigureAwait(false);

        if (borehole == null)
        {
            return NotFound();
        }

        if (!await BoreholePermissionService.CanChangeBoreholeStatusAsync(HttpContext.GetUserSubjectId(), borehole.Id).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        Context.Remove(borehole);

        try
        {
            await Context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the entity changes.";
            Logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
    }

    /// <summary>
    /// Asynchronously deletes multiple boreholes. The whole batch is rejected (nothing is deleted) if the
    /// current user is not allowed to delete any of the selected boreholes. Uses the same permission check
    /// as the single-borehole delete (<see cref="IBoreholePermissionService.CanChangeBoreholeStatusAsync"/>).
    /// </summary>
    /// <param name="boreholeIds">The ids of the boreholes to delete.</param>
    [HttpPost("bulkdelete")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> BulkDeleteAsync([FromBody][Required][MinLength(1)] Collection<int> boreholeIds)
    {
        var distinctIds = boreholeIds.Distinct().ToList();
        var subjectId = HttpContext.GetUserSubjectId();

        var unauthorizedBoreholeIds = await BoreholePermissionService
            .GetBoreholeIdsUserCannotChangeStatusAsync(subjectId, distinctIds)
            .ConfigureAwait(false);

        if (unauthorizedBoreholeIds.Count > 0)
        {
            return UnauthorizedBoreholesProblem(unauthorizedBoreholeIds, "bulkDeleteUnauthorizedBoreholes");
        }

        var boreholes = await Context.Boreholes
            .Where(b => distinctIds.Contains(b.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        Context.Boreholes.RemoveRange(boreholes);

        try
        {
            await Context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while deleting the boreholes.";
            Logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
    }

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(Borehole entity)
    {
        if (entity == null) return default;
        return await Task.FromResult<int?>(entity.Id).ConfigureAwait(false);
    }

    private async Task<ActionResult<T>> ExecuteAsAuthenticatedUserAsync<T>(string operationDescription, Func<User, Task<T>> operation)
    {
        try
        {
            var subjectId = HttpContext.GetUserSubjectId();
            var user = await Context.UsersWithIncludes
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.SubjectId == subjectId)
                .ConfigureAwait(false);

            if (user == null) return Unauthorized($"No user with subject_id <{subjectId}> found.");

            var result = await operation(user).ConfigureAwait(false);
            return Ok(result);
        }
        catch (Exception ex)
        {
            Logger.LogWarning(ex, "Unexpected error {Operation}", operationDescription);
            return Problem($"An unexpected error occurred while {operationDescription}.");
        }
    }

    /// <summary>
    /// Returns whether the current user holds the <see cref="Role.Editor"/> role on the given workgroup.
    /// This is the gate for placing or moving a borehole into a workgroup, shared by create, copy, edit and bulk edit.
    /// </summary>
    private Task<bool> CanEditInWorkgroupAsync(string? subjectId, int? workgroupId)
        => BoreholePermissionService.HasUserRoleOnWorkgroupAsync(subjectId, workgroupId, Role.Editor);

    /// <summary>
    /// Builds a <see cref="ProblemType.UserError"/> response (HTTP 403) listing the boreholes the current user
    /// is not allowed to operate on, so the client can show them. Shared by bulk edit and bulk delete; the
    /// caller supplies the i18n <paramref name="messageKey"/>. Mirrors the <c>conflictingNames</c> pattern.
    /// </summary>
    private ObjectResult UnauthorizedBoreholesProblem(IReadOnlyList<int> unauthorizedBoreholeIds, string messageKey)
    {
        var result = ForbiddenUserError("You are not authorized to perform this action on some of the selected boreholes.", messageKey);
        ((ProblemDetails)result.Value!).Extensions["unauthorizedBoreholeIds"] = unauthorizedBoreholeIds;
        return result;
    }

    /// <summary>
    /// Builds a <see cref="ProblemType.UserError"/> response (HTTP 403) carrying an i18n <paramref name="messageKey"/>,
    /// so the client can show a tailored message instead of the generic error handler.
    /// </summary>
    private ObjectResult ForbiddenUserError(string detail, string messageKey)
    {
        var result = Problem(
            detail: detail,
            statusCode: StatusCodes.Status403Forbidden,
            type: ProblemType.UserError);
        ((ProblemDetails)result.Value!).Extensions["messageKey"] = messageKey;
        return result;
    }

    private static readonly HashSet<string> LocationTabFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "locationPrecisionId", "elevationPrecisionId", "referenceElevationPrecisionId", "referenceElevationTypeId",
    };

    private static readonly HashSet<string> GeneralTabFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "restrictionId", "restrictionUntil", "nationalInterest", "projectName", "typeId", "purposeId", "statusId",
        "depthPrecisionId", "totalDepth", "topBedrockFreshMd", "topBedrockWeatheredMd", "hasGroundwater",
        "lithologyTopBedrockId", "lithostratigraphyTopBedrockId", "chronostratigraphyTopBedrockId",
    };

    // All fields that may be bulk-edited: the union of the tab field sets plus workgroupId
    // (workgroupId is editable but is not shown on any reviewable tab, so it is not in either tab set).
    private static readonly HashSet<string> BulkEditableFields = new(
        LocationTabFields.Concat(GeneralTabFields).Append("workgroupId"),
        StringComparer.OrdinalIgnoreCase);

    private static void ResetAffectedTabs(Borehole borehole, bool resetLocation, bool resetGeneral)
    {
        if (borehole.Workflow == null)
        {
            return;
        }

        if (resetLocation)
        {
            borehole.Workflow.ReviewedTabs.Location = false;
            borehole.Workflow.PublishedTabs.Location = false;
        }

        if (resetGeneral)
        {
            borehole.Workflow.ReviewedTabs.General = false;
            borehole.Workflow.PublishedTabs.General = false;
        }
    }

    private static void ApplyBulkEditField(Borehole borehole, BoreholeBulkUpdate update, string field)
    {
        // Case labels are the ToUpperInvariant() of the camelCase field names (CA1308 requires
        // ToUpperInvariant over ToLowerInvariant). Keep them in sync with BulkEditableFields.
        switch (field.ToUpperInvariant())
        {
            case "WORKGROUPID": borehole.WorkgroupId = update.WorkgroupId; break;
            case "RESTRICTIONID": borehole.RestrictionId = update.RestrictionId; break;
            case "RESTRICTIONUNTIL": borehole.RestrictionUntil = update.RestrictionUntil; break;
            case "NATIONALINTEREST": borehole.NationalInterest = update.NationalInterest; break;
            case "PROJECTNAME": borehole.ProjectName = update.ProjectName; break;
            case "TYPEID": borehole.TypeId = update.TypeId; break;
            case "PURPOSEID": borehole.PurposeId = update.PurposeId; break;
            case "STATUSID": borehole.StatusId = update.StatusId; break;
            case "LOCATIONPRECISIONID": borehole.LocationPrecisionId = update.LocationPrecisionId; break;
            case "ELEVATIONPRECISIONID": borehole.ElevationPrecisionId = update.ElevationPrecisionId; break;
            case "REFERENCEELEVATIONPRECISIONID": borehole.ReferenceElevationPrecisionId = update.ReferenceElevationPrecisionId; break;
            case "REFERENCEELEVATIONTYPEID": borehole.ReferenceElevationTypeId = update.ReferenceElevationTypeId; break;
            case "DEPTHPRECISIONID": borehole.DepthPrecisionId = update.DepthPrecisionId; break;
            case "TOTALDEPTH": borehole.TotalDepth = update.TotalDepth; break;
            case "TOPBEDROCKFRESHMD": borehole.TopBedrockFreshMd = update.TopBedrockFreshMd; break;
            case "TOPBEDROCKWEATHEREDMD": borehole.TopBedrockWeatheredMd = update.TopBedrockWeatheredMd; break;
            case "HASGROUNDWATER": borehole.HasGroundwater = update.HasGroundwater; break;
            case "LITHOLOGYTOPBEDROCKID": borehole.LithologyTopBedrockId = update.LithologyTopBedrockId; break;
            case "LITHOSTRATIGRAPHYTOPBEDROCKID": borehole.LithostratigraphyTopBedrockId = update.LithostratigraphyTopBedrockId; break;
            case "CHRONOSTRATIGRAPHYTOPBEDROCKID": borehole.ChronostratigraphyTopBedrockId = update.ChronostratigraphyTopBedrockId; break;
            default: throw new InvalidOperationException($"Unhandled bulk edit field '{field}'.");
        }
    }
}
