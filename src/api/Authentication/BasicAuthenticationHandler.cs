using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;

namespace BDMS.Authentication;

public class BasicAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private const string GuestCredentials = "guest:MeiSe0we1Oowief";
    private readonly BdmsContext dbContext;

    /// <summary>
    /// Initializes a new instance of the <see cref="BasicAuthenticationHandler"/> class.
    /// </summary>
    /// <param name="dbContext">The EF database context containing data for the BDMS application.</param>
    /// <param name="options">The monitor for the options instance.</param>
    /// <param name="logger">The <see cref="ILoggerFactory"/>.</param>
    /// <param name="encoder">The <see cref="System.Text.Encodings.Web.UrlEncoder"/>.</param>
    /// <param name="clock">The <see cref="ISystemClock"/>.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="dbContext"/> is <c>null</c>.</exception>
    public BasicAuthenticationHandler(BdmsContext dbContext, IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock)
        : base(options, logger, encoder, clock)
    {
        this.dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    /// <inheritdoc/>
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authorizationHeader = Request.Headers.Authorization.ToString();
        if (authorizationHeader != null && authorizationHeader.StartsWith("basic ", StringComparison.OrdinalIgnoreCase))
        {
            // Get username and password from base64 encoded authorization header
            var token = authorizationHeader[6..].Trim();
            var credentialstring = Encoding.UTF8.GetString(Convert.FromBase64String(token));
            var credentials = credentialstring.Split(':', 2);

            // Get authenticated user from database
            var authenticatedUser = dbContext.Users
                .FromSqlRaw(
                    "SELECT * FROM bdms.users WHERE username = @username AND password = crypt(@password, password)",
                    new NpgsqlParameter("@username", credentials[0]),
                    new NpgsqlParameter("@password", credentials[1]))
                .SingleOrDefault();

            // Handle disabled and default guest user
            if ((authenticatedUser == null || authenticatedUser.IsDisabled) &&
                !credentialstring.Equals(GuestCredentials, StringComparison.OrdinalIgnoreCase))
            {
                return Task.FromResult(AuthenticateResult.Fail("No valid authentication credentials have been provided."));
            }

            var claimsIdentity = new ClaimsIdentity();
            claimsIdentity.AddClaim(new Claim(ClaimTypes.AuthenticationMethod, "Basic"));
            claimsIdentity.AddClaim(new Claim(ClaimTypes.Name, authenticatedUser?.Name ?? "guest"));
            if (authenticatedUser?.IsAdmin ?? false) claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, PolicyNames.Admin));
            else if (authenticatedUser?.IsViewer ?? false) claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, PolicyNames.Viewer));
            else claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, PolicyNames.Guest));

            return Task.FromResult(AuthenticateResult.Success(
                new AuthenticationTicket(new ClaimsPrincipal(claimsIdentity), "BasicAuthentication")));
        }

        return Task.FromResult(AuthenticateResult.Fail("No valid authentication credentials has been provided."));
    }
}
