using Microsoft.EntityFrameworkCore;

namespace BDMS;

/// <inheritdoc />
public class BoreholeLockService(BdmsContext context, ILogger<BoreholeLockService> logger, TimeProvider timeProvider) : IBoreholeLockService
{
    internal const int LockTimeoutInMinutes = 10;

    private readonly BdmsContext context = context;
    private readonly ILogger<BoreholeLockService> logger = logger;
    private readonly TimeProvider timeProvider = timeProvider;

    /// <inheritdoc />
    public async Task<bool> IsBoreholeLockedAsync(int? boreholeId, string? userName)
    {
        var user = await context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Name == userName)
            .ConfigureAwait(false) ?? throw new InvalidOperationException($"Current user with name <{userName}> does not exist.");

        var borehole = await context.Boreholes
            .Include(b => b.Workflows)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == boreholeId)
            .ConfigureAwait(false) ?? throw new InvalidOperationException($"Associated borehole with id <{boreholeId}> does not exist.");

        var userWorkflowRoles = borehole.Workflows
            .Where(w => w.UserId == user.Id)
            .Select(w => w.Role)
            .ToHashSet();

        if (!user.WorkgroupRoles.Any(x => x.WorkgroupId == borehole.WorkgroupId && userWorkflowRoles.Contains(x.Role)))
        {
            logger.LogWarning("Current user with name <{UserName}> does not have the required role to create a stratigraphy for borehole with id <{BoreholeId}>.", userName, boreholeId);
            throw new UnauthorizedAccessException();
        }

        if (borehole.Locked.HasValue && borehole.Locked.Value.AddMinutes(LockTimeoutInMinutes) > timeProvider.GetUtcNow() && borehole.LockedById != user.Id)
        {
            var lockedUserFullName = $"{borehole.LockedBy?.FirstName} {borehole.LockedBy?.LastName}";
            logger.LogWarning("Current user with name <{UserName}> tried to create a stratigraphy for borehole with id <{BoreholeId}>, but the borehole is locked by user <{LockedByUserName}>.", userName, boreholeId, lockedUserFullName);
            return true;
        }

        return false;
    }
}
