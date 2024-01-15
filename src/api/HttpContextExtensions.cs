using System.Security.Claims;

namespace BDMS;

/// <summary>
/// Provides extension methods for the <see cref="HttpContext"/>.
/// </summary>
internal static class HttpContextExtensions
{
    /// <summary>
    /// Gets the SubjectId of the user from the <see cref="HttpContext"/>.
    /// </summary>
    /// <param name="httpContext">The current <see cref="HttpContext"/>.</param>
    /// <returns>The SubjectId or <c>null</c>, if the users SubjectId cannot be read.</returns>
    internal static string GetUserSubjectId(this HttpContext httpContext)
        => httpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
}
