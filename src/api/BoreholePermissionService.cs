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

    internal bool HasUserRoleOnWorkgroup(User user, int? workgroupId, Role expectedRole)
    {
        return user.IsAdmin || HasUserSpecificRoleOnWorkgroup(user, workgroupId, expectedRole);
    }

    /// <inheritdoc />
    public async Task<bool> CanViewBoreholeAsync(string? subjectId, int? boreholeId)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);
        var borehole = await GetBoreholeAsync(boreholeId).ConfigureAwait(false);
        return CanViewBorehole(user, borehole);
    }

    internal bool CanViewBorehole(User user, Borehole borehole)
    {
        return user.IsAdmin || HasViewPermission(user, borehole);
    }

    /// <inheritdoc />
    public async Task<bool> CanEditBoreholeAsync(string? subjectId, int? boreholeId)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);
        var borehole = await GetBoreholeAsync(boreholeId).ConfigureAwait(false);
        return CanEditBorehole(user, borehole);
    }

    /// <inheritdoc />
    public async Task<bool> CanChangeBoreholeStatusAsync(string? subjectId, int? boreholeId)
    {
        var user = await GetUserWithWorkgroupRolesAsync(subjectId).ConfigureAwait(false);
        var borehole = await GetBoreholeAsync(boreholeId).ConfigureAwait(false);
        return CanChangeBoreholeStatus(user, borehole);
    }

    /// <summary>
    /// Determines if a user can change the workflow status of a borehole.
    /// This allows status transitions regardless of the current status (including Reviewed/Published),
    /// but still checks for admin privileges, lock status, and proper permissions.
    /// </summary>
    /// <param name="user">The user attempting to change the borehole status</param>
    /// <param name="borehole">The borehole whose status is to be changed</param>
    /// <returns>True if the user can change the borehole status; otherwise, false</returns>
    internal bool CanChangeBoreholeStatus(User user, Borehole borehole)
    {
        return IsBoreholeEditableByUser(user, borehole);
    }

    /// <summary>
    /// Determines if a user can edit a borehole.
    /// This checks if the borehole is not in Reviewed or Published status,
    /// and if the user has appropriate permissions to edit the borehole.
    /// </summary>
    /// <param name="user">The user attempting to edit the borehole</param>
    /// <param name="borehole">The borehole to be edited</param>
    /// <returns>True if the user can edit the borehole; otherwise, false</returns>
    internal bool CanEditBorehole(User user, Borehole borehole)
    {
        var isReviewedOrPublished = borehole.Workflow?.Status is WorkflowStatus.Reviewed or WorkflowStatus.Published;
        if (isReviewedOrPublished)
        {
            return false;
        }

        return IsBoreholeEditableByUser(user, borehole);
    }

    /// <summary>
    /// Determines if a borehole can be edited by the specified user.
    /// Checks if the user has admin privileges, if the borehole is not locked by another user,
    /// and if the user has both view and edit permissions for the borehole.
    /// </summary>
    /// <param name="user">The user attempting to edit the borehole</param>
    /// <param name="borehole">The borehole to be edited</param>
    /// <returns>True if the borehole can be edited by the user; otherwise, false</returns>
    private bool IsBoreholeEditableByUser(User user, Borehole borehole)
    {
        if (user.IsAdmin)
        {
            return true;
        }

        return !IsBoreholeLocked(user, borehole)
            && HasViewPermission(user, borehole)
            && HasEditPermission(user, borehole);
    }

    private static bool HasUserSpecificRoleOnWorkgroup(User user, int? workgroupId, Role expectedRole)
    {
        var workgroupRoles = user.WorkgroupRoles ?? Enumerable.Empty<UserWorkgroupRole>();
        var hasAtLeastExpectedRole = workgroupRoles.Any(x => x.WorkgroupId == workgroupId && (int)x.Role >= (int)expectedRole);

        return hasAtLeastExpectedRole;
    }

    private static bool HasUserAnyRoleOnWorkgroup(User user, int? workgroupId)
    {
        var userWorkgroupRoles = user.WorkgroupRoles ?? Enumerable.Empty<UserWorkgroupRole>();
        var hasAnyRoleOnWorkgroup = userWorkgroupRoles.Any(x => x.WorkgroupId == workgroupId);

        return hasAnyRoleOnWorkgroup;
    }

    private bool HasViewPermission(User user, Borehole borehole)
    {
        var hasAnyRoleOnWorkgroup = HasUserAnyRoleOnWorkgroup(user, borehole.WorkgroupId);
        if (!hasAnyRoleOnWorkgroup)
        {
            logger.LogWarning("User with SubjectId <{SubjectId}> lacks the permission to view BoreholeId <{BoreholeId}>.", user.SubjectId, borehole.Id);
            return false;
        }

        return true;
    }

    /// <summary>
    /// Checks whether the <paramref name="user"/> has permissions to edit the <paramref name="borehole"/>.
    /// "Permission to edit" refers to the user having the <see cref="Role"/> on the <see cref="Workgroup"/> of the <see cref="Borehole"/>, which has permission to
    /// change the borehole with the current <see cref="Workflow.Status"/>.
    /// </summary>
    private bool HasEditPermission(User user, Borehole borehole)
    {
        if (borehole.Workflow == null)
        {
            logger.LogWarning("User with SubjectId <{SubjectId}> attempted to edit BoreholeId <{BoreholeId}>, but it has no workflow.", user.SubjectId, borehole.Id);
            return false;
        }

        if (!EditPermissionsStatusRoleMap.TryGetValue(borehole.Workflow.Status, out var requiredRole))
        {
            return false;
        }

        var hasUserPermission = requiredRole != null && HasUserSpecificRoleOnWorkgroup(user, borehole.WorkgroupId, requiredRole.Value);

        if (!hasUserPermission)
        {
            logger.LogWarning("User with SubjectId <{SubjectId}> lacks the required role to edit BoreholeId <{BoreholeId}>.", user.SubjectId, borehole.Id);
            return false;
        }

        return true;
    }

    private bool IsBoreholeLocked(User user, Borehole borehole)
    {
        if (borehole.Locked.HasValue && borehole.Locked.Value.AddMinutes(LockTimeoutInMinutes) > timeProvider.GetUtcNow() && borehole.LockedById != user.Id)
        {
            var lockedUserFullName = $"{borehole.LockedBy?.FirstName} {borehole.LockedBy?.LastName}";
            logger.LogWarning("Current user with subject_id <{SubjectId}> tried to edit borehole with id <{BoreholeId}>, but the borehole is locked by user <{LockedByUserName}>.", user.Id, borehole.Id, lockedUserFullName);
            return true;
        }

        return false;
    }

    private async Task<Borehole> GetBoreholeAsync(int? boreholeId)
    {
        return await context.Boreholes
            .Include(b => b.Workflow)
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

    /// <summary>
    /// Maps workflow statuses to the minimum role required to edit a borehole in that status.
    /// Roles have a hierarchical relationship (Publisher > Validator > Controller > Editor > View),
    /// where a higher role includes all permissions of lower roles.
    ///
    /// This mapping defines which role is needed to edit a borehole based on its current workflow status:
    /// - Draft: Requires at least Editor role
    /// - InReview: Requires at least Controller role
    /// - Reviewed: Requires at least Controller role
    /// - Published: Requires Publisher role
    /// </summary>
    internal static readonly Dictionary<WorkflowStatus, Role?> EditPermissionsStatusRoleMap = new()
    {
        { WorkflowStatus.Draft, Role.Editor },
        { WorkflowStatus.InReview, Role.Controller },
        { WorkflowStatus.Reviewed, Role.Controller },
        { WorkflowStatus.Published, Role.Publisher },
    };
}
