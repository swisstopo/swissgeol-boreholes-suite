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
    /// <param name="userName">The current user name.</param>
    /// <returns><c>true</c> if the borehole is locked by another user; otherwise, <c>false</c>.</returns>
    /// <exception cref="InvalidOperationException">Provided user or <see cref="Borehole"/> does not exist.</exception>
    /// <exception cref="UnauthorizedAccessException">Current user is not allowed to create the given <see cref="Stratigraphy"/>.</exception>
    Task<bool> IsBoreholeLockedAsync(int? boreholeId, string? userName);
}
