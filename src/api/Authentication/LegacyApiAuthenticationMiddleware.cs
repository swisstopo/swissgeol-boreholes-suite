using System.Security.Claims;

namespace BDMS.Authentication;

/// <summary>
/// Middleware to authenticate requests to the legacy api before proxying.
/// </summary>
/// <param name="logger">The logger for the instance.</param>
public class LegacyApiAuthenticationMiddleware(ILogger<LegacyApiAuthenticationMiddleware> logger) : IMiddleware
{
    private readonly ILogger<LegacyApiAuthenticationMiddleware> logger = logger;

    /// <inheritdoc/>
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if (context.Request.Path.StartsWithSegments(new PathString("/api/v1"), StringComparison.OrdinalIgnoreCase))
        {
            var subjectId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (subjectId is not null)
            {
                context.Request.Headers.Authorization = subjectId.Value;

                await next.Invoke(context).ConfigureAwait(false);

                logger.LogInformation("Authorized user with subject_id <{SubjectId}> for legacy api accessing route <{Route}>", subjectId.Value, context.Request.Path);
                return;
            }
        }

        await next.Invoke(context).ConfigureAwait(false);
    }
}
