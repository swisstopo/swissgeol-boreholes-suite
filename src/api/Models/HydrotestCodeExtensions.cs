namespace BDMS.Models;

/// <summary>
/// Provides extension methods for the <see cref="IHydrotestCode"/> interface.
/// </summary>
public static class HydrotestCodeExtensions
{
    /// <summary>
    /// Resets the HydrotestId of each <see cref="IHydrotestCode"/> in the provided collection to 0.
    /// </summary>
    /// <param name="hydrotestCodes">The collection of <see cref="IHydrotestCode"/> objects to reset.</param>
    public static void ResetHydrotestIds(this IEnumerable<IHydrotestCode> hydrotestCodes)
    {
        foreach (var hydrotestCode in hydrotestCodes)
        {
            hydrotestCode.HydrotestId = 0;
        }
    }
}
