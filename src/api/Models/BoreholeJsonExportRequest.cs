using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Selects the boreholes for the JSON exports, with or without attachments. Each borehole is exported with
/// all its data, so the number of boreholes is limited to <see cref="MaxBoreholeCount"/>. The ids travel in
/// the request body, as that many ids no longer fit into a URL reliably.
/// </summary>
public class BoreholeJsonExportRequest
{
    /// <summary>
    /// The maximum number of boreholes one JSON export accepts.
    /// </summary>
    public const int MaxBoreholeCount = 500;

    /// <summary>
    /// The ids of the boreholes to export. At least one and at most <see cref="MaxBoreholeCount"/> ids are required.
    /// </summary>
    [Required]
    [MinLength(1)]
    [MaxLength(MaxBoreholeCount)]
    public IReadOnlyList<int> Ids { get; set; } = [];
}
