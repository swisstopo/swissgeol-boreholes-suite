namespace BDMS.Models;

/// <summary>
/// A single suggestion for autocomplete on a borehole text column.
/// </summary>
/// <param name="Value">The distinct text value present on one or more boreholes.</param>
/// <param name="Count">How many boreholes in the caller's visible set have this value.</param>
public record BoreholeSuggestion(string Value, int Count);
