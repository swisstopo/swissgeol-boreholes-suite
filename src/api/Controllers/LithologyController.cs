using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class LithologyController : BoreholeControllerBase<Lithology>
{
    public LithologyController(BdmsContext context, ILogger<LithologyController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Lithology"/>s, filtered by <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy containing the lithologies to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Lithology>>> GetAsync([FromQuery] int stratigraphyId)
    {
        var stratigraphy = await Context.StratigraphiesV2
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == stratigraphyId)
            .ConfigureAwait(false);

        if (stratigraphy == null)
        {
            return NotFound();
        }

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false)) return Unauthorized();

        return await Context.LithologiesWithProjection // LithologiesWithProjection is used to return only CodelistIds instead of the whole codeslists to the client
            .AsNoTracking()
            .Where(l => l.StratigraphyId == stratigraphyId)
            .OrderBy(l => l.FromDepth)
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Lithology"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of lithology to get.</param>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Lithology>> GetByIdAsync(int id)
    {
        var lithology = await Context.LithologiesWithProjection // LithologiesWithProjection is used to return only CodelistIds instead of the whole codeslists to the client
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (lithology == null)
        {
            return NotFound();
        }

        var boreholeId = await GetBoreholeId(lithology).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        return Ok(lithology);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Lithology>> CreateAsync(Lithology entity)
    {
        try
        {
            if (entity == null) return BadRequest();

            var boreholeId = await GetBoreholeId(entity).ConfigureAwait(false);
            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

            await PrepareLithologyDescriptionsAsync(entity).ConfigureAwait(false);
            await PrepareNewLithologyForSaveAsync(entity).ConfigureAwait(false);
            return await base.CreateAsync(entity).ConfigureAwait(false);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while creating the stratigraphy.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <summary>
    /// Asynchronously creates multiple <see cref="Lithology"/> entities in a single operation.
    /// </summary>
    /// <param name="entities">The collection of lithologies to create.</param>
    /// <returns>The created lithologies.</returns>
    [HttpPost("bulk")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Lithology>>> BulkCreateAsync(IEnumerable<Lithology> entities)
    {
        try
        {
            var entityList = entities?.ToList();
            if (entities == null || entityList.Count == 0)
            {
                return BadRequest("No lithologies provided");
            }

            // Verify all entities share the same stratigraphyId
            var stratigraphyIds = entityList.Select(e => e.StratigraphyId).Distinct().ToList();
            if (stratigraphyIds.Count != 1)
            {
                return BadRequest("All lithologies must belong to the same stratigraphy");
            }

            var stratigraphyId = stratigraphyIds.Single();
            var stratigraphy = await Context.StratigraphiesV2
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == stratigraphyId)
                .ConfigureAwait(false);

            if (stratigraphy == null)
            {
                return NotFound("Stratigraphy not found");
            }

            if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), stratigraphy.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            // Prepare each lithology for saving
            foreach (var entity in entityList)
            {
                await PrepareLithologyDescriptionsAsync(entity).ConfigureAwait(false);
                await PrepareNewLithologyForSaveAsync(entity).ConfigureAwait(false);
            }

            await Context.Lithologies.AddRangeAsync(entities).ConfigureAwait(false);

            try
            {
                await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
                return Ok(entities);
            }
            catch (Exception ex)
            {
                var errorMessage = "An error occurred while saving the lithologies.";
                Logger?.LogError(ex, errorMessage);
                return Problem(errorMessage);
            }
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            var message = "An error occurred while processing the lithologies.";
            Logger.LogError(ex, message);
            return Problem(message);
        }
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public async override Task<ActionResult<Lithology>> EditAsync(Lithology entity)
    {
        if (entity == null)
        {
            return BadRequest(ModelState);
        }

        var boreholeId = await GetBoreholeId(entity).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        var existingLithology = await Context.LithologiesWithIncludes
            .SingleOrDefaultAsync(l => l.Id == entity.Id).ConfigureAwait(false);

        if (existingLithology == null)
        {
            return NotFound();
        }

        try
        {
            await PrepareLithologyDescriptionsAsync(entity, existingLithology).ConfigureAwait(false);
            await PrepareEditedLithologyForSaveAsync(entity, existingLithology).ConfigureAwait(false);
            Context.Entry(existingLithology).CurrentValues.SetValues(entity);

            await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
            return await GetByIdAsync(entity.Id).ConfigureAwait(false);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
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
    public override Task<IActionResult> DeleteAsync(int id) => base.DeleteAsync(id);

    private async Task PrepareLithologyDescriptionsAsync(Lithology entity, Lithology? existingLithology = null)
    {
        // Order LithologyDescriptions so that the one with IsFirst = true is first in order
        entity.LithologyDescriptions = entity.LithologyDescriptions?
            .OrderByDescending(ld => ld.IsFirst)
            .ThenBy(ld => ld.Id)
            .ToList() ?? [];

        if (!entity.HasBedding)
        {
            entity.Share = null; // Reset share if bedding is false
            entity.LithologyDescriptions = entity.LithologyDescriptions?.Where(ld => ld.IsFirst).ToList() ?? [];
        }

        // Remove old lithology descriptions
        var currentLithologyDescriptionIds = entity.LithologyDescriptions?.Select(ld => ld.Id).ToList();
        var existingDescriptions = existingLithology?.LithologyDescriptions?.ToList() ?? [];
        var descriptionsToRemove = existingDescriptions.Where(ld => !currentLithologyDescriptionIds.Contains(ld.Id)).ToList();

        foreach (var lithologyDescription in descriptionsToRemove)
        {
            Context.Remove(lithologyDescription);
            existingDescriptions.Remove(lithologyDescription);
        }

        foreach (var lithologyDescription in entity.LithologyDescriptions)
        {
            if (lithologyDescription.Id == 0)
            {
                await PrepareNewLithologyDescriptionForSaveAsync(lithologyDescription, entity.IsUnconsolidated).ConfigureAwait(false);
                if (entity.Id != 0)
                {
                    Context.Add(lithologyDescription);
                }
            }
            else
            {
                var existingDescription = existingDescriptions.FirstOrDefault(d => d.Id == lithologyDescription.Id);
                if (existingDescription != null)
                {
                    await PrepareEditedLithologyDescriptionAsync(lithologyDescription, existingDescription, entity.IsUnconsolidated).ConfigureAwait(false);
                    Context.Entry(existingDescription).CurrentValues.SetValues(lithologyDescription);
                }
            }
        }
    }

    private async Task PrepareNewLithologyDescriptionForSaveAsync(LithologyDescription lithologyDescription, bool isUnconsolidated)
    {
        if (isUnconsolidated)
        {
            // Reset consolidated codes
            lithologyDescription.LithologyConId = null;
            lithologyDescription.GrainSizeId = null;
            lithologyDescription.GrainAngularityId = null;
            lithologyDescription.GradationId = null;
            lithologyDescription.CementationId = null;

            lithologyDescription.LithologyDescriptionComponentConParticleCodes = [];
            lithologyDescription.LithologyDescriptionComponentConMineralCodes = [];
            lithologyDescription.LithologyDescriptionStructureSynGenCodes = [];
            lithologyDescription.LithologyDescriptionStructurePostGenCodes = [];

            // Set unconsolidated codes
            var organicComponentCodes = await Context.Codelists.Where(c => lithologyDescription.ComponentUnconOrganicCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionComponentUnconOrganicCodes = organicComponentCodes.Select(c => new LithologyDescriptionComponentUnconOrganicCodes() { Codelist = c, CodelistId = c.Id }).ToList();

            var debrisCodes = await Context.Codelists.Where(c => lithologyDescription.ComponentUnconDebrisCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionComponentUnconDebrisCodes = debrisCodes.Select(c => new LithologyDescriptionComponentUnconDebrisCodes() { Codelist = c, CodelistId = c.Id }).ToList();

            var grainShapeCodes = await Context.Codelists.Where(c => lithologyDescription.GrainShapeCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionGrainShapeCodes = grainShapeCodes.Select(c => new LithologyDescriptionGrainShapeCodes() { Codelist = c, CodelistId = c.Id }).ToList();

            var grainAngularityCodes = await Context.Codelists.Where(c => lithologyDescription.GrainAngularityCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionGrainAngularityCodes = grainAngularityCodes.Select(c => new LithologyDescriptionGrainAngularityCodes() { Codelist = c, CodelistId = c.Id }).ToList();

            var unconCoarseCodes = await Context.Codelists.Where(c => lithologyDescription.LithologyUnconDebrisCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionLithologyUnconDebrisCodes = unconCoarseCodes.Select(c => new LithologyDescriptionLithologyUnconDebrisCodes() { Codelist = c, CodelistId = c.Id }).ToList();
        }
        else
        {
            // Reset unconsolidated codes
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

            // Set consolidated codes
            var componentConParticleCodes = await Context.Codelists.Where(c => lithologyDescription.ComponentConParticleCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionComponentConParticleCodes = componentConParticleCodes.Select(c => new LithologyDescriptionComponentConParticleCodes() { Codelist = c, CodelistId = c.Id }).ToList();

            var componentConMineralCodes = await Context.Codelists.Where(c => lithologyDescription.ComponentConMineralCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionComponentConMineralCodes = componentConMineralCodes.Select(c => new LithologyDescriptionComponentConMineralCodes() { Codelist = c, CodelistId = c.Id }).ToList();

            var structureSynGenCodes = await Context.Codelists.Where(c => lithologyDescription.StructureSynGenCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionStructureSynGenCodes = structureSynGenCodes.Select(c => new LithologyDescriptionStructureSynGenCodes() { Codelist = c, CodelistId = c.Id }).ToList();

            var structurePostGenCodes = await Context.Codelists.Where(c => lithologyDescription.StructurePostGenCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            lithologyDescription.LithologyDescriptionStructurePostGenCodes = [.. structurePostGenCodes.Select(c => new LithologyDescriptionStructurePostGenCodes() { Codelist = c, CodelistId = c.Id })];
        }
    }

    private async Task PrepareEditedLithologyDescriptionAsync(LithologyDescription lithologyDescription, LithologyDescription existingDescription, bool isUnconsolidated)
    {
        if (isUnconsolidated)
        {
            // Reset consolidated codes
            lithologyDescription.LithologyConId = null;
            lithologyDescription.GrainSizeId = null;
            lithologyDescription.GrainAngularityId = null;
            lithologyDescription.GradationId = null;
            lithologyDescription.CementationId = null;

            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentConParticleCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentConMineralCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionStructureSynGenCodes!, []).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionStructurePostGenCodes!, []).ConfigureAwait(false);

            // Set unconsolidated codes
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentUnconOrganicCodes!, lithologyDescription.ComponentUnconOrganicCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentUnconDebrisCodes!, lithologyDescription.ComponentUnconDebrisCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionGrainShapeCodes!, lithologyDescription.GrainShapeCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionGrainAngularityCodes!, lithologyDescription.GrainAngularityCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionLithologyUnconDebrisCodes!, lithologyDescription.LithologyUnconDebrisCodelistIds!).ConfigureAwait(false);
        }
        else
        {
            // Reset unconsolidated codes
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

            // Set consolidated codes
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentConParticleCodes!, lithologyDescription.ComponentConParticleCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionComponentConMineralCodes!, lithologyDescription.ComponentConMineralCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionStructureSynGenCodes!, lithologyDescription.StructureSynGenCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyDescriptionCodesAsync(lithologyDescription.Id, existingDescription.LithologyDescriptionStructurePostGenCodes!, lithologyDescription.StructurePostGenCodelistIds!).ConfigureAwait(false);
        }
    }

    private async Task PrepareNewLithologyForSaveAsync(Lithology entity)
    {
        if (entity.IsUnconsolidated)
        {
            // Reset consolidated codes
            entity.LithologyTextureMetaCodes = [];

            // Set unconsolidated codes
            var uscsTypeCodes = await Context.Codelists.Where(c => entity.UscsTypeCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            entity.LithologyUscsTypeCodes = uscsTypeCodes.Select(c => new LithologyUscsTypeCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var rockConditionCodes = await Context.Codelists.Where(c => entity.RockConditionCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            entity.LithologyRockConditionCodes = rockConditionCodes.Select(c => new LithologyRockConditionCodes { Codelist = c, CodelistId = c.Id }).ToList();
        }
        else
        {
            // Reset unconsolidated codes
            entity.CompactnessId = null;
            entity.CohesionId = null;
            entity.HumidityId = null;
            entity.ConsistencyId = null;
            entity.PlasticityId = null;
            entity.UscsDeterminationId = null;

            entity.LithologyUscsTypeCodes = [];
            entity.LithologyRockConditionCodes = [];

            // Set consolidated codes
            var textureMetaCodes = await Context.Codelists.Where(c => entity.TextureMetaCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            entity.LithologyTextureMetaCodes = textureMetaCodes.Select(c => new LithologyTextureMetaCodes { Codelist = c, CodelistId = c.Id }).ToList();
        }
    }

    private async Task PrepareEditedLithologyForSaveAsync(Lithology entity, Lithology existingLithology)
    {
        if (entity.IsUnconsolidated)
        {
            // Reset consolidated codes
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyTextureMetaCodes!, []).ConfigureAwait(false);

            // Set unconsolidated codes
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUscsTypeCodes!, entity.UscsTypeCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyRockConditionCodes!, entity.RockConditionCodelistIds!).ConfigureAwait(false);
        }
        else
        {
            // Reset unconsolidated codes
            entity.CompactnessId = null;
            entity.CohesionId = null;
            entity.HumidityId = null;
            entity.ConsistencyId = null;
            entity.PlasticityId = null;
            entity.UscsDeterminationId = null;

            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUscsTypeCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyRockConditionCodes!, []).ConfigureAwait(false);

            // Set consolidated codes
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyTextureMetaCodes!, entity.TextureMetaCodelistIds!).ConfigureAwait(false);
        }
    }

    private async Task UpdateLithologyCodesAsync<T>(int lithologyId, IList<T> existingCodes, ICollection<int> newCodelistIds)
        where T : class, ILithologyCode, new()
    {
        newCodelistIds = newCodelistIds?.ToList() ?? [];
        existingCodes ??= [];

        // Remove codes not in newCodelistIds
        var codesToRemove = existingCodes.Where(lithologyCode => !newCodelistIds.Contains(lithologyCode.CodelistId)).ToList();
        foreach (var lithologyCode in codesToRemove)
        {
            Context.Remove(lithologyCode);
        }

        // Add codes that are in newCodelistIds but not in existingCodes
        var idsToAdd = newCodelistIds.Where(id => !existingCodes.Any(lc => lc.CodelistId == id)).ToList();
        foreach (var id in idsToAdd)
        {
            var codelist = await Context.Codelists.FindAsync(id).ConfigureAwait(false);
            if (codelist != null)
            {
                var newLithologyCode = CreateLithologyCode<T>(lithologyId, codelist);
                existingCodes.Add(newLithologyCode);
            }
        }
    }

    private T CreateLithologyCode<T>(int lithologyId, Codelist codelist)
        where T : class, ILithologyCode, new()
    {
        return new T
        {
            CodelistId = codelist.Id,
            LithologyId = lithologyId,
        };
    }

    private async Task UpdateLithologyDescriptionCodesAsync<T>(int lithologyDescriptionId, IList<T> existingCodes, ICollection<int> newCodelistIds)
    where T : class, ILithologyDescriptionCode, new()
    {
        newCodelistIds = newCodelistIds?.ToList() ?? [];
        existingCodes ??= [];

        // Remove codes not in newCodelistIds
        var codesToRemove = existingCodes.Where(lithologyCode => !newCodelistIds.Contains(lithologyCode.CodelistId)).ToList();
        foreach (var lithologyCode in codesToRemove)
        {
            Context.Remove(lithologyCode);
        }

        // Add codes that are in newCodelistIds but not in existingCodes
        var idsToAdd = newCodelistIds.Where(id => !existingCodes.Any(lc => lc.CodelistId == id)).ToList();
        foreach (var id in idsToAdd)
        {
            var codelist = await Context.Codelists.FindAsync(id).ConfigureAwait(false);
            if (codelist != null)
            {
                var newLithologyDescriptionCode = CreateLithologyDescriptionCode<T>(lithologyDescriptionId, codelist);
                existingCodes.Add(newLithologyDescriptionCode);
            }
        }
    }

    private T CreateLithologyDescriptionCode<T>(int lithologyDescriptionId, Codelist codelist)
    where T : class, ILithologyDescriptionCode, new()
    {
        return new T
        {
            CodelistId = codelist.Id,
            LithologyDescriptionId = lithologyDescriptionId,
        };
    }

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(Lithology entity)
    {
        if (entity == null) return default;

        var stratigraphy = await Context.StratigraphiesV2
            .AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == entity.StratigraphyId)
            .ConfigureAwait(false);
        return stratigraphy?.BoreholeId;
    }
}
