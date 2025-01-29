using BDMS.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BDMS.Authentication;

/// <summary>
/// An <see cref="IClaimsTransformation"/> mapping OpentID Connect "sub" claim to BDMS application claims derived from <see cref="User"/>.
/// </summary>
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
        var authenticatedUser = await CreateOrUpdateUser(principal).ConfigureAwait(false);
        if (authenticatedUser is null)
            return principal;

        var claimsIdentity = new ClaimsIdentity();
        claimsIdentity.AddClaim(new Claim(ClaimTypes.Name, authenticatedUser.Name));

        if (authenticatedUser.IsAdmin)
        {
            claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, PolicyNames.Admin));
        }
        else
        {
             claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, PolicyNames.Viewer));
        }

        principal.AddIdentity(claimsIdentity);

        return principal;
    }

    internal async Task<User?> CreateOrUpdateUser(ClaimsPrincipal principal)
    {
        var subjectId = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (subjectId is null)
            return null;

        var user = dbContext.Users.SingleOrDefault(u => u.SubjectId == subjectId) ?? new User { SubjectId = subjectId };
        user.FirstName = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value ?? user.FirstName;
        user.LastName = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Surname)?.Value ?? user.LastName;
        user.Name = $"{user.FirstName[0]}. {user.LastName}";

        var emailClaim = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email);

        if (emailClaim == null) throw new InvalidOperationException("The email claim is missing.");

        user.Email = emailClaim.Value;

        dbContext.Update(user);

        try
        {
            await dbContext.SaveChangesAsync().ConfigureAwait(false);
        }
        catch (DbUpdateException ex)
        {
            if (!ex.InnerException.Message.Contains("users_subject_id_unique", StringComparison.OrdinalIgnoreCase))
                throw;

            user = dbContext.Users.Single(u => u.SubjectId == subjectId);
        }

        return user;
    }
}
