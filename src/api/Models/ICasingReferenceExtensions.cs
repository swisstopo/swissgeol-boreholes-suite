namespace BDMS.Models;

internal static class ICasingReferenceExtensions
{
    /// <summary>
    /// Maps a single ICasingReference to its corresponding Casing from the dictionary.
    /// </summary>
    public static void MapCasing(this ICasingReference casingReference, Dictionary<int, Casing> casings)
    {
        if (casingReference == null) return;

        casingReference.Casing = null; // Reset the reference first
        if (casingReference.CasingId.HasValue)
        {
            if (casings.TryGetValue(casingReference.CasingId.Value, out var casing))
            {
                casingReference.Casing = casing;
            }
            else
            {
                throw new InvalidOperationException($"Casing with ID {casingReference.CasingId} not found.");
            }
        }
    }

    /// <summary>
    /// Maps a list of ICasingReference objects to their corresponding Casings from the dictionary.
    /// </summary>
    public static void MapCasings(this IEnumerable<ICasingReference> casingReferences, Dictionary<int, Casing> casings)
    {
        if (casingReferences == null) return;

        foreach (var casingReference in casingReferences)
        {
            casingReference.MapCasing(casings);
        }
    }
}
