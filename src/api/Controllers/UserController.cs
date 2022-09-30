using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    [Authorize(Policy = PolicyNames.Guest)]
    [SwaggerResponse(StatusCodes.Status204NoContent, "If logged in with the default guest user.")]
    public async Task<ActionResult<User?>> GetUserInformationAsync() =>
        await HttpContext.User.GetAuthenticatedUserAsync(context).ConfigureAwait(false);
}
