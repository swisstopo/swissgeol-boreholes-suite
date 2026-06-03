using BDMS.Authentication;
using BDMS.Models;
using BDMS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class StratigraphyController : BoreholeControllerBase<Stratigraphy>
{
    private readonly ILithologyTabContentService lithologyTabContentService;

    public StratigraphyController(BdmsContext context, ILogger<StratigraphyController> logger, IBoreholePermissionService boreholePermissionService, ILithologyTabContentService lithologyTabContentService)
        : base(context, logger, boreholePermissionService)
    {
        this.lithologyTabContentService = lithologyTabContentService;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Stratigraphy"/>s, filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole containing the stratigraphies to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Stratigraphy>>> GetAsync([FromQuery] int boreholeId)
    {
        var borehole = await Context.Boreholes
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == boreholeId)
            .ConfigureAwait(false);

        if (borehole == null)
        {
            return NotFound();
        }

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var stratigraphies = await Context.Stratigraphies
            .AsNoTracking()
            .Where(x => x.BoreholeId == boreholeId)
            .ToListAsync()
            .ConfigureAwait(false);

        return Ok(stratigraphies);
    }

    /// <summary>
    /// Asynchronously gets the full contents of the Lithology tab for the given <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy whose lithology tab contents to get.</param>
    [HttpGet("{stratigraphyId:int}/lithology")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<LithologyTabContents>> GetLithologyContentsAsync(int stratigraphyId)
    {
        var stratigraphy = await Context.Stratigraphies
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == stratigraphyId)
            .ConfigureAwait(false);

        if (stratigraphy == null) return NotFound();

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false)) return Unauthorized();

        return Ok(await lithologyTabContentService.LoadContentAsync(stratigraphyId).ConfigureAwait(false));
    }

    /// <summary>
    /// Asynchronously copies a <see cref="Stratigraphy"/>.
    /// </summary>
    /// <param name="id">The <see cref="Stratigraphy.Id"/> of the stratigraphy to copy.</param>
    /// <returns>The id of the newly created <see cref="Stratigraphy"/>.</returns>
    [HttpPost("copy")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> CopyAsync([Required] int id)
    {
        try
        {
            var stratigraphy = await Context.StratigraphiesWithIncludes
                .AsNoTracking()
                .SingleOrDefaultAsync(b => b.Id == id)
                .ConfigureAwait(false);

            if (stratigraphy == null)
            {
                return NotFound();
            }

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            // Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
            stratigraphy.Id = 0;
            stratigraphy.Name = string.IsNullOrEmpty(stratigraphy.Name) ? "(Clone)" : $"{stratigraphy.Name} (Clone)";
            stratigraphy.IsPrimary = false;

            foreach (var lithology in stratigraphy.Lithologies)
            {
                lithology.Id = 0;
                lithology.LithologyRockConditionCodes?.ResetLithologyIds();
                lithology.LithologyUscsTypeCodes?.ResetLithologyIds();
                lithology.LithologyTextureMetaCodes?.ResetLithologyIds();

                foreach (var description in lithology.LithologyDescriptions)
                {
                    description.Id = 0;
                    description.LithologyDescriptionComponentUnconOrganicCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionComponentUnconDebrisCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionGrainShapeCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionGrainAngularityCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionLithologyUnconDebrisCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionComponentConParticleCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionComponentConMineralCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionStructureSynGenCodes?.ResetLithologyDescriptionIds();
                    description.LithologyDescriptionStructurePostGenCodes?.ResetLithologyDescriptionIds();
                }
            }

            stratigraphy.LithologicalDescriptions?.MarkAsNew();
            stratigraphy.FaciesDescriptions?.MarkAsNew();
            stratigraphy.ChronostratigraphyLayers?.MarkAsNew();
            stratigraphy.LithostratigraphyLayers?.MarkAsNew();

            var entityEntry = await Context.AddAsync(stratigraphy).ConfigureAwait(false);
            await Context.SaveChangesAsync().ConfigureAwait(false);

            return Ok(entityEntry.Entity.Id);
        }
        catch (Exception ex)
        {
            var message = "An error occurred while copying the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        try
        {
            var stratigraphyToDelete = await Context.Stratigraphies.FindAsync(id).ConfigureAwait(false);
            if (stratigraphyToDelete == null)
            {
                return NotFound();
            }

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphyToDelete.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            var existingStratigraphyCount = await Context.Stratigraphies
                .CountAsync(s => s.BoreholeId == stratigraphyToDelete.BoreholeId)
                .ConfigureAwait(false);

            if (existingStratigraphyCount > 1 && stratigraphyToDelete.IsPrimary)
            {
                return Problem("Main stratigraphy cannot be deleted.");
            }

            Context.Remove(stratigraphyToDelete);
            await Context.SaveChangesAsync().ConfigureAwait(false);

            return Ok();
        }
        catch (Exception ex)
        {
            var message = "An error occurred while deleting the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Asynchronously creates one or more <see cref="Stratigraphy"/> entries, each together with the
    /// contents of one of its tabs (currently only the Lithology tab is implemented). Used both by the
    /// "add stratigraphy" action (a single header-only edit) and by the extraction modal that bulk-adds
    /// 1–n stratigraphies with their lithology contents. All edits must target the same borehole. Name
    /// conflicts within the borehole are resolved server-side by appending " (N)" suffixes.
    /// </summary>
    /// <param name="edits">The stratigraphies (with optional tab content) to create.</param>
    /// <param name="resolveNameConflicts">
    /// When <c>true</c> (used by the extraction bulk-add) duplicate names are made unique server-side by
    /// appending " (N)". When <c>false</c> (the default, used by the manual "add stratigraphy" action) a
    /// duplicate name is rejected with a <c>mustBeUnique</c> error instead.
    /// </param>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Collection<StratigraphyTabEdit>>> CreateStratigraphiesAsync([Required, MinLength(1)] Collection<StratigraphyTabEdit> edits, [FromQuery] bool resolveNameConflicts = false)
    {
        if (!TryGetSingleBoreholeId(edits, out var boreholeId))
        {
            return BadRequest("All stratigraphies must belong to the same borehole.");
        }

        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        try
        {
            var takenNames = await LoadTakenStratigraphyNamesAsync(boreholeId).ConfigureAwait(false);

            // TODO: Decide on how to handle name conflicts from imports, extractions and manual inputs
            if (!resolveNameConflicts && HasDuplicateName(edits, takenNames))
            {
                return NameMustBeUniqueProblem();
            }

            var hasDesignatedPrimary = await StageEditsForCreateAsync(edits, takenNames, resolveNameConflicts).ConfigureAwait(false);
            if (hasDesignatedPrimary)
            {
                await DemotePriorPrimariesAsync(boreholeId).ConfigureAwait(false);
            }

            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

            var responses = new Collection<StratigraphyTabEdit>();
            foreach (var edit in edits)
            {
                responses.Add(await BuildResponseAsync(edit.Stratigraphy.Id).ConfigureAwait(false));
            }

            return Ok(responses);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            const string message = "An error ocurred while creating the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Asynchronously updates a <see cref="Stratigraphy"/> header together with the contents of one of
    /// its tabs (currently only the Lithology tab is implemented). The whole edit is persisted in a
    /// single transaction.
    /// </summary>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<StratigraphyTabEdit>> EditStratigraphyAsync([Required] StratigraphyTabEdit edit)
    {
        var entity = edit.Stratigraphy;

        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), entity.BoreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        // TODO: Decide on how to handle name conflicts from imports, extractions and manual inputs
        if (!await IsNameUnique(entity).ConfigureAwait(false))
        {
            return NameMustBeUniqueProblem();
        }

        var existingStratigraphy = await Context.Stratigraphies.FindAsync(entity.Id).ConfigureAwait(false);
        if (existingStratigraphy == null) return NotFound();

        if (edit.LithologyTab != null && !lithologyTabContentService.ValidateChildStratigraphyIds(edit.LithologyTab, entity.Id, out var validationError))
        {
            return BadRequest(validationError);
        }

        try
        {
            entity.Date = entity.Date != null ? DateTime.SpecifyKind(entity.Date.Value, DateTimeKind.Utc) : null;
            Context.Entry(existingStratigraphy).CurrentValues.SetValues(entity);

            if (edit.LithologyTab != null)
            {
                await lithologyTabContentService.SyncContentAsync(entity.Id, edit.LithologyTab).ConfigureAwait(false);
            }

            if (entity.IsPrimary)
            {
                await StageOtherPrimaryStratigraphiesResetAsync(entity).ConfigureAwait(false);
            }

            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

            return Ok(await BuildResponseAsync(entity.Id).ConfigureAwait(false));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            const string message = "An error ocurred while editing the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// The base create action is replaced by <see cref="CreateStratigraphiesAsync"/>, which accepts the
    /// combined stratigraphy + tab-content payload.
    /// </summary>
    [NonAction]
    public override Task<ActionResult<Stratigraphy>> CreateAsync(Stratigraphy entity)
        => throw new NotSupportedException("Use the combined create endpoint that accepts stratigraphy tab edits.");

    /// <summary>
    /// The base edit action is replaced by <see cref="EditStratigraphyAsync"/>, which accepts the
    /// combined stratigraphy + tab-content payload.
    /// </summary>
    [NonAction]
    public override Task<ActionResult<Stratigraphy>> EditAsync(Stratigraphy entity)
        => throw new NotSupportedException("Use the combined update endpoint that accepts a stratigraphy tab edit.");

    /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(Stratigraphy entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }

    private static bool TryGetSingleBoreholeId(Collection<StratigraphyTabEdit> edits, out int boreholeId)
    {
        var boreholeIds = edits.Select(e => e.Stratigraphy?.BoreholeId ?? 0).Distinct().ToList();
        boreholeId = boreholeIds.Count == 1 ? boreholeIds[0] : 0;
        return boreholeId != 0;
    }

    private async Task<HashSet<string>> LoadTakenStratigraphyNamesAsync(int boreholeId)
    {
        var existingStratigraphyNames = await Context.Stratigraphies
            .Where(s => s.BoreholeId == boreholeId)
            .Select(s => s.Name)
            .ToListAsync()
            .ConfigureAwait(false);

        return existingStratigraphyNames.OfType<string>().ToHashSet(StringComparer.Ordinal);
    }

    private static bool HasDuplicateName(Collection<StratigraphyTabEdit> edits, HashSet<string> takenNames)
    {
        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (var edit in edits)
        {
            var name = edit.Stratigraphy.Name;
            if (string.IsNullOrEmpty(name)) continue;
            if (takenNames.Contains(name) || !seen.Add(name)) return true;
        }

        return false;
    }

    private async Task<bool> StageEditsForCreateAsync(Collection<StratigraphyTabEdit> edits, HashSet<string> takenNames, bool resolveNameConflicts)
    {
        var isFirstStratigraphy = takenNames.Count == 0;
        var hasDesignatedPrimary = false;
        foreach (var edit in edits)
        {
            var becomesPrimary = !hasDesignatedPrimary && (edit.Stratigraphy.IsPrimary || isFirstStratigraphy);
            await StageEditForCreateAsync(edit, takenNames, becomesPrimary, resolveNameConflicts).ConfigureAwait(false);
            hasDesignatedPrimary |= becomesPrimary;
        }

        return hasDesignatedPrimary;
    }

    private async Task StageEditForCreateAsync(StratigraphyTabEdit edit, HashSet<string> takenNames, bool becomesPrimary, bool resolveNameConflicts)
    {
        var stratigraphy = edit.Stratigraphy;
        stratigraphy.Id = 0;

        if (resolveNameConflicts) ApplyUniqueName(stratigraphy, takenNames);
        if (!string.IsNullOrEmpty(stratigraphy.Name)) takenNames.Add(stratigraphy.Name);

        // First-ever stratigraphy on the borehole auto-promotes to primary; an explicit
        // IsPrimary=true on any edit wins and demotes everything else (in-batch + DB).
        stratigraphy.IsPrimary = becomesPrimary;

        // Strip stratigraphy-level navigation collections that aren't part of this endpoint.
        stratigraphy.ChronostratigraphyLayers = null;
        stratigraphy.LithostratigraphyLayers = null;

        if (edit.LithologyTab != null)
        {
            // Attach the lithology tab's child collections so a single AddAsync cascades the subgraph.
            await lithologyTabContentService.StageContentForCreateAsync(stratigraphy, edit.LithologyTab).ConfigureAwait(false);
        }
        else
        {
            stratigraphy.Lithologies = null;
            stratigraphy.LithologicalDescriptions = null;
            stratigraphy.FaciesDescriptions = null;
        }

        await Context.AddAsync(stratigraphy).ConfigureAwait(false);
    }

    private async Task DemotePriorPrimariesAsync(int boreholeId)
    {
        var priorPrimaries = await Context.Stratigraphies
            .Where(s => s.BoreholeId == boreholeId && s.IsPrimary && s.Id != 0)
            .ToListAsync()
            .ConfigureAwait(false);
        foreach (var prior in priorPrimaries)
        {
            prior.IsPrimary = false;
        }
    }

    private static void ApplyUniqueName(Stratigraphy stratigraphy, HashSet<string> takenNames)
    {
        if (string.IsNullOrEmpty(stratigraphy.Name)) return;

        const int maxAttempts = 100;
        var baseName = stratigraphy.Name;
        var attempt = 0;
        while (takenNames.Contains(stratigraphy.Name))
        {
            attempt++;
            if (attempt > maxAttempts)
            {
                throw new InvalidOperationException($"Could not find a unique name based on '{baseName}' within {maxAttempts} attempts.");
            }

            stratigraphy.Name = $"{baseName} ({attempt})";
        }
    }

    private async Task<StratigraphyTabEdit> BuildResponseAsync(int stratigraphyId)
    {
        var stratigraphy = await Context.Stratigraphies
            .AsNoTracking()
            .SingleAsync(s => s.Id == stratigraphyId)
            .ConfigureAwait(false);

        var contents = await lithologyTabContentService.LoadContentAsync(stratigraphyId).ConfigureAwait(false);

        return new StratigraphyTabEdit
        {
            Stratigraphy = stratigraphy,
            LithologyTab = contents,
        };
    }

    private async Task StageOtherPrimaryStratigraphiesResetAsync(Stratigraphy entity)
    {
        var otherPrimaryStratigraphies = await Context.Stratigraphies
            .Where(s => s.BoreholeId == entity.BoreholeId && s.IsPrimary && s.Id != entity.Id)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var other in otherPrimaryStratigraphies)
        {
            other.IsPrimary = false;
            Context.Update(other);
        }
    }

    private ObjectResult NameMustBeUniqueProblem()
    {
        var result = Problem(detail: "Name must be unique", type: ProblemType.UserError);
        ((ProblemDetails)result.Value!).Extensions["messageKey"] = "mustBeUnique";
        return result;
    }

    private async Task<bool> IsNameUnique(Stratigraphy entity)
    {
        if (string.IsNullOrEmpty(entity.Name))
        {
            return true;
        }

        var hasBoreholeStratigraphiesWithSameName = await Context.Stratigraphies
                .AnyAsync(s => s.BoreholeId == entity.BoreholeId && s.Id != entity.Id && s.Name == entity.Name)
                .ConfigureAwait(false);

        return !hasBoreholeStratigraphiesWithSameName;
    }
}
