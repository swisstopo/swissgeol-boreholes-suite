using Microsoft.Extensions.Logging;

namespace BDMS.ExternSync;

/// <summary>
/// Represents a task manager that executes and validates a collection of <see cref="ISyncTask"/> in sequence.
/// </summary>
/// <param name="tasks">A collection of <see cref="ISyncTask"/>s to execute in sequence.</param>
/// <param name="logger">The logger for this instance.</param>
public class SyncTaskManager(IEnumerable<ISyncTask> tasks, ILogger<SyncTaskManager> logger)
{
    /// <summary>
    /// Executes the <see cref="ISyncTask"/>s in sequence."
    /// </summary>
    public async Task ExecuteTasksAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Queued tasks: {TaskNames}", string.Join(", ", tasks.Select(t => t.GetType().Name)));

        foreach (var task in tasks)
        {
            logger.LogInformation("Executing task {TaskName}...", task.GetType().Name);
            await task.ExecuteAndValidateAsync(cancellationToken).ConfigureAwait(false);
        }

        logger.LogInformation("All tasks have been executed successfully.");
    }
}
