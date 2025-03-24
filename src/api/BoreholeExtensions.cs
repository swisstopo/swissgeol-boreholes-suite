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
}
