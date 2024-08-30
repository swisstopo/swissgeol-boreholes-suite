using System.Security.Claims;
using static BDMS.EnvironmentExtensions;

namespace BDMS.Authentication;

/// <summary>
/// Enables anonymous mode for the application.
/// </summary>
/// <param name="next">The delegate representing the remaining middleware in the request pipeline.</param>
/// <param name="configuration">The application configuration.</param>
public class AnonymousAuthenticationMiddleware(RequestDelegate next, IConfiguration configuration)
{
    private const string AnonymousUserIdentifier = "sub_anonymous";

    /// <summary>
    /// Request handling method.
    /// </summary>
    /// <param name="context">The <see cref="HttpContext"/> for the current request.</param>
    /// <param name="dbContext">The <see cref="BdmsContext"/>.</param>
    /// <returns>A <see cref="Task"/> that represents the execution of this middleware.</returns>
    public async Task InvokeAsync(HttpContext context, BdmsContext dbContext)
    {
        if (IsAnonymousModeEnabled())
        {
            var groupClaimType = configuration.GetValue<string>("Auth:GroupClaimType")
                ?? throw new InvalidOperationException("The configuration 'Auth:GroupClaimType' is missing.");

            var authorizedGroupName = configuration.GetValue<string>("Auth:AuthorizedGroupName")
                ?? throw new InvalidOperationException("The configuration 'Auth:AuthorizedGroupName' is missing.");

            // Get pre-configured anonymous user.
            var anonymousUser = dbContext.Users.SingleOrDefault(u => u.SubjectId == AnonymousUserIdentifier && !u.IsAdmin);
            if (anonymousUser is null)
                throw new InvalidOperationException("The anonymous user is not configured.");

            // Automatically _authenticate_ the anonymous user with the viewer role.
            var claimsIdentity = new ClaimsIdentity();
            claimsIdentity.AddClaim(new(ClaimTypes.Name, anonymousUser.Name));
            claimsIdentity.AddClaim(new(ClaimTypes.NameIdentifier, AnonymousUserIdentifier));
            claimsIdentity.AddClaim(new(ClaimTypes.Role, PolicyNames.Viewer));
            claimsIdentity.AddClaim(new(groupClaimType, authorizedGroupName));

            context.User = new ClaimsPrincipal(claimsIdentity);

            await next(context).ConfigureAwait(false);
        }
        else
        {
            throw new InvalidOperationException("Misconfigured anonymous mode.");
        }
    }
}
