using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using static BDMS.ImportHelpers;

namespace BDMS;

public static class BoreholeExtensions
{
    /// <summary>
    /// Gets a new query for the specified <paramref name="boreholes"/> including all the data which represents a
    /// complete <see cref="Borehole"/>. In the first place, this extension method is meant to be used to export
    /// or copy an entire <see cref="Borehole"/> with all its dependencies.
    /// </summary>
    public static IQueryable<Borehole> GetAllWithIncludes(this IQueryable<Borehole> boreholes)
    {
        return boreholes.Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerColorCodes)
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
            .Include(b => b.Observations).ThenInclude(o => (o as FieldMeasurement)!.FieldMeasurementResults)
            .Include(b => b.Observations).ThenInclude(o => (o as Hydrotest)!.HydrotestResults)
            .Include(b => b.Observations).ThenInclude(o => (o as Hydrotest)!.HydrotestEvaluationMethodCodes)
            .Include(b => b.Observations).ThenInclude(o => (o as Hydrotest)!.HydrotestFlowDirectionCodes)
            .Include(b => b.Observations).ThenInclude(o => (o as Hydrotest)!.HydrotestKindCodes)
            .Include(b => b.BoreholeCodelists)
            .Include(b => b.Workflows)
            .Include(b => b.BoreholeFiles).ThenInclude(f => f.File)
            .Include(b => b.BoreholeGeometry)
            .Include(b => b.Workgroup)
            .Include(b => b.UpdatedBy);
    }

    /// <summary>
    /// Updates the borehole's TVD properties based on the provided borehole geometries.
    /// </summary>
    /// <param name="borehole">The borehole object to update.</param>
    /// <param name="boreholeGeometries">A dictionary mapping borehole IDs to their respective geometry elements.</param>
    public static void SetTvdValues(this Borehole borehole, Dictionary<int, List<BoreholeGeometryElement>> boreholeGeometries)
    {
        boreholeGeometries.TryGetValue(borehole.Id, out var boreholeGeometry);

        borehole.TotalDepthTvd = boreholeGeometry.GetTVDIfGeometryExists(borehole.TotalDepth);
        borehole.TopBedrockFreshTvd = boreholeGeometry.GetTVDIfGeometryExists(borehole.TopBedrockFreshMd);
        borehole.TopBedrockWeatheredTvd = boreholeGeometry.GetTVDIfGeometryExists(borehole.TopBedrockWeatheredMd);
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
            CompareValuesWithTolerance(b.TotalDepth, borehole.TotalDepth, 0) &&
            (CompareValuesWithTolerance(b.LocationX, borehole.LocationX, 2) || CompareValuesWithTolerance(b.LocationXLV03, borehole.LocationX, 2)) &&
            (CompareValuesWithTolerance(b.LocationY, borehole.LocationY, 2) || CompareValuesWithTolerance(b.LocationYLV03, borehole.LocationY, 2)));
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
}
