using BDMS.Models;
using Microsoft.EntityFrameworkCore;

namespace BDMS;

public static class BoreholeExtensions
{
    /// <summary>
    /// Updates the borehole's TVD properties based on the provided borehole geometries.
    /// </summary>
    /// <param name="borehole">The borehole object to update.</param>
    /// <param name="boreholeGeometries">A dictionary mapping borehole IDs to their respective geometry elements.</param>
    public static void SetTvdValues(this Borehole borehole, Dictionary<int, List<BoreholeGeometryElement>> boreholeGeometries)
    {
        boreholeGeometries.TryGetValue(borehole.Id, out var boreholeGeometry);

        borehole.TotalDepthTvd = boreholeGeometry.ConvertBoreholeDepth(borehole.TotalDepth, BoreholeGeometryExtensions.GetDepthTVD);
        borehole.TopBedrockFreshTvd = boreholeGeometry.ConvertBoreholeDepth(borehole.TopBedrockFreshMd, BoreholeGeometryExtensions.GetDepthTVD);
        borehole.TopBedrockWeatheredTvd = boreholeGeometry.ConvertBoreholeDepth(borehole.TopBedrockWeatheredMd, BoreholeGeometryExtensions.GetDepthTVD);
    }

    /// <summary>
    /// Checks whether the coordinates and depth of the given <paramref name="borehole"/> matches with any
    /// <see cref="Borehole"/> from <paramref name="boreholes"/> considering the pre-defined tolerances.
    /// Actually the coordinates in LV95/LV03 are tested if they are within a radius of 2 meters.
    /// The <see cref="Borehole.TotalDepth"/> must be exactly the same to create a match.
    /// </summary>
    /// <returns><c>true</c> if there are any matches. Otherwise <c>false</c>.</returns>
    public static bool IsWithinPredefinedTolerance(this Borehole borehole, IEnumerable<Borehole> boreholes)
    {
        return boreholes.Any(b =>
            CompareToWithTolerance(b.TotalDepth, borehole.TotalDepth, 0) &&
            (CompareToWithTolerance(b.LocationX, borehole.LocationX, 2) || CompareToWithTolerance(b.LocationXLV03, borehole.LocationX, 2)) &&
            (CompareToWithTolerance(b.LocationY, borehole.LocationY, 2) || CompareToWithTolerance(b.LocationYLV03, borehole.LocationY, 2)));
    }

    /// <summary>
    /// Compares this <paramref name="value"/> to the specified <paramref name="valueToCompare"/> using the
    /// specified <paramref name="tolerance"/>.
    /// </summary>
    /// <returns><c>true</c> if both values are within the specified <paramref name="tolerance"/>.
    /// Otherwise <c>false</c>.</returns>
    internal static bool CompareToWithTolerance(this double? value, double? valueToCompare, double tolerance)
    {
        if (value == null && valueToCompare == null) return true;
        if (value == null || valueToCompare == null) return false;

        return Math.Abs(value.Value - valueToCompare.Value) <= tolerance;
    }

    /// <summary>
    /// Validates whether the <see cref="Casing"/> references used in every <see cref="Borehole"/> in the given
    /// list of <paramref name="boreholes"/> <see cref="Completion.Instrumentations"/>, <see cref="Completion.Backfills"/>
    /// and <see cref="Borehole.Observations"/> are also present in <see cref="Completion.Casings"/>.
    /// </summary>
    /// <returns><c>true</c> if all requirements are met, otherwise <c>false</c>.</returns>
    public static bool ValidateCasingReferences(this IEnumerable<Borehole> boreholes)
    {
        var result = true;
        foreach (var borehole in boreholes)
        {
            // If a single borehole does not validate exit validation
            if (!borehole.ValidateCasingReferences())
            {
                result = false;
                break;
            }
        }

        return result;
    }

    /// <summary>
    /// Validates whether the <see cref="Casing"/> references in <see cref="Completion.Instrumentations"/>,
    /// <see cref="Completion.Backfills"/> and <see cref="Borehole.Observations"/> are also present in <see cref="Completion.Casings"/>.
    /// </summary>
    /// <returns><c>true</c> if all requirements are met, otherwise <c>false</c>.</returns>
    public static bool ValidateCasingReferences(this Borehole borehole)
    {
        // Get all casing Ids from the borehole's completions
        var casingIdsInCompletions = borehole.Completions?
            .SelectMany(c => c.Casings ?? Enumerable.Empty<Casing>())
            .Select(c => c.Id)
            .ToHashSet() ?? [];

        // Aggregate all CasingId references from Observations, Instrumentations, and Backfills
        var casingIdsInBorehole = new HashSet<int>(borehole.Observations?.Where(o => o.CasingId.HasValue).Select(o => o.CasingId!.Value) ?? []);
        casingIdsInBorehole
            .UnionWith(borehole.Completions?.SelectMany(c => c.Instrumentations ?? Enumerable.Empty<Instrumentation>())
            .Where(i => i.CasingId.HasValue)
            .Select(i => i.CasingId!.Value) ?? []);
        casingIdsInBorehole
            .UnionWith(borehole.Completions?.SelectMany(c => c.Backfills ?? Enumerable.Empty<Backfill>())
            .Where(b => b.CasingId.HasValue)
            .Select(b => b.CasingId!.Value) ?? []);

        return !casingIdsInBorehole.Except(casingIdsInCompletions).Any();
    }

    /// <summary>
    /// Maps the <see cref="Casing"/> references in <see cref="Completion.Instrumentations"/>, <see cref="Completion.Backfills"/>
    /// and <see cref="Borehole.Observations"/> to the casings present in <see cref="Borehole.Completions"/>.
    /// </summary>
    public static void MapCasingReferences(this Borehole borehole)
    {
        var casings = borehole.Completions?.SelectMany(c => c.Casings ?? Enumerable.Empty<Casing>()).ToDictionary(c => c.Id);
        if (casings == null) return;

        borehole.Observations?.MapCasings(casings);

        foreach (var completion in borehole.Completions)
        {
            completion.Instrumentations?.MapCasings(casings);
            completion.Backfills?.MapCasings(casings);
        }
    }

    /// <summary>
    /// Marks the content of this <see cref="Borehole"/> as new entities for Entity Framework.
    /// </summary>
    /// <param name="borehole">The borehole object to update.</param>
    /// <param name="user">The user that is assigned to the new workflow item.</param>
    /// <param name="workgroupId">The new workgroup for this borehole.</param>
    public static void MarkBoreholeContentAsNew(this Borehole borehole, User user, int workgroupId)
    {
        borehole.MarkAsNew();
        borehole.Workgroup = null;
        borehole.WorkgroupId = workgroupId;
        borehole.LockedBy = null;
        borehole.LockedById = null;

        // CreatedBy and UpdatedBy are copied by id unless they are overwritten later.
        borehole.UpdatedBy = null;
        borehole.CreatedBy = null;

        borehole.MapCasingReferences();

        borehole.Stratigraphies?.MarkAsNew();
        borehole.Completions?.MarkAsNew();
        borehole.Sections?.MarkAsNew();
        borehole.Observations?.MarkAsNew();
        borehole.BoreholeGeometry?.MarkAsNew();
        borehole.Documents?.MarkAsNew();
        borehole.LogRuns?.MarkAsNew();

        borehole.Workflow = new Workflow
        {
            ReviewedTabs = new(),
            PublishedTabs = new(),
        };

        // Set the geometry's SRID to LV95 (EPSG:2056)
        if (borehole.Geometry != null) borehole.Geometry.SRID = SpatialReferenceConstants.SridLv95;

        borehole.Files?.Clear();
        if (borehole.BoreholeFiles != null)
        {
            foreach (var file in borehole.BoreholeFiles)
            {
                file.File.MarkAsNew();
            }
        }

        foreach (var stratigraphy in borehole.Stratigraphies ?? [])
        {
            foreach (var lithology in stratigraphy.Lithologies ?? [])
            {
                // LithologyId needs to be reset because it is part of the primary key
                lithology.LithologyRockConditionCodes?.ResetLithologyIds();
                lithology.LithologyUscsTypeCodes?.ResetLithologyIds();
                lithology.LithologyTextureMetaCodes?.ResetLithologyIds();

                foreach (var description in lithology.LithologyDescriptions ?? [])
                {
                    // LithologyDescriptionId needs to be reset because it is part of the primary key
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
        }

        foreach (var observation in borehole.Observations)
        {
            if (observation is Hydrotest hydrotest)
            {
                // HydrotestId needs to be reset because it is part of the primary key
                hydrotest.HydrotestKindCodes?.ResetHydrotestIds();
                hydrotest.HydrotestEvaluationMethodCodes?.ResetHydrotestIds();
                hydrotest.HydrotestFlowDirectionCodes?.ResetHydrotestIds();
            }
        }
    }
}
