using BDMS.Models;
using Microsoft.Extensions.DependencyInjection;

namespace BDMS.Maintenance;

/// <summary>
/// Base class for migration tasks that iterates over all boreholes, handles
/// <see cref="BdmsContext"/> resolution, counting of affected records, and
/// conditional persistence based on <see cref="MaintenanceTaskParameters.DryRun"/>.
/// Subclasses implement <see cref="ProcessBoreholeAsync"/> with per-borehole migration logic.
/// The type parameter <typeparamref name="TService"/> is resolved from the DI scope
/// and passed to each invocation, eliminating deferred initialization.
/// </summary>
/// <typeparam name="TService">The scoped service type required by the migration task.</typeparam>
public abstract class MigrationTaskBase<TService> : IMaintenanceTask
    where TService : notnull
{
    /// <inheritdoc/>
    public abstract MaintenanceTaskType TaskType { get; }

    /// <inheritdoc/>
    public async Task<int> ExecuteAsync(IServiceScope scope, MaintenanceTaskParameters parameters, CancellationToken cancellationToken)
    {
        var context = scope.ServiceProvider.GetRequiredService<BdmsContext>();
        var service = scope.ServiceProvider.GetRequiredService<TService>();

        var affectedRecords = 0;
        foreach (var borehole in context.Boreholes)
        {
            if (await ProcessBoreholeAsync(service, borehole, parameters, cancellationToken).ConfigureAwait(false))
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
    /// Processes a single borehole.
    /// </summary>
    /// <param name="service">The resolved service instance for this migration.</param>
    /// <param name="borehole">The borehole to process.</param>
    /// <param name="parameters">The maintenance task parameters.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns><c>true</c> if the borehole was affected; otherwise <c>false</c>.</returns>
    protected abstract Task<bool> ProcessBoreholeAsync(TService service, Borehole borehole, MaintenanceTaskParameters parameters, CancellationToken cancellationToken);
}
