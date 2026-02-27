using BDMS.Models;
using Microsoft.Extensions.DependencyInjection;

namespace BDMS.Maintenance;

/// <summary>
/// Base class for migration tasks that iterates over all boreholes, handles
/// <see cref="BdmsContext"/> resolution, counting of affected records, and
/// conditional persistence based on <see cref="MigrationParameters.DryRun"/>.
/// Subclasses implement <see cref="InitializeAsync"/> to resolve scoped services
/// and <see cref="ProcessBoreholeAsync"/> with per-borehole migration logic.
/// </summary>
public abstract class MigrationTaskBase : IMaintenanceTask
{
    /// <inheritdoc/>
    public abstract MaintenanceTaskType TaskType { get; }

    /// <inheritdoc/>
    public async Task<int> ExecuteAsync(IServiceScope scope, MigrationParameters parameters, CancellationToken cancellationToken)
    {
        var context = scope.ServiceProvider.GetRequiredService<BdmsContext>();

        await InitializeAsync(scope.ServiceProvider).ConfigureAwait(false);

        var affectedRecords = 0;
        foreach (var borehole in context.Boreholes)
        {
            if (await ProcessBoreholeAsync(borehole, parameters, cancellationToken).ConfigureAwait(false))
            {
                affectedRecords++;
            }
        }

        if (!parameters.DryRun)
        {
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }

        return affectedRecords;
    }

    /// <summary>
    /// Resolves task-specific scoped services needed for processing. Called once before the borehole loop.
    /// </summary>
    /// <param name="services">The service provider for resolving scoped services.</param>
    protected abstract Task InitializeAsync(IServiceProvider services);

    /// <summary>
    /// Processes a single borehole.
    /// </summary>
    /// <param name="borehole">The borehole to process.</param>
    /// <param name="parameters">The migration parameters.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns><c>true</c> if the borehole was affected; otherwise <c>false</c>.</returns>
    protected abstract Task<bool> ProcessBoreholeAsync(Borehole borehole, MigrationParameters parameters, CancellationToken cancellationToken);
}
