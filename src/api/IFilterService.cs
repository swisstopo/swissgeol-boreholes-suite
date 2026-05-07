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

    /// <summary>
    /// Returns autocomplete suggestions for a borehole text column. Suggestions are drawn from
    /// boreholes matching the active <paramref name="filterRequest"/>, except the filter on the
    /// <paramref name="field"/> being autocompleted is excluded. When no
    /// filter is supplied only the user's workgroup permissions constrain the result set.
    /// </summary>
    /// <param name="field">The borehole column to search.</param>
    /// <param name="query">The prefix to match against (case-insensitive).</param>
    /// <param name="limit">Maximum number of suggestions to return.</param>
    /// <param name="filterRequest">The active filter request; may be null to compute unconstrained suggestions.</param>
    /// <param name="user">The user making the request.</param>
    /// <returns>Suggestions ordered by descending count then value.</returns>
    Task<IList<BoreholeSuggestion>> GetSuggestionsAsync(BoreholeSuggestionField field, string query, int limit, FilterRequest? filterRequest, User user);
}
