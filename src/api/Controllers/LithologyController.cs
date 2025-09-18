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

        return await Context.LithologiesWithIncludes
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
        var lithology = await Context.LithologiesWithIncludes
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

            await PrepareLithologyForSaveAsync(entity).ConfigureAwait(false);
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
            if (entities == null || !entities.Any())
            {
                return BadRequest("No lithologies provided");
            }

            // Verify all entities share the same stratigraphyId
            var stratigraphyIds = entities.Select(e => e.StratigraphyId).Distinct().ToList();
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
            foreach (var entity in entities)
            {
                await PrepareLithologyForSaveAsync(entity).ConfigureAwait(false);
            }

            // Add all entities to the context
            await Context.Lithologies.AddRangeAsync(entities).ConfigureAwait(false);

            // Save changes
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
            await PrepareLithologyForSaveAsync(entity, existingLithology).ConfigureAwait(false);
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

    private async Task PrepareLithologyForSaveAsync(Lithology entity, Lithology? existingLithology = null)
    {
        PrepareLithologyDescriptions(entity, existingLithology);

        if (entity.IsUnconsolidated)
        {
            await ResetConsolidatedValues(entity, existingLithology).ConfigureAwait(false);
            await SetUnconsolidatedValues(entity, existingLithology).ConfigureAwait(false);
        }
        else
        {
            await ResetUnconsolidatedValues(entity, existingLithology).ConfigureAwait(false);
            await SetConsolidatedValues(entity, existingLithology).ConfigureAwait(false);
        }
    }

    private void PrepareLithologyDescriptions(Lithology entity, Lithology? existingLithology = null)
    {
        if (entity.HasBedding && entity.Share == null) throw new InvalidOperationException("Share must be set when bedding is true.");

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
        var descriptionsToRemove = existingLithology?.LithologyDescriptions?
        .Where(ld => !currentLithologyDescriptionIds.Contains(ld.Id))
        .ToList() ?? [];

        foreach (var lithologyDescription in descriptionsToRemove)
        {
            Context.Remove(lithologyDescription);
        }
    }

    private async Task ResetUnconsolidatedValues(Lithology entity, Lithology? existingLithology = null)
    {
        if (entity.LithologyDescriptions != null)
        {
            foreach (var ld in entity.LithologyDescriptions)
            {
                ld.LithologyUnconMainId = null;
                ld.LithologyUncon2Id = null;
                ld.LithologyUncon3Id = null;
                ld.LithologyUncon4Id = null;
                ld.LithologyUncon5Id = null;
                ld.LithologyUncon6Id = null;
                ld.HasStriae = false;

                if (ld.Id == 0 || existingLithology == null)
                {
                    ld.LithologyDescriptionComponentUnconOrganicCodes = [];
                    ld.LithologyDescriptionComponentUnconDebrisCodes = [];
                    ld.LithologyDescriptionGrainShapeCodes = [];
                    ld.LithologyDescriptionGrainAngularityCodes = [];
                    ld.LithologyDescriptionLithologyUnconDebrisCodes = [];
                }
                else
                {
                    var existingLithologyDescription = existingLithology.LithologyDescriptions?.SingleOrDefault(x => x.Id == ld.Id);

                    var organicComponentCodes = existingLithologyDescription?.LithologyDescriptionComponentUnconOrganicCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, organicComponentCodes!, []).ConfigureAwait(false);

                    var debrisCodes = existingLithologyDescription?.LithologyDescriptionComponentUnconDebrisCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, debrisCodes!, []).ConfigureAwait(false);

                    var grainShapeCodes = existingLithologyDescription?.LithologyDescriptionGrainShapeCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, grainShapeCodes!, []).ConfigureAwait(false);

                    var grainAngularityCodes = existingLithologyDescription?.LithologyDescriptionGrainAngularityCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, grainAngularityCodes!, []).ConfigureAwait(false);

                    var unconCoarseCodes = existingLithologyDescription?.LithologyDescriptionLithologyUnconDebrisCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, unconCoarseCodes!, []).ConfigureAwait(false);
                }
            }
        }

        entity.CompactnessId = null;
        entity.CohesionId = null;
        entity.HumidityId = null;
        entity.ConsistencyId = null;
        entity.PlasticityId = null;
        entity.UscsDeterminationId = null;

        if (existingLithology == null)
        {
            entity.LithologyUscsTypeCodes = [];
            entity.LithologyRockConditionCodes = [];
        }
        else
        {
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUscsTypeCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyRockConditionCodes!, []).ConfigureAwait(false);
        }
    }

    private async Task ResetConsolidatedValues(Lithology entity, Lithology? existingLithology = null)
    {
        if (entity.LithologyDescriptions != null)
        {
            foreach (var ld in entity.LithologyDescriptions)
            {
                ld.LithologyConId = null;
                ld.GrainSizeId = null;
                ld.GrainAngularityId = null;
                ld.GradationId = null;
                ld.CementationId = null;

                if (ld.Id == 0 || existingLithology == null)
                {
                    ld.LithologyDescriptionComponentConParticleCodes = [];
                    ld.LithologyDescriptionComponentConMineralCodes = [];
                    ld.LithologyDescriptionStructureSynGenCodes = [];
                    ld.LithologyDescriptionStructurePostGenCodes = [];
                }
                else
                {
                    var existingLithologyDescription = existingLithology.LithologyDescriptions?.SingleOrDefault(x => x.Id == ld.Id);

                    var componentConParticleCodes = existingLithologyDescription?.LithologyDescriptionComponentConParticleCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, componentConParticleCodes!, []).ConfigureAwait(false);

                    var componentConMineralCodes = existingLithologyDescription?.LithologyDescriptionComponentConMineralCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, componentConMineralCodes!, []).ConfigureAwait(false);

                    var structureSynGenCodes = existingLithologyDescription?.LithologyDescriptionStructureSynGenCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, structureSynGenCodes!, []).ConfigureAwait(false);

                    var structurePostGenCodes = existingLithologyDescription?.LithologyDescriptionStructurePostGenCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, structurePostGenCodes!, []).ConfigureAwait(false);
                }
            }
        }

        if (existingLithology == null)
        {
            entity.LithologyTextureMataCodes = [];
        }
        else
        {
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyTextureMataCodes!, []).ConfigureAwait(false);
        }
    }

    private async Task SetUnconsolidatedValues(Lithology entity, Lithology? existingLithology = null)
    {
        if (entity.LithologyDescriptions != null)
        {
            foreach (var ld in entity.LithologyDescriptions)
            {
                if (ld.Id == 0 || existingLithology == null)
                {
                    var organicComponentCodes = await Context.Codelists.Where(c => ld.ComponentUnconOrganicCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                    ld.LithologyDescriptionComponentUnconOrganicCodes = organicComponentCodes.Select(c => new LithologyDescriptionComponentUnconOrganicCodes() { Codelist = c, CodelistId = c.Id }).ToList();

                    var debrisCodes = await Context.Codelists.Where(c => ld.ComponentUnconDebrisCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                    ld.LithologyDescriptionComponentUnconDebrisCodes = debrisCodes.Select(c => new LithologyDescriptionComponentUnconDebrisCodes() { Codelist = c, CodelistId = c.Id }).ToList();

                    var grainShapeCodes = await Context.Codelists.Where(c => ld.GrainShapeCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                    ld.LithologyDescriptionGrainShapeCodes = grainShapeCodes.Select(c => new LithologyDescriptionGrainShapeCodes() { Codelist = c, CodelistId = c.Id }).ToList();

                    var grainAngularityCodes = await Context.Codelists.Where(c => ld.GrainAngularityCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                    ld.LithologyDescriptionGrainAngularityCodes = grainAngularityCodes.Select(c => new LithologyDescriptionGrainAngularityCodes() { Codelist = c, CodelistId = c.Id }).ToList();

                    var unconCoarseCodes = await Context.Codelists.Where(c => ld.LithologyUnconDebrisCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                    ld.LithologyDescriptionLithologyUnconDebrisCodes = unconCoarseCodes.Select(c => new LithologyDescriptionLithologyUnconDebrisCodes() { Codelist = c, CodelistId = c.Id }).ToList();
                }
                else
                {
                    var existingLithologyDescription = existingLithology.LithologyDescriptions?.SingleOrDefault(x => x.Id == ld.Id);

                    var organicComponentCodes = existingLithologyDescription?.LithologyDescriptionComponentUnconOrganicCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, organicComponentCodes!, ld.ComponentUnconOrganicCodelistIds!).ConfigureAwait(false);

                    var debrisCodes = existingLithologyDescription?.LithologyDescriptionComponentUnconDebrisCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, debrisCodes!, ld.ComponentUnconDebrisCodelistIds!).ConfigureAwait(false);

                    var grainShapeCodes = existingLithologyDescription?.LithologyDescriptionGrainShapeCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, grainShapeCodes!, ld.GrainShapeCodelistIds!).ConfigureAwait(false);

                    var grainAngularityCodes = existingLithologyDescription?.LithologyDescriptionGrainAngularityCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, grainAngularityCodes!, ld.GrainAngularityCodelistIds!).ConfigureAwait(false);

                    var unconCoarseCodes = existingLithologyDescription?.LithologyDescriptionLithologyUnconDebrisCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, unconCoarseCodes!, ld.LithologyUnconDebrisCodelistIds!).ConfigureAwait(false);
                }
            }
        }

        if (existingLithology == null)
        {
            var uscsTypeCodes = await Context.Codelists.Where(c => entity.UscsTypeCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            entity.LithologyUscsTypeCodes = uscsTypeCodes.Select(c => new LithologyUscsTypeCodes { Codelist = c, CodelistId = c.Id }).ToList();

            var rockConditionCodes = await Context.Codelists.Where(c => entity.RockConditionCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            entity.LithologyRockConditionCodes = rockConditionCodes.Select(c => new LithologyRockConditionCodes { Codelist = c, CodelistId = c.Id }).ToList();
        }
        else
        {
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUscsTypeCodes!, entity.UscsTypeCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyRockConditionCodes!, entity.RockConditionCodelistIds!).ConfigureAwait(false);
        }
    }

    private async Task SetConsolidatedValues(Lithology entity, Lithology? existingLithology = null)
    {
        if (entity.LithologyDescriptions != null)
        {
            foreach (var ld in entity.LithologyDescriptions)
            {
                if (ld.Id == 0 || existingLithology == null)
                {
                    // Set the consolidated lithology codes
                    var componentConParticleCodes = await Context.Codelists.Where(c => ld.ComponentConParticleCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                    ld.LithologyDescriptionComponentConParticleCodes = componentConParticleCodes.Select(c => new LithologyDescriptionComponentConParticleCodes() { Codelist = c, CodelistId = c.Id }).ToList();

                    var componentConMineralCodes = await Context.Codelists.Where(c => ld.ComponentConMineralCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                    ld.LithologyDescriptionComponentConMineralCodes = componentConMineralCodes.Select(c => new LithologyDescriptionComponentConMineralCodes() { Codelist = c, CodelistId = c.Id }).ToList();

                    var structureSynGenCodes = await Context.Codelists.Where(c => ld.StructureSynGenCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                    ld.LithologyDescriptionStructureSynGenCodes = structureSynGenCodes.Select(c => new LithologyDescriptionStructureSynGenCodes() { Codelist = c, CodelistId = c.Id }).ToList();

                    var structurePostGenCodes = await Context.Codelists.Where(c => ld.StructurePostGenCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                    ld.LithologyDescriptionStructurePostGenCodes = [.. structurePostGenCodes.Select(c => new LithologyDescriptionStructurePostGenCodes() { Codelist = c, CodelistId = c.Id })];
                }
                else
                {
                    var existingLithologyDescription = existingLithology.LithologyDescriptions?.SingleOrDefault(x => x.Id == ld.Id);

                    // Set the consolidated lithology codes
                    var componentConParticleCodes = existingLithologyDescription?.LithologyDescriptionComponentConParticleCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, componentConParticleCodes!, ld.ComponentConParticleCodelistIds!).ConfigureAwait(false);

                    var componentConMineralCodes = existingLithologyDescription?.LithologyDescriptionComponentConMineralCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, componentConMineralCodes!, ld.ComponentConMineralCodelistIds!).ConfigureAwait(false);

                    var structureSynGenCodes = existingLithologyDescription?.LithologyDescriptionStructureSynGenCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, structureSynGenCodes!, ld.StructureSynGenCodelistIds!).ConfigureAwait(false);

                    var structurePostGenCodes = existingLithologyDescription?.LithologyDescriptionStructurePostGenCodes ?? [];
                    await UpdateLithologyDescriptionCodesAsync(ld.Id, structurePostGenCodes!, ld.StructurePostGenCodelistIds!).ConfigureAwait(false);
                }
            }
        }

        if (existingLithology == null)
        {
            var textureMataCodes = await Context.Codelists.Where(c => entity.TextureMataCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
            entity.LithologyTextureMataCodes = textureMataCodes.Select(c => new LithologyTextureMataCodes { Codelist = c, CodelistId = c.Id }).ToList();
        }
        else
        {
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyTextureMataCodes!, entity.TextureMataCodelistIds!).ConfigureAwait(false);
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
