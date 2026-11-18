using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;

namespace BDMS.Services;

/// <summary>
/// Provides methods for filtering boreholes based on various criteria.
/// </summary>
public class FilterService : IFilterService
{
    // Limit the maximum number of items per request to 100.
    private const int MaxPageSize = 100;
    private const int LockTimeoutMinutes = 120;
    private readonly BdmsContext context;

    public FilterService(BdmsContext context)
    {
        this.context = context;
    }

    /// <inheritdoc />
    public async Task<FilterResponse> FilterBoreholesAsync(FilterRequest? filterRequest, User user)
    {
        var lockExpiryTime = DateTime.UtcNow.AddMinutes(-LockTimeoutMinutes);

        // Base query, restricted to the workgroups the user may see
        var query = QueryVisibleBoreholes(user);

        // Default pagination
        var pageSize = MaxPageSize;
        var skip = 0;
        var orderedQuery = query;

        if (filterRequest != null)
        {
            query = ApplyFilters(query, filterRequest);
            orderedQuery = ApplyOrdering(query, filterRequest.OrderBy, filterRequest.Direction);

            // Pagination from filterRequest
            pageSize = Math.Min(MaxPageSize, Math.Max(1, filterRequest.PageSize));
            skip = (filterRequest.PageNumber - 1) * pageSize;
        }

        // One unordered query over the whole filtered set feeds the selectable ids and the total count.
        var filteredBoreholes = await query
            .Select(b => new SelectableBoreholeRow(b.Id, b.Locked))
            .ToListAsync()
            .ConfigureAwait(false);
        filteredBoreholes.Sort((a, b) => a.Id.CompareTo(b.Id));

        // Selectable boreholes (unlocked only) for client-side use (e.g., bulk selection in table)
        var allSelectableBoreholeIds = filteredBoreholes
            .Where(b => b.Locked == null || b.Locked < lockExpiryTime)
            .Select(b => b.Id)
            .ToList();

        // Execute query and map to list items
        var boreholes = await orderedQuery
            .Skip(skip)
            .Take(pageSize)
            .Select(b => new BoreholeListItem
            {
                Id = b.Id,
                OriginalName = b.OriginalName,
                Name = b.Name,
                WorkgroupId = b.WorkgroupId,
                WorkgroupName = b.Workgroup != null ? b.Workgroup.Name : null,
                StatusId = b.StatusId,
                TypeId = b.TypeId,
                PurposeId = b.PurposeId,
                RestrictionId = b.RestrictionId,
                RestrictionUntil = b.RestrictionUntil,
                NationalInterest = b.NationalInterest,
                LocationX = b.LocationX,
                LocationY = b.LocationY,
                ElevationZ = b.ElevationZ,
                TotalDepth = b.TotalDepth,
                Created = b.Created,
                Updated = b.Updated,
                Locked = b.Locked != null && b.Locked >= lockExpiryTime ? b.Locked : null,
            })
            .ToListAsync()
            .ConfigureAwait(false);

        var totalCount = filteredBoreholes.Count;
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new FilterResponse(
            totalCount,
            filterRequest?.PageNumber ?? 1,
            pageSize,
            totalPages,
            boreholes,
            allSelectableBoreholeIds);
    }

    /// <inheritdoc />
    public async Task<FeatureCollection> GetMapFeaturesAsync(BoreholeFilterCriteria? filterCriteria, User user)
    {
        var query = QueryVisibleBoreholes(user);
        if (filterCriteria != null)
        {
            query = ApplyFilters(query, filterCriteria);
        }

        // A stable order keeps identical results equal, so the client keeps its cached map data
        // and the map does not jump after a refetch.
        var boreholes = await query
            .Where(b => b.LocationX.HasValue && b.LocationY.HasValue)
            .OrderBy(b => b.Id)
            .Select(b => new MapBoreholeRow(b.Id, b.Name, b.TypeId, b.RestrictionId, b.LocationX ?? 0, b.LocationY ?? 0))
            .ToListAsync()
            .ConfigureAwait(false);

        return BuildGeoJson(boreholes);
    }

    /// <inheritdoc />
    public async Task<FilterStatsResponse> GetFilterStatsAsync(FilterRequest? filterRequest, User user)
    {
        var baseQuery = QueryVisibleBoreholes(user);

        var req = filterRequest ?? new FilterRequest();

        // For each dimension, clone the request, null out that dimension's filter,
        // apply all remaining filters, then group/count by that dimension's value.
        IQueryable<Borehole> QueryExcluding(Action<FilterRequest> mutate)
        {
            var clone = CloneFilterRequest(req);
            mutate(clone);
            return ApplyFilters(baseQuery, clone);
        }

        return new FilterStatsResponse
        {
            StatusId = await CountByIntAsync(QueryExcluding(r => r.StatusId = null), b => b.StatusId).ConfigureAwait(false),
            TypeId = await CountByIntAsync(QueryExcluding(r => r.TypeId = null), b => b.TypeId).ConfigureAwait(false),
            PurposeId = await CountByIntAsync(QueryExcluding(r => r.PurposeId = null), b => b.PurposeId).ConfigureAwait(false),
            WorkgroupId = await CountByIntAsync(QueryExcluding(r => r.WorkgroupId = null), b => b.WorkgroupId).ConfigureAwait(false),
            RestrictionId = await CountByIntAsync(QueryExcluding(r => r.RestrictionId = null), b => b.RestrictionId).ConfigureAwait(false),
            IdentifierTypeId = await CountByIdentifierTypesAsync(QueryExcluding(r => r.IdentifierTypeId = null), req.IdentifierValue).ConfigureAwait(false),
            WorkflowStatusCount = await CountByWorkflowStatusAsync(QueryExcluding(r => r.WorkflowStatus = null)).ConfigureAwait(false),
            NationalInterest = await CountByNullableBoolAsync(QueryExcluding(r => r.NationalInterest = null), b => b.NationalInterest).ConfigureAwait(false),
            CoreRepositoryStored = await CountByNullableBoolAsync(QueryExcluding(r => r.CoreRepositoryStored = null), b => b.CoreRepositoryStored).ConfigureAwait(false),
            TopBedrockIntersected = await CountByNullableBoolAsync(QueryExcluding(r => r.TopBedrockIntersected = null), b => b.TopBedrockIntersected).ConfigureAwait(false),
            HasGroundwater = await CountByNullableBoolAsync(QueryExcluding(r => r.HasGroundwater = null), b => b.HasGroundwater).ConfigureAwait(false),
            HasGeometry = await CountByBooleanAsync(
                QueryExcluding(r => r.HasGeometry = null),
                b => b.BoreholeGeometry != null && b.BoreholeGeometry.Any()).ConfigureAwait(false),
            HasLogs = await CountByBooleanAsync(
                QueryExcluding(r => r.HasLogs = null),
                b => context.LogRuns.Any(lr => lr.BoreholeId == b.Id)).ConfigureAwait(false),
            HasProfiles = await CountByBooleanAsync(
                QueryExcluding(r => r.HasProfiles = null),
                b => context.Profiles.Any(bf => bf.BoreholeId == b.Id)).ConfigureAwait(false),
            HasPhotos = await CountByBooleanAsync(
                QueryExcluding(r => r.HasPhotos = null),
                b => context.Photos.Any(p => p.BoreholeId == b.Id)).ConfigureAwait(false),
            HasDocuments = await CountByBooleanAsync(
                QueryExcluding(r => r.HasDocuments = null),
                b => context.Documents.Any(d => d.BoreholeId == b.Id)).ConfigureAwait(false),
            Canton = await CountByStringAsync(QueryExcluding(r => r.Canton = null), b => b.Canton).ConfigureAwait(false),
            Municipality = await CountByStringAsync(QueryExcluding(r => r.Municipality = null), b => b.Municipality).ConfigureAwait(false),
            LogToolTypeId = await CountByLogToolTypeAsync(QueryExcluding(r => r.LogToolTypeId = null)).ConfigureAwait(false),
            SourceTypeId = await CountBySourceTypeAsync(QueryExcluding(r => r.SourceTypeId = null)).ConfigureAwait(false),
        };
    }

    /// <inheritdoc />
    public async Task<IList<BoreholeSuggestion>> GetSuggestionsAsync(
        BoreholeSuggestionField field,
        string query,
        int limit,
        FilterRequest? filterRequest,
        User user)
    {
        var baseQuery = QueryVisibleBoreholes(user);

        if (filterRequest != null)
        {
            // Filter-exclusion semantics: when computing suggestions for a field, drop that
            // field's own filter so the user can refine the value they're typing. All other
            // active filters still constrain the suggestion set (strict intersection).
            var effectiveFilter = CloneFilterRequest(filterRequest);
            switch (field)
            {
                case BoreholeSuggestionField.OriginalName:
                    effectiveFilter.OriginalName = null;
                    break;
                case BoreholeSuggestionField.ProjectName:
                    effectiveFilter.ProjectName = null;
                    break;
                case BoreholeSuggestionField.Name:
                    effectiveFilter.Name = null;
                    break;
            }

            baseQuery = ApplyFilters(baseQuery, effectiveFilter);
        }

        var prefix = query + "%";
        var groupedQuery = field switch
        {
            BoreholeSuggestionField.OriginalName => baseQuery
                .Where(b => b.OriginalName != null && b.OriginalName != "" && EF.Functions.ILike(b.OriginalName!, prefix))
                .GroupBy(b => b.OriginalName!)
                .Select(g => new { Value = g.Key, Count = g.Count() }),
            BoreholeSuggestionField.ProjectName => baseQuery
                .Where(b => b.ProjectName != null && b.ProjectName != "" && EF.Functions.ILike(b.ProjectName!, prefix))
                .GroupBy(b => b.ProjectName!)
                .Select(g => new { Value = g.Key, Count = g.Count() }),
            BoreholeSuggestionField.Name => baseQuery
                .Where(b => b.Name != null && b.Name != "" && EF.Functions.ILike(b.Name!, prefix))
                .GroupBy(b => b.Name!)
                .Select(g => new { Value = g.Key, Count = g.Count() }),
            _ => throw new InvalidOperationException("Unreachable: enum binding guarantees a valid field."),
        };

        var rows = await groupedQuery
            .OrderByDescending(s => s.Count)
            .ThenBy(s => s.Value)
            .Take(limit)
            .ToListAsync()
            .ConfigureAwait(false);

        return rows.Select(r => new BoreholeSuggestion(r.Value, r.Count)).ToList();
    }

    private IQueryable<Borehole> QueryVisibleBoreholes(User user)
    {
        var query = context.Boreholes.AsNoTracking();
        if (user.IsAdmin) return query;

        var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
        return query.Where(b => b.WorkgroupId.HasValue && allowedWorkgroupIds.Contains(b.WorkgroupId.Value));
    }

    private static async Task<Dictionary<WorkflowStatus, int>> CountByWorkflowStatusAsync(IQueryable<Borehole> query)
    {
        var grouped = await query
            .Where(b => b.Workflow != null)
            .GroupBy(b => b.Workflow!.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync()
            .ConfigureAwait(false);

        return grouped.ToDictionary(x => x.Status, x => x.Count);
    }

    private static async Task<Dictionary<int, int>> CountByIntAsync(
        IQueryable<Borehole> query,
        Expression<Func<Borehole, int?>> selector)
    {
        var grouped = await query
            .Select(selector)
            .Where(id => id.HasValue)
            .GroupBy(id => id!.Value)
            .Select(g => new { Key = g.Key, Count = g.Count() })
            .ToListAsync()
            .ConfigureAwait(false);

        return grouped.ToDictionary(x => x.Key, x => x.Count);
    }

    private static async Task<Dictionary<string, int>> CountByStringAsync(
        IQueryable<Borehole> query,
        Expression<Func<Borehole, string?>> selector)
    {
        var grouped = await query
            .Select(selector)
            .Where(v => v != null)
            .GroupBy(v => v!)
            .Select(g => new { Key = g.Key, Count = g.Count() })
            .ToListAsync()
            .ConfigureAwait(false);

        return grouped.ToDictionary(x => x.Key, x => x.Count);
    }

    private async Task<Dictionary<int, int>> CountByLogToolTypeAsync(IQueryable<Borehole> boreholeQuery)
    {
        // Distinct-borehole count per tool type codelist id. Avoids double-counting boreholes
        // with multiple log files referencing the same tool type.
        var grouped = await boreholeQuery
            .SelectMany(b => context.LogRuns
                .Where(lr => lr.BoreholeId == b.Id)
                .SelectMany(lr => context.LogFiles
                    .Where(lf => lf.LogRunId == lr.Id)
                    .SelectMany(lf => lf.LogFileToolTypeCodes!
                        .Select(t => new { CodelistId = t.CodelistId, BoreholeId = b.Id }))))
            .GroupBy(r => r.CodelistId)
            .Select(g => new { Key = g.Key, Count = g.Select(r => r.BoreholeId).Distinct().Count() })
            .ToListAsync()
            .ConfigureAwait(false);

        return grouped.ToDictionary(x => x.Key, x => x.Count);
    }

    private static async Task<Dictionary<int, int>> CountBySourceTypeAsync(IQueryable<Borehole> boreholeQuery)
    {
        // The join table's primary key is (borehole_id, codelist_id), so each row is a distinct borehole per type.
        var grouped = await boreholeQuery
            .SelectMany(b => b.BoreholeSourceTypeCodes!.Select(c => c.CodelistId))
            .GroupBy(codelistId => codelistId)
            .Select(g => new { Key = g.Key, Count = g.Count() })
            .ToListAsync()
            .ConfigureAwait(false);

        return grouped.ToDictionary(x => x.Key, x => x.Count);
    }

    private static async Task<BooleanCounts> CountByBooleanAsync(
        IQueryable<Borehole> query,
        Expression<Func<Borehole, bool>> isTrue)
    {
        var grouped = await query
            .Select(isTrue)
            .GroupBy(value => value)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToListAsync()
            .ConfigureAwait(false);

        return new BooleanCounts
        {
            True = grouped.FirstOrDefault(g => g.Key)?.Count ?? 0,
            False = grouped.FirstOrDefault(g => !g.Key)?.Count ?? 0,
        };
    }

    private static async Task<NullableBooleanCounts> CountByNullableBoolAsync(
        IQueryable<Borehole> query,
        Expression<Func<Borehole, bool?>> selector)
    {
        var grouped = await query
            .Select(selector)
            .GroupBy(value => value)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToListAsync()
            .ConfigureAwait(false);

        return new NullableBooleanCounts
        {
            True = grouped.FirstOrDefault(g => g.Key == true)?.Count ?? 0,
            False = grouped.FirstOrDefault(g => g.Key == false)?.Count ?? 0,
            Null = grouped.FirstOrDefault(g => g.Key == null)?.Count ?? 0,
        };
    }

    private async Task<Dictionary<int, int>> CountByIdentifierTypesAsync(
        IQueryable<Borehole> boreholeQuery,
        string? valueFilter)
    {
        var hasValue = !string.IsNullOrWhiteSpace(valueFilter);
        var valuePattern = hasValue ? $"%{valueFilter}%" : null;
        var grouped = await boreholeQuery
            .SelectMany(b => b.BoreholeCodelists!.Select(c => new { c.CodelistId, c.Value, b.Id }))
            .Where(r => !hasValue || EF.Functions.ILike(r.Value, valuePattern!))
            .GroupBy(r => r.CodelistId)
            .Select(g => new { Key = g.Key, Count = g.Select(r => r.Id).Distinct().Count() })
            .ToListAsync()
            .ConfigureAwait(false);

        return grouped.ToDictionary(x => x.Key, x => x.Count);
    }

    private static FilterRequest CloneFilterRequest(FilterRequest src) => new()
    {
        Polygon = src.Polygon,
        OriginalName = src.OriginalName,
        ProjectName = src.ProjectName,
        Name = src.Name,
        StatusId = src.StatusId,
        TypeId = src.TypeId,
        PurposeId = src.PurposeId,
        WorkflowStatus = src.WorkflowStatus,
        WorkgroupId = src.WorkgroupId,
        RestrictionUntilFrom = src.RestrictionUntilFrom,
        RestrictionUntilTo = src.RestrictionUntilTo,
        TotalDepthMin = src.TotalDepthMin,
        TotalDepthMax = src.TotalDepthMax,
        TopBedrockFreshMdMin = src.TopBedrockFreshMdMin,
        TopBedrockFreshMdMax = src.TopBedrockFreshMdMax,
        TopBedrockWeatheredMdMin = src.TopBedrockWeatheredMdMin,
        TopBedrockWeatheredMdMax = src.TopBedrockWeatheredMdMax,
        IdentifierTypeId = src.IdentifierTypeId,
        IdentifierValue = src.IdentifierValue,
        RestrictionId = src.RestrictionId,
        Canton = src.Canton,
        Municipality = src.Municipality,
        LogToolTypeId = src.LogToolTypeId,
        SourceTypeId = src.SourceTypeId,
        NationalInterest = src.NationalInterest,
        CoreRepositoryStored = src.CoreRepositoryStored,
        TopBedrockIntersected = src.TopBedrockIntersected,
        HasGroundwater = src.HasGroundwater,
        HasGeometry = src.HasGeometry,
        HasLogs = src.HasLogs,
        HasProfiles = src.HasProfiles,
        HasPhotos = src.HasPhotos,
        HasDocuments = src.HasDocuments,
    };

    private IQueryable<Borehole> ApplyFilters(IQueryable<Borehole> query, BoreholeFilterCriteria filterCriteria)
    {
        if (filterCriteria == null) return query;

        query = ApplyPolygonAndTextFilters(query, filterCriteria);
        query = ApplySimplePropertyFilters(query, filterCriteria);
        query = ApplyNestedPropertyFilters(query, filterCriteria);
        query = ApplyRangeFilters(query, filterCriteria);
        query = ApplyBooleanFilters(query, filterCriteria);
        return ApplyAvailabilityFilters(query, filterCriteria);
    }

    private static IQueryable<Borehole> ApplyPolygonAndTextFilters(IQueryable<Borehole> query, BoreholeFilterCriteria filterCriteria)
    {
        // Polygon geometry filter
        if (filterCriteria.Polygon != null)
        {
            query = query.Where(b =>
                b.Geometry != null &&
                filterCriteria.Polygon.Intersects(b.Geometry));
        }

        // Text filters
        if (!string.IsNullOrWhiteSpace(filterCriteria.OriginalName))
        {
            query = query.Where(b => b.OriginalName != null && EF.Functions.ILike(b.OriginalName, $"%{filterCriteria.OriginalName}%"));
        }

        if (!string.IsNullOrWhiteSpace(filterCriteria.ProjectName))
        {
            query = query.Where(b => b.ProjectName != null && EF.Functions.ILike(b.ProjectName, $"%{filterCriteria.ProjectName}%"));
        }

        if (!string.IsNullOrWhiteSpace(filterCriteria.Name))
        {
            query = query.Where(b => b.Name != null && EF.Functions.ILike(b.Name, $"%{filterCriteria.Name}%"));
        }

        return query;
    }

    private static IQueryable<Borehole> ApplySimplePropertyFilters(IQueryable<Borehole> query, BoreholeFilterCriteria filterCriteria)
    {
        // Simple property filters
        if (HasAny(filterCriteria.StatusId))
        {
            query = query.Where(b => b.StatusId.HasValue && filterCriteria.StatusId.Contains(b.StatusId.Value));
        }

        if (HasAny(filterCriteria.TypeId))
        {
            query = query.Where(b => b.TypeId.HasValue && filterCriteria.TypeId.Contains(b.TypeId.Value));
        }

        if (HasAny(filterCriteria.PurposeId))
        {
            query = query.Where(b => b.PurposeId.HasValue && filterCriteria.PurposeId.Contains(b.PurposeId.Value));
        }

        if (HasAny(filterCriteria.WorkgroupId))
        {
            query = query.Where(b => b.WorkgroupId.HasValue && filterCriteria.WorkgroupId.Contains(b.WorkgroupId.Value));
        }

        if (HasAny(filterCriteria.RestrictionId))
        {
            query = query.Where(b => b.RestrictionId.HasValue && filterCriteria.RestrictionId.Contains(b.RestrictionId.Value));
        }

        if (HasAny(filterCriteria.Canton))
        {
            query = query.Where(b => b.Canton != null && filterCriteria.Canton.Contains(b.Canton));
        }

        if (HasAny(filterCriteria.Municipality))
        {
            query = query.Where(b => b.Municipality != null && filterCriteria.Municipality.Contains(b.Municipality));
        }

        return query;
    }

    private IQueryable<Borehole> ApplyNestedPropertyFilters(IQueryable<Borehole> query, BoreholeFilterCriteria filterCriteria)
    {
        // Nested property filters (requires joining with related tables)
        if (HasAny(filterCriteria.LogToolTypeId))
        {
            query = query.Where(b =>
                context.LogRuns.Any(lr => lr.BoreholeId == b.Id
                    && context.LogFiles.Any(lf => lf.LogRunId == lr.Id
                        && lf.LogFileToolTypeCodes != null
                        && lf.LogFileToolTypeCodes.Any(t => filterCriteria.LogToolTypeId.Contains(t.CodelistId)))));
        }

        if (HasAny(filterCriteria.SourceTypeId))
        {
            query = query.Where(b => b.BoreholeSourceTypeCodes != null && b.BoreholeSourceTypeCodes.Any(c => filterCriteria.SourceTypeId.Contains(c.CodelistId)));
        }

        // Identifier filters — strict same-row semantics: when both type and value
        // are present, both predicates must hold on the *same* BoreholeCodelist row.
        var hasIdentifierTypes = HasAny(filterCriteria.IdentifierTypeId);
        var hasIdentifierValue = !string.IsNullOrWhiteSpace(filterCriteria.IdentifierValue);
        if (hasIdentifierTypes || hasIdentifierValue)
        {
            var typeIds = filterCriteria.IdentifierTypeId;
            var valuePattern = hasIdentifierValue ? $"%{filterCriteria.IdentifierValue}%" : null;

            query = query.Where(b => b.BoreholeCodelists!.Any(c =>
                (!hasIdentifierTypes || typeIds!.Contains(c.CodelistId)) &&
                (!hasIdentifierValue || EF.Functions.ILike(c.Value, valuePattern!))));
        }

        // Workflow status filter
        if (HasAny(filterCriteria.WorkflowStatus))
        {
            query = query.Where(b => b.Workflow != null && filterCriteria.WorkflowStatus.Contains(b.Workflow.Status));
        }

        return query;
    }

    private static IQueryable<Borehole> ApplyRangeFilters(IQueryable<Borehole> query, BoreholeFilterCriteria filterCriteria)
    {
        // Date range filters
        if (filterCriteria.RestrictionUntilFrom.HasValue)
        {
            query = query.Where(b => b.RestrictionUntil >= filterCriteria.RestrictionUntilFrom.Value);
        }

        if (filterCriteria.RestrictionUntilTo.HasValue)
        {
            query = query.Where(b => b.RestrictionUntil <= filterCriteria.RestrictionUntilTo.Value);
        }

        // Numeric range filters
        if (filterCriteria.TotalDepthMin.HasValue)
        {
            query = query.Where(b => b.TotalDepth >= filterCriteria.TotalDepthMin.Value);
        }

        if (filterCriteria.TotalDepthMax.HasValue)
        {
            query = query.Where(b => b.TotalDepth <= filterCriteria.TotalDepthMax.Value);
        }

        if (filterCriteria.TopBedrockFreshMdMin.HasValue)
        {
            query = query.Where(b => b.TopBedrockFreshMd >= filterCriteria.TopBedrockFreshMdMin.Value);
        }

        if (filterCriteria.TopBedrockFreshMdMax.HasValue)
        {
            query = query.Where(b => b.TopBedrockFreshMd <= filterCriteria.TopBedrockFreshMdMax.Value);
        }

        if (filterCriteria.TopBedrockWeatheredMdMin.HasValue)
        {
            query = query.Where(b => b.TopBedrockWeatheredMd >= filterCriteria.TopBedrockWeatheredMdMin.Value);
        }

        if (filterCriteria.TopBedrockWeatheredMdMax.HasValue)
        {
            query = query.Where(b => b.TopBedrockWeatheredMd <= filterCriteria.TopBedrockWeatheredMdMax.Value);
        }

        return query;
    }

    private static IQueryable<Borehole> ApplyBooleanFilters(IQueryable<Borehole> query, BoreholeFilterCriteria filterCriteria)
    {
        // Boolean filters
        query = WhereNullableBoolean(query, filterCriteria.NationalInterest, b => b.NationalInterest);
        query = WhereNullableBoolean(query, filterCriteria.CoreRepositoryStored, b => b.CoreRepositoryStored);
        query = WhereNullableBoolean(query, filterCriteria.TopBedrockIntersected, b => b.TopBedrockIntersected);
        query = WhereNullableBoolean(query, filterCriteria.HasGroundwater, b => b.HasGroundwater);
        return WhereHasData(query, filterCriteria.HasGeometry, b => b.BoreholeGeometry != null && b.BoreholeGeometry.Any());
    }

    private IQueryable<Borehole> ApplyAvailabilityFilters(IQueryable<Borehole> query, BoreholeFilterCriteria filterCriteria)
    {
        // Availability filters (requires joining with related tables)
        query = WhereHasData(query, filterCriteria.HasLogs, b => context.LogRuns.Any(lr => lr.BoreholeId == b.Id));
        query = WhereHasData(query, filterCriteria.HasProfiles, b => context.Profiles.Any(p => p.BoreholeId == b.Id));
        query = WhereHasData(query, filterCriteria.HasPhotos, b => context.Photos.Any(p => p.BoreholeId == b.Id));
        return WhereHasData(query, filterCriteria.HasDocuments, b => context.Documents.Any(d => d.BoreholeId == b.Id));
    }

    private static bool HasAny<T>([NotNullWhen(true)] IEnumerable<T>? values) => values != null && values.Any();

    /// <summary>
    /// Keeps the boreholes whose nullable boolean <paramref name="property"/> matches the three-state
    /// <paramref name="filter"/>, where <see cref="NullableBooleanFilterValue.Null"/> matches an unset value.
    /// </summary>
    private static IQueryable<Borehole> WhereNullableBoolean(IQueryable<Borehole> query, NullableBooleanFilterValue? filter, Expression<Func<Borehole, bool?>> property)
    {
        if (filter is null) return query;

        bool? expectedValue = filter == NullableBooleanFilterValue.Null ? null : filter == NullableBooleanFilterValue.True;
        var matchesFilter = Expression.Lambda<Func<Borehole, bool>>(
            Expression.Equal(property.Body, Expression.Constant(expectedValue, typeof(bool?))),
            property.Parameters);
        return query.Where(matchesFilter);
    }

    /// <summary>
    /// Keeps the boreholes for which <paramref name="hasData"/> holds when the <paramref name="filter"/> is
    /// <see cref="BooleanFilterValue.True"/>, and those for which it does not hold otherwise.
    /// </summary>
    private static IQueryable<Borehole> WhereHasData(IQueryable<Borehole> query, BooleanFilterValue? filter, Expression<Func<Borehole, bool>> hasData)
    {
        if (filter is null) return query;
        if (filter == BooleanFilterValue.True) return query.Where(hasData);

        var hasNoData = Expression.Lambda<Func<Borehole, bool>>(Expression.Not(hasData.Body), hasData.Parameters);
        return query.Where(hasNoData);
    }

    private static IQueryable<Borehole> ApplyOrdering(IQueryable<Borehole> query, BoreholeOrderBy? orderBy, OrderDirection? direction)
    {
        var isDescending = direction == OrderDirection.Desc;

        // The id tiebreaker keeps pages from skipping or repeating boreholes with equal sort keys.
        if (orderBy is null)
        {
            return isDescending
                ? query.OrderByDescending(b => b.Name).ThenByDescending(b => b.Id)
                : query.OrderBy(b => b.Name).ThenBy(b => b.Id);
        }

        Expression<Func<Borehole, object>> orderExpression = orderBy switch
        {
            BoreholeOrderBy.Id => b => b.Id,
            BoreholeOrderBy.OriginalName => b => b.OriginalName ?? string.Empty,
            BoreholeOrderBy.Name => b => b.Name ?? string.Empty,
            BoreholeOrderBy.WorkgroupId => b => b.WorkgroupId ?? 0,
            BoreholeOrderBy.StatusId => b => b.StatusId ?? 0,
            BoreholeOrderBy.TypeId => b => b.TypeId ?? 0,
            BoreholeOrderBy.PurposeId => b => b.PurposeId ?? 0,
            BoreholeOrderBy.LocationX => b => b.LocationX ?? 0,
            BoreholeOrderBy.LocationY => b => b.LocationY ?? 0,
            BoreholeOrderBy.ElevationZ => b => b.ElevationZ ?? 0,
            BoreholeOrderBy.TotalDepth => b => b.TotalDepth ?? 0,
            _ => b => b.Name ?? string.Empty,
        };

        return isDescending
            ? query.OrderByDescending(orderExpression).ThenByDescending(b => b.Id)
            : query.OrderBy(orderExpression).ThenBy(b => b.Id);
    }

    private static FeatureCollection BuildGeoJson(IEnumerable<MapBoreholeRow> boreholes)
    {
        var featureCollection = new FeatureCollection();

        foreach (var borehole in boreholes)
        {
            var point = new Point(borehole.LocationX, borehole.LocationY) { SRID = SpatialReferenceIdentifier.LV95 };
            var attributes = new AttributesTable
            {
                // Include selected attributes needed for map display and popups.
                { "id", borehole.Id },
                { "type", borehole.TypeId },
                { "name", borehole.Name },
                { "restriction", borehole.RestrictionId },
            };

            var feature = new Feature(point, attributes);
            featureCollection.Add(feature);
        }

        return featureCollection;
    }

    private sealed record SelectableBoreholeRow(int Id, DateTime? Locked);

    private sealed record MapBoreholeRow(int Id, string? Name, int? TypeId, int? RestrictionId, double LocationX, double LocationY);
}
