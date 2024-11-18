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
    /// <exception cref="UnauthorizedAccessException">Current user is not allowed to create the given <see cref="Stratigraphy"/>.</exception>
    Task<bool> IsBoreholeLockedAsync(int? boreholeId, string? subjectId);

    /// <summary>
    /// Checks whether the currently authenticated user lacks permissions to edit the <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to check permissions for.</param>
    /// <param name="subjectId">The <see cref="User.SubjectId" /> of the current user.</param>
    /// <returns><c>true</c> if the user is lacking permissions for the borehole; otherwise, <c>false</c>.</returns>
    /// <exception cref="InvalidOperationException">Provided user or <see cref="Borehole"/> does not exist.</exception>
    Task<bool> IsUserLackingPermissions(int? boreholeId, string? subjectId);
}
