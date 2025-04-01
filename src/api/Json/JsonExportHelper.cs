using System.Text.Json.Serialization.Metadata;

namespace BDMS.Json;

public static class JsonExportHelper
{
    /// <summary>
    /// Requires the <see cref="IncludeInExportAttribute"/> for all properties that should be serialized.
    /// Can be used as a modifier of the <see cref="DefaultJsonTypeInfoResolver"/>.
    /// </summary>
    /// <param name="typeInfo">The type metadata.</param>
    public static void RequireIncludeInExportAttribute(JsonTypeInfo typeInfo)
    {
        foreach (var property in typeInfo.Properties)
        {
            if (!property.AttributeProvider.IsDefined(typeof(IncludeInExportAttribute), true))
            {
                property.ShouldSerialize = (_, _) => false;
            }
        }
    }
}
