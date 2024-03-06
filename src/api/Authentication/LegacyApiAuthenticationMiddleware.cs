using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BDMS.Authentication;

/// <summary>
/// Middleware to authenticate requests to the legacy api before proxying.
/// </summary>
/// <param name="authorizationService">The authorization service used to check for policies.</param>
/// <param name="logger">The logger for the instance.</param>
public class LegacyApiAuthenticationMiddleware(IAuthorizationService authorizationService, ILogger<LegacyApiAuthenticationMiddleware> logger) : IMiddleware
{
    private readonly ILogger<LegacyApiAuthenticationMiddleware> logger = logger;

    /// <inheritdoc/>
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if (context.Request.Path.StartsWithSegments(new PathString("/api/v1"), StringComparison.OrdinalIgnoreCase))
        {
            var userAuthorized = (await authorizationService.AuthorizeAsync(context.User, PolicyNames.Viewer).ConfigureAwait(false)).Succeeded;
            var subjectId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (userAuthorized && subjectId is not null)
            {
                context.Request.Headers.Authorization = subjectId.Value;

                await next.Invoke(context).ConfigureAwait(false);

                var route = context.Request.Path.ToString().ReplaceLineEndings("");
                logger.LogInformation("Authorized user with subject_id <{SubjectId}> for legacy api accessing route <{Route}>", subjectId.Value, route);
                return;
            }
        }

        await next.Invoke(context).ConfigureAwait(false);
    }
}
