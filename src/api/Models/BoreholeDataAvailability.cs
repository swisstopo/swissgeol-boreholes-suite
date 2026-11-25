using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Tells which kinds of child data a <see cref="Borehole"/> has, so the detail page can mark its tabs
/// without loading the child data itself.
/// </summary>
public record BoreholeDataAvailability
{
    /// <summary>Gets whether the borehole has a <see cref="Section"/>.</summary>
    [JsonRequired]
    public bool HasSections { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="BoreholeGeometryElement"/>.</summary>
    [JsonRequired]
    public bool HasGeometry { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Stratigraphy"/>.</summary>
    [JsonRequired]
    public bool HasStratigraphy { get; init; }

    /// <summary>Gets whether any stratigraphy of the borehole has a <see cref="Lithology"/>.</summary>
    [JsonRequired]
    public bool HasLithology { get; init; }

    /// <summary>Gets whether any stratigraphy of the borehole has a <see cref="LithostratigraphyLayer"/>.</summary>
    [JsonRequired]
    public bool HasLithostratigraphy { get; init; }

    /// <summary>Gets whether any stratigraphy of the borehole has a <see cref="ChronostratigraphyLayer"/>.</summary>
    [JsonRequired]
    public bool HasChronostratigraphy { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Completion"/>.</summary>
    [JsonRequired]
    public bool HasCompletion { get; init; }

    /// <summary>Gets whether any completion of the borehole has a <see cref="Casing"/>.</summary>
    [JsonRequired]
    public bool HasCasings { get; init; }

    /// <summary>Gets whether any completion of the borehole has a <see cref="Backfill"/>.</summary>
    [JsonRequired]
    public bool HasBackfills { get; init; }

    /// <summary>Gets whether any completion of the borehole has an <see cref="Instrumentation"/>.</summary>
    [JsonRequired]
    public bool HasInstrumentations { get; init; }

    /// <summary>Gets whether the borehole has an <see cref="Observation"/> of any type.</summary>
    [JsonRequired]
    public bool HasObservation { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="WaterIngress"/>.</summary>
    [JsonRequired]
    public bool HasWaterIngress { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="GroundwaterLevelMeasurement"/>.</summary>
    [JsonRequired]
    public bool HasGroundwaterLevelMeasurement { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Hydrotest"/>.</summary>
    [JsonRequired]
    public bool HasHydrotest { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="FieldMeasurement"/>.</summary>
    [JsonRequired]
    public bool HasFieldMeasurement { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Profile"/>.</summary>
    [JsonRequired]
    public bool HasProfiles { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Photo"/>.</summary>
    [JsonRequired]
    public bool HasPhotos { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="Document"/>.</summary>
    [JsonRequired]
    public bool HasDocuments { get; init; }

    /// <summary>Gets whether the borehole has a <see cref="LogRun"/>.</summary>
    [JsonRequired]
    public bool HasLogRuns { get; init; }
}
