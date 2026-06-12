using BDMS.Models;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Services;

/// <inheritdoc cref="ILithologyTabContentService" />
public class LithologyTabContentService(BdmsContext context) : ILithologyTabContentService
{
    private readonly BdmsContext context = context;

    /// <inheritdoc />
    public async Task StageContentForCreateAsync(Stratigraphy stratigraphy, LithologyTabContents contents)
    {
        // Attach the three child collections to the stratigraphy so a single AddAsync cascades
        // the whole subgraph; EF assigns Ids and fills in StratigraphyId during SaveChanges.
        await PrepareNewLithologiesAsync(contents.Lithologies).ConfigureAwait(false);
        stratigraphy.Lithologies = contents.Lithologies.ToList();

        ResetChildIdentity(contents.LithologicalDescriptions);
        stratigraphy.LithologicalDescriptions = contents.LithologicalDescriptions.ToList();

        ResetChildIdentity(contents.FaciesDescriptions);
        stratigraphy.FaciesDescriptions = contents.FaciesDescriptions.ToList();
    }

    /// <inheritdoc />
    public async Task SyncContentAsync(int stratigraphyId, LithologyTabContents contents)
    {
        await SyncLithologiesAsync(stratigraphyId, contents.Lithologies).ConfigureAwait(false);
        await SyncLithologicalDescriptionsAsync(stratigraphyId, contents.LithologicalDescriptions).ConfigureAwait(false);
        await SyncFaciesDescriptionsAsync(stratigraphyId, contents.FaciesDescriptions).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task<LithologyTabContents> LoadContentAsync(int stratigraphyId)
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

    /// <inheritdoc />
    public bool ValidateChildStratigraphyIds(LithologyTabContents contents, int stratigraphyId, out string? errorMessage)
    {
        string? Validate(IEnumerable<IStratigraphyLayer>? items, string childName) =>
            (items ?? []).Any(item => item.StratigraphyId != 0 && item.StratigraphyId != stratigraphyId)
                ? $"All {childName} must reference the path stratigraphyId."
                : null;

        errorMessage = Validate(contents.Lithologies, "lithologies")
            ?? Validate(contents.LithologicalDescriptions, "lithological descriptions")
            ?? Validate(contents.FaciesDescriptions, "facies descriptions");

        return errorMessage == null;
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
                    lithologyDescription.LithologyId = entity.Id;
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
