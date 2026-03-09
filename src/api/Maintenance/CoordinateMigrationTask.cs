using BDMS.Models;

namespace BDMS.Maintenance;

/// <summary>
/// Maintenance task that recalculates LV03/LV95 coordinates for boreholes
/// based on their original reference system via the swisstopo coordinate API.
/// </summary>
public sealed class CoordinateMigrationTask : MigrationTaskBase<CoordinateService>
{
    /// <inheritdoc/>
    public override MaintenanceTaskType TaskType => MaintenanceTaskType.CoordinateMigration;

    /// <inheritdoc/>
    protected override async Task<bool> ProcessBoreholeAsync(CoordinateService service, Borehole borehole, MigrationParameters parameters, CancellationToken cancellationToken) =>
        await service.MigrateCoordinatesAsync(borehole, parameters.OnlyMissing).ConfigureAwait(false);
}
