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
    /// Checks which boreholes in the provided list the user lacks permissions to edit.
    /// </summary>
    /// <param name="boreholes">The list of <see cref="Borehole"/> objects to check permissions for.</param>
    /// <param name="user">The <see cref="User"/> to check against.</param>
    /// <returns><c>true</c> if the user is lacking permissions for the borehole; otherwise, <c>false</c>.</returns>
    bool IsUserLackingPermissions(ICollection<Borehole> boreholes, User user);
}
