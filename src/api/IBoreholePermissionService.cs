using BDMS.Models;

namespace BDMS;

/// <summary>
/// Provides methods for checking if a user is allowed to access a borehole or workgroup.
/// </summary>
public interface IBoreholePermissionService
{
    /// <summary>
    /// Check if the <paramref name="user"/> has the <paramref name="expectedRole"/> <see cref="Role"/> on the
    /// workgroup with <paramref name="workgroupId"/>.
    /// </summary>
    /// <param name="user">The <see cref="User"/> to check.</param>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> to check.</param>
    /// <param name="expectedRole">The expected <see cref="Role"/>.</param>
    /// <returns><see langword="true"/> if the user has the expected role on the workgroup; otherwise, <see langword="false"/>.</returns>
    bool HasUserRoleOnWorkgroup(User user, int? workgroupId, Role expectedRole);

    /// <inheritdoc cref="HasUserRoleOnWorkgroup(User, int?, Role)"/>
    /// <remarks>Resolves the <see cref="User"/> from the Database by its <paramref name="subjectId"/>.</remarks>
    Task<bool> HasUserRoleOnWorkgroupAsync(string? subjectId, int? workgroupId, Role expectedRole);

    /// <summary>
    /// Checks whether the <paramref name="user"/> has permissions to view the <paramref name="borehole"/>.
    /// "Permission to view" refers to the user having at least one <see cref="Role"/> on the <see cref="Workgroup"/> of the <see cref="Borehole"/>.
    /// </summary>
    /// <param name="user">The <see cref="User"/> to check against.</param>
    /// <param name="borehole">The <see cref="Borehole"/> object to check the workgroup for.</param>
    /// <returns><see langword="true"/> if the user has permissions for the borehole; otherwise, <see langword="false"/>.</returns>
    bool CanViewBorehole(User user, Borehole borehole);

    /// <inheritdoc cref="CanViewBorehole(User, Borehole)"/>
    /// <remarks>Resolves the <see cref="User"/> and <see cref="Borehole"/> with the required includes from the Database.</remarks>
    Task<bool> CanViewBoreholeAsync(string? subjectId, int? boreholeId);

    /// <summary>
    /// Checks whether the <see cref="User"/> with <paramref name="subjectId"/> can edit the <paramref name="boreholeId"/>.
    /// Takes into account if the borehole is locked or the user lacks permission.
    /// </summary>
    /// <param name="subjectId">The <see cref="User.SubjectId" /> of the current user.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to check locks for.</param>
    /// <returns><see langword="true"/> <c>true</c> if the borehole is locked by another user; otherwise, <see langword="false"/>.</returns>
    /// <exception cref="InvalidOperationException">Provided user or <see cref="Borehole"/> does not exist.</exception>
    Task<bool> CanEditBoreholeAsync(string? subjectId, int? boreholeId);
}
