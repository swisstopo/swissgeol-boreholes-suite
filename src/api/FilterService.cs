using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using System.Linq.Expressions;

namespace BDMS;

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
        var query = context.Boreholes
            .Include(b => b.Workgroup)
            .AsNoTracking();

        // Apply permission filtering by workgroup
        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            query = query.Where(b => b.WorkgroupId.HasValue && allowedWorkgroupIds.Contains(b.WorkgroupId.Value));
        }

        // Default pagination
        var pageSize = MaxPageSize;
        var skip = 0;

        if (filterRequest != null)
        {
            query = ApplyFilters(query, filterRequest);
            query = ApplyOrdering(query, filterRequest.OrderBy, filterRequest.Direction);

            // Pagination from filterRequest
            pageSize = Math.Min(MaxPageSize, Math.Max(1, filterRequest.PageSize));
            skip = (filterRequest.PageNumber - 1) * pageSize;
        }

        var allFilteredBoreholeIds = await query
            .Select(b => b.Id)
            .ToListAsync()
            .ConfigureAwait(false);

        // Get all selectable borehole IDs (unlocked only) for client-side use (e.g., bulk selection in table)
        var allSelectableBoreholeIds = await query
            .Where(b => b.Locked == null || b.Locked < lockExpiryTime)
            .Select(b => b.Id)
            .ToListAsync()
            .ConfigureAwait(false);

        var paginatedQuery = query.Skip(skip).Take(pageSize);

        // Execute query and map to list items
        var boreholes = await paginatedQuery
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

        // Build GeoJSON feature collection for map from all filtered boreholes
        var geoJson = await BuildGeoJsonAsync(query).ConfigureAwait(false);
        var totalCount = await query.CountAsync().ConfigureAwait(false);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new FilterResponse(
            totalCount,
            filterRequest?.PageNumber ?? 1,
            pageSize,
            totalPages,
            boreholes,
            geoJson,
            allFilteredBoreholeIds,
            allSelectableBoreholeIds);
    }

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

        if (filterRequest.Ids != null && filterRequest.Ids.Any())
        {
            query = query.Where(b => filterRequest.Ids.Contains(b.Id));
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

        // Workflow status filter
        if (filterRequest.WorkflowStatus.HasValue)
        {
            query = query.Where(b => b.Workflow != null && b.Workflow.Status == filterRequest.WorkflowStatus.Value);
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
            if (filterRequest.NationalInterest == TriStateBooleanFilter.Null)
                query = query.Where(b => b.NationalInterest == null);
            else
                query = query.Where(b => b.NationalInterest == (filterRequest.NationalInterest == TriStateBooleanFilter.True));
        }

        if (filterRequest.TopBedrockIntersected != null)
        {
            if (filterRequest.TopBedrockIntersected == TriStateBooleanFilter.Null)
                query = query.Where(b => b.TopBedrockIntersected == null);
            else
                query = query.Where(b => b.TopBedrockIntersected == (filterRequest.TopBedrockIntersected == TriStateBooleanFilter.True));
        }

        if (filterRequest.HasGroundwater != null)
        {
            if (filterRequest.HasGroundwater == TriStateBooleanFilter.Null)
                query = query.Where(b => b.HasGroundwater == null);
            else
                query = query.Where(b => b.HasGroundwater == (filterRequest.HasGroundwater == TriStateBooleanFilter.True));
        }

        if (filterRequest.HasGeometry != null)
        {
            if (filterRequest.HasGeometry == BooleanFilter.True)
                query = query.Where(b => b.BoreholeGeometry != null && b.BoreholeGeometry.Any());
            else
                query = query.Where(b => b.BoreholeGeometry == null || !b.BoreholeGeometry.Any());
        }

        // Availability filters (requires joining with related tables)
        if (filterRequest.HasLogs != null)
        {
            if (filterRequest.HasLogs == BooleanFilter.True)
                query = query.Where(b => context.LogRuns.Any(lr => lr.BoreholeId == b.Id));
            else
                query = query.Where(b => !context.LogRuns.Any(lr => lr.BoreholeId == b.Id));
        }

        if (filterRequest.HasProfiles != null)
        {
            if (filterRequest.HasProfiles == BooleanFilter.True)
                query = query.Where(b => context.BoreholeFiles.Any(bf => bf.BoreholeId == b.Id));
            else
                query = query.Where(b => !context.BoreholeFiles.Any(bf => bf.BoreholeId == b.Id));
        }

        if (filterRequest.HasPhotos != null)
        {
            if (filterRequest.HasPhotos == BooleanFilter.True)
                query = query.Where(b => context.Photos.Any(p => p.BoreholeId == b.Id));
            else
                query = query.Where(b => !context.Photos.Any(p => p.BoreholeId == b.Id));
        }

        if (filterRequest.HasDocuments != null)
        {
            if (filterRequest.HasDocuments == BooleanFilter.True)
                query = query.Where(b => context.Documents.Any(d => d.BoreholeId == b.Id));
            else
                query = query.Where(b => !context.Documents.Any(d => d.BoreholeId == b.Id));
        }

        return query;
    }

    private static IQueryable<Borehole> ApplyOrdering(IQueryable<Borehole> query, BoreholeOrderBy? orderBy, OrderDirection? direction)
    {
        var isDescending = direction == OrderDirection.Desc;

        if (orderBy is null)
        {
            return isDescending ? query.OrderByDescending(b => b.Name) : query.OrderBy(b => b.Name);
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

        return isDescending ? query.OrderByDescending(orderExpression) : query.OrderBy(orderExpression);
    }

    private static async Task<FeatureCollection> BuildGeoJsonAsync(IQueryable<Borehole> query)
    {
        // Get all filtered boreholes' location data for GeoJSON
        var boreholes = await query.Select(b => new
        {
            b.Id,
            b.Name,
            b.TypeId,
            b.RestrictionId,
            b.LocationX,
            b.LocationY,
        })
            .ToListAsync()
            .ConfigureAwait(false);

        var featureCollection = new FeatureCollection();

        foreach (var borehole in boreholes)
        {
            if (borehole.LocationX.HasValue && borehole.LocationY.HasValue)
            {
                var point = new Point(borehole.LocationX.Value, borehole.LocationY.Value) { SRID = SpatialReferenceConstants.SridLv95 };
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
}
