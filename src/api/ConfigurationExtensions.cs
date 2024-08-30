using BDMS.Models;

namespace BDMS;

/// <summary>
/// Provides extension methods for <see cref="IConfiguration"/>.
/// </summary>
internal static class ConfigurationExtensions
{
    /// <summary>
    /// Checks if anonymous mode is enabled.
    /// </summary>
    /// <returns><c>true</c> if the anonymous mode is enabled; otherwise <c>false</c>.</returns>
    internal static bool IsAnonymousModeEnabled(this IConfiguration configuration)
        => configuration.GetRequiredSection("Auth").Get<AuthSettings>().AnonymousModeEnabled;
}
