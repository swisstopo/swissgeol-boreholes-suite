namespace BDMS;

/// <summary>
/// Helper methods for importing data.
/// </summary>
public static class ImportHelpers
{
    /// <summary>
    /// Checks whether <paramref name="firstValue"/> and <paramref name="secondValue"/> are within the given <paramref name="tolerance"/>.
    /// </summary>
    internal static bool CompareValuesWithTolerance(double? firstValue, double? secondValue, double tolerance)
    {
        if (firstValue == null && secondValue == null) return true;
        if (firstValue == null || secondValue == null) return false;

        return Math.Abs(firstValue.Value - secondValue.Value) <= tolerance;
    }
}
