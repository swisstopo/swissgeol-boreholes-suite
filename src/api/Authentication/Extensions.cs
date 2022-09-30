using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Principal;

namespace BDMS.Authentication;

/// <summary>
/// Authentication extensions.
/// </summary>
public static class Extensions
{
    /// <summary>
    /// Gets the current authenticated <see cref="User"/>.
    /// </summary>
    /// <param name="claimsPrincipal">Concrete <see cref="IPrincipal"/> supporting multiple claims-based identities.</param>
    /// <param name="dbContext">The EF database context containing data for the BDMS application.</param>
    /// <returns>The current logged in <see cref="User"/> or <c>null</c> if the user is logged in
    /// with the default guest account.</returns>
    public static async Task<User?> GetAuthenticatedUserAsync(this ClaimsPrincipal claimsPrincipal, BdmsContext dbContext) =>
        await dbContext.Users.SingleOrDefaultAsync(u => u.Name == claimsPrincipal.FindFirst(ClaimTypes.Name).Value).ConfigureAwait(false);
}
