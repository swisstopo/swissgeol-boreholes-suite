using BDMS.Models;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BDMS.Json;

/// <summary>
/// Serializes and deserializes <see cref="Observation"/> objects based on their ObservationType.
/// </summary>
public class ObservationConverter : JsonConverter<Observation>
{
    private static readonly JsonSerializerOptions observationDefaultOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
    };

    /// <inheritdoc/>
    public override Observation? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using JsonDocument doc = JsonDocument.ParseValue(ref reader);
        var jsonObject = doc.RootElement;

        // Deserialize the observation type to determine the observation type
        var observation = JsonSerializer.Deserialize<Observation>(jsonObject.GetRawText(), observationDefaultOptions);

        return observation.Type switch
        {
            ObservationType.Hydrotest => JsonSerializer.Deserialize<Hydrotest>(jsonObject.GetRawText(), options),
            ObservationType.FieldMeasurement => JsonSerializer.Deserialize<FieldMeasurement>(jsonObject.GetRawText(), options),
            ObservationType.WaterIngress => JsonSerializer.Deserialize<WaterIngress>(jsonObject.GetRawText(), options),
            ObservationType.GroundwaterLevelMeasurement => JsonSerializer.Deserialize<GroundwaterLevelMeasurement>(jsonObject.GetRawText(), options),
            _ => observation,
        };
    }

    /// <inheritdoc/>
    public override void Write(Utf8JsonWriter writer, Observation value, JsonSerializerOptions options)
    {
        switch (value)
        {
            case Hydrotest hydrotest:
                hydrotest.EvaluationMethodCodelistIds = hydrotest.HydrotestEvaluationMethodCodes?.Select(x => x.CodelistId).ToList();
                hydrotest.FlowDirectionCodelistIds = hydrotest.HydrotestFlowDirectionCodes?.Select(x => x.CodelistId).ToList();
                hydrotest.KindCodelistIds = hydrotest.HydrotestKindCodes?.Select(x => x.CodelistId).ToList();
                JsonSerializer.Serialize(writer, hydrotest, options);
                break;
            case FieldMeasurement fieldMeasurement:
                JsonSerializer.Serialize(writer, fieldMeasurement, options);
                break;
            case WaterIngress waterIngress:
                JsonSerializer.Serialize(writer, waterIngress, options);
                break;
            case GroundwaterLevelMeasurement groundwaterLevelMeasurement:
                JsonSerializer.Serialize(writer, groundwaterLevelMeasurement, options);
                break;
            default:
                break;
        }
    }
}
