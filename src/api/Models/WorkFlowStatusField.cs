namespace BDMS.Models;

/// <summary>
/// Represents a status field type on a workflow tab.
/// </summary>
public enum WorkflowStatusField
{
    Unknown = 0,
    Location,
    General,
    Sections,
    Geometry,
    Lithology,
    Chronostratigraphy,
    Lithostratigraphy,
    Casing,
    Instrumentation,
    Backfill,
    WaterIngress,
    GroundwaterLevelMeasurement,
    FieldMeasurement,
    Hydrotest,
    Profiles,
    Photos,
    Documents,
    Log,
}
