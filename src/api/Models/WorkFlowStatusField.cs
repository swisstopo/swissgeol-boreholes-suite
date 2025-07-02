namespace BDMS.Models;

/// <summary>
/// Represents a status field type on a workflow tab.
/// </summary>
public enum WorkflowStatusField
{
    Unknown = 0,
    General,
    Section,
    Geometry,
    Lithology,
    Chronostratigraphy,
    Lithostratigraphy,
    Casing,
    Instrumentation,
    Backfill,
    WaterIngress,
    Groundwater,
    FieldMeasurement,
    Hydrotest,
    Profile,
    Photo,
    Document,
}
