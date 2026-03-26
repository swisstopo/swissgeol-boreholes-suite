using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Defines the valid fields by which a borehole list can be ordered.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum BoreholeOrderBy
{
    Id,
    OriginalName,
    Name,
    WorkgroupId,
    StatusId,
    TypeId,
    PurposeId,
    LocationX,
    LocationY,
    ElevationZ,
    TotalDepth,
}
