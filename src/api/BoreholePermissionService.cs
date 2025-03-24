using BDMS.Models;
using Microsoft.EntityFrameworkCore;

namespace BDMS;

/// <inheritdoc cref="IBoreholePermissionService" />
public class BoreholePermissionService(BdmsContext context, ILogger<BoreholePermissionService> logger, TimeProvider timeProvider) : IBoreholePermissionService
{
    internal const int LockTimeoutInMinutes = 60;

    private readonly BdmsContext context = context;
    private readonly ILogger<BoreholePermissionService> logger = logger;
    private readonly TimeProvider timeProvider = timeProvider;

    /// <inheritdoc />
    public async Task<bool> HasUserRoleOnWorkgroupAsync(string? subjectId, int? workgroupId, Role expectedRole)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);
        return HasUserRoleOnWorkgroup(user, workgroupId, expectedRole);
    }

    /// <inheritdoc />
    public bool HasUserRoleOnWorkgroup(User user, int? workgroupId, Role expectedRole)
    {
        if (user != null && user.IsAdmin)
        {
            return true;
        }

        var workgroupRoles = user?.WorkgroupRoles ?? Enumerable.Empty<UserWorkgroupRole>();
        var hasExpectedWorkgroupRole = workgroupRoles.Any(x => x.WorkgroupId == workgroupId && x.Role == expectedRole);

        return hasExpectedWorkgroupRole;
    }

    /// <inheritdoc />
    public async Task<bool> CanViewBoreholeAsync(string? subjectId, int? boreholeId)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);
        var borehole = await GetBoreholeWithWorkflowsAsync(boreholeId).ConfigureAwait(false);
        return CanViewBorehole(user, borehole);
    }

    /// <inheritdoc />
    public bool CanViewBorehole(User user, Borehole borehole)
    {
        try
        {
            if (user != null && user.IsAdmin)
            {
                return true;
            }

            if (user == null || borehole == null)
            {
                logger.LogWarning("User <{SubjectId}> or Borehole <{BoreholeId}> is null.", user?.SubjectId, borehole?.Id);
                return false;
            }

            if (borehole.WorkgroupId == null)
            {
                logger.LogWarning("User with SubjectId <{SubjectId}> attempted to view BoreholeId <{BoreholeId}>, but it has no Workgroup.", user.SubjectId, borehole.Id);
                return false;
            }

            var userWorkgroupRoles = user.WorkgroupRoles ?? Enumerable.Empty<UserWorkgroupRole>();
            var hasAnyRoleOnWorkgroup = userWorkgroupRoles.Any(x => x.WorkgroupId == borehole.WorkgroupId);

            if (!hasAnyRoleOnWorkgroup)
            {
                logger.LogWarning("User with SubjectId <{SubjectId}> lacks the permission to view BoreholeId <{BoreholeId}>.", user.SubjectId, borehole.Id);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking user permissions for BoreholeId <{BoreholeId}>.", borehole.Id);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> CanEditBoreholeAsync(string? subjectId, int? boreholeId)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);
        var borehole = await GetBoreholeWithWorkflowsAsync(boreholeId).ConfigureAwait(false);
        return !IsBoreholeLocked(user, borehole) && HasEditPermission(user, borehole);
    }

    /// <summary>
    /// Checks whether the <paramref name="user"/> has permissions to edit the <paramref name="borehole"/>.
    /// "Permission to edit" refers to the user having the <see cref="Role"/> on the <see cref="Workgroup"/> of the <see cref="Borehole"/>, which is equal to the
    /// borehole's current <see cref="Workflow.Role"/>.
    /// </summary>
    /// <param name="user">The <see cref="User"/> to check against.</param>
    /// <param name="borehole">The <see cref="Borehole"/> object to check the workgroup for.</param>
    /// <returns><see langword="true"/> if the user has permissions for the borehole; otherwise, <see langword="false"/>.</returns>
    internal bool HasEditPermission(User user, Borehole borehole)
    {
        try
        {
            if (user != null && user.IsAdmin)
            {
                return true;
            }

            if (user == null || borehole == null)
            {
                logger.LogWarning("User <{SubjectId}> or Borehole <{BoreholeId}> is null.", user?.SubjectId, borehole?.Id);
                return false;
            }

            if (borehole.Workflows == null || borehole.Workflows.Count == 0)
            {
                logger.LogWarning("User with SubjectId <{SubjectId}> attempted to edit BoreholeId <{BoreholeId}>, but it has no workflows.", user.SubjectId, borehole.Id);
                return false;
            }

            if (borehole.WorkgroupId == null)
            {
                logger.LogWarning("User with SubjectId <{SubjectId}> attempted to edit BoreholeId <{BoreholeId}>, but it has no Workgroup.", user.SubjectId, borehole.Id);
                return false;
            }

            var currentBoreholeWorkflow = borehole.Workflows.OrderBy(w => w.Id).Last();
            var userHasPermission = currentBoreholeWorkflow.Role != null && HasUserRoleOnWorkgroup(user, borehole.Workgroup.Id, currentBoreholeWorkflow.Role.Value);
            if (!userHasPermission)
            {
                logger.LogWarning("User with SubjectId <{SubjectId}> lacks the required role to edit BoreholeId <{BoreholeId}>.", user.SubjectId, borehole.Id);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking user permissions for BoreholeId <{BoreholeId}>.", borehole.Id);
            return false;
        }
    }

    internal bool IsBoreholeLocked(User user, Borehole borehole)
    {
        // Admins can edit locked boreholes
        if (user.IsAdmin)
        {
            return false;
        }

        if (borehole.Locked.HasValue && borehole.Locked.Value.AddMinutes(LockTimeoutInMinutes) > timeProvider.GetUtcNow() && borehole.LockedById != user.Id)
        {
            var lockedUserFullName = $"{borehole.LockedBy?.FirstName} {borehole.LockedBy?.LastName}";
            logger.LogWarning("Current user with subject_id <{SubjectId}> tried to edit borehole with id <{BoreholeId}>, but the borehole is locked by user <{LockedByUserName}>.", user.Id, borehole.Id, lockedUserFullName);
            return true;
        }

        return false;
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
