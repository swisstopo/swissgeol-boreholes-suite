using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

/// <summary>
/// Endpoints for the Lithology tab of a stratigraphy: the tab owns three sibling collections
/// (<see cref="Lithology"/>, <see cref="LithologicalDescription"/> and <see cref="FaciesDescription"/>)
/// that are loaded and persisted together so a single transactional save covers them.
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LithologyController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger<LithologyController> logger;
    private readonly IBoreholePermissionService boreholePermissionService;

    public LithologyController(BdmsContext context, ILogger<LithologyController> logger, IBoreholePermissionService boreholePermissionService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Gets the full contents of the Lithology tab for the given <paramref name="stratigraphyId"/>.
    /// </summary>
    [HttpGet("{stratigraphyId:int}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<LithologyTabContents>> GetByStratigraphyIdAsync(int stratigraphyId)
    {
        var stratigraphy = await context.Stratigraphies
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == stratigraphyId)
            .ConfigureAwait(false);

        if (stratigraphy == null) return NotFound();

        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        return Ok(await LoadTabContentsAsync(stratigraphyId).ConfigureAwait(false));
    }

    /// <summary>
    /// Creates one or more new <see cref="Stratigraphy"/> entries together with their full Lithology
    /// tab contents. Used by the extraction modal that bulk-adds 1–n stratigraphies extracted from a
    /// profile. All stratigraphies must belong to the same borehole. Name conflicts within the borehole
    /// are resolved server-side by appending " (N)" suffixes so the client can submit naive names like
    /// "report_1", "report_2", ... and let the server disambiguate.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Collection<StratigraphyWithLithology>>> CreateAsync([Required, MinLength(1)] Collection<StratigraphyWithLithology> stratigraphies)
    {
        if (!TryGetSingleBoreholeId(stratigraphies, out var boreholeId))
        {
            return BadRequest("All stratigraphies must belong to the same borehole.");
        }

        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        try
        {
            var takenNames = await LoadTakenStratigraphyNamesAsync(boreholeId).ConfigureAwait(false);
            var hasDesignatedPrimary = await StageStratigraphiesForCreateAsync(stratigraphies, takenNames).ConfigureAwait(false);
            if (hasDesignatedPrimary)
            {
                await DemotePriorPrimariesAsync(boreholeId).ConfigureAwait(false);
            }

            await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

            var responses = new Collection<StratigraphyWithLithology>();
            foreach (var entry in stratigraphies)
            {
                responses.Add(await BuildResponseAsync(entry.Stratigraphy.Id).ConfigureAwait(false));
            }

            return Ok(responses);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            const string message = "An error occurred while creating the stratigraphies.";
            logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Updates the full Lithology tab contents of an existing stratigraphy. The request carries the
    /// desired final state — the sync helpers stage the create/update/delete edits on the change
    /// tracker and a single SaveChangesAsync at the end persists them atomically.
    /// </summary>
    [HttpPut("{stratigraphyId:int}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<StratigraphyWithLithology>> UpdateContentsAsync(int stratigraphyId, [Required] LithologyTabContents contents)
    {
        var stratigraphy = await context.Stratigraphies
            .SingleOrDefaultAsync(s => s.Id == stratigraphyId)
            .ConfigureAwait(false);

        if (stratigraphy == null) return NotFound();

        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false))
        {
            return Unauthorized();
        }

        if (!ValidateChildStratigraphyIds(contents, stratigraphyId, out var validationError))
        {
            return BadRequest(validationError);
        }

        try
        {
            await SyncLithologiesAsync(stratigraphyId, contents.Lithologies).ConfigureAwait(false);
            await SyncLithologicalDescriptionsAsync(stratigraphyId, contents.LithologicalDescriptions).ConfigureAwait(false);
            await SyncFaciesDescriptionsAsync(stratigraphyId, contents.FaciesDescriptions).ConfigureAwait(false);

            await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

            return Ok(await BuildResponseAsync(stratigraphyId).ConfigureAwait(false));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            const string message = "An error occurred while updating the lithology tab contents.";
            logger.LogError(ex, message);
            return Problem(message);
        }
    }

    private static bool TryGetSingleBoreholeId(Collection<StratigraphyWithLithology> stratigraphies, out int boreholeId)
    {
        var boreholeIds = stratigraphies.Select(s => s.Stratigraphy?.BoreholeId ?? 0).Distinct().ToList();
        boreholeId = boreholeIds.Count == 1 ? boreholeIds[0] : 0;
        return boreholeId != 0;
    }

    private async Task<HashSet<string>> LoadTakenStratigraphyNamesAsync(int boreholeId)
    {
        var existingStratigraphyNames = await context.Stratigraphies
            .Where(s => s.BoreholeId == boreholeId)
            .Select(s => s.Name)
            .ToListAsync()
            .ConfigureAwait(false);

        return existingStratigraphyNames.OfType<string>().ToHashSet(StringComparer.Ordinal);
    }

    private async Task<bool> StageStratigraphiesForCreateAsync(
        Collection<StratigraphyWithLithology> stratigraphies,
        HashSet<string> takenNames)
    {
        var isFirstStratigaphy = takenNames.Count == 0;
        var hasDesignatedPrimary = false;
        foreach (var entry in stratigraphies)
        {
            var becomesPrimary = !hasDesignatedPrimary && (entry.Stratigraphy.IsPrimary || isFirstStratigaphy);
            await StageStratigraphyForCreateAsync(entry, takenNames, becomesPrimary).ConfigureAwait(false);
            hasDesignatedPrimary |= becomesPrimary;
        }

        return hasDesignatedPrimary;
    }

    private async Task StageStratigraphyForCreateAsync(StratigraphyWithLithology entry, HashSet<string> takenNames, bool becomesPrimary)
    {
        var stratigraphy = entry.Stratigraphy;
        stratigraphy.Id = 0;

        ApplyUniqueName(stratigraphy, takenNames);
        if (!string.IsNullOrEmpty(stratigraphy.Name)) takenNames.Add(stratigraphy.Name);

        // First-ever stratigraphy on the borehole auto-promotes to primary; an explicit
        // IsPrimary=true on any entry wins and demotes everything else (in-batch + DB).
        stratigraphy.IsPrimary = becomesPrimary;

        // Strip stratigraphy-level navigation collections that aren't part of this endpoint.
        stratigraphy.ChronostratigraphyLayers = null;
        stratigraphy.LithostratigraphyLayers = null;

        // Attach the three child collections to the stratigraphy so a single AddAsync cascades
        // the whole subgraph; EF assigns Ids and fills in StratigraphyId during SaveChanges.
        await PrepareNewLithologiesAsync(entry.Lithologies).ConfigureAwait(false);
        stratigraphy.Lithologies = entry.Lithologies.ToList();

        ResetChildIdentity(entry.LithologicalDescriptions);
        stratigraphy.LithologicalDescriptions = entry.LithologicalDescriptions.ToList();

        ResetChildIdentity(entry.FaciesDescriptions);
        stratigraphy.FaciesDescriptions = entry.FaciesDescriptions.ToList();

        await context.AddAsync(stratigraphy).ConfigureAwait(false);
    }

    private async Task PrepareNewLithologiesAsync(IEnumerable<Lithology> lithologies)
    {
        foreach (var lithology in lithologies)
        {
            lithology.Id = 0;
            lithology.StratigraphyId = 0;
            await PrepareLithologyDescriptionsAsync(lithology).ConfigureAwait(false);
            await PrepareNewLithologyForSaveAsync(lithology).ConfigureAwait(false);
        }
    }

    private static void ResetChildIdentity<T>(IEnumerable<T> items)
        where T : IStratigraphyLayer, IIdentifyable
    {
        foreach (var item in items)
        {
            item.Id = 0;
            item.StratigraphyId = 0;
        }
    }

    private async Task DemotePriorPrimariesAsync(int boreholeId)
    {
        var priorPrimaries = await context.Stratigraphies
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

    private static bool ValidateChildStratigraphyIds(LithologyTabContents contents, int stratigraphyId, out string? error)
    {
        bool MatchesOrUnset(int candidate) => candidate == 0 || candidate == stratigraphyId;

        if ((contents.Lithologies ?? []).Any(l => !MatchesOrUnset(l.StratigraphyId)))
        {
            error = "All lithologies must reference the path stratigraphyId.";
            return false;
        }

        if ((contents.LithologicalDescriptions ?? []).Any(d => !MatchesOrUnset(d.StratigraphyId)))
        {
            error = "All lithological descriptions must reference the path stratigraphyId.";
            return false;
        }

        if ((contents.FaciesDescriptions ?? []).Any(d => !MatchesOrUnset(d.StratigraphyId)))
        {
            error = "All facies descriptions must reference the path stratigraphyId.";
            return false;
        }

        error = null;
        return true;
    }

    private async Task SyncLithologiesAsync(int stratigraphyId, ICollection<Lithology> incoming)
    {
        var existingById = await context.LithologiesWithIncludes
            .Where(l => l.StratigraphyId == stratigraphyId)
            .ToDictionaryAsync(l => l.Id)
            .ConfigureAwait(false);

        var incomingIds = incoming.Where(l => l.Id != 0).Select(l => l.Id).ToHashSet();
        foreach (var (id, lithologyToDelete) in existingById)
        {
            if (!incomingIds.Contains(id))
            {
                context.Remove(lithologyToDelete);
            }
        }

        foreach (var lithology in incoming)
        {
            lithology.StratigraphyId = stratigraphyId;

            if (lithology.Id == 0)
            {
                await PrepareLithologyDescriptionsAsync(lithology).ConfigureAwait(false);
                await PrepareNewLithologyForSaveAsync(lithology).ConfigureAwait(false);
                await context.AddAsync(lithology).ConfigureAwait(false);
                continue;
            }

            if (!existingById.TryGetValue(lithology.Id, out var existingLithology))
            {
                throw new InvalidOperationException($"Lithology {lithology.Id} does not belong to stratigraphy {stratigraphyId}.");
            }

            await PrepareLithologyDescriptionsAsync(lithology, existingLithology).ConfigureAwait(false);
            await PrepareEditedLithologyForSaveAsync(lithology, existingLithology).ConfigureAwait(false);
            context.Entry(existingLithology).CurrentValues.SetValues(lithology);
        }
    }

    private Task SyncLithologicalDescriptionsAsync(int stratigraphyId, ICollection<LithologicalDescription> incoming)
        => SyncStratigraphyChildrenAsync(stratigraphyId, incoming, context.LithologicalDescriptions, nameof(LithologicalDescription));

    private Task SyncFaciesDescriptionsAsync(int stratigraphyId, ICollection<FaciesDescription> incoming)
        => SyncStratigraphyChildrenAsync(stratigraphyId, incoming, context.FaciesDescriptions, nameof(FaciesDescription));

    private async Task SyncStratigraphyChildrenAsync<T>(int stratigraphyId, ICollection<T> incoming, DbSet<T> dbSet, string entityName)
        where T : class, IStratigraphyLayer, IIdentifyable
    {
        var existingById = await dbSet
            .Where(d => d.StratigraphyId == stratigraphyId)
            .ToDictionaryAsync(d => d.Id)
            .ConfigureAwait(false);

        var incomingIds = incoming.Where(d => d.Id != 0).Select(d => d.Id).ToHashSet();
        foreach (var (id, toDelete) in existingById)
        {
            if (!incomingIds.Contains(id))
            {
                context.Remove(toDelete);
            }
        }

        foreach (var item in incoming)
        {
            item.StratigraphyId = stratigraphyId;

            if (item.Id == 0)
            {
                await context.AddAsync(item).ConfigureAwait(false);
                continue;
            }

            if (!existingById.TryGetValue(item.Id, out var existing))
            {
                throw new InvalidOperationException($"{entityName} {item.Id} does not belong to stratigraphy {stratigraphyId}.");
            }

            context.Entry(existing).CurrentValues.SetValues(item);
        }
    }

    private async Task<StratigraphyWithLithology> BuildResponseAsync(int stratigraphyId)
    {
        var stratigraphy = await context.Stratigraphies
            .AsNoTracking()
            .SingleAsync(s => s.Id == stratigraphyId)
            .ConfigureAwait(false);

        var contents = await LoadTabContentsAsync(stratigraphyId).ConfigureAwait(false);

        return new StratigraphyWithLithology
        {
            Stratigraphy = stratigraphy,
            Lithologies = contents.Lithologies,
            LithologicalDescriptions = contents.LithologicalDescriptions,
            FaciesDescriptions = contents.FaciesDescriptions,
        };
    }

    private async Task<LithologyTabContents> LoadTabContentsAsync(int stratigraphyId)
    {
        var lithologies = await context.LithologiesWithProjection
            .Where(l => l.StratigraphyId == stratigraphyId)
            .OrderBy(l => l.FromDepth)
            .ToListAsync()
            .ConfigureAwait(false);

        var lithologicalDescriptions = await context.LithologicalDescriptions
            .AsNoTracking()
            .Where(d => d.StratigraphyId == stratigraphyId)
            .ToListAsync()
            .ConfigureAwait(false);

        var faciesDescriptions = await context.FaciesDescriptionsWithIncludes
            .AsNoTracking()
            .Where(d => d.StratigraphyId == stratigraphyId)
            .ToListAsync()
            .ConfigureAwait(false);

        return new LithologyTabContents
        {
            Lithologies = new(lithologies),
            LithologicalDescriptions = new(lithologicalDescriptions),
            FaciesDescriptions = new(faciesDescriptions),
        };
    }

    private async Task PrepareLithologyDescriptionsAsync(Lithology entity, Lithology? existingLithology = null)
    {
        // Order LithologyDescriptions so that the one with IsFirst = true is first in order
        entity.LithologyDescriptions = entity.LithologyDescriptions?
            .OrderByDescending(ld => ld.IsFirst)
            .ThenBy(ld => ld.Id)
            .ToList() ?? [];

        if (entity.IsUnconsolidated == null)
        {
            // Unspecified lithologies are deliberately stripped: only depth + notes + IsUnconsolidated
            // (=null) + HasBedding (forced false) survive. Every categorization-specific field is
            // cleared here or in PrepareNewLithologyForSaveAsync / PrepareEditedLithologyForSaveAsync.
            entity.HasBedding = false;
            entity.Share = null;
            entity.AlterationDegreeId = null;
            entity.LithologyDescriptions = [];
        }
        else if (!entity.HasBedding)
        {
            entity.Share = null; // Reset share if bedding is false
            entity.LithologyDescriptions = entity.LithologyDescriptions.Where(ld => ld.IsFirst).ToList();
        }

        var currentLithologyDescriptionIds = entity.LithologyDescriptions?.Select(ld => ld.Id).ToList() ?? [];
        var existingDescriptions = existingLithology?.LithologyDescriptions?.ToList() ?? [];
        var descriptionsToRemove = existingDescriptions.Where(ld => !currentLithologyDescriptionIds.Contains(ld.Id)).ToList();

        foreach (var lithologyDescription in descriptionsToRemove)
        {
            context.Remove(lithologyDescription);
            existingDescriptions.Remove(lithologyDescription);
        }

        foreach (var lithologyDescription in entity.LithologyDescriptions ?? [])
        {
            if (lithologyDescription.Id == 0)
            {
                await PrepareNewLithologyDescriptionForSaveAsync(lithologyDescription, entity.IsUnconsolidated).ConfigureAwait(false);
                if (entity.Id != 0)
                {
                    context.Add(lithologyDescription);
                }
            }
            else
            {
                var existingDescription = existingDescriptions.FirstOrDefault(d => d.Id == lithologyDescription.Id);
                if (existingDescription != null)
                {
                    await PrepareEditedLithologyDescriptionAsync(lithologyDescription, existingDescription, entity.IsUnconsolidated).ConfigureAwait(false);
                    context.Entry(existingDescription).CurrentValues.SetValues(lithologyDescription);
                }
            }
        }
    }

    private async Task PrepareNewLithologyDescriptionForSaveAsync(LithologyDescription lithologyDescription, bool? isUnconsolidated)
    {
        if (isUnconsolidated == true)
        {
            var organicComponentCodes = await context.Codelists.Where(c => lithologyDescription.ComponentUnconOrganicCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionComponentUnconOrganicCodes = organicComponentCodes.Select(c => new LithologyDescriptionComponentUnconOrganicCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var debrisCodes = await context.Codelists.Where(c => lithologyDescription.ComponentUnconDebrisCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionComponentUnconDebrisCodes = debrisCodes.Select(c => new LithologyDescriptionComponentUnconDebrisCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var grainShapeCodes = await context.Codelists.Where(c => lithologyDescription.GrainShapeCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionGrainShapeCodes = grainShapeCodes.Select(c => new LithologyDescriptionGrainShapeCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var grainAngularityCodes = await context.Codelists.Where(c => lithologyDescription.GrainAngularityCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionGrainAngularityCodes = grainAngularityCodes.Select(c => new LithologyDescriptionGrainAngularityCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var unconCoarseCodes = await context.Codelists.Where(c => lithologyDescription.LithologyUnconDebrisCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionLithologyUnconDebrisCodes = unconCoarseCodes.Select(c => new LithologyDescriptionLithologyUnconDebrisCodes { Codelist = c, CodelistId = c.Id }).ToList();
        }
        else
        {
            lithologyDescription.LithologyUnconMainId = null;
            lithologyDescription.LithologyUncon2Id = null;
            lithologyDescription.LithologyUncon3Id = null;
            lithologyDescription.LithologyUncon4Id = null;
            lithologyDescription.LithologyUncon5Id = null;
            lithologyDescription.LithologyUncon6Id = null;
            lithologyDescription.HasStriae = false;

            lithologyDescription.LithologyDescriptionComponentUnconOrganicCodes = [];
            lithologyDescription.LithologyDescriptionComponentUnconDebrisCodes = [];
            lithologyDescription.LithologyDescriptionGrainShapeCodes = [];
            lithologyDescription.LithologyDescriptionGrainAngularityCodes = [];
            lithologyDescription.LithologyDescriptionLithologyUnconDebrisCodes = [];
        }

        if (isUnconsolidated == false)
        {
            var componentConParticleCodes = await context.Codelists.Where(c => lithologyDescription.ComponentConParticleCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionComponentConParticleCodes = componentConParticleCodes.Select(c => new LithologyDescriptionComponentConParticleCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var componentConMineralCodes = await context.Codelists.Where(c => lithologyDescription.ComponentConMineralCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionComponentConMineralCodes = componentConMineralCodes.Select(c => new LithologyDescriptionComponentConMineralCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var structureSynGenCodes = await context.Codelists.Where(c => lithologyDescription.StructureSynGenCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionStructureSynGenCodes = structureSynGenCodes.Select(c => new LithologyDescriptionStructureSynGenCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var structurePostGenCodes = await context.Codelists.Where(c => lithologyDescription.StructurePostGenCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionStructurePostGenCodes = [.. structurePostGenCodes.Select(c => new LithologyDescriptionStructurePostGenCodes { Codelist = c, CodelistId = c.Id })];
        }
        else
        {
            lithologyDescription.LithologyConId = null;
            lithologyDescription.GrainSizeId = null;
            lithologyDescription.GrainAngularityId = null;
            lithologyDescription.GradationId = null;
            lithologyDescription.CementationId = null;

            lithologyDescription.LithologyDescriptionComponentConParticleCodes = [];
            lithologyDescription.LithologyDescriptionComponentConMineralCodes = [];
            lithologyDescription.LithologyDescriptionStructureSynGenCodes = [];
            lithologyDescription.LithologyDescriptionStructurePostGenCodes = [];
        }
    }

    private async Task PrepareEditedLithologyDescriptionAsync(LithologyDescription lithologyDescription, LithologyDescription existingDescription, bool? isUnconsolidated)
    {
        if (isUnconsolidated == true)
        {
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentUnconOrganicCodes!, lithologyDescription.ComponentUnconOrganicCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentUnconDebrisCodes!, lithologyDescription.ComponentUnconDebrisCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionGrainShapeCodes!, lithologyDescription.GrainShapeCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionGrainAngularityCodes!, lithologyDescription.GrainAngularityCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionLithologyUnconDebrisCodes!, lithologyDescription.LithologyUnconDebrisCodelistIds!).ConfigureAwait(false);
        }
        else
        {
            lithologyDescription.LithologyUnconMainId = null;
            lithologyDescription.LithologyUncon2Id = null;
            lithologyDescription.LithologyUncon3Id = null;
            lithologyDescription.LithologyUncon4Id = null;
            lithologyDescription.LithologyUncon5Id = null;
            lithologyDescription.LithologyUncon6Id = null;
            lithologyDescription.HasStriae = false;

            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentUnconOrganicCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentUnconDebrisCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionGrainShapeCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionGrainAngularityCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionLithologyUnconDebrisCodes!, []).ConfigureAwait(false);
        }

        if (isUnconsolidated == false)
        {
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentConParticleCodes!, lithologyDescription.ComponentConParticleCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentConMineralCodes!, lithologyDescription.ComponentConMineralCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionStructureSynGenCodes!, lithologyDescription.StructureSynGenCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionStructurePostGenCodes!, lithologyDescription.StructurePostGenCodelistIds!).ConfigureAwait(false);
        }
        else
        {
            lithologyDescription.LithologyConId = null;
            lithologyDescription.GrainSizeId = null;
            lithologyDescription.GrainAngularityId = null;
            lithologyDescription.GradationId = null;
            lithologyDescription.CementationId = null;

            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentConParticleCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentConMineralCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionStructureSynGenCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionStructurePostGenCodes!, []).ConfigureAwait(false);
        }
    }

    private async Task PrepareNewLithologyForSaveAsync(Lithology entity)
    {
        if (entity.IsUnconsolidated == true)
        {
            var uscsTypeCodes = await context.Codelists.Where(c => entity.UscsTypeCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            entity.LithologyUscsTypeCodes = uscsTypeCodes.Select(c => new LithologyUscsTypeCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var rockConditionCodes = await context.Codelists.Where(c => entity.RockConditionCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            entity.LithologyRockConditionCodes = rockConditionCodes.Select(c => new LithologyRockConditionCodes { Codelist = c, CodelistId = c.Id }).ToList();
        }
        else
        {
            entity.CompactnessId = null;
            entity.CohesionId = null;
            entity.HumidityId = null;
            entity.ConsistencyId = null;
            entity.PlasticityId = null;
            entity.UscsDeterminationId = null;

            entity.LithologyUscsTypeCodes = [];
            entity.LithologyRockConditionCodes = [];
        }

        if (entity.IsUnconsolidated == false)
        {
            var textureMetaCodes = await context.Codelists.Where(c => entity.TextureMetaCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            entity.LithologyTextureMetaCodes = textureMetaCodes.Select(c => new LithologyTextureMetaCodes { Codelist = c, CodelistId = c.Id }).ToList();
        }
        else
        {
            entity.LithologyTextureMetaCodes = [];
        }
    }

    private async Task PrepareEditedLithologyForSaveAsync(Lithology entity, Lithology existingLithology)
    {
        if (entity.IsUnconsolidated == true)
        {
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUscsTypeCodes!, entity.UscsTypeCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyRockConditionCodes!, entity.RockConditionCodelistIds!).ConfigureAwait(false);
        }
        else
        {
            entity.CompactnessId = null;
            entity.CohesionId = null;
            entity.HumidityId = null;
            entity.ConsistencyId = null;
            entity.PlasticityId = null;
            entity.UscsDeterminationId = null;

            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUscsTypeCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyRockConditionCodes!, []).ConfigureAwait(false);
        }

        if (entity.IsUnconsolidated == false)
        {
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyTextureMetaCodes!, entity.TextureMetaCodelistIds!).ConfigureAwait(false);
        }
        else
        {
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyTextureMetaCodes!, []).ConfigureAwait(false);
        }
    }

    private Task UpdateLithologyCodesAsync<T>(int lithologyId, IList<T> existingCodes, ICollection<int> newCodelistIds)
        where T : class, ILithologyCode, new()
        => SyncCodelistJoinsAsync(existingCodes, newCodelistIds, c => c.CodelistId, codelistId => new T { CodelistId = codelistId, LithologyId = lithologyId });

    private Task UpdateLithologyDescriptionCodesAsync<T>(int lithologyDescriptionId, IList<T> existingCodes, ICollection<int> newCodelistIds)
        where T : class, ILithologyDescriptionCode, new()
        => SyncCodelistJoinsAsync(existingCodes, newCodelistIds, c => c.CodelistId, codelistId => new T { CodelistId = codelistId, LithologyDescriptionId = lithologyDescriptionId });

    private async Task SyncCodelistJoinsAsync<T>(IList<T> existingCodes, ICollection<int> newCodelistIds, Func<T, int> getCodelistId, Func<int, T> createJoin)
        where T : class
    {
        newCodelistIds = newCodelistIds?.ToList() ?? [];
        existingCodes ??= [];

        var codesToRemove = existingCodes.Where(code => !newCodelistIds.Contains(getCodelistId(code))).ToList();
        foreach (var code in codesToRemove)
        {
            context.Remove(code);
        }

        var idsToAdd = newCodelistIds.Where(id => !existingCodes.Any(c => getCodelistId(c) == id)).ToList();
        foreach (var id in idsToAdd)
        {
            var codelist = await context.Codelists.FindAsync(id).ConfigureAwait(false);
            if (codelist != null)
            {
                existingCodes.Add(createJoin(codelist.Id));
            }
        }
    }
}
