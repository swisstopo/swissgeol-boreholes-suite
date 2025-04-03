using System.Runtime.CompilerServices;
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
        var isAnonymousType = typeInfo.Type.IsDefined(typeof(CompilerGeneratedAttribute), false) && typeInfo.Type.Namespace == null;
        if (isAnonymousType)
        {
            // GPKG export uses anonymous types for geojson serialization.
            return;
        }

        foreach (var property in typeInfo.Properties)
        {
            if (!property.AttributeProvider.IsDefined(typeof(IncludeInExportAttribute), true))
            {
                property.ShouldSerialize = (_, _) => false;
            }
        }
    }
}
