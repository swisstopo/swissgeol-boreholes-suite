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
    /// <param name="user">The user making the request.</param>
    /// <returns>A <see cref="FilterResponse"/> containing the filtered and paginated results.</returns>
    Task<FilterResponse> FilterBoreholesAsync(FilterRequest? filterRequest, User user);

    /// <summary>
    /// Computes per-option counts for each multi-option filter
    /// dimension using the filter-exclusion semantic: every active filter
    /// is applied except the one whose counts are being computed.
    /// </summary>
    /// <param name="filterRequest">The active filter request; each dimension is excluded in turn.</param>
    /// <param name="user">The user making the request.</param>
    /// <returns>A <see cref="FilterStatsResponse"/> with per-option counts for every filter dimension.</returns>
    Task<FilterStatsResponse> GetFilterStatsAsync(FilterRequest? filterRequest, User user);
}
