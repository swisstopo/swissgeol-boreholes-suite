using BDMS.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BDMS;

internal static class Helpers
{
    internal static ControllerContext GetControllerContextAdmin()
        => new() { HttpContext = new DefaultHttpContext().SetAdminClaimsPrincipal() };

    internal static HttpContext SetAdminClaimsPrincipal(this HttpContext httpContext)
        => httpContext.SetClaimsPrincipal("admin", PolicyNames.Admin);

    internal static HttpContext SetClaimsPrincipal(this HttpContext httpContext, string name, string role)
    {
        var adminClaims = new List<Claim>()
        {
           new Claim(ClaimTypes.Name, name),
           new Claim(ClaimTypes.Role, role),
        };

        var userIdentity = new ClaimsIdentity(adminClaims, "TestAuthType");
        httpContext.User = new ClaimsPrincipal(userIdentity);

        return httpContext;
    }
}
