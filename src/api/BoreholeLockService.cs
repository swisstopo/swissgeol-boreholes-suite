using BDMS.Models;
using Microsoft.EntityFrameworkCore;

namespace BDMS;

/// <inheritdoc />
public class BoreholeLockService(BdmsContext context, ILogger<BoreholeLockService> logger, TimeProvider timeProvider) : IBoreholeLockService
{
    internal const int LockTimeoutInMinutes = 60;

    private readonly BdmsContext context = context;
    private readonly ILogger<BoreholeLockService> logger = logger;
    private readonly TimeProvider timeProvider = timeProvider;

    /// <inheritdoc />
    public async Task<bool> IsBoreholeLockedAsync(int? boreholeId, string? subjectId)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);

        // Admins can always edit boreholes
        if (user.IsAdmin) return false;

        var borehole = await GetBoreholeWithWorkflowsAsync(boreholeId).ConfigureAwait(false);
        if (borehole.Locked.HasValue && borehole.Locked.Value.AddMinutes(LockTimeoutInMinutes) > timeProvider.GetUtcNow() && borehole.LockedById != user.Id)
        {
            var lockedUserFullName = $"{borehole.LockedBy?.FirstName} {borehole.LockedBy?.LastName}";
            logger.LogWarning("Current user with subject_id <{SubjectId}> tried to edit borehole with id <{BoreholeId}>, but the borehole is locked by user <{LockedByUserName}>.", subjectId, boreholeId, lockedUserFullName);
            return true;
        }

        return IsUserLackingPermissions(borehole, user);
    }

    /// <inheritdoc />
    public async Task<bool> IsUserLackingPermissionsAsync(int? boreholeId, string? subjectId)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);

        if (user.IsAdmin) return false;
        var borehole = await GetBoreholeWithWorkflowsAsync(boreholeId).ConfigureAwait(false);

        return IsUserLackingPermissions(borehole, user);
    }

    /// <inheritdoc />
    public bool IsUserLackingPermissions(Borehole borehole, User user)
    {
        try
        {
            if (borehole.Workflows == null || borehole.Workflows.Count == 0)
            {
                logger.LogWarning("User with SubjectId <{SubjectId}> attempted to edit BoreholeId <{BoreholeId}>, but it has no workflows.", user.SubjectId, borehole.Id);
                return true;
            }

            var boreholeWorkflowRoles = borehole.Workflows.Select(w => w.Role).ToHashSet();

            if (user.WorkgroupRoles == null || !user.WorkgroupRoles.Any(x => x.WorkgroupId == borehole.WorkgroupId && boreholeWorkflowRoles.Contains(x.Role)))
            {
                logger.LogWarning("User with SubjectId <{SubjectId}> lacks the required role to edit BoreholeId <{BoreholeId}>.", user.SubjectId, borehole.Id);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking user permissions for BoreholeId <{BoreholeId}>.", borehole.Id);
            return true;
        }
    }

    /// <inheritdoc />
    public async Task<bool> HasUserWorkgroupPermissionsAsync(int? boreholeId, string? subjectId)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);

        if (user.IsAdmin) return true;
        var borehole = await GetBoreholeWithWorkflowsAsync(boreholeId).ConfigureAwait(false);

        return HasUserWorkgroupPermissions(borehole, user);
    }

    /// <inheritdoc />
    public bool HasUserWorkgroupPermissions(Borehole borehole, User user)
    {
        return user.WorkgroupRoles != null && user.WorkgroupRoles.Any(x => x.WorkgroupId == borehole.WorkgroupId);
    }

    /// <inheritdoc />
    public async Task<bool> IsUserLackingWorkgroupRoleAsync(string? subjectId, int workgroupId, Role expectedRole)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);
        return IsUserLackingWorkgroupRole(user, workgroupId, expectedRole);
    }

    /// <inheritdoc />
    public bool IsUserLackingWorkgroupRole(User user, int workgroupId, Role expectedRole)
    {
        if (user != null && user.IsAdmin)
        {
            return false;
        }

        var workgroupRoles = user?.WorkgroupRoles ?? Enumerable.Empty<UserWorkgroupRole>();
        var hasExpectedWorkgroupRole = workgroupRoles.Any(x => x.WorkgroupId == workgroupId && x.Role == expectedRole);

        return !hasExpectedWorkgroupRole;
    }

    private async Task<Borehole> GetBoreholeWithWorkflowsAsync(int? boreholeId)
    {
        return await context.Boreholes
            .Include(b => b.Workflows)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == boreholeId)
            .ConfigureAwait(false) ?? throw new InvalidOperationException($"Associated borehole with id <{boreholeId}> does not exist.");
    }

    private async Task<User> GetUserWithWorkgroupRolesAsync(string? subjectId)
    {
        return await context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == subjectId)
            .ConfigureAwait(false) ?? throw new InvalidOperationException($"Current user with subjectId <{subjectId}> does not exist.");
    }
}
