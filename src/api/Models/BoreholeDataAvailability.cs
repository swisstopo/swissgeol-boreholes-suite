namespace BDMS.Models;

/// <summary>
/// Tells which kinds of child data a <see cref="Borehole"/> has, so the detail page can mark its tabs
/// without loading the child data itself.
/// </summary>
public record BoreholeDataAvailability
{
    /// <summary>Gets whether the borehole has a <see cref="Section"/>.</summary>
    public bool HasSections { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="BoreholeGeometryElement"/>.</summary>
    public bool HasGeometry { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Stratigraphy"/>.</summary>
    public bool HasStratigraphy { get; init; }

    /// <summary>Gets whether any stratigraphy of the borehole has a <see cref="Lithology"/>.</summary>
    public bool HasLithology { get; init; }

    /// <summary>Gets whether any stratigraphy of the borehole has a <see cref="LithostratigraphyLayer"/>.</summary>
    public bool HasLithostratigraphy { get; init; }

    /// <summary>Gets whether any stratigraphy of the borehole has a <see cref="ChronostratigraphyLayer"/>.</summary>
    public bool HasChronostratigraphy { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Completion"/>.</summary>
    public bool HasCompletion { get; init; }

    /// <summary>Gets whether any completion of the borehole has a <see cref="Casing"/>.</summary>
    public bool HasCasings { get; init; }

    /// <summary>Gets whether any completion of the borehole has a <see cref="Backfill"/>.</summary>
    public bool HasBackfills { get; init; }

    /// <summary>Gets whether any completion of the borehole has an <see cref="Instrumentation"/>.</summary>
    public bool HasInstrumentations { get; init; }

    /// <summary>Gets whether the borehole has an <see cref="Observation"/> of any type.</summary>
    public bool HasObservation { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="WaterIngress"/>.</summary>
    public bool HasWaterIngress { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="GroundwaterLevelMeasurement"/>.</summary>
    public bool HasGroundwaterLevelMeasurement { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Hydrotest"/>.</summary>
    public bool HasHydrotest { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="FieldMeasurement"/>.</summary>
    public bool HasFieldMeasurement { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Profile"/>.</summary>
    public bool HasProfiles { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Photo"/>.</summary>
    public bool HasPhotos { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Document"/>.</summary>
    public bool HasDocuments { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="LogRun"/>.</summary>
    public bool HasLogRuns { get; init; }
}
