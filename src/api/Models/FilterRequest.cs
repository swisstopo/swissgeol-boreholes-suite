using System.ComponentModel.DataAnnotations;

namespace BDMS.Models;

/// <summary>
/// Represents a request to filter boreholes by various criteria, with the paging and ordering the
/// borehole table needs.
/// </summary>
public class FilterRequest : BoreholeFilterCriteria
{
    /// <summary>
    /// Gets or sets the page number for pagination.
    /// </summary>
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Gets or sets the page size for pagination.
    /// </summary>
    [Range(1, 100)]
    public int PageSize { get; set; } = 100;

    /// <summary>
    /// Gets or sets the field to order by.
    /// </summary>
    public BoreholeOrderBy? OrderBy { get; set; }

    /// <summary>
    /// Gets or sets the order direction.
    /// </summary>
    public OrderDirection? Direction { get; set; }
}
