using BDMS.Models;

namespace BDMS.Services;

/// <summary>
/// Provides methods for checking if a user is allowed to access a borehole or workgroup.
/// </summary>
public interface IBoreholePermissionService
{
    /// <summary>
    /// Check if the <see cref="User"/> with <paramref name="subjectId"/> has the <paramref name="expectedRole"/> <see cref="Role"/> on the
    /// workgroup with <paramref name="workgroupId"/>.
    /// </summary>
    /// <param name="subjectId">The <see cref="User.SubjectId"/> of the user.</param>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> to check.</param>
    /// <param name="expectedRole">The expected <see cref="Role"/>.</param>
    /// <returns><see langword="true"/> if the user has the expected role on the workgroup; otherwise, <see langword="false"/>.</returns>
    Task<bool> HasUserRoleOnWorkgroupAsync(string? subjectId, int? workgroupId, Role expectedRole);

    /// <summary>
    /// Checks whether the <see cref="User"/> with <paramref name="subjectId"/> has permissions to view the <paramref name="boreholeId"/>.
    /// "Permission to view" refers to the user having at least one <see cref="Role"/> on the <see cref="Workgroup"/> of the <see cref="Borehole"/>.
    /// </summary>
    /// <param name="subjectId">The <see cref="User.SubjectId"/> of the user.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to check.</param>
    /// <returns><see langword="true"/> if the user has permissions for the borehole; otherwise, <see langword="false"/>.</returns>
    Task<bool> CanViewBoreholeAsync(string? subjectId, int? boreholeId);

    /// <summary>
    /// Checks whether the <see cref="User"/> with <paramref name="subjectId"/> can edit the <paramref name="boreholeId"/>.
    /// Takes into account if the borehole is in a status that allows editing, is locked or the user lacks permission.
    /// </summary>
    /// <param name="subjectId">The <see cref="User.SubjectId" /> of the current user.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to check locks for.</param>
    /// <returns><see langword="true"/> if the user has permission for the borehole; otherwise, <see langword="false"/>.</returns>
    Task<bool> CanEditBoreholeAsync(string? subjectId, int? boreholeId);

    /// <summary>
    /// Checks whether the <see cref="User"/> with <paramref name="subjectId"/> can manage the <paramref name="boreholeId"/>.
    /// "Manage" means the user has authority over the borehole regardless of its workflow status
    /// (e.g. changing status, deleting, or updating tab statuses).
    /// Takes into account if the borehole is locked or the user lacks permission.
    /// </summary>
    /// <param name="subjectId">The <see cref="User.SubjectId" /> of the current user.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to check.</param>
    /// <returns><see langword="true"/> if the user has permission to manage the borehole; otherwise, <see langword="false"/>.</returns>
    Task<bool> CanManageBoreholeAsync(string? subjectId, int? boreholeId);

    /// <summary>
    /// Batch equivalent of <see cref="CanEditBoreholeAsync"/>: returns the subset of <paramref name="boreholeIds"/>
    /// that the <see cref="User"/> with <paramref name="subjectId"/> cannot edit, fetching the user and all boreholes
    /// in a single round-trip each. A borehole id that does not exist is treated as not editable.
    /// </summary>
    /// <param name="subjectId">The <see cref="User.SubjectId"/> of the current user.</param>
    /// <param name="boreholeIds">The <see cref="Borehole.Id"/>s to check.</param>
    /// <returns>The distinct ids the user is not allowed to edit; empty if the user may edit all of them.</returns>
    Task<IReadOnlyList<int>> GetBoreholeIdsUserCannotEditAsync(string? subjectId, IReadOnlyCollection<int> boreholeIds);

    /// <summary>
    /// Batch equivalent of <see cref="CanManageBoreholeAsync"/>: returns the subset of <paramref name="boreholeIds"/>
    /// that the <see cref="User"/> with <paramref name="subjectId"/> cannot manage, fetching the user and all
    /// boreholes in a single round-trip each. A borehole id that does not exist is treated as not allowed.
    /// </summary>
    /// <param name="subjectId">The <see cref="User.SubjectId"/> of the current user.</param>
    /// <param name="boreholeIds">The <see cref="Borehole.Id"/>s to check.</param>
    /// <returns>The distinct ids the user is not allowed to manage; empty if the user may manage all of them.</returns>
    Task<IReadOnlyList<int>> GetBoreholeIdsUserCannotManageAsync(string? subjectId, IReadOnlyCollection<int> boreholeIds);
}
