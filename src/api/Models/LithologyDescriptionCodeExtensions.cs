namespace BDMS.Models;

/// <summary>
/// Provides extension methods for the <see cref="ILithologyDescriptionCode"/> interface.
/// </summary>
public static class LithologyDescriptionCodeExtensions
{
    /// <summary>
    /// Resets the LithologyDescriptionId of each <see cref="ILithologyDescriptionCode"/> in the provided collection to 0.
    /// </summary>
    /// <param name="lithologyDescriptionCodes">The collection of <see cref="ILithologyDescriptionCode"/> objects to reset.</param>
    public static void ResetLithologyDescriptionIds(this IEnumerable<ILithologyDescriptionCode> lithologyDescriptionCodes)
    {
        foreach (var lithologyDescriptionCode in lithologyDescriptionCodes)
        {
            lithologyDescriptionCode.LithologyDescriptionId = 0;
        }
    }
}
