using BDMS.Models;

namespace BDMS.Maintenance;

/// <summary>
/// Maintenance task that recalculates LV03/LV95 coordinates for boreholes
/// based on their original reference system via the swisstopo coordinate API.
/// </summary>
public class CoordinateMigrationTask : MigrationTaskBase
{
    private CoordinateService coordinateService = null!;

    /// <inheritdoc/>
    public override MaintenanceTaskType TaskType => MaintenanceTaskType.CoordinateMigration;

    /// <inheritdoc/>
    protected override Task InitializeAsync(IServiceProvider services)
    {
        coordinateService = services.GetRequiredService<CoordinateService>();
        return Task.CompletedTask;
    }

    /// <inheritdoc/>
    protected override async Task<bool> ProcessBoreholeAsync(Borehole borehole, MigrationParameters parameters, CancellationToken cancellationToken) =>
        await coordinateService.MigrateCoordinatesOfBorehole(borehole, parameters.OnlyMissing).ConfigureAwait(false);
}
