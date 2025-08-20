using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    /// Asynchronously gets the <see cref="Lithology"/>s, optionally filtered by <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy containing the lithologies to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Lithology>>> GetAsync([FromQuery] int stratigraphyId)
    {
        var user = await Context.UsersWithIncludes
                    .AsNoTracking()
                    .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
                    .ConfigureAwait(false);

        var lithologies = Context.LithologiesWithIncludes.AsNoTracking();

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            lithologies = lithologies
                .Where(l => Context.Boreholes
                .Where(b => b.WorkgroupId.HasValue)
                .Any(b => b.Id == l.Stratigraphy.BoreholeId && allowedWorkgroupIds
                .Contains(b.WorkgroupId!.Value)));
        }

        lithologies = lithologies.Where(l => l.StratigraphyId == stratigraphyId);

        return await lithologies.ToListAsync().ConfigureAwait(false);
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

            if (entity.HasBedding && entity.Share == null)
            {
                return BadRequest("Share must be set when bedding is true.");
            }
            else
            {
                entity.Share = null; // Reset share if bedding is false
            }

            if (entity.IsUnconsolidated)
            {
                // Reset the consolidated lithology values
                entity.LithologyConId = null;
                entity.GrainSizeId = null;
                entity.GrainAngularityId = null;
                entity.GradationId = null;
                entity.CementationId = null;

                // Set the unconsolidated lithology codes
                var organicComponentCodes = await Context.Codelists.Where(c => entity.OrganicComponentCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyOrganicComponentCodes = organicComponentCodes.Select(c => new LithologyOrganicComponentCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var debrisCodes = await Context.Codelists.Where(c => entity.DebrisCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyDebrisCodes = debrisCodes.Select(c => new LithologyDebrisCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var grainShapeCodes = await Context.Codelists.Where(c => entity.DebrisCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyGrainShapeCodes = grainShapeCodes.Select(c => new LithologyGrainShapeCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var grainAngularityCodes = await Context.Codelists.Where(c => entity.GrainAngularityCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyGrainAngularityCodes = grainAngularityCodes.Select(c => new LithologyGrainAngularityCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var unconCoarseCodes = await Context.Codelists.Where(c => entity.LithologyUnconCoarseCodeCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyUnconCoarseCodes = unconCoarseCodes.Select(c => new LithologyUnconCoarseCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var uscsTypeCodes = await Context.Codelists.Where(c => entity.UscsTypeCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyUscsTypeCodes = uscsTypeCodes.Select(c => new LithologyUscsTypeCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var rockConditionCodes = await Context.Codelists.Where(c => entity.RockConditionCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyRockConditionCodes = rockConditionCodes.Select(c => new LithologyRockConditionCodes { Codelist = c, CodelistId = c.Id }).ToList();
            }
            else
            {
                // Reset the unconsolidated lithology values
                entity.LithologyUnconMainId = null;
                entity.LithologyUncon2Id = null;
                entity.LithologyUncon3Id = null;
                entity.LithologyUncon4Id = null;
                entity.LithologyUncon5Id = null;
                entity.LithologyUncon6Id = null;
                entity.HasStriae = false;
                entity.CompactnessId = null;
                entity.CohesionId = null;
                entity.HumidityId = null;
                entity.ConsistencyId = null;
                entity.PlasticityId = null;
                entity.UscsDeterminationId = null;

                // Set the consolidated lithology codes
                var componentConParticleCodes = await Context.Codelists.Where(c => entity.ComponentConParticleCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyComponentConParticleCodes = componentConParticleCodes.Select(c => new LithologyComponentConParticleCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var componentConMineralCodes = await Context.Codelists.Where(c => entity.ComponentConMineralCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyComponentConMineralCodes = componentConMineralCodes.Select(c => new LithologyComponentConMineralCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var structureSynGenCodes = await Context.Codelists.Where(c => entity.StructureSynGenCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyStructureSynGenCodes = structureSynGenCodes.Select(c => new LithologyStructureSynGenCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var structurePostGenCodes = await Context.Codelists.Where(c => entity.StructurePostGenCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyStructurePostGenCodes = structurePostGenCodes.Select(c => new LithologyStructurePostGenCodes { Codelist = c, CodelistId = c.Id }).ToList();

                var textureMetaCodes = await Context.Codelists.Where(c => entity.TextureMetaCodelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
                entity.LithologyTextureMetaCodes = textureMetaCodes.Select(c => new LithologyTextureMetaCodes { Codelist = c, CodelistId = c.Id }).ToList();
            }

            return await base.CreateAsync(entity).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            var message = "An error ocurred while creating the stratigraphy.";
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

        var existingLithology = Context.LithologiesWithIncludes
            .SingleOrDefault(l => l.Id == entity.Id);

        if (existingLithology == null)
        {
            return NotFound();
        }

        var boreholeId = await GetBoreholeId(entity).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        if (entity.IsUnconsolidated)
        {
            // Reset the consolidated lithology values
            entity.LithologyConId = null;
            entity.GrainSizeId = null;
            entity.GrainAngularityId = null;
            entity.GradationId = null;
            entity.CementationId = null;

            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyComponentConParticleCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyComponentConMineralCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyStructureSynGenCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyStructurePostGenCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyTextureMetaCodes!, []).ConfigureAwait(false);

            // Set the unconsolidated lithology codes
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyOrganicComponentCodes!, entity.OrganicComponentCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyDebrisCodes!, entity.DebrisCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyGrainShapeCodes!, entity.GrainShapeCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyGrainAngularityCodes!, entity.GrainAngularityCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUnconCoarseCodes!, entity.LithologyUnconCoarseCodeCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUscsTypeCodes!, entity.UscsTypeCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyRockConditionCodes!, entity.RockConditionCodelistIds!).ConfigureAwait(false);
        }
        else
        {
            // Reset the unconsolidated lithology values
            entity.LithologyUnconMainId = null;
            entity.LithologyUncon2Id = null;
            entity.LithologyUncon3Id = null;
            entity.LithologyUncon4Id = null;
            entity.LithologyUncon5Id = null;
            entity.LithologyUncon6Id = null;
            entity.HasStriae = false;
            entity.CompactnessId = null;
            entity.CohesionId = null;
            entity.HumidityId = null;
            entity.ConsistencyId = null;
            entity.PlasticityId = null;
            entity.UscsDeterminationId = null;

            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyOrganicComponentCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyDebrisCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyGrainShapeCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyGrainAngularityCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUnconCoarseCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyUscsTypeCodes!, []).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyRockConditionCodes!, []).ConfigureAwait(false);

            // Set the consolidated lithology codes
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyComponentConParticleCodes!, entity.ComponentConParticleCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyComponentConMineralCodes!, entity.ComponentConMineralCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyStructureSynGenCodes!, entity.StructureSynGenCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyStructurePostGenCodes!, entity.StructurePostGenCodelistIds!).ConfigureAwait(false);
            await UpdateLithologyCodesAsync(existingLithology.Id, existingLithology.LithologyTextureMetaCodes!, entity.TextureMetaCodelistIds!).ConfigureAwait(false);
        }

        Context.Entry(existingLithology).CurrentValues.SetValues(entity);

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

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id) => base.DeleteAsync(id);

    private async Task UpdateLithologyCodesAsync<T>(int lithologyId, IList<T> existingCodes, ICollection<int> newCodelistIds)
        where T : class, ILithologyCode, new()
    {
        newCodelistIds = newCodelistIds?.ToList() ?? [];
        existingCodes ??= [];

        foreach (var lithologyCode in existingCodes)
        {
            if (!newCodelistIds.Contains(lithologyCode.CodelistId))
            {
                Context.Remove(lithologyCode);
            }
        }

        foreach (var id in newCodelistIds)
        {
            if (!existingCodes.Any(lc => lc.CodelistId == id))
            {
                var codelist = await Context.Codelists.FindAsync(id).ConfigureAwait(false);
                if (codelist != null)
                {
                    var newLithologyCode = CreateLithologyCode<T>(lithologyId, codelist);
                    existingCodes.Add(newLithologyCode);
                }
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
