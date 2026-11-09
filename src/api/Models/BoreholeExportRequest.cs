using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Selects the boreholes to export. The ids travel in the request body, so a selection of many thousands
/// of boreholes fits into one request.
/// </summary>
public class BoreholeExportRequest
{
    /// <summary>
    /// The largest request body the CSV export accepts, in bytes. The number of ids is not limited by itself,
    /// but the body is: one million bytes hold well over 100,000 ids, several times the boreholes a user can
    /// select today, while a request is rejected before it is parsed or queried for. The JSON exports apply
    /// the same cap, so a body far larger than their <see cref="BoreholeJsonExportRequest.MaxBoreholeCount"/>
    /// ids is refused before it is read instead of after it is parsed.
    /// </summary>
    public const int MaxRequestBodySize = 1_000_000;

    /// <summary>
    /// The ids of the boreholes to export, in the order their rows are written. At least one id is required.
    /// </summary>
    [Required]
    [MinLength(1)]
    public IReadOnlyList<int> Ids { get; set; } = [];
}
