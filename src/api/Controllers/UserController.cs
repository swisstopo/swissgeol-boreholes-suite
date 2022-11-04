using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class UserController : ControllerBase
{
    private readonly BdmsContext context;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserController"/> class.
    /// </summary>
    /// <param name="context">The EF database context containing data for the BDMS application.</param>
    public UserController(BdmsContext context)
    {
        this.context = context;
    }

    /// <summary>
    /// Gets the current authenticated and authorized bdms user.
    /// </summary>
    [HttpGet("self")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<User?>> GetUserInformationAsync() =>
        await context.Users.SingleOrDefaultAsync(u => u.Name == HttpContext.User.FindFirst(ClaimTypes.Name).Value).ConfigureAwait(false);

    /// <summary>
    /// Gets the user list.
    /// </summary>
    [HttpGet]
    public async Task<IEnumerable<User>> GetAll()
    {
        var users = await context
            .Users
            .Include(x => x.WorkgroupRoles)
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var user in users)
        {
            user.Deletable = !(context.Workflows.Any(x => x.UserId == user.Id)
                || context.Layers.Any(x => x.CreatedById == user.Id)
                || context.Layers.Any(x => x.UpdatedById == user.Id)
                || context.Boreholes.Any(x => x.UpdatedById == user.Id)
                || context.Boreholes.Any(x => x.CreatedById == user.Id)
                || context.Boreholes.Any(x => x.LockedById == user.Id)
                || context.Stratigraphies.Any(x => x.CreatedById == user.Id)
                || context.Stratigraphies.Any(x => x.UpdatedById == user.Id)
                || context.Files.Any(x => x.UserId == user.Id)
                || context.BoreholeFiles.Any(x => x.UserId == user.Id));
        }

        return users;
    }
}
