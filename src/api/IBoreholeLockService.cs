using BDMS.Models;

namespace BDMS;

/// <summary>
/// Provides methods for handling borehole locks.
/// </summary>
public interface IBoreholeLockService
{
    /// <summary>
    /// Checks whether the borehole with the specified <paramref name="boreholeId"/> is locked.
    /// </summary>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to check locks for.</param>
    /// <param name="subjectId">The <see cref="User.SubjectId" /> of the current user.</param>
    /// <returns><c>true</c> if the borehole is locked by another user; otherwise, <c>false</c>.</returns>
    /// <exception cref="InvalidOperationException">Provided user or <see cref="Borehole"/> does not exist.</exception>
    Task<bool> IsBoreholeLockedAsync(int? boreholeId, string? subjectId);

    /// <summary>
    /// Checks whether the currently authenticated user lacks permissions to edit the <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to check permissions for.</param>
    /// <param name="subjectId">The <see cref="User.SubjectId" /> of the current user.</param>
    /// <returns><c>true</c> if the user is lacking permissions for the borehole; otherwise, <c>false</c>.</returns>
    /// <exception cref="InvalidOperationException">Provided user or <see cref="Borehole"/> does not exist.</exception>
    Task<bool> IsUserLackingPermissions(int? boreholeId, string? subjectId);

    /// <summary>
    /// Checks whether the currently authenticated user is part of the borehole's work group.
    /// </summary>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to check workgroup for.</param>
    /// <param name="subjectId">The <see cref="User.SubjectId" /> of the current user.</param>
    /// <returns><c>true</c> if the user is part of the borehole's workgroup; otherwise, <c>false</c>.</returns>
    /// <exception cref="InvalidOperationException">Provided user or <see cref="Borehole"/> does not exist.</exception>
    Task<bool> HasUserWorkgroupPermissionsAsync(int? boreholeId, string? subjectId);

    /// <summary>
    /// Checks if the user is part of the borehole's work group.
    /// </summary>
    /// <param name="borehole">The <see cref="Borehole"/> object to check the workgroup for.</param>
    /// <param name="user">The <see cref="User"/> to check against.</param>
    /// <returns><c>true</c> if the user is part of the borehole's workgroup; otherwise, <c>false</c>.</returns>
    bool HasUserWorkgroupPermissions(Borehole borehole, User user);
}
