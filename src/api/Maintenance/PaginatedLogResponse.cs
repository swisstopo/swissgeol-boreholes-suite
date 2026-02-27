namespace BDMS.Maintenance;

/// <summary>
/// Represents a paginated response containing a subset of <see cref="MaintenanceTaskLogEntry"/> along with pagination info.
/// </summary>
/// <param name="TotalCount">The total count of matching log entries.</param>
/// <param name="PageNumber">The current page number (1-based).</param>
/// <param name="PageSize">The number of entries per page.</param>
/// <param name="LogEntries">The log entries on the current page.</param>
public record PaginatedLogResponse(
    int TotalCount,
    int PageNumber,
    int PageSize,
    IReadOnlyList<MaintenanceTaskLogEntry> LogEntries);
