using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace BDMS.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v{version:apiVersion}/[controller]")]
public class SettingsController(IConfiguration serverConfiguration) : ControllerBase
{
    private readonly IConfiguration configuration = serverConfiguration;

    [HttpGet("auth")]
    [SwaggerResponse(StatusCodes.Status200OK, "The current AuthSettings of the application.")]
    public AuthSettings? GetAuth()
        => configuration.GetRequiredSection("Auth").Get<AuthSettings>();
}
