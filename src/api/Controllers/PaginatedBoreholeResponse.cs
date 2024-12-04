using BDMS.Models;

namespace BDMS.Controllers;

/// <summary>
/// Represents a paginated response containing a subset of <see cref="Borehole"/> along with pagination info.
/// </summary>
/// <param name="TotalCount">The total count of <see cref="Borehole"/>.</param>
/// <param name="PageNumber">The current page number.</param>
/// <param name="PageSize">The size of the page (number of <see cref="Borehole"/> per page).</param>
/// <param name="MaxPageSize">The maximum allowed size of the page.</param>
/// <param name="Boreholes">The <see cref="Borehole"/> contained in the current page.</param>
public record PaginatedBoreholeResponse(
    int TotalCount,
    int PageNumber,
    int PageSize,
    int MaxPageSize,
    IEnumerable<Borehole> Boreholes);
