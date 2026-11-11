using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
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

        // Base query
        var query = context.Boreholes.AsNoTracking();

        // Apply permission filtering by workgroup
        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            query = query.Where(b => b.WorkgroupId.HasValue && allowedWorkgroupIds.Contains(b.WorkgroupId.Value));
        }

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

        // One unordered query over the whole filtered set feeds the selectable ids, the map and the total count.
        var filteredBoreholes = await query
            .Select(b => new FilteredBoreholeRow(b.Id, b.Name, b.TypeId, b.RestrictionId, b.LocationX, b.LocationY, b.Locked))
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
                IsPublic = b.IsPublic,
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
            BuildGeoJson(filteredBoreholes),
            allSelectableBoreholeIds);
    }

    /// <inheritdoc />
    public async Task<FilterStatsResponse> GetFilterStatsAsync(FilterRequest? filterRequest, User user)
    {
        var baseQuery = context.Boreholes.AsNoTracking();

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            baseQuery = baseQuery.Where(b => b.WorkgroupId.HasValue && allowedWorkgroupIds.Contains(b.WorkgroupId.Value));
        }

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
        var baseQuery = context.Boreholes.AsNoTracking();

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            baseQuery = baseQuery.Where(b => b.WorkgroupId.HasValue && allowedWorkgroupIds.Contains(b.WorkgroupId.Value));
        }

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

    private IQueryable<Borehole> ApplyFilters(IQueryable<Borehole> query, FilterRequest filterRequest)
    {
        if (filterRequest == null) return query;

        // Polygon geometry filter
        if (filterRequest.Polygon != null)
        {
            query = query.Where(b =>
                b.Geometry != null &&
                filterRequest.Polygon.Intersects(b.Geometry));
        }

        // Text filters
        if (!string.IsNullOrWhiteSpace(filterRequest.OriginalName))
        {
            query = query.Where(b => b.OriginalName != null && EF.Functions.ILike(b.OriginalName, $"%{filterRequest.OriginalName}%"));
        }

        if (!string.IsNullOrWhiteSpace(filterRequest.ProjectName))
        {
            query = query.Where(b => b.ProjectName != null && EF.Functions.ILike(b.ProjectName, $"%{filterRequest.ProjectName}%"));
        }

        if (!string.IsNullOrWhiteSpace(filterRequest.Name))
        {
            query = query.Where(b => b.Name != null && EF.Functions.ILike(b.Name, $"%{filterRequest.Name}%"));
        }

        // Simple property filters
        if (filterRequest.StatusId != null && filterRequest.StatusId.Any())
        {
            query = query.Where(b => b.StatusId.HasValue && filterRequest.StatusId.Contains(b.StatusId.Value));
        }

        if (filterRequest.TypeId != null && filterRequest.TypeId.Any())
        {
            query = query.Where(b => b.TypeId.HasValue && filterRequest.TypeId.Contains(b.TypeId.Value));
        }

        if (filterRequest.PurposeId != null && filterRequest.PurposeId.Any())
        {
            query = query.Where(b => b.PurposeId.HasValue && filterRequest.PurposeId.Contains(b.PurposeId.Value));
        }

        if (filterRequest.WorkgroupId != null && filterRequest.WorkgroupId.Any())
        {
            query = query.Where(b => b.WorkgroupId.HasValue && filterRequest.WorkgroupId.Contains(b.WorkgroupId.Value));
        }

        if (filterRequest.RestrictionId != null && filterRequest.RestrictionId.Any())
        {
            query = query.Where(b => b.RestrictionId.HasValue && filterRequest.RestrictionId.Contains(b.RestrictionId.Value));
        }

        if (filterRequest.Canton != null && filterRequest.Canton.Any())
        {
            query = query.Where(b => b.Canton != null && filterRequest.Canton.Contains(b.Canton));
        }

        if (filterRequest.Municipality != null && filterRequest.Municipality.Any())
        {
            query = query.Where(b => b.Municipality != null && filterRequest.Municipality.Contains(b.Municipality));
        }

        // Nested property filters (requires joining with related tables)
        if (filterRequest.LogToolTypeId != null && filterRequest.LogToolTypeId.Any())
        {
            query = query.Where(b =>
                context.LogRuns.Any(lr => lr.BoreholeId == b.Id
                    && context.LogFiles.Any(lf => lf.LogRunId == lr.Id
                        && lf.LogFileToolTypeCodes!.Any(t => filterRequest.LogToolTypeId.Contains(t.CodelistId)))));
        }

        if (filterRequest.SourceTypeId != null && filterRequest.SourceTypeId.Any())
        {
            query = query.Where(b => b.BoreholeSourceTypeCodes!.Any(c => filterRequest.SourceTypeId.Contains(c.CodelistId)));
        }

        // Identifier filters — strict same-row semantics: when both type and value
        // are present, both predicates must hold on the *same* BoreholeCodelist row.
        var hasIdentifierTypes = filterRequest.IdentifierTypeId != null && filterRequest.IdentifierTypeId.Any();
        var hasIdentifierValue = !string.IsNullOrWhiteSpace(filterRequest.IdentifierValue);
        if (hasIdentifierTypes || hasIdentifierValue)
        {
            var typeIds = filterRequest.IdentifierTypeId;
            var valuePattern = hasIdentifierValue ? $"%{filterRequest.IdentifierValue}%" : null;

            query = query.Where(b => b.BoreholeCodelists!.Any(c =>
                (!hasIdentifierTypes || typeIds!.Contains(c.CodelistId)) &&
                (!hasIdentifierValue || EF.Functions.ILike(c.Value, valuePattern!))));
        }

        // Workflow status filter
        if (filterRequest.WorkflowStatus != null && filterRequest.WorkflowStatus.Any())
        {
            query = query.Where(b => b.Workflow != null && filterRequest.WorkflowStatus.Contains(b.Workflow.Status));
        }

        // Date range filters
        if (filterRequest.RestrictionUntilFrom.HasValue)
        {
            query = query.Where(b => b.RestrictionUntil >= filterRequest.RestrictionUntilFrom.Value);
        }

        if (filterRequest.RestrictionUntilTo.HasValue)
        {
            query = query.Where(b => b.RestrictionUntil <= filterRequest.RestrictionUntilTo.Value);
        }

        // Numeric range filters
        if (filterRequest.TotalDepthMin.HasValue)
        {
            query = query.Where(b => b.TotalDepth >= filterRequest.TotalDepthMin.Value);
        }

        if (filterRequest.TotalDepthMax.HasValue)
        {
            query = query.Where(b => b.TotalDepth <= filterRequest.TotalDepthMax.Value);
        }

        if (filterRequest.TopBedrockFreshMdMin.HasValue)
        {
            query = query.Where(b => b.TopBedrockFreshMd >= filterRequest.TopBedrockFreshMdMin.Value);
        }

        if (filterRequest.TopBedrockFreshMdMax.HasValue)
        {
            query = query.Where(b => b.TopBedrockFreshMd <= filterRequest.TopBedrockFreshMdMax.Value);
        }

        if (filterRequest.TopBedrockWeatheredMdMin.HasValue)
        {
            query = query.Where(b => b.TopBedrockWeatheredMd >= filterRequest.TopBedrockWeatheredMdMin.Value);
        }

        if (filterRequest.TopBedrockWeatheredMdMax.HasValue)
        {
            query = query.Where(b => b.TopBedrockWeatheredMd <= filterRequest.TopBedrockWeatheredMdMax.Value);
        }

        // Boolean filters
        if (filterRequest.NationalInterest != null)
        {
            if (filterRequest.NationalInterest == NullableBooleanFilterValue.Null)
                query = query.Where(b => b.NationalInterest == null);
            else
                query = query.Where(b => b.NationalInterest == (filterRequest.NationalInterest == NullableBooleanFilterValue.True));
        }

        if (filterRequest.CoreRepositoryStored != null)
        {
            if (filterRequest.CoreRepositoryStored == NullableBooleanFilterValue.Null)
                query = query.Where(b => b.CoreRepositoryStored == null);
            else
                query = query.Where(b => b.CoreRepositoryStored == (filterRequest.CoreRepositoryStored == NullableBooleanFilterValue.True));
        }

        if (filterRequest.TopBedrockIntersected != null)
        {
            if (filterRequest.TopBedrockIntersected == NullableBooleanFilterValue.Null)
                query = query.Where(b => b.TopBedrockIntersected == null);
            else
                query = query.Where(b => b.TopBedrockIntersected == (filterRequest.TopBedrockIntersected == NullableBooleanFilterValue.True));
        }

        if (filterRequest.HasGroundwater != null)
        {
            if (filterRequest.HasGroundwater == NullableBooleanFilterValue.Null)
                query = query.Where(b => b.HasGroundwater == null);
            else
                query = query.Where(b => b.HasGroundwater == (filterRequest.HasGroundwater == NullableBooleanFilterValue.True));
        }

        if (filterRequest.HasGeometry != null)
        {
            if (filterRequest.HasGeometry == BooleanFilterValue.True)
                query = query.Where(b => b.BoreholeGeometry != null && b.BoreholeGeometry.Any());
            else
                query = query.Where(b => b.BoreholeGeometry == null || !b.BoreholeGeometry.Any());
        }

        // Availability filters (requires joining with related tables)
        if (filterRequest.HasLogs != null)
        {
            if (filterRequest.HasLogs == BooleanFilterValue.True)
                query = query.Where(b => context.LogRuns.Any(lr => lr.BoreholeId == b.Id));
            else
                query = query.Where(b => !context.LogRuns.Any(lr => lr.BoreholeId == b.Id));
        }

        if (filterRequest.HasProfiles != null)
        {
            if (filterRequest.HasProfiles == BooleanFilterValue.True)
                query = query.Where(b => context.Profiles.Any(p => p.BoreholeId == b.Id));
            else
                query = query.Where(b => !context.Profiles.Any(p => p.BoreholeId == b.Id));
        }

        if (filterRequest.HasPhotos != null)
        {
            if (filterRequest.HasPhotos == BooleanFilterValue.True)
                query = query.Where(b => context.Photos.Any(p => p.BoreholeId == b.Id));
            else
                query = query.Where(b => !context.Photos.Any(p => p.BoreholeId == b.Id));
        }

        if (filterRequest.HasDocuments != null)
        {
            if (filterRequest.HasDocuments == BooleanFilterValue.True)
                query = query.Where(b => context.Documents.Any(d => d.BoreholeId == b.Id));
            else
                query = query.Where(b => !context.Documents.Any(d => d.BoreholeId == b.Id));
        }

        return query;
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

    private static FeatureCollection BuildGeoJson(IEnumerable<FilteredBoreholeRow> boreholes)
    {
        var featureCollection = new FeatureCollection();

        foreach (var borehole in boreholes)
        {
            if (borehole.LocationX.HasValue && borehole.LocationY.HasValue)
            {
                var point = new Point(borehole.LocationX.Value, borehole.LocationY.Value) { SRID = SpatialReferenceIdentifier.LV95 };
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
        }

        return featureCollection;
    }

    private sealed record FilteredBoreholeRow(int Id, string? Name, int? TypeId, int? RestrictionId, double? LocationX, double? LocationY, DateTime? Locked);
}
