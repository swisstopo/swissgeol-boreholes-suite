using BDMS.Maintenance;
using BDMS.Models;
using Microsoft.Extensions.Logging;
using Moq;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class LocationMigrationTest : MaintenanceTaskTestBase
{
    /// <inheritdoc/>
    protected override void ConfigureServices(Mock<IServiceProvider> serviceProviderMock)
    {
        var loggerMock = new Mock<ILogger<LocationService>>(MockBehavior.Strict);
        var locationService = new LocationService(loggerMock.Object, HttpClientFactoryMock.Object);
        serviceProviderMock.Setup(sp => sp.GetService(typeof(LocationService))).Returns(locationService);
    }

    /// <inheritdoc/>
    protected override IEnumerable<IMaintenanceTask> CreateMaintenanceTasks()
        => [new LocationMigrationTask()];

    [TestMethod]
    public async Task MigrateLocations()
    {
        var boreholeWithAllLocationAttributes = CreateBoreholeWithAllLocationAttributes();
        var boreholeWithMissingLocationAttributes = CreateBoreholeWithMissingLocationAttributes();
        var boreholeWithMissingSourceCoordinates = CreateBoreholeWithMissingSourceCoordinates();

        var boreholesWithSetSourceCoordinates = Context.Boreholes.Where(b =>
            (b.OriginalReferenceSystem == ReferenceSystem.LV95 && b.LocationX != null && b.LocationY != null) ||
            (b.OriginalReferenceSystem == ReferenceSystem.LV03 && b.LocationXLV03 != null && b.LocationYLV03 != null)).Count();

        Assert.AreEqual(3003, Context.Boreholes.Count());

        SetupLocationHttpMock();

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters { OnlyMissing = false, DryRun = true }, AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);

        var state = (await Service.GetTaskStatesAsync().ConfigureAwait(false)).Single(s => s.Type == MaintenanceTaskType.LocationMigration);
        Assert.AreEqual(MaintenanceTaskStatus.Completed, state.Status);
        Assert.AreEqual(boreholesWithSetSourceCoordinates, state.AffectedCount);

        AssertBoreholeLocationUpdated(boreholeWithAllLocationAttributes);
        AssertBoreholeLocationUpdated(boreholeWithMissingLocationAttributes);
        AssertBoreholeLocationUnchanged(boreholeWithMissingSourceCoordinates);
    }

    [TestMethod]
    public async Task MigrateLocationsWithMissingOnly()
    {
        var boreholeWithAllLocationAttributes = CreateBoreholeWithAllLocationAttributes();
        var boreholeWithMissingLocationAttributes = CreateBoreholeWithMissingLocationAttributes();
        var boreholeWithMissingSourceCoordinates = CreateBoreholeWithMissingSourceCoordinates();

        var boreholesWithMissingLocationAttributes = Context.Boreholes.Where(b =>
            ((b.OriginalReferenceSystem == ReferenceSystem.LV95 && b.LocationX != null && b.LocationY != null) ||
            (b.OriginalReferenceSystem == ReferenceSystem.LV03 && b.LocationXLV03 != null && b.LocationYLV03 != null))
            &&
            (string.IsNullOrWhiteSpace(b.Country) || string.IsNullOrWhiteSpace(b.Canton) || string.IsNullOrWhiteSpace(b.Municipality)))
            .Count();

        Assert.AreEqual(3003, Context.Boreholes.Count());

        SetupLocationHttpMock();

        Assert.IsTrue(Service.TryStartTask(MaintenanceTaskType.LocationMigration, new MaintenanceTaskParameters { OnlyMissing = true, DryRun = true }, AdminUserId));
        await Service.WaitForCompletionAsync(MaintenanceTaskType.LocationMigration).ConfigureAwait(false);

        var state = (await Service.GetTaskStatesAsync().ConfigureAwait(false)).Single(s => s.Type == MaintenanceTaskType.LocationMigration);
        Assert.AreEqual(MaintenanceTaskStatus.Completed, state.Status);
        Assert.AreEqual(boreholesWithMissingLocationAttributes, state.AffectedCount);

        // Borehole with all location attributes should be unchanged (onlyMissing=true).
        var unchanged = Context.Boreholes.Single(b => b.Id == boreholeWithAllLocationAttributes.Id);
        Assert.AreEqual("GALAXYOLIVE", unchanged.Country);
        Assert.AreEqual("ATLASFOOT", unchanged.Canton);
        Assert.AreEqual("SILVERSHADOW", unchanged.Municipality);

        AssertBoreholeLocationUpdated(boreholeWithMissingLocationAttributes);
        AssertBoreholeLocationUnchanged(boreholeWithMissingSourceCoordinates);
    }

    private void SetupLocationHttpMock()
    {
        HttpClientFactoryMock.Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => CreateLocationHttpClient("DARKFALCON", "OCEANMUTANT", "FIRESHARK"))
            .Verifiable();
    }

    private Borehole CreateBoreholeWithAllLocationAttributes()
    {
        var borehole = new Borehole
        {
            Id = 2_000_000,
            LocationX = 2626103.1988343936,
            LocationY = 1125366.3469565178,
            LocationXLV03 = null,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            Name = "WINDTOPPER",
            Country = "GALAXYOLIVE",
            Canton = "ATLASFOOT",
            Municipality = "SILVERSHADOW",
        };
        Context.Boreholes.Add(borehole);
        Context.SaveChanges();
        return borehole;
    }

    private Borehole CreateBoreholeWithMissingLocationAttributes()
    {
        var borehole = new Borehole
        {
            Id = 2_000_001,
            LocationX = 2626103.1988343936,
            LocationY = 1125366.3469565178,
            LocationXLV03 = 741929.5530394556,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            Name = "CHAOSBEAM",
            Country = null,
            Canton = "ATLASFOOT",
            Municipality = "SILVERSHADOW",
        };
        Context.Boreholes.Add(borehole);
        Context.SaveChanges();
        return borehole;
    }

    private Borehole CreateBoreholeWithMissingSourceCoordinates()
    {
        var borehole = new Borehole
        {
            Id = 2_000_002,
            LocationX = null,
            LocationY = 1125366.3469565178,
            LocationXLV03 = 741929.5530394556,
            LocationYLV03 = 78390.10392298926,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            Name = "PRISMHUNT",
            Country = "HEMLOCKSTONE",
            Canton = "ATLASFOOT",
            Municipality = "SILVERSHADOW",
        };
        Context.Boreholes.Add(borehole);
        Context.SaveChanges();
        return borehole;
    }

    private void AssertBoreholeLocationUpdated(Borehole initialBorehole)
    {
        var borehole = Context.Boreholes.Single(b => b.Id == initialBorehole.Id);
        Assert.AreEqual("DARKFALCON", borehole.Country);
        Assert.AreEqual("OCEANMUTANT", borehole.Canton);
        Assert.AreEqual("FIRESHARK", borehole.Municipality);
    }

    private void AssertBoreholeLocationUnchanged(Borehole initialBorehole)
    {
        var borehole = Context.Boreholes.Single(b => b.Id == initialBorehole.Id);
        Assert.AreEqual(initialBorehole.Country, borehole.Country);
        Assert.AreEqual(initialBorehole.Canton, borehole.Canton);
        Assert.AreEqual(initialBorehole.Municipality, borehole.Municipality);
    }
}
