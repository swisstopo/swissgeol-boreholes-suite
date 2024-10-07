using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BDMS.Authentication;

/// <summary>
/// Middleware to authenticate requests to the data extraction api before proxying.
/// </summary>
/// <param name="authorizationService">The authorization service used to check for policies.</param>
/// <param name="logger">The logger for the instance.</param>
public class DataExtractionApiAuthenticationMiddleware(IAuthorizationService authorizationService, ILogger<DataExtractionApiAuthenticationMiddleware> logger) : IMiddleware
{
    private readonly ILogger<DataExtractionApiAuthenticationMiddleware> logger = logger;

    /// <inheritdoc/>
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if (context.Request.Path.StartsWithSegments(new PathString("/dataextraction"), StringComparison.OrdinalIgnoreCase))
        {
            var userAuthorized = (await authorizationService.AuthorizeAsync(context.User, PolicyNames.Admin).ConfigureAwait(false)).Succeeded;
            var subjectId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (userAuthorized && subjectId is not null)
            {
                context.Request.Headers.Authorization = subjectId.Value;

                await next.Invoke(context).ConfigureAwait(false);

                var route = context.Request.Path.ToString().ReplaceLineEndings("");
                logger.LogInformation("Authorized user with subject_id <{SubjectId}> for data extraction api accessing route <{Route}>", subjectId.Value, route);
                return;
            }
        }

        await next.Invoke(context).ConfigureAwait(false);
    }
}
