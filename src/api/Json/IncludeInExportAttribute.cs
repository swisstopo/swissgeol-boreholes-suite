namespace BDMS.Json;

/// <summary>
/// Marks the target property to be included in export and import.
/// All properties are excluded by default.
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class IncludeInExportAttribute : Attribute
{
}
