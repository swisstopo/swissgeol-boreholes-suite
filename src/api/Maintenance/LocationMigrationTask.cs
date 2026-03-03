using BDMS.Models;

namespace BDMS.Maintenance;

/// <summary>
/// Maintenance task that updates country, canton and municipality for boreholes
/// using their original coordinates via the swisstopo location API.
/// </summary>
public class LocationMigrationTask : MigrationTaskBase
{
    private LocationService locationService = null!;

    /// <inheritdoc/>
    public override MaintenanceTaskType TaskType => MaintenanceTaskType.LocationMigration;

    /// <inheritdoc/>
    protected override Task InitializeAsync(IServiceProvider services)
    {
        locationService = services.GetRequiredService<LocationService>();
        return Task.CompletedTask;
    }

    /// <inheritdoc/>
    protected override async Task<bool> ProcessBoreholeAsync(Borehole borehole, MigrationParameters parameters, CancellationToken cancellationToken)
    {
        var locationX = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationX : borehole.LocationXLV03;
        var locationY = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? borehole.LocationY : borehole.LocationYLV03;
        var srid = borehole.OriginalReferenceSystem == ReferenceSystem.LV95 ? SpatialReferenceConstants.SridLv95 : SpatialReferenceConstants.SridLv03;

        if (locationX == null || locationY == null) return false;

        if (parameters.OnlyMissing &&
            !string.IsNullOrWhiteSpace(borehole.Country) &&
            !string.IsNullOrWhiteSpace(borehole.Canton) &&
            !string.IsNullOrWhiteSpace(borehole.Municipality)) return false;

        var locationInfo = await locationService.IdentifyAsync(locationX.Value, locationY.Value, srid).ConfigureAwait(false);
        borehole.Country = locationInfo.Country;
        borehole.Canton = locationInfo.Canton;
        borehole.Municipality = locationInfo.Municipality;

        return true;
    }
}
