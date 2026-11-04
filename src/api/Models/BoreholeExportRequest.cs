using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Selects the boreholes to export. The ids travel in the request body, so a selection of many thousands
/// of boreholes fits into one request.
/// </summary>
public class BoreholeExportRequest
{
    /// <summary>
    /// The ids of the boreholes to export, in the order their rows are written. At least one id is required.
    /// </summary>
    [Required]
    [MinLength(1)]
    public IReadOnlyList<int> Ids { get; set; } = [];
}
