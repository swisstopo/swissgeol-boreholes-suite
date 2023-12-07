using System.Security.Claims;

namespace BDMS.Authentication;

public class LegacyApiAuthenticationMiddleware(ILogger<LegacyApiAuthenticationMiddleware> logger) : IMiddleware
{
    private readonly ILogger<LegacyApiAuthenticationMiddleware> logger = logger;

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        Claim? userName;
        if (context.Request.Path.StartsWithSegments(new PathString("/api/v1"), StringComparison.OrdinalIgnoreCase))
        {
            userName = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
            if (userName is not null)
            {
                context.Request.Headers.Authorization = userName.Value;

                await next.Invoke(context).ConfigureAwait(false);

                logger.LogInformation("Authorized user <{UserName}> for legacy api accessing route <{Route}>", userName.Value, context.Request.Path);
                return;
            }
        }

        await next.Invoke(context).ConfigureAwait(false);
    }
}
