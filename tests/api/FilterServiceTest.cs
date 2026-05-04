using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace BDMS;

[TestClass]
public class FilterServiceTest
{
    private const string AdminSubjectId = "sub_admin";
    private const string EditorSubjectId = "sub_editor";
    private BdmsContext context;
    private FilterService filterService;
    private User adminUser;
    private User editorUser;

    [TestInitialize]
    public async Task TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        filterService = new FilterService(context);
        adminUser = await context.UsersWithIncludes.AsNoTracking().SingleAsync(u => u.SubjectId == AdminSubjectId);
        editorUser = await context.UsersWithIncludes.AsNoTracking().SingleAsync(u => u.SubjectId == EditorSubjectId);
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task FilterBoreholesWithoutFiltersReturnsAllBoreholesForAdmin()
    {
        await AddTwoBoreholesToWorkgroupWithId3();
        var filterRequest = new FilterRequest
        {
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(3002, result.TotalCount);
        Assert.IsNotNull(result.Boreholes);
        Assert.AreEqual(100, result.Boreholes.Count());
    }

    [TestMethod]
    public async Task FilterBoreholesWithoutFiltersReturnsOnlyWorkgroupBoreholesForEditor()
    {
        await AddTwoBoreholesToWorkgroupWithId3();
        var filterRequest = new FilterRequest
        {
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, editorUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(3000, result.TotalCount);
        Assert.IsNotNull(result.Boreholes);
        Assert.AreEqual(100, result.Boreholes.Count());

        // GeoJSON contains all filtered boreholes with geometry (2426 out of 3000 editor's boreholes have geometry)
        Assert.AreEqual(2426, result.GeoJson.Count);

        // Editor should only see boreholes from their workgroups
        var editor = await context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == EditorSubjectId);

        Assert.IsNotNull(editor);
        var allowedWorkgroupIds = editor.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.WorkgroupId.HasValue);
            Assert.IsTrue(allowedWorkgroupIds.Contains(borehole.WorkgroupId.Value));
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithIdsFilterReturnsMultipleBoreholes()
    {
        var testIds = new List<int> { 1_000_100, 1_000_200, 1_000_300 };
        var filterRequest = new FilterRequest
        {
            Ids = testIds,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(testIds.Count, result.TotalCount);
        Assert.AreEqual(testIds.Count, result.Boreholes.Count());

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(testIds.Contains(borehole.Id));
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithOriginalNameFilterReturnsMatchingBoreholes()
    {
        var existingBoreholeName = "Luther Littel";

        // Use part of the name for the filter
        var searchTerm = existingBoreholeName.Substring(0, 3);

        var filterRequest = new FilterRequest
        {
            OriginalName = searchTerm,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(6, result.TotalCount);

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.OriginalName != null && borehole.OriginalName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithWorkgroupIdFilterReturnsMatchingBoreholes()
    {
        await AddTwoBoreholesToWorkgroupWithId3();
        var filterRequest = new FilterRequest
        {
            WorkgroupId = new List<int> { 3 },
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(2, result.TotalCount);

        foreach (var borehole in result.Boreholes)
        {
            Assert.AreEqual(3, borehole.WorkgroupId);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithTotalDepthRangeReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            TotalDepthMin = 100,
            TotalDepthMax = 500,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(600, result.TotalCount);
        foreach (var borehole in result.Boreholes)
        {
            if (borehole.TotalDepth.HasValue)
            {
                Assert.IsTrue(borehole.TotalDepth.Value >= 100);
                Assert.IsTrue(borehole.TotalDepth.Value <= 500);
            }
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithPolygonFilterReturnsMatchingBoreholes()
    {
        // Find a borehole with coordinates in the test data
        var existingBorehole = await context.Boreholes
            .Where(b => b.LocationX != null && b.LocationY != null)
            .FirstOrDefaultAsync();
        Assert.IsNotNull(existingBorehole);

        // Create a polygon that covers the borehole's location with a large buffer
        var coordX = existingBorehole!.LocationX.Value;
        var coordY = existingBorehole.LocationY.Value;
        var buffer = 10000; // 10km buffer to ensure it covers the point

        var coordinates = new Coordinate[]
        {
            new Coordinate(coordX - buffer, coordY - buffer),
            new Coordinate(coordX + buffer, coordY - buffer),
            new Coordinate(coordX + buffer, coordY + buffer),
            new Coordinate(coordX - buffer, coordY + buffer),
            new Coordinate(coordX - buffer, coordY - buffer),
        };

        var polygon = new Polygon(new LinearRing(coordinates)) { SRID = SpatialReferenceConstants.SridLv95 };

        var filterRequest = new FilterRequest
        {
            Polygon = polygon,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(10, result.TotalCount);

        // Verify that the borehole we used to create the polygon is in the results
        CollectionAssert.Contains(result.Boreholes.Select(b => b.Id).ToList(), existingBorehole.Id, $"Expected borehole with ID {existingBorehole.Id} to be in the filtered results");
    }

    [TestMethod]
    public async Task FilterBoreholesAsyncWithPaginationReturnsPaginatedResults()
    {
        var filterRequest = new FilterRequest
        {
            PageNumber = 1,
            PageSize = 5,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(5, result.Boreholes.Count());
        Assert.AreEqual(1, result.PageNumber);
        Assert.AreEqual(5, result.PageSize);
        Assert.AreEqual(600, result.TotalPages);
    }

    [TestMethod]
    public async Task FilterBoreholesWithOrderingReturnsOrderedResults()
    {
        var filterRequest = new FilterRequest
        {
            OrderBy = BoreholeOrderBy.TotalDepth,
            Direction = OrderDirection.Asc,
            PageNumber = 1,
            PageSize = 10,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(10, result.Boreholes.Count());

        var boreholesList = result.Boreholes.ToList();
        for (int i = 1; i < boreholesList.Count; i++)
        {
            var prev = boreholesList[i - 1].TotalDepth ?? 0;
            var current = boreholesList[i].TotalDepth ?? 0;
            Assert.IsTrue(prev <= current);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithDescendingOrderingReturnsOrderedResults()
    {
        var filterRequest = new FilterRequest
        {
            OrderBy = BoreholeOrderBy.TotalDepth,
            Direction = OrderDirection.Desc,
            PageNumber = 1,
            PageSize = 10,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(10, result.Boreholes.Count());

        var boreholesList = result.Boreholes.ToList();
        for (int i = 1; i < boreholesList.Count; i++)
        {
            var prev = boreholesList[i - 1].TotalDepth ?? 0;
            var current = boreholesList[i].TotalDepth ?? 0;
            Assert.IsTrue(prev >= current);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithBooleanFiltersReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            NationalInterest = NullableBooleanFilterValue.True,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.NationalInterest == true);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithBooleanFilterFalseReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            NationalInterest = NullableBooleanFilterValue.False,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.NationalInterest == false);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithBooleanFilterUndefinedReturnsBorehoresWithNullValue()
    {
        var filterRequest = new FilterRequest
        {
            NationalInterest = NullableBooleanFilterValue.Null,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsNull(borehole.NationalInterest);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesReturnsGeoJsonFeatureCollection()
    {
        var filterRequest = new FilterRequest
        {
            PageNumber = 1,
            PageSize = 10,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsNotNull(result.GeoJson);

        // GeoJSON contains all filtered boreholes with geometry, not just the paginated ones
        Assert.AreEqual(2426, result.GeoJson.Count);
        var firstFeature = result.GeoJson.OrderBy(g => g.Attributes["id"]).First();
        Assert.AreEqual(4, firstFeature.Attributes.Count);
        Assert.AreEqual(1000000, firstFeature.Attributes["id"]);
        Assert.AreEqual(null, firstFeature.Attributes["type"]);
        Assert.AreEqual("Luther Littel", firstFeature.Attributes["name"]);
        Assert.AreEqual(null, firstFeature.Attributes["restriction"]);
    }

    [TestMethod]
    public async Task FilterBoreholesAsyncReturnsSelectableAndFilteredBoreholeIds()
    {
        // Add locked borehole
        var lockedBorehole = new Borehole
        {
            OriginalName = "Locked borehole",
            Locked = DateTime.UtcNow,
        };

        await context.Boreholes.AddAsync(lockedBorehole);
        await context.SaveChangesAsync();

        var filterRequest = new FilterRequest
        {
            PageNumber = 1,
            PageSize = 5,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsNotNull(result.FilteredBoreholeIds);
        Assert.IsTrue(result.FilteredBoreholeIds.Any());
        Assert.AreEqual(5, result.Boreholes.Count());

        // should contain all results, not just paginated ones
        Assert.AreEqual(3001, result.FilteredBoreholeIds.Count()); // all boreholes
        Assert.AreEqual(3000, result.SelectableBoreholeIds.Count()); // unlocked boreholes
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasLogsFilterReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            HasLogs = BooleanFilterValue.True,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(101, result.TotalCount);

        // Verify that boreholes have logs
        foreach (var borehole in result.Boreholes)
        {
            var hasLogs = await context.LogRuns.AnyAsync(lr => lr.BoreholeId == borehole.Id);
            Assert.IsTrue(hasLogs);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasLogsFilterFalseReturnsMatchingBoreholes()
    {
        var expectedCount = await context.Boreholes
            .CountAsync(b => !context.LogRuns.Any(lr => lr.BoreholeId == b.Id));

        var filterRequest = new FilterRequest
        {
            HasLogs = BooleanFilterValue.False,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(expectedCount, result.TotalCount);

        // Verify that no returned borehole has log runs
        foreach (var borehole in result.Boreholes)
        {
            var hasLogs = await context.LogRuns.AnyAsync(lr => lr.BoreholeId == borehole.Id);
            Assert.IsFalse(hasLogs);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasProfilesFiltersReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            HasProfiles = BooleanFilterValue.True,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(88, result.TotalCount);

        // Verify that boreholes have profiles (boreholefiles).
        foreach (var borehole in result.Boreholes)
        {
            var hasProfiles = await context.BoreholeFiles.AnyAsync(s => s.BoreholeId == borehole.Id);
            Assert.IsTrue(hasProfiles);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasProfilesFilterFalseReturnsMatchingBoreholes()
    {
        var expectedCount = await context.Boreholes
            .CountAsync(b => !context.BoreholeFiles.Any(bf => bf.BoreholeId == b.Id));

        var filterRequest = new FilterRequest
        {
            HasProfiles = BooleanFilterValue.False,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(expectedCount, result.TotalCount);

        // Verify that no returned borehole has profiles (boreholefiles)
        foreach (var borehole in result.Boreholes)
        {
            var hasProfiles = await context.BoreholeFiles.AnyAsync(bf => bf.BoreholeId == borehole.Id);
            Assert.IsFalse(hasProfiles);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithNameFilterReturnsMatchingBoreholes()
    {
        // Find a borehole with an alternate name
        var existingBorehole = await context.Boreholes
            .Where(b => !string.IsNullOrEmpty(b.Name))
            .FirstOrDefaultAsync();

        Assert.IsNotNull(existingBorehole);

        // Use part of the name for the filter
        var searchTerm = existingBorehole.Name!.Substring(0, Math.Min(3, existingBorehole.Name.Length));

        var filterRequest = new FilterRequest
        {
            Name = searchTerm,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.Name != null && borehole.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithProjectNameFilterReturnsMatchingBoreholes()
    {
        // Find a borehole with a project name
        var existingBorehole = await context.Boreholes
            .Where(b => !string.IsNullOrEmpty(b.ProjectName))
            .FirstOrDefaultAsync();

        Assert.IsNotNull(existingBorehole);

        // Use part of the project name for the filter
        var searchTerm = existingBorehole.ProjectName!.Substring(0, Math.Min(3, existingBorehole.ProjectName.Length));

        var filterRequest = new FilterRequest
        {
            ProjectName = searchTerm,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        // Get original Boreholes since ProjectName is not present in result BoreholeListItem.
        var originalBoreholes = context.Boreholes.Where(ob => result.Boreholes.Select(b => b.Id).Contains(ob.Id));
        Assert.AreEqual(result.Boreholes.Count(), await originalBoreholes.CountAsync());

        foreach (var borehole in originalBoreholes)
        {
            Assert.IsTrue(borehole.ProjectName != null && borehole.ProjectName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithStatusIdFilterReturnsMatchingBoreholes()
    {
        // Find a borehole with a status
        var existingBorehole = await context.Boreholes
            .Where(b => b.StatusId.HasValue)
            .FirstOrDefaultAsync();

        Assert.IsNotNull(existingBorehole);
        Assert.IsTrue(existingBorehole.StatusId.HasValue);

        var filterRequest = new FilterRequest
        {
            StatusId = new List<int> { existingBorehole.StatusId.Value },
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        foreach (var borehole in result.Boreholes)
        {
            Assert.AreEqual(existingBorehole.StatusId, borehole.StatusId);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithTypeIdFilterReturnsMatchingBoreholes()
    {
        // Find a borehole with a type
        var existingBorehole = await context.Boreholes
            .Where(b => b.TypeId.HasValue)
            .FirstOrDefaultAsync();

        Assert.IsNotNull(existingBorehole);
        Assert.IsTrue(existingBorehole.TypeId.HasValue);

        var filterRequest = new FilterRequest
        {
            TypeId = new List<int> { existingBorehole.TypeId.Value },
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        foreach (var borehole in result.Boreholes)
        {
            Assert.AreEqual(existingBorehole.TypeId, borehole.TypeId);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithPurposeIdFilterReturnsMatchingBoreholes()
    {
        // Find a borehole with a purpose
        var existingBorehole = await context.Boreholes
            .Where(b => b.PurposeId.HasValue)
            .FirstOrDefaultAsync();

        Assert.IsNotNull(existingBorehole);
        Assert.IsTrue(existingBorehole.PurposeId.HasValue);

        var filterRequest = new FilterRequest
        {
            PurposeId = new List<int> { existingBorehole.PurposeId.Value },
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        foreach (var borehole in result.Boreholes)
        {
            Assert.AreEqual(existingBorehole.PurposeId, borehole.PurposeId);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithRestrictionIdFilterReturnsMatchingBoreholes()
    {
        // Find a borehole with a restriction
        var existingBorehole = await context.Boreholes
            .Where(b => b.RestrictionId.HasValue)
            .FirstOrDefaultAsync();

        Assert.IsNotNull(existingBorehole);
        Assert.IsTrue(existingBorehole.RestrictionId.HasValue);

        var filterRequest = new FilterRequest
        {
            RestrictionId = new List<int> { existingBorehole.RestrictionId.Value },
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        foreach (var borehole in result.Boreholes)
        {
            Assert.AreEqual(existingBorehole.RestrictionId, borehole.RestrictionId);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithRestrictionUntilRangeReturnsMatchingBoreholes()
    {
        // Find boreholes with restriction dates
        var existingBorehole = await context.Boreholes
            .Where(b => b.RestrictionUntil.HasValue)
            .OrderBy(b => b.RestrictionUntil)
            .FirstOrDefaultAsync();

        Assert.IsNotNull(existingBorehole);
        Assert.IsTrue(existingBorehole.RestrictionUntil.HasValue);

        var fromDate = existingBorehole.RestrictionUntil.Value.AddDays(-30);
        var toDate = existingBorehole.RestrictionUntil.Value.AddDays(30);

        var filterRequest = new FilterRequest
        {
            RestrictionUntilFrom = fromDate,
            RestrictionUntilTo = toDate,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        foreach (var borehole in result.Boreholes)
        {
            if (borehole.RestrictionUntil.HasValue)
            {
                Assert.IsTrue(borehole.RestrictionUntil.Value >= fromDate);
                Assert.IsTrue(borehole.RestrictionUntil.Value <= toDate);
            }
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithRestrictionUntilFromOnlyReturnsMatchingBoreholes()
    {
        // Test filtering with only RestrictionUntilFrom (no upper bound)
        var testDate = new DateOnly(2025, 1, 1);

        // Add test boreholes with specific dates
        var testBoreholes = new List<Borehole>
        {
            new Borehole
            {
                OriginalName = "Test Borehole Before Date",
                WorkgroupId = 1,
                RestrictionUntil = new DateOnly(2024, 12, 31),
                Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
            },
            new Borehole
            {
                OriginalName = "Test Borehole On Date",
                WorkgroupId = 1,
                RestrictionUntil = testDate,
                Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
            },
            new Borehole
            {
                OriginalName = "Test Borehole After Date",
                WorkgroupId = 1,
                RestrictionUntil = new DateOnly(2025, 6, 1),
                Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
            },
        };

        await context.Boreholes.AddRangeAsync(testBoreholes);
        await context.SaveChangesAsync();

        var filterRequest = new FilterRequest
        {
            RestrictionUntilFrom = testDate,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(2, result.TotalCount);

        // Verify that all returned boreholes have restriction date on or after testDate
        foreach (var borehole in result.Boreholes)
        {
            if (borehole.RestrictionUntil.HasValue)
            {
                Assert.IsTrue(borehole.RestrictionUntil.Value >= testDate, $"Borehole {borehole.Id} has RestrictionUntil {borehole.RestrictionUntil.Value} which is before {testDate}");
            }
        }

        // Verify our test boreholes
        var returnedIds = result.Boreholes.Select(b => b.Id).ToList();
        Assert.IsFalse(returnedIds.Contains(testBoreholes[0].Id), "Borehole before date should not be included");
        Assert.IsTrue(returnedIds.Contains(testBoreholes[1].Id), "Borehole on date should be included");
        Assert.IsTrue(returnedIds.Contains(testBoreholes[2].Id), "Borehole after date should be included");
    }

    [TestMethod]
    public async Task FilterBoreholesWithRestrictionUntilToOnlyReturnsMatchingBoreholes()
    {
        // Test filtering with only RestrictionUntilTo (no lower bound)
        var testDate = new DateOnly(2025, 3, 1);

        // Add test boreholes with specific dates
        var testBoreholes = new List<Borehole>
        {
            new Borehole
            {
                OriginalName = "Test Borehole Before Limit",
                WorkgroupId = 1,
                RestrictionUntil = new DateOnly(2025, 1, 1),
                Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
            },
            new Borehole
            {
                OriginalName = "Test Borehole On Limit",
                WorkgroupId = 1,
                RestrictionUntil = testDate,
                Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
            },
            new Borehole
            {
                OriginalName = "Test Borehole After Limit",
                WorkgroupId = 1,
                RestrictionUntil = new DateOnly(2025, 12, 31),
                Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
            },
        };

        await context.Boreholes.AddRangeAsync(testBoreholes);
        await context.SaveChangesAsync();

        var filterRequest = new FilterRequest
        {
            RestrictionUntilTo = testDate,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount >= 2);

        // Verify that all returned boreholes have restriction date on or before testDate
        foreach (var borehole in result.Boreholes)
        {
            if (borehole.RestrictionUntil.HasValue)
            {
                Assert.IsTrue(borehole.RestrictionUntil.Value <= testDate, $"Borehole {borehole.Id} has RestrictionUntil {borehole.RestrictionUntil.Value} which is after {testDate}");
            }
        }

        // Verify our test boreholes
        var returnedIds = result.FilteredBoreholeIds;
        Assert.IsTrue(returnedIds.Contains(testBoreholes[0].Id), "Borehole before limit should be included");
        Assert.IsTrue(returnedIds.Contains(testBoreholes[1].Id), "Borehole on limit should be included");
        Assert.IsFalse(returnedIds.Contains(testBoreholes[2].Id), "Borehole after limit should not be included");
    }

    [TestMethod]
    public async Task FilterBoreholesWithExactRestrictionUntilDateReturnsMatchingBoreholes()
    {
        // Test filtering with exact date match (both from and to are the same)
        var exactDate = new DateOnly(2025, 5, 15);

        // Add test borehole with exact date
        var testBorehole = new Borehole
        {
            OriginalName = "Test Borehole Exact Date",
            WorkgroupId = 1,
            RestrictionUntil = exactDate,
            Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
        };

        await context.Boreholes.AddAsync(testBorehole);
        await context.SaveChangesAsync();

        var filterRequest = new FilterRequest
        {
            RestrictionUntilFrom = exactDate,
            RestrictionUntilTo = exactDate,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        // Verify that all returned boreholes have exactly this restriction date
        foreach (var borehole in result.Boreholes)
        {
            if (borehole.RestrictionUntil.HasValue)
            {
                Assert.AreEqual(exactDate, borehole.RestrictionUntil.Value, $"Borehole {borehole.Id} should have RestrictionUntil exactly {exactDate}");
            }
        }

        Assert.IsTrue(result.Boreholes.Any(b => b.Id == testBorehole.Id), "Test borehole with exact date should be in results");
    }

    [TestMethod]
    public async Task FilterBoreholesWithTopBedrockFreshMdRangeReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            TopBedrockFreshMdMin = 10,
            TopBedrockFreshMdMax = 100,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(273, result.TotalCount);

        // Get original Boreholes since TopBedrockFreshMd is not present in result BoreholeListItem.
        var originalBoreholes = context.Boreholes.Where(ob => result.Boreholes.Select(b => b.Id).Contains(ob.Id));
        Assert.AreEqual(result.Boreholes.Count(), await originalBoreholes.CountAsync());

        foreach (var borehole in originalBoreholes)
        {
            Assert.IsTrue(borehole.TopBedrockFreshMd.Value >= 10);
            Assert.IsTrue(borehole.TopBedrockFreshMd.Value <= 100);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithTopBedrockWeatheredMdRangeReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            TopBedrockWeatheredMdMin = 0.1,
            TopBedrockWeatheredMdMax = 1.5,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        // Get original Boreholes since TopBedrockWeatheredMd is not present in result BoreholeListItem.
        var originalBoreholes = context.Boreholes.Where(ob => result.Boreholes.Select(b => b.Id).Contains(ob.Id));
        Assert.AreEqual(result.Boreholes.Count(), await originalBoreholes.CountAsync());

        foreach (var borehole in originalBoreholes)
        {
            if (borehole.TopBedrockWeatheredMd.HasValue)
            {
                Assert.IsTrue(borehole.TopBedrockWeatheredMd.Value >= 0.1);
                Assert.IsTrue(borehole.TopBedrockWeatheredMd.Value <= 1.5);
            }
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithTopBedrockIntersectedFilterReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            TopBedrockIntersected = NullableBooleanFilterValue.True,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        // Get original Boreholes since TopBedrockIntersected is not present in result BoreholeListItem.
        var originalBoreholes = context.Boreholes.Where(ob => result.Boreholes.Select(b => b.Id).Contains(ob.Id));
        Assert.AreEqual(result.Boreholes.Count(), await originalBoreholes.CountAsync());

        foreach (var borehole in originalBoreholes)
        {
            Assert.IsTrue(borehole.TopBedrockIntersected == true);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasGroundwaterFilterReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            HasGroundwater = NullableBooleanFilterValue.True,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        // Get original Boreholes since HasGroundwater is not present in result BoreholeListItem.
        var originalBoreholes = context.Boreholes.Where(ob => result.Boreholes.Select(b => b.Id).Contains(ob.Id));
        Assert.AreEqual(result.Boreholes.Count(), await originalBoreholes.CountAsync());

        foreach (var borehole in originalBoreholes)
        {
            Assert.IsTrue(borehole.HasGroundwater == true);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasGeometryFilterReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            HasGeometry = BooleanFilterValue.True,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(100, result.TotalCount); // rich boreholes with boreholeGeometry

        // Verify that all returned boreholes have a boreholeGeometry
        var originalBoreholes = await context.Boreholes
            .Include(b => b.BoreholeGeometry)
            .Where(b => result.Boreholes.Select(rb => rb.Id).Contains(b.Id))
            .ToListAsync();

        foreach (var borehole in originalBoreholes)
        {
            Assert.IsNotNull(borehole.BoreholeGeometry);
            Assert.IsGreaterThan(0, borehole.BoreholeGeometry.Count());
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasGeometryFilterFalseReturnsMatchingBoreholes()
    {
        var expectedCount = await context.Boreholes
            .CountAsync(b => b.BoreholeGeometry == null || !b.BoreholeGeometry.Any());

        var filterRequest = new FilterRequest
        {
            HasGeometry = BooleanFilterValue.False,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(expectedCount, result.TotalCount);

        // Verify that no returned borehole has borehole geometry
        var originalBoreholes = await context.Boreholes
            .Include(b => b.BoreholeGeometry)
            .Where(b => result.Boreholes.Select(rb => rb.Id).Contains(b.Id))
            .ToListAsync();

        foreach (var borehole in originalBoreholes)
        {
            Assert.IsTrue(borehole.BoreholeGeometry == null || !borehole.BoreholeGeometry.Any());
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasPhotosFilterReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            HasPhotos = BooleanFilterValue.True,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        // Verify that boreholes have photos
        foreach (var borehole in result.Boreholes)
        {
            var hasPhotos = await context.Photos.AnyAsync(p => p.BoreholeId == borehole.Id);
            Assert.IsTrue(hasPhotos);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasPhotosFilterFalseReturnsMatchingBoreholes()
    {
        var expectedCount = await context.Boreholes
            .CountAsync(b => !context.Photos.Any(p => p.BoreholeId == b.Id));

        var filterRequest = new FilterRequest
        {
            HasPhotos = BooleanFilterValue.False,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(expectedCount, result.TotalCount);

        // Verify that no returned borehole has photos
        foreach (var borehole in result.Boreholes)
        {
            var hasPhotos = await context.Photos.AnyAsync(p => p.BoreholeId == borehole.Id);
            Assert.IsFalse(hasPhotos);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasDocumentsFilterReturnsMatchingBoreholes()
    {
        var filterRequest = new FilterRequest
        {
            HasDocuments = BooleanFilterValue.True,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.IsTrue(result.TotalCount > 0);

        // Verify that boreholes have documents
        foreach (var borehole in result.Boreholes)
        {
            var hasDocuments = await context.Documents.AnyAsync(d => d.BoreholeId == borehole.Id);
            Assert.IsTrue(hasDocuments);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithHasDocumentsFilterFalseReturnsMatchingBoreholes()
    {
        var expectedCount = await context.Boreholes
            .CountAsync(b => !context.Documents.Any(d => d.BoreholeId == b.Id));

        var filterRequest = new FilterRequest
        {
            HasDocuments = BooleanFilterValue.False,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(expectedCount, result.TotalCount);

        // Verify that no returned borehole has documents
        foreach (var borehole in result.Boreholes)
        {
            var hasDocuments = await context.Documents.AnyAsync(d => d.BoreholeId == borehole.Id);
            Assert.IsFalse(hasDocuments);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithMultipleFiltersReturnsMatchingBoreholes()
    {
        // Find a borehole that meets multiple criteria
        var existingBorehole = await context.Boreholes
            .Where(b => b.TotalDepth.HasValue && b.TotalDepth > 100 && b.TotalDepth < 500
                && b.TypeId.HasValue
                && b.NationalInterest == true
                && !string.IsNullOrEmpty(b.OriginalName))
            .FirstOrDefaultAsync();

        Assert.IsNotNull(existingBorehole);
        var filterRequest = new FilterRequest
        {
            TotalDepthMin = 100,
            TotalDepthMax = 500,
            TypeId = existingBorehole.TypeId.HasValue ? new List<int> { existingBorehole.TypeId.Value } : null,
            NationalInterest = NullableBooleanFilterValue.True,
            OrderBy = BoreholeOrderBy.TotalDepth,
            Direction = OrderDirection.Asc,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(5, result.TotalCount);

        // Verify all filters are applied
        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.TotalDepth.Value >= 100);
            Assert.IsTrue(borehole.TotalDepth.Value <= 500);
            Assert.AreEqual(existingBorehole.TypeId, borehole.TypeId);
            Assert.IsTrue(borehole.NationalInterest == true);
        }

        // Verify ordering
        var boreholesList = result.Boreholes.ToList();
        for (int i = 1; i < boreholesList.Count; i++)
        {
            var prev = boreholesList[i - 1].TotalDepth ?? 0;
            var current = boreholesList[i].TotalDepth ?? 0;
            Assert.IsTrue(prev <= current, "Results should be ordered by TotalDepth ascending");
        }

        // Verify the test borehole is in the results
        Assert.IsTrue(result.Boreholes.Any(b => b.Id == existingBorehole.Id), "The test borehole should be in the filtered results");
    }

    [TestMethod]
    public async Task FilterBoreholesAssertsAllBoreholeProperties()
    {
        var filterRequest = new FilterRequest
        {
            Ids = new List<int> { 1_000_010 },
            PageNumber = 1,
            PageSize = 1,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(1, result.TotalCount);
        Assert.AreEqual(1, result.Boreholes.Count());

        var filteredBorehole = result.Boreholes.First();
        var originalBorehole = await context.Boreholes.SingleAsync(b => b.Id.Equals(filteredBorehole.Id));

        // Assert all Borehole properties
        Assert.AreEqual(originalBorehole.Id, filteredBorehole.Id);
        Assert.AreEqual(originalBorehole.Created, filteredBorehole.Created);
        Assert.AreEqual(originalBorehole.Updated, filteredBorehole.Updated);
        Assert.AreEqual(originalBorehole.Locked, filteredBorehole.Locked);
        Assert.AreEqual(originalBorehole.WorkgroupId, filteredBorehole.WorkgroupId);
        Assert.AreEqual(originalBorehole.IsPublic, filteredBorehole.IsPublic);
        Assert.AreEqual(originalBorehole.TypeId, filteredBorehole.TypeId);
        Assert.AreEqual(originalBorehole.LocationX, filteredBorehole.LocationX);
        Assert.AreEqual(originalBorehole.LocationY, filteredBorehole.LocationY);
        Assert.AreEqual(originalBorehole.ElevationZ, filteredBorehole.ElevationZ);
        Assert.AreEqual(originalBorehole.TotalDepth, filteredBorehole.TotalDepth);
        Assert.AreEqual(originalBorehole.RestrictionId, filteredBorehole.RestrictionId);
        Assert.AreEqual(originalBorehole.RestrictionUntil, filteredBorehole.RestrictionUntil);
        Assert.AreEqual(originalBorehole.NationalInterest, filteredBorehole.NationalInterest);
        Assert.AreEqual(originalBorehole.OriginalName, filteredBorehole.OriginalName);
        Assert.AreEqual(originalBorehole.Name, filteredBorehole.Name);
        Assert.AreEqual(originalBorehole.PurposeId, filteredBorehole.PurposeId);
        Assert.AreEqual(originalBorehole.StatusId, filteredBorehole.StatusId);

        // Assert GeoJson feature geometry
        if (originalBorehole.Geometry != null)
        {
            Assert.IsNotNull(result.GeoJson);
            Assert.AreEqual(1, result.GeoJson.Count);
            var feature = result.GeoJson.First();
            Assert.IsNotNull(feature.Geometry);
            Assert.IsTrue(feature.Geometry is Point);
            var point = (Point)feature.Geometry;
            Assert.AreEqual(originalBorehole.Geometry.X, point.X);
            Assert.AreEqual(originalBorehole.Geometry.Y, point.Y);
            Assert.AreEqual(originalBorehole.Geometry.SRID, point.SRID);
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithUnsupportedOrderByValueFallsBackToDefaultOrdering()
    {
        var filterRequest = new FilterRequest
        {
            OrderBy = (BoreholeOrderBy)999,
            PageNumber = 1,
            PageSize = 10,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(10, result.Boreholes.Count());

        // Verify fallback to default ordering by Name ascending
        var boreholesList = result.Boreholes.ToList();
        for (int i = 1; i < boreholesList.Count; i++)
        {
            var prev = boreholesList[i - 1].Name ?? string.Empty;
            var current = boreholesList[i].Name ?? string.Empty;
            Assert.IsTrue(
                string.Compare(prev, current, StringComparison.OrdinalIgnoreCase) <= 0,
                $"Expected default ordering by Name ascending, but found '{prev}' > '{current}'");
        }
    }

    private async Task AddTwoBoreholesToWorkgroupWithId3()
    {
        var borehole1 = new Borehole
        {
            WorkgroupId = 3,
            OriginalName = "Test Borehole 1 - Restricted",
            Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
        };
        var borehole2 = new Borehole
        {
            WorkgroupId = 3,
            OriginalName = "Test Borehole 2 - Restricted",
            Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
        };

        await context.Boreholes.AddAsync(borehole1);
        await context.Boreholes.AddAsync(borehole2);
        await context.SaveChangesAsync();
    }

    [TestMethod]
    public async Task FilterBoreholesWithMultipleStatusIdsReturnsMatchingBoreholes()
    {
        // Find boreholes with different status IDs
        var statusIds = await context.Boreholes
            .Where(b => b.StatusId.HasValue)
            .Select(b => b.StatusId.Value)
            .Distinct()
            .Take(2)
            .ToListAsync();

        var filterRequest = new FilterRequest
        {
            StatusId = statusIds,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(626, result.TotalCount);
        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.StatusId.HasValue);
            Assert.IsTrue(statusIds.Contains(borehole.StatusId.Value));
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithMultipleTypeIdsReturnsMatchingBoreholes()
    {
        // Find boreholes with different type IDs
        var typeIds = await context.Boreholes
            .Where(b => b.TypeId.HasValue)
            .Select(b => b.TypeId.Value)
            .Distinct()
            .Take(3)
            .ToListAsync();

        var filterRequest = new FilterRequest
        {
            TypeId = typeIds,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(521, result.TotalCount);
        Assert.IsTrue(result.TotalCount > 0);

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.TypeId.HasValue);
            Assert.IsTrue(typeIds.Contains(borehole.TypeId.Value));
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithMultiplePurposeIdsReturnsMatchingBoreholes()
    {
        // Find boreholes with different purpose IDs
        var purposeIds = await context.Boreholes
            .Where(b => b.PurposeId.HasValue)
            .Select(b => b.PurposeId.Value)
            .Distinct()
            .Take(2)
            .ToListAsync();

        var filterRequest = new FilterRequest
        {
            PurposeId = purposeIds,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(233, result.TotalCount);

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.PurposeId.HasValue);
            Assert.IsTrue(purposeIds.Contains(borehole.PurposeId.Value));
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithMultipleWorkgroupIdsReturnsMatchingBoreholes()
    {
        // Add test boreholes to different workgroups
        var borehole1 = new Borehole
        {
            WorkgroupId = 3,
            OriginalName = "Test Borehole - Workgroup 3",
            Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
        };
        var borehole2 = new Borehole
        {
            WorkgroupId = 4,
            OriginalName = "Test Borehole - Workgroup 4",
            Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
        };
        var borehole3 = new Borehole
        {
            WorkgroupId = 5,
            OriginalName = "Test Borehole - Workgroup 5",
            Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
        };

        await context.Boreholes.AddRangeAsync(borehole1, borehole2, borehole3);
        await context.SaveChangesAsync();

        var workgroupIds = new List<int> { 3, 4 };

        var filterRequest = new FilterRequest
        {
            WorkgroupId = workgroupIds,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(2, result.TotalCount);

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.WorkgroupId.HasValue);
            Assert.IsTrue(workgroupIds.Contains(borehole.WorkgroupId.Value));
        }

        // Verify that borehole from workgroup 5 is NOT in the results
        Assert.IsFalse(result.Boreholes.Any(b => b.Id == borehole3.Id));
    }

    [TestMethod]
    public async Task FilterBoreholesWithMultipleRestrictionIdsReturnsMatchingBoreholes()
    {
        // Find boreholes with different restriction IDs
        var restrictionIds = await context.Boreholes
            .Where(b => b.RestrictionId.HasValue)
            .Select(b => b.RestrictionId.Value)
            .Distinct()
            .Take(2)
            .ToListAsync();

        var filterRequest = new FilterRequest
        {
            RestrictionId = restrictionIds,
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);
        Assert.AreEqual(750, result.TotalCount);

        foreach (var borehole in result.Boreholes)
        {
            Assert.IsTrue(borehole.RestrictionId.HasValue);
            Assert.IsTrue(restrictionIds.Contains(borehole.RestrictionId.Value));
        }
    }

    [TestMethod]
    public async Task FilterBoreholesWithIdsFilterRespectsWorkgroupPermissions()
    {
        // Add a new borehole with workgroup that editor doesn't have access to
        var newBorehole = new Borehole
        {
            Name = "Test Borehole - Workgroup 4",
            WorkgroupId = 4,
            Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
        };
        await context.Boreholes.AddAsync(newBorehole);
        await context.SaveChangesAsync();

        var filterRequest = new FilterRequest
        {
            Ids = new List<int> { newBorehole.Id },
            PageNumber = 1,
            PageSize = 100,
        };

        // Admin can see the borehole
        var adminResult = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

        Assert.IsNotNull(adminResult);
        Assert.IsNotNull(adminResult.Boreholes);
        Assert.AreEqual(1, adminResult.Boreholes.Count());
        Assert.AreEqual(newBorehole.Id, adminResult.Boreholes.First().Id);

        // Editor cannot see the borehole (not in their workgroups)
        var editorResult = await filterService.FilterBoreholesAsync(filterRequest, editorUser);

        Assert.IsNotNull(editorResult);
        Assert.IsNotNull(editorResult.Boreholes);
        Assert.AreEqual(0, editorResult.Boreholes.Count());
        Assert.AreEqual(0, editorResult.TotalCount);
    }

    [TestMethod]
    public async Task ReturnsAllBoreholesForFilterRequestWithoutParameters()
    {
        var result = await filterService.FilterBoreholesAsync(null, adminUser);

        // Verify result with default pagination
        Assert.AreEqual(100, result.Boreholes.Count());
        Assert.AreEqual(100, result.PageSize);
        Assert.AreEqual(1, result.PageNumber);
        Assert.AreEqual(3000, result.TotalCount);
        Assert.AreEqual(3000, result.FilteredBoreholeIds.Count());
        Assert.AreEqual(2426, result.GeoJson.Count()); // not all test boreholes have a geometry, so GeoJson count is less than total count
    }

    [TestMethod]
    public async Task FilterBoreholesWithWorkflowStatusReturnsMatchingBoreholes()
    {
        var testBoreholes = new List<Borehole>();
        var statusCounts = new Dictionary<WorkflowStatus, int>
        {
            { WorkflowStatus.Draft, 3000 }, // from seeddata
            { WorkflowStatus.InReview, 3 },
            { WorkflowStatus.Reviewed, 4 },
            { WorkflowStatus.Published, 2 },
        };

        foreach (var status in new[] { WorkflowStatus.InReview, WorkflowStatus.Reviewed, WorkflowStatus.Published })
        {
            for (int i = 1; i <= statusCounts[status]; i++)
            {
                testBoreholes.Add(new Borehole
                {
                    OriginalName = $"{status} Borehole {i}",
                    WorkgroupId = 1,
                    Workflow = new Workflow
                    {
                        Status = status,
                        ReviewedTabs = new(),
                        PublishedTabs = new(),
                    },
                });
            }
        }

        await context.Boreholes.AddRangeAsync(testBoreholes);
        await context.SaveChangesAsync();

        // Test filtering by each workflow status
        foreach (var status in Enum.GetValues<WorkflowStatus>())
        {
            var filterRequest = new FilterRequest
            {
                WorkflowStatus = new[] { status },
                PageNumber = 1,
                PageSize = 100,
            };

            var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);

            Assert.IsNotNull(result);
            Assert.AreEqual(statusCounts[status], result.TotalCount, $"Expected {statusCounts[status]} boreholes with status {status}");

            // Verify that all returned boreholes have the correct status
            var originalBoreholes = await context.Boreholes
                .Include(b => b.Workflow)
                .Where(b => result.Boreholes.Select(rb => rb.Id).Contains(b.Id))
                .ToListAsync();

            foreach (var borehole in originalBoreholes)
            {
                Assert.IsNotNull(borehole.Workflow);
                Assert.AreEqual(status, borehole.Workflow.Status, $"Borehole {borehole.Id} should have status {status}");
            }
        }
    }

    private async Task<(int MatchingBoreholeId, int CrossRowBoreholeId, int TypeAId, int TypeBId)> SeedBoreholesWithIdentifiersAsync()
    {
        var typeIds = await context.Codelists
            .Where(c => c.Schema == "borehole_identifier")
            .OrderBy(c => c.Id)
            .Select(c => c.Id)
            .Take(2)
            .ToListAsync();
        Assert.IsTrue(typeIds.Count >= 2, "Test requires at least 2 borehole_identifier codelists in the test DB.");
        var typeA = typeIds[0];
        var typeB = typeIds[1];

        var matching = new Borehole
        {
            WorkgroupId = 1,
            OriginalName = "Borehole MATCH",
            Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
            BoreholeCodelists = new List<BoreholeCodelist>
            {
                new() { CodelistId = typeA, Value = "FOO_ABC_BAR" },
            },
        };

        // Cross-row: typeA on one row, "ABC" only on the typeB row.
        // Strict same-row semantics must reject this borehole when filtering by typeA + "ABC".
        var crossRow = new Borehole
        {
            WorkgroupId = 1,
            OriginalName = "Borehole CROSS",
            Workflow = new Workflow { ReviewedTabs = new(), PublishedTabs = new() },
            BoreholeCodelists = new List<BoreholeCodelist>
            {
                new() { CodelistId = typeA, Value = "NO_MATCH_HERE" },
                new() { CodelistId = typeB, Value = "OTHER_ABC_VALUE" },
            },
        };

        await context.Boreholes.AddAsync(matching);
        await context.Boreholes.AddAsync(crossRow);
        await context.SaveChangesAsync();

        return (matching.Id, crossRow.Id, typeA, typeB);
    }

    [TestMethod]
    public async Task FilterBoreholesByIdentifierTypeReturnsBoreholesWithThatType()
    {
        var (matchingId, crossRowId, typeA, _) = await SeedBoreholesWithIdentifiersAsync();

        var filterRequest = new FilterRequest
        {
            IdentifierTypeId = new[] { typeA },
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);
        var ids = result.FilteredBoreholeIds.ToHashSet();

        Assert.IsTrue(ids.Contains(matchingId), "Borehole with typeA row must be returned.");
        Assert.IsTrue(ids.Contains(crossRowId), "Borehole that also has a typeA row must be returned.");
    }

    [TestMethod]
    public async Task FilterBoreholesByIdentifierValueReturnsBoreholesWithMatchingValue()
    {
        var (matchingId, crossRowId, _, _) = await SeedBoreholesWithIdentifiersAsync();

        var filterRequest = new FilterRequest
        {
            IdentifierValue = "abc",
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);
        var ids = result.FilteredBoreholeIds.ToHashSet();

        Assert.IsTrue(ids.Contains(matchingId), "FOO_ABC_BAR matches case-insensitively.");
        Assert.IsTrue(ids.Contains(crossRowId), "OTHER_ABC_VALUE matches case-insensitively.");
    }

    [TestMethod]
    public async Task FilterBoreholesByIdentifierTypeAndValueOnSameRowMatches()
    {
        var (matchingId, crossRowId, typeA, _) = await SeedBoreholesWithIdentifiersAsync();

        var filterRequest = new FilterRequest
        {
            IdentifierTypeId = new[] { typeA },
            IdentifierValue = "abc",
            PageNumber = 1,
            PageSize = 100,
        };

        var result = await filterService.FilterBoreholesAsync(filterRequest, adminUser);
        var ids = result.FilteredBoreholeIds.ToHashSet();

        Assert.IsTrue(ids.Contains(matchingId), "typeA + ABC on the same row must match.");
        Assert.IsFalse(ids.Contains(crossRowId), "Strict same-row semantics: borehole with typeA on one row and 'ABC' on a different row must NOT match.");
    }

    [TestMethod]
    public async Task GetFilterStatsWithoutFiltersReturnsPopulatedCountsForAdmin()
    {
        // Derive expected truth from the seed data so assertions stay valid across seed changes.
        var totalBoreholes = await context.Boreholes.CountAsync();
        var expectedHasLogsTrue = await context.Boreholes.CountAsync(b => context.LogRuns.Any(lr => lr.BoreholeId == b.Id));
        var expectedHasProfilesTrue = await context.Boreholes.CountAsync(b => context.BoreholeFiles.Any(bf => bf.BoreholeId == b.Id));
        var expectedHasGeometryTrue = await context.Boreholes.CountAsync(b => b.BoreholeGeometry != null && b.BoreholeGeometry.Any());

        var result = await filterService.GetFilterStatsAsync(null, adminUser);

        Assert.IsNotNull(result);

        // Boolean dimensions must partition the admin-visible set exactly.
        Assert.AreEqual(expectedHasGeometryTrue, result.HasGeometry.True);
        Assert.AreEqual(totalBoreholes, result.HasGeometry.True + result.HasGeometry.False);
        Assert.AreEqual(expectedHasLogsTrue, result.HasLogs.True);
        Assert.AreEqual(totalBoreholes, result.HasLogs.True + result.HasLogs.False);
        Assert.AreEqual(expectedHasProfilesTrue, result.HasProfiles.True);
        Assert.AreEqual(totalBoreholes, result.HasProfiles.True + result.HasProfiles.False);
        Assert.AreEqual(totalBoreholes, result.HasPhotos.True + result.HasPhotos.False);
        Assert.AreEqual(totalBoreholes, result.HasDocuments.True + result.HasDocuments.False);

        // Nullable boolean dimensions must partition the full set across true/false/null.
        Assert.AreEqual(totalBoreholes, result.NationalInterest.True + result.NationalInterest.False + result.NationalInterest.Null);
        Assert.AreEqual(totalBoreholes, result.TopBedrockIntersected.True + result.TopBedrockIntersected.False + result.TopBedrockIntersected.Null);
        Assert.AreEqual(totalBoreholes, result.HasGroundwater.True + result.HasGroundwater.False + result.HasGroundwater.Null);

        // Every borehole has a workgroup, so workgroup counts should sum to the total.
        Assert.AreEqual(totalBoreholes, result.WorkgroupId.Values.Sum());

        // Id-dimension dictionaries skip nulls, so sums can be <= total but the maps must be populated.
        Assert.IsTrue(result.StatusId.Count > 0);
        Assert.IsTrue(result.TypeId.Count > 0);
        Assert.IsTrue(result.PurposeId.Count > 0);
        Assert.IsTrue(result.RestrictionId.Count > 0);
    }

    [TestMethod]
    public async Task GetFilterStatsExcludesSelfDimensionWhenApplyingFilters()
    {
        // Filter-exclusion semantic: stats for dimension D must be computed with D's filter excluded.
        // Other dimensions must see the filtered set. Verify with HasLogs=True.
        var totalBoreholes = await context.Boreholes.CountAsync();
        var expectedHasLogsTrue = await context.Boreholes.CountAsync(b => context.LogRuns.Any(lr => lr.BoreholeId == b.Id));
        var expectedHasLogsFalse = totalBoreholes - expectedHasLogsTrue;

        var filterRequest = new FilterRequest
        {
            HasLogs = BooleanFilterValue.True,
        };

        var result = await filterService.GetFilterStatsAsync(filterRequest, adminUser);

        Assert.IsNotNull(result);

        // Self-dimension: HasLogs counts ignore the HasLogs filter → full baseline.
        Assert.AreEqual(expectedHasLogsTrue, result.HasLogs.True);
        Assert.AreEqual(expectedHasLogsFalse, result.HasLogs.False);

        // Other dimensions are counted WITH HasLogs=True applied → partitioned set of expectedHasLogsTrue.
        Assert.AreEqual(expectedHasLogsTrue, result.HasGeometry.True + result.HasGeometry.False);
        Assert.AreEqual(expectedHasLogsTrue, result.HasProfiles.True + result.HasProfiles.False);
        Assert.AreEqual(expectedHasLogsTrue, result.HasPhotos.True + result.HasPhotos.False);
        Assert.AreEqual(expectedHasLogsTrue, result.HasDocuments.True + result.HasDocuments.False);
        Assert.AreEqual(expectedHasLogsTrue, result.NationalInterest.True + result.NationalInterest.False + result.NationalInterest.Null);
        Assert.AreEqual(expectedHasLogsTrue, result.WorkgroupId.Values.Sum());
    }

    [TestMethod]
    public async Task GetFilterStatsReturnsDistinctBoreholeCountPerIdentifierType()
    {
        var (matchingId, crossRowId, typeA, typeB) = await SeedBoreholesWithIdentifiersAsync();

        // No filter → counts include every borehole that has at least one row of that type.
        var noFilter = await filterService.GetFilterStatsAsync(new FilterRequest(), adminUser);

        Assert.IsTrue(noFilter.IdentifierTypeId.ContainsKey(typeA), "Stats must contain typeA.");
        Assert.IsTrue(noFilter.IdentifierTypeId.ContainsKey(typeB), "Stats must contain typeB.");

        // With value="abc" only matching rows count.
        // - matchingId has a typeA row "FOO_ABC_BAR" → typeA gets +1, typeB gets 0 from this borehole.
        // - crossRowId has a typeB row "OTHER_ABC_VALUE" matching "abc" → typeB gets +1; its typeA
        //   row "NO_MATCH_HERE" does NOT match, so typeA does NOT get a +1 from this borehole.
        var withValue = await filterService.GetFilterStatsAsync(
            new FilterRequest { IdentifierValue = "abc" },
            adminUser);

        var typeABaseline = noFilter.IdentifierTypeId[typeA];
        var typeBBaseline = noFilter.IdentifierTypeId[typeB];

        // typeA count drops by exactly the boreholes whose typeA row(s) don't match "abc".
        // We can't assert the absolute number against seed data, but we can assert the relationship:
        Assert.IsTrue(
            withValue.IdentifierTypeId.GetValueOrDefault(typeA) <= typeABaseline,
            "typeA count with value filter must be ≤ baseline.");
        Assert.IsTrue(
            withValue.IdentifierTypeId.GetValueOrDefault(typeB) <= typeBBaseline,
            "typeB count with value filter must be ≤ baseline.");

        // Specific assertions for the boreholes we explicitly seeded.
        // After value="abc": matchingId contributes +1 to typeA; crossRowId contributes +1 to typeB.
        // So filtering for typeA + value="abc" should match exactly matchingId.
        var combined = await filterService.FilterBoreholesAsync(
            new FilterRequest { IdentifierTypeId = new[] { typeA }, IdentifierValue = "abc", PageNumber = 1, PageSize = 100 },
            adminUser);
        Assert.IsTrue(combined.FilteredBoreholeIds.Contains(matchingId));
        Assert.IsFalse(combined.FilteredBoreholeIds.Contains(crossRowId));
    }

    [TestMethod]
    public async Task GetFilterStatsExcludesIdentifierTypeFromItsOwnDimension()
    {
        var (_, _, typeA, typeB) = await SeedBoreholesWithIdentifiersAsync();

        // When the user is already filtering by typeA, the per-type counts must STILL show typeB
        // — because the convention is "null only this dimension" so the user can switch to it.
        var stats = await filterService.GetFilterStatsAsync(
            new FilterRequest { IdentifierTypeId = new[] { typeA } },
            adminUser);

        Assert.IsTrue(
            stats.IdentifierTypeId.ContainsKey(typeB),
            "Per-type stats must show non-selected types (self-dimension excluded from filtering).");
    }
}
