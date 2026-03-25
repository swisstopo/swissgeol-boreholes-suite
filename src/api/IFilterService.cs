using BDMS.Models;

namespace BDMS;

/// <summary>
/// Provides methods for filtering boreholes based on various criteria.
/// </summary>
public interface IFilterService
{
    /// <summary>
    /// Filters boreholes based on the provided filter request.
    /// </summary>
    /// <param name="filterRequest">The filter request containing filter criteria.</param>
    /// <param name="subjectId">The subject ID of the user making the request.</param>
    /// <returns>A <see cref="FilterResponse"/> containing the filtered and paginated results.</returns>
    Task<FilterResponse> FilterBoreholesAsync(FilterRequest? filterRequest, string? subjectId);
}
