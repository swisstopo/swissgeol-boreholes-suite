namespace BDMS.Models;

/// <summary>
/// Provides extension methods for the <see cref="ILithologyCode"/> interface.
/// </summary>
public static class LithologyCodeExtensions
{
    /// <summary>
    /// Resets the LithologyId of each <see cref="ILithologyCode"/> in the provided collection to 0.
    /// </summary>
    /// <param name="lithologyCodes">The collection of <see cref="ILithologyCode"/> objects to reset.</param>
    public static void ResetLithologyIds(this IEnumerable<ILithologyCode> lithologyCodes)
    {
        foreach (var lithologyCode in lithologyCodes)
        {
            lithologyCode.LithologyId = 0;
        }
    }
}
