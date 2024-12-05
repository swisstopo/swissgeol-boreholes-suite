using System.Collections;
using System.Reflection;

namespace BDMS.Models;

internal static class IIdentifyableExtensions
{
    /// <summary>
    /// Sets the <see cref="IIdentifyable.Id"/> property of the object to 0. Entity Framework interprets this as a added object.
    /// </summary>
    /// <param name="item"><see cref="IIdentifyable"/> object.</param>
    public static void MarkAsNew(this IIdentifyable item) => item.Id = 0;

    /// <summary>
    /// Mark the <see cref="IIdentifyable"/> objects in the collection as new, and recursively mark <see cref="IIdentifyable"/> objects of nested collections as new.
    /// </summary>
    /// <param name="items">Collection of <see cref="IIdentifyable"/> objects.</param>
    public static void MarkAsNew(this IEnumerable<IIdentifyable> items)
    {
        foreach (var item in items)
        {
            SetIdToZeroRecursive(item);
        }
    }

    private static void SetIdToZeroRecursive(IIdentifyable item)
    {
        item.MarkAsNew();

        // Select all IEnumerable properties of the object that are not strings
        var collectionProperties = item.GetType()
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(property => typeof(IEnumerable).IsAssignableFrom(property.PropertyType) && property.PropertyType != typeof(string));

        foreach (var property in collectionProperties)
        {
            // If the property value is an IEnumerable of IIdentifyable objects, process it recursively
            if (property.GetValue(item) is IEnumerable collection)
            {
                foreach (var identifyableElement in collection.OfType<IIdentifyable>())
                {
                    SetIdToZeroRecursive(identifyableElement);
                }
            }
        }
    }
}
