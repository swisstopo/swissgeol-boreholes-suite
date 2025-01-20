using BDMS.Models;
using Microsoft.EntityFrameworkCore;

namespace BDMS;

public static class BoreholeExtensions
{
    public static IQueryable<Borehole> GetAllWithIncludes(this DbSet<Borehole> boreholes)
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

        return;
    }
}
