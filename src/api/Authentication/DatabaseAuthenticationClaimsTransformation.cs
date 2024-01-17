using BDMS.Models;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;

namespace BDMS.Authentication;

public class DatabaseAuthenticationClaimsTransformation : IClaimsTransformation
{
    private readonly BdmsContext dbContext;

    /// <summary>
    /// Initializes a new instance of the <see cref="DatabaseAuthenticationClaimsTransformation"/> class.
    /// </summary>
    /// <param name="dbContext">The EF database context containing data for the BDMS application.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="dbContext"/> is <c>null</c>.</exception>
    public DatabaseAuthenticationClaimsTransformation(BdmsContext dbContext)
    {
        this.dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    /// <inheritdoc/>
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var userId = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userId is null) return principal;

        var authenticatedUser =
            dbContext.Users.FirstOrDefault(u => u.SubjectId == userId.Value) ?? new User { SubjectId = userId.Value };

        if (authenticatedUser.IsDisabled) return principal;

        authenticatedUser.FirstName = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value ?? authenticatedUser.FirstName;
        authenticatedUser.LastName = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Surname)?.Value ?? authenticatedUser.LastName;
        authenticatedUser.Name = $"{authenticatedUser.FirstName[0]}. {authenticatedUser.LastName}";
        dbContext.Update(authenticatedUser);
        await dbContext.SaveChangesAsync().ConfigureAwait(false);

        var claimsIdentity = new ClaimsIdentity();
        claimsIdentity.AddClaim(new Claim(ClaimTypes.Name, authenticatedUser.Name));
        if (authenticatedUser.IsAdmin) claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, PolicyNames.Admin));
        else if (authenticatedUser.IsViewer) claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, PolicyNames.Viewer));

        principal.AddIdentity(claimsIdentity);
        return principal;
    }
}
