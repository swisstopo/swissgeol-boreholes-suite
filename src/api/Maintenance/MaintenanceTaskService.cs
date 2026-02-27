using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Text.Json;

namespace BDMS.Maintenance;

/// <summary>
/// Singleton service that manages and executes long-running maintenance tasks in the background.
/// Task implementations are provided via DI as <see cref="IMaintenanceTask"/> instances.
/// </summary>
public class MaintenanceTaskService
{
    private static readonly JsonSerializerOptions jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly ILogger<MaintenanceTaskService> logger;
    private readonly IServiceScopeFactory serviceScopeFactory;
    private readonly Dictionary<MaintenanceTaskType, IMaintenanceTask> tasks;
    private readonly ConcurrentDictionary<MaintenanceTaskType, MaintenanceTaskState> taskStates = new();
    private readonly object startLock = new();

    /// <summary>
    /// Initializes a new instance of the <see cref="MaintenanceTaskService"/> class.
    /// </summary>
    /// <param name="logger">The logger instance.</param>
    /// <param name="serviceScopeFactory">Factory for creating DI scopes for background task execution.</param>
    /// <param name="maintenanceTasks">The registered maintenance task implementations.</param>
    public MaintenanceTaskService(
        ILogger<MaintenanceTaskService> logger,
        IServiceScopeFactory serviceScopeFactory,
        IEnumerable<IMaintenanceTask> maintenanceTasks)
    {
        this.logger = logger;
        this.serviceScopeFactory = serviceScopeFactory;
        tasks = maintenanceTasks.ToDictionary(t => t.TaskType);

        // Initialize all registered task types with idle state.
        foreach (var taskType in tasks.Keys)
        {
            taskStates[taskType] = new MaintenanceTaskState { Type = taskType };
        }
    }

    /// <summary>
    /// Returns whether the specified maintenance task is currently running.
    /// </summary>
    /// <param name="taskType">The type of maintenance task to check.</param>
    public bool IsTaskRunning(MaintenanceTaskType taskType)
        => taskStates.TryGetValue(taskType, out var state) && state.Status == MaintenanceTaskStatus.Running;

    /// <summary>
    /// Gets the current in-memory state of all maintenance tasks.
    /// </summary>
    public Task<IReadOnlyList<MaintenanceTaskState>> GetTaskStatesAsync()
        => Task.FromResult<IReadOnlyList<MaintenanceTaskState>>(taskStates.Values.ToList().AsReadOnly());

    /// <summary>
    /// Gets a paginated list of log entries, optionally filtering out dry-run entries.
    /// Results are ordered by <see cref="Models.MaintenanceTaskLog.CompletedAt"/> descending (newest first).
    /// </summary>
    /// <param name="pageNumber">The 1-based page number.</param>
    /// <param name="pageSize">The number of entries per page.</param>
    /// <param name="includeDryRun">Whether to include dry-run entries in the results.</param>
    public async Task<PaginatedLogResponse> GetPaginatedLogEntriesAsync(int pageNumber, int pageSize, bool includeDryRun)
    {
        using var scope = serviceScopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BdmsContext>();

        var query = context.MaintenanceTaskLogs
            .AsNoTracking()
            .Include(l => l.StartedBy)
            .AsQueryable();

        if (!includeDryRun)
        {
            query = query.Where(l => !l.IsDryRun);
        }

        query = query.OrderByDescending(l => l.CompletedAt);

        // Count before pagination so the client knows the total number of matching entries.
        var totalCount = await query.CountAsync().ConfigureAwait(false);
        var skip = (pageNumber - 1) * pageSize;

        var logs = await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync()
            .ConfigureAwait(false);

        var entries = logs
            .Select(log => new MaintenanceTaskLogEntry
            {
                TaskType = log.TaskType,
                Status = log.Status,
                AffectedCount = log.AffectedCount,
                Message = log.Message,
                Parameters = log.Parameters,
                IsDryRun = log.IsDryRun,
                OnlyMissing = log.OnlyMissing,
                StartedByName = log.StartedBy != null ? $"{log.StartedBy.FirstName} {log.StartedBy.LastName}" : null,
                StartedAt = log.StartedAt,
                CompletedAt = log.CompletedAt,
            })
            .ToList();

        return new PaginatedLogResponse(totalCount, pageNumber, pageSize, entries.AsReadOnly());
    }

    /// <summary>
    /// Starts the specified maintenance task in the background if it is not already running.
    /// Returns <c>null</c> if the task is already running; otherwise returns the background
    /// task that callers may optionally await (e.g. in tests) or discard for fire-and-forget behavior.
    /// Uses a lock to ensure the running check and state transition are atomic.
    /// </summary>
    /// <param name="taskType">The type of maintenance task to start.</param>
    /// <param name="parameters">Migration parameters controlling the task behavior.</param>
    /// <param name="startedById">The ID of the user who started the task, used for audit logging.</param>
    public Task<bool> TryStartTaskAsync(MaintenanceTaskType taskType, MigrationParameters parameters, int startedById)
    {
        if (!tasks.TryGetValue(taskType, out var task))
        {
            throw new ArgumentException($"No maintenance task registered for type {taskType}.", nameof(taskType));
        }

        lock (startLock)
        {
            if (IsTaskRunning(taskType))
            {
                return Task.FromResult(false);
            }

            return StartBackgroundTaskAsync(taskType, (scope, ct) => task.ExecuteAsync(scope, parameters, ct), parameters, startedById);
        }
    }

    private async Task<bool> StartBackgroundTaskAsync(MaintenanceTaskType taskType, Func<IServiceScope, CancellationToken, Task<int>> taskAction, MigrationParameters parameters, int startedById)
    {
        var state = taskStates[taskType];

        state.Status = MaintenanceTaskStatus.Running;
        state.Message = null;
        state.AffectedCount = null;
        state.StartedAt = DateTime.UtcNow;
        state.CompletedAt = null;

        logger.LogInformation("Starting maintenance task {TaskType}.", taskType);

        await Task.Run(async () =>
        {
            using var scope = serviceScopeFactory.CreateScope();
            try
            {
                var affectedCount = await taskAction(scope, CancellationToken.None).ConfigureAwait(false);
                state.Status = MaintenanceTaskStatus.Completed;
                state.AffectedCount = affectedCount;
                state.Message = null;
                state.CompletedAt = DateTime.UtcNow;
                logger.LogInformation("Maintenance task {TaskType} completed. Affected count: {AffectedCount}", taskType, affectedCount);
            }
            catch (Exception ex)
            {
                state.Status = MaintenanceTaskStatus.Failed;
                state.AffectedCount = null;
                state.Message = ex.Message;
                state.CompletedAt = DateTime.UtcNow;
                logger.LogError(ex, "Maintenance task {TaskType} failed.", taskType);
            }

            // Persist log entry using a separate scope to avoid issues with a potentially
            // dirty DbContext from the task execution (especially on failure).
            try
            {
                using var logScope = serviceScopeFactory.CreateScope();
                var bdmsContext = logScope.ServiceProvider.GetRequiredService<BdmsContext>();

                bdmsContext.MaintenanceTaskLogs.Add(new MaintenanceTaskLog
                {
                    TaskType = taskType,
                    Status = state.Status,
                    AffectedCount = state.AffectedCount,
                    Message = state.Message,
                    Parameters = JsonSerializer.Serialize(parameters, jsonOptions),
                    IsDryRun = parameters.DryRun,
                    OnlyMissing = parameters.OnlyMissing,
                    StartedById = startedById,
                    StartedAt = state.StartedAt!.Value,
                    CompletedAt = state.CompletedAt!.Value,
                });
                await bdmsContext.SaveChangesAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to persist log entry for maintenance task {TaskType}.", taskType);
            }
        }).ConfigureAwait(false);

        return true;
    }
}
