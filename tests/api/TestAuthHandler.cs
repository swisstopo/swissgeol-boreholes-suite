using BDMS.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace BDMS;

/// <summary>
/// A test authentication handler that reads identity claims from request headers.
/// Use <see cref="SubjectIdHeader"/> and <see cref="RoleHeader"/> to configure the authenticated user per request.
/// </summary>
internal class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    /// <summary>The authentication scheme name used to register this handler.</summary>
    public const string AuthenticationScheme = "TestScheme";

    /// <summary>Request header that sets the authenticated user's subject identifier claim.</summary>
    public const string SubjectIdHeader = "X-Test-SubjectId";

    /// <summary>Request header that sets the authenticated user's role claim. Defaults to Admin if absent.</summary>
    public const string RoleHeader = "X-Test-Role";

    /// <summary>
    /// Initializes a new instance of the <see cref="TestAuthHandler"/> class.
    /// </summary>
    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var subjectId = Request.Headers[SubjectIdHeader].FirstOrDefault();
        if (subjectId == null)
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var role = Request.Headers[RoleHeader].FirstOrDefault() ?? PolicyNames.Admin;

        var configuration = Context.RequestServices.GetRequiredService<IConfiguration>();
        var groupClaimType = configuration.GetAuthGroupClaimType();
        var authorizedGroupName = configuration.GetAuthorizedGroupName();

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, subjectId),
            new(ClaimTypes.Role, role),
            new(groupClaimType, authorizedGroupName),
        };

        var identity = new ClaimsIdentity(claims, AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, AuthenticationScheme);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
