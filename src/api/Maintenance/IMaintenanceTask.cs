using Microsoft.Extensions.DependencyInjection;

namespace BDMS.Maintenance;

/// <summary>
/// Represents a maintenance task that can be executed in the background.
/// Implementations are registered as singletons and receive a fresh <see cref="IServiceScope"/>
/// per execution to resolve scoped dependencies like <see cref="BdmsContext"/>.
/// </summary>
public interface IMaintenanceTask
{
    /// <summary>
    /// Gets the type identifier for this maintenance task.
    /// </summary>
    MaintenanceTaskType TaskType { get; }

    /// <summary>
    /// Executes the maintenance task using services resolved from the provided <paramref name="scope"/>.
    /// </summary>
    /// <returns>The number of affected records.</returns>
    Task<int> ExecuteAsync(IServiceScope scope, MigrationParameters parameters, CancellationToken cancellationToken);
}
