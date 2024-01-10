using System.Security.Claims;

namespace BDMS;

/// <summary>
/// Provides extension methods for the <see cref="HttpContext"/>.
/// </summary>
internal static class HttpContextExtensions
{
    /// <summary>
    /// Gets the name of the user from the <see cref="HttpContext"/>.
    /// </summary>
    /// <param name="httpContext">The current <see cref="HttpContext"/>.</param>
    /// <returns>The username or <c>null</c>, if the username cannot be read.</returns>
    internal static string GetUserName(this HttpContext httpContext)
        => httpContext.User.FindFirst(ClaimTypes.Name).Value;
}
