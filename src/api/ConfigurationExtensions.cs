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
    /// <param name="configuration">The <see cref="IConfiguration"/>.</param>
    /// <returns><c>true</c> if the anonymous mode is enabled; otherwise <c>false</c>.</returns>
    internal static bool IsAnonymousModeEnabled(this IConfiguration configuration)
        => configuration.GetRequiredSection("Auth").Get<AuthSettings>().AnonymousModeEnabled;

    /// <summary>
    /// Gets the group claim type for the authentication.
    /// </summary>
    /// <param name="configuration">The <see cref="IConfiguration"/>.</param>
    /// <returns>The group claim type for the authentication.</returns>
    /// <exception cref="InvalidOperationException">The configuration setting is missing.</exception>
    internal static string GetAuthGroupClaimType(this IConfiguration configuration)
        => configuration.GetValue<string>("Auth:GroupClaimType") ?? throw new InvalidOperationException("The configuration 'Auth:GroupClaimType' is missing.");

    /// <summary>
    /// Gets the authorized group name for the authentication.
    /// </summary>
    /// <param name="configuration">The <see cref="IConfiguration"/>.</param>
    /// <returns>The authorized group name for the authentication.</returns>
    /// <exception cref="InvalidOperationException">The configuration setting is missing.</exception>
    internal static string GetAuthorizedGroupName(this IConfiguration configuration)
        => configuration.GetValue<string>("Auth:AuthorizedGroupName") ?? throw new InvalidOperationException("The configuration 'Auth:AuthorizedGroupName' is missing.");
}
