using BDMS.Models;
using NetTopologySuite.Features;

namespace BDMS.Services;

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
    /// Returns the map features of all boreholes the <paramref name="user"/> can see that match the
    /// <paramref name="filterCriteria"/>. The criteria carry no paging or ordering, so paging and
    /// sorting the borehole table never change this result.
    /// </summary>
    /// <param name="filterCriteria">The filter criteria; may be null to return all boreholes the user can see.</param>
    /// <param name="user">The user making the request.</param>
    /// <returns>One point feature per matching borehole with coordinates, ordered by borehole id, with the attributes id, type, name and restriction.</returns>
    Task<FeatureCollection> GetMapFeaturesAsync(BoreholeFilterCriteria? filterCriteria, User user);

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
