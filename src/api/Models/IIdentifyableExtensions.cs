using System.Collections;
using System.Reflection;

namespace BDMS.Models;

internal static class IIdentifyableExtensions
{
    /// <summary>
    /// Sets the <see cref="IIdentifyable.Id"/> property of the object to 0.
    /// </summary>
    /// <param name="item"><see cref="IIdentifyable"/> object.</param>
    public static void MarkAsNew(this IIdentifyable item)
    {
        item.Id = 0;
    }

    /// <summary>
    /// Sets the <see cref="IIdentifyable.Id"/> property of the objects in the collection to 0, and recursively sets the <see cref="IIdentifyable.Id"/> properties of nested collections of <see cref="IIdentifyable"/> objects to zero.
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
        item.Id = 0;
        var properties = item.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);

        foreach (var property in properties)
        {
            // Check if the property is a collection (excluding string)
            if (typeof(IEnumerable).IsAssignableFrom(property.PropertyType) && property.PropertyType != typeof(string))
            {
                // Try to cast the property value to IEnumerable
                var collection = property.GetValue(item) as IEnumerable;
                if (collection != null)
                {
                    foreach (var element in collection)
                    {
                        if (element is IIdentifyable identifyableElement)
                        {
                            SetIdToZeroRecursive(identifyableElement);
                        }
                    }
                }
            }
        }
    }
}
