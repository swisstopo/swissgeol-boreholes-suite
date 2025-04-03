using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BDMS.Json;

/// <summary>
/// JSON converter for type <see href="https://www.npgsql.org/efcore/api/Microsoft.EntityFrameworkCore.LTree.html">LTree</see>.
/// </summary>
public class LTreeJsonConverter : JsonConverter<LTree>
{
    public override LTree Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.GetString() ?? string.Empty;
    }

    public override void Write(Utf8JsonWriter writer, LTree value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value);
    }
}
